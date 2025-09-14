import { Request, Response } from "express";
import { IBookingUseCase } from "../../interface/Usecase/IBookingUseCase";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { ResponseMessage } from "../../constants/responseMssg";
import Stripe from "stripe";
import { AuthenticatedRequestUser } from "../../infrastructure/middleware/userAuth";
import { generateId } from "../../infrastructure/utils/bookingIdGenerator";
import { AuthenticatedRequest } from "../../infrastructure/middleware/ownerAuth";

export class bookingController {
  private bookingUseCase: IBookingUseCase
  constructor(bookingUseCase: IBookingUseCase) {
    this.bookingUseCase = bookingUseCase
    this.checkAvailability = this.checkAvailability.bind(this)
    this.createBooking = this.createBooking.bind(this)
    this.getBookingDetails = this.getBookingDetails.bind(this)
    this.createStripeSession = this.createStripeSession.bind(this)
    this.stripeWebhook = this.stripeWebhook.bind(this)
    this.listBookings = this.listBookings.bind(this)
    this.getBookingDetailsOwner = this.getBookingDetailsOwner.bind(this)
    this.bookingConfirmDetails = this.bookingConfirmDetails.bind(this)
    this.fetchBookingDetails = this.fetchBookingDetails.bind(this)
    this.cancelBooking = this.cancelBooking.bind(this)
  }
  async checkAvailability(req: Request, res: Response) {
    try {
      const workspaceId = req.query.workspaceId as string
      const { date, startTime, endTime, seats, day } = req.body;
      const data = {
        workspaceId,
        date,
        startTime,
        endTime,
        seats: parseInt(seats, 10),
        day
      }
      const response = await this.bookingUseCase.checkAvailability(data)
      res.status(HttpStatusCode.OK)
        .json(handleSuccess(ResponseMessage.AVAILABILITY_CHECK_SUCCESS, HttpStatusCode.OK, response))

    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json(handleError(ResponseMessage.AVAILABILITY_CHECK_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
    }
  }
  async createBooking(req: AuthenticatedRequestUser, res: Response) {
    try {
      const { workspaceId, bookingDetails, pricePerHour } = req.body;
      const userId = req.user?.userId;
      const bookingId = generateId();
      const response = await this.bookingUseCase.createBooking(
        userId ?? "",
        workspaceId,
        bookingId,
        pricePerHour,
        bookingDetails
      );
      res.status(HttpStatusCode.OK)
        .json(handleSuccess(ResponseMessage.BOOKING_CONFIRMATION, HttpStatusCode.OK, response));
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json(handleError(ResponseMessage.BOOKING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }
  }
  async createStripeSession(req: Request, res: Response) {
    try {
      const { payload } = req.body;
      const workspaceId =
        payload.workspace?.workspaceId ?? payload.workspaceId?._id;
      const workspaceName = await this.bookingUseCase.findProductName(
        workspaceId
      );
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error(
          "STRIPE_SECRET_KEY is not defined in environment variables"
        );
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: workspaceName ?? "workspaceName",
              },
              unit_amount: payload.grandTotal * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        metadata: {
          bookingId: payload.bookingId,
          paymentMethod: payload.paymentMethod,
          mobile: payload.phoneNumber,
          seat: payload.seats,
          worksapceId: workspaceId,
        },
        success_url: `${process.env.SUCCESS_URL_PRO}/bookingConfirmation/${payload.bookingId}`,
        cancel_url: `${process.env.SUCCESS_URL_PRO}/checkout/${payload.bookingId}`,
      });
      res.status(HttpStatusCode.OK).json(handleSuccess(ResponseMessage.BOOKING_CONFIRMATION, HttpStatusCode.OK, session));
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
        handleError(ResponseMessage.BOOKING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }
  }
  async stripeWebhook(req: Request, res: Response) {
    try {
      console.log('function started')
      console.log(process.env.WEBHOOK_SECRET_KEY,'key log')
      const sig = req.headers["stripe-signature"];
      const event = Stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.WEBHOOK_SECRET_KEY!
      );
      console.log(event, 'event in stripe')
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        await this.bookingUseCase.updateBookingStatus(
          session.metadata?.bookingId!,
          "completed",
          parseInt(session.metadata?.seat!),
          session.metadata?.paymentMethod!,
          session.metadata?.worksapceId!
        );
      }
      res.json({ received: true });
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(handleError(ResponseMessage.BOOKING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }
  }

  async getBookingDetails(req: Request, res: Response) {
    try {
      const bookingId = req.query.bookingId as string;
      const response = await this.bookingUseCase.getBookingDetails(bookingId);
      res.status(HttpStatusCode.OK)
        .json(handleSuccess(ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, HttpStatusCode.OK, response));
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json(handleError(ResponseMessage.FETCH_PROFILE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }
  }

  async listBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const search = req.query.search?.toString() || ''
      const page = parseInt(req.query.page as string, 10) || 1
      const limit = 6
      const ownerId = req.owner?.userId
      if (!ownerId) {
        throw new Error("Owner ID is required")
      }
      const { bookings, totalPages } = await this.bookingUseCase.listBookings(ownerId, search, page, limit)
      res.status(HttpStatusCode.OK)
        .json(handleSuccess(ResponseMessage.BOOKING_LISTING_SUCCESS, HttpStatusCode.OK, { bookings, totalPages }));
      return
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json(handleError(ResponseMessage.BOOKING_LISTING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
    }
  }

  async getBookingDetailsOwner(req: Request, res: Response) {
    try {
      const bookingId = req.query.bookingId as string
      const response = await this.bookingUseCase.bookingViewDetails(bookingId)
      res.status(HttpStatusCode.OK)
        .json(handleSuccess(ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, HttpStatusCode.OK, response));
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json(handleError(ResponseMessage.BOOKING_VIEWDETAILS_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
    }
  }
  async bookingConfirmDetails(req: Request, res: Response) {
    try {
      const bookingId = req.query.bookingId as string;
      const response = await this.bookingUseCase.bookingConfirmDetails(bookingId)
      res.status(HttpStatusCode.OK)
        .json(handleSuccess(ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, HttpStatusCode.OK, response));
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json(handleError(ResponseMessage.BOOKING_VIEWDETAILS_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
    }
  }
  async fetchBookingDetails(req: Request, res: Response) {
    try {
      const bookingId = req.query.bookingId as string;
      const response = await this.bookingUseCase.bookingViewDetails(bookingId)
      res.status(HttpStatusCode.OK)
        .json(handleSuccess(ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, HttpStatusCode.OK, response));
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json(handleError(ResponseMessage.BOOKING_VIEWDETAILS_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const bookingId = req.query.bookingId as string;
      const response = await this.bookingUseCase.cancelBooking(bookingId)
      res.status(HttpStatusCode.OK)
        .json(handleSuccess(ResponseMessage.CANCEL_BOOKING, HttpStatusCode.OK, response));
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json(handleError(ResponseMessage.CANCEL_BOOKING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
    }
  }
}