"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const httpStatusCode_1 = require("../../constants/httpStatusCode");
const responseHandler_1 = require("../../infrastructure/utils/responseHandler");
const responseMssg_1 = require("../../constants/responseMssg");
const stripe_1 = __importDefault(require("stripe"));
const bookingIdGenerator_1 = require("../../infrastructure/utils/bookingIdGenerator");
class bookingController {
    constructor(bookingUseCase) {
        this.bookingUseCase = bookingUseCase;
        this.checkAvailability = this.checkAvailability.bind(this);
        this.createBooking = this.createBooking.bind(this);
        this.getBookingDetails = this.getBookingDetails.bind(this);
        this.createStripeSession = this.createStripeSession.bind(this);
        this.stripeWebhook = this.stripeWebhook.bind(this);
        this.listBookings = this.listBookings.bind(this);
        this.getBookingDetailsOwner = this.getBookingDetailsOwner.bind(this);
        this.bookingConfirmDetails = this.bookingConfirmDetails.bind(this);
        this.fetchBookingDetails = this.fetchBookingDetails.bind(this);
        this.cancelBooking = this.cancelBooking.bind(this);
    }
    async checkAvailability(req, res) {
        try {
            const workspaceId = req.query.workspaceId;
            const { date, startTime, endTime, seats, day } = req.body;
            const data = {
                workspaceId,
                date,
                startTime,
                endTime,
                seats: parseInt(seats, 10),
                day
            };
            const response = await this.bookingUseCase.checkAvailability(data);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.AVAILABILITY_CHECK_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.AVAILABILITY_CHECK_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async createBooking(req, res) {
        var _a;
        try {
            const { workspaceId, bookingDetails, pricePerHour } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const bookingId = (0, bookingIdGenerator_1.generateId)();
            const response = await this.bookingUseCase.createBooking(userId !== null && userId !== void 0 ? userId : "", workspaceId, bookingId, pricePerHour, bookingDetails);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.BOOKING_CONFIRMATION, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.BOOKING_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async createStripeSession(req, res) {
        var _a, _b, _c;
        try {
            const { payload } = req.body;
            const workspaceId = (_b = (_a = payload.workspace) === null || _a === void 0 ? void 0 : _a.workspaceId) !== null && _b !== void 0 ? _b : (_c = payload.workspaceId) === null || _c === void 0 ? void 0 : _c._id;
            const workspaceName = await this.bookingUseCase.findProductName(workspaceId);
            if (!process.env.STRIPE_SECRET_KEY) {
                throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
            }
            const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: workspaceName !== null && workspaceName !== void 0 ? workspaceName : "workspaceName",
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
            res.status(httpStatusCode_1.HttpStatusCode.OK).json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.BOOKING_CONFIRMATION, httpStatusCode_1.HttpStatusCode.OK, session));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR).json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.BOOKING_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async stripeWebhook(req, res) {
        var _a, _b, _c, _d;
        try {
            const sig = req.headers["stripe-signature"];
            const event = stripe_1.default.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET_KEY);
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                await this.bookingUseCase.updateBookingStatus((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.bookingId, "completed", parseInt((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.seat), (_c = session.metadata) === null || _c === void 0 ? void 0 : _c.paymentMethod, (_d = session.metadata) === null || _d === void 0 ? void 0 : _d.worksapceId);
            }
            res.json({ received: true });
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR).json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.BOOKING_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getBookingDetails(req, res) {
        try {
            const bookingId = req.query.bookingId;
            const response = await this.bookingUseCase.getBookingDetails(bookingId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_PROFILE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async listBookings(req, res) {
        var _a, _b;
        try {
            const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            const page = parseInt(req.query.page, 10) || 1;
            const limit = 6;
            const ownerId = (_b = req.owner) === null || _b === void 0 ? void 0 : _b.userId;
            if (!ownerId) {
                throw new Error("Owner ID is required");
            }
            const { bookings, totalPages } = await this.bookingUseCase.listBookings(ownerId, search, page, limit);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.BOOKING_LISTING_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, { bookings, totalPages }));
            return;
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.BOOKING_LISTING_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getBookingDetailsOwner(req, res) {
        try {
            const bookingId = req.query.bookingId;
            const response = await this.bookingUseCase.bookingViewDetails(bookingId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async bookingConfirmDetails(req, res) {
        try {
            const bookingId = req.query.bookingId;
            const response = await this.bookingUseCase.bookingConfirmDetails(bookingId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async fetchBookingDetails(req, res) {
        try {
            const bookingId = req.query.bookingId;
            const response = await this.bookingUseCase.bookingViewDetails(bookingId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async cancelBooking(req, res) {
        try {
            const bookingId = req.query.bookingId;
            const response = await this.bookingUseCase.cancelBooking(bookingId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.CANCEL_BOOKING, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.CANCEL_BOOKING_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
}
exports.bookingController = bookingController;
//# sourceMappingURL=bookingController.js.map