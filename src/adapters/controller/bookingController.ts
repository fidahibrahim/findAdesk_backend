import { Request, Response } from "express";
import { IBookingUseCase } from "../../interface/Usecase/IBookingUseCase";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { ResponseMessage } from "../../constants/responseMssg";
import Stripe from "stripe";

export class bookingController {
    private bookingUseCase: IBookingUseCase
    constructor(bookingUseCase: IBookingUseCase) {
        this.bookingUseCase = bookingUseCase
        this.checkAvailability = this.checkAvailability.bind(this)
        this.createBooking = this.createBooking.bind(this)
        this.createStripeSession = this.createStripeSession.bind(this)
        this.stripeWebhook = this.stripeWebhook.bind(this)
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
    async createBooking(req: Request, res: Response) {
        try {
            console.log(req.body, "req body in my controller")
            const { userId, workspaceId, bookingDetails, mobile, specialRequests, total } = req.body;

            await this.bookingUseCase.createBooking({
                userId,
                workspaceId,
                date: new Date(bookingDetails.date),
                startTime: new Date(`${bookingDetails.date}T${bookingDetails.startTime}:00`),
                endTime: new Date(`${bookingDetails.date}T${bookingDetails.endTime}:00`),
                mobile,
                seats: bookingDetails.seats,
                concern: specialRequests,
                total,
                status: "pending",
            });
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.BOOKING_CONFIRMATION, HttpStatusCode.OK))

        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.BOOKING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async createStripeSession(req: Request, res: Response) {
        try {
            const { payload } = req.body
            const workspaceId = payload.workspaceId
            const workspaceName = await this.bookingUseCase.findProductName(workspaceId)
            if (!process.env.STRIPE_SECRET_KEY) {
                throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
            }
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: workspaceName ?? 'workspaceName',
                            },
                            unit_amount: payload.total * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: 'http://localhost:5000/bookingConfirmation',
                cancel_url: 'http://localhost:5000/checkout',

            });
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.BOOKING_CONFIRMATION, HttpStatusCode.OK, session))

        } catch (error) {
            console.log(error)
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.BOOKING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async stripeWebhook(req: Request, res: Response) {
        try {
            const sig = req.headers["stripe-signature"];
            const event = Stripe.webhooks.constructEvent(
                req.body,
                sig as string,
                process.env.WEBHOOK_SECRET_KEY!
            );
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                console.log("session", session);
            }

            console.log("✅ Verified Stripe event:", event);

            res.json({ received: true });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.BOOKING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
}