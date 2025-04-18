"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = void 0;
const responseHandler_1 = require("../../infrastructure/utils/responseHandler");
const httpStatusCode_1 = require("../../constants/httpStatusCode");
const responseMssg_1 = require("../../constants/responseMssg");
class reviewController {
    constructor(reviewUseCase) {
        this.reviewUseCase = reviewUseCase;
        this.addReview = this.addReview.bind(this);
        this.getReviews = this.getReviews.bind(this);
        this.getAllReviews = this.getAllReviews.bind(this);
    }
    async addReview(req, res) {
        var _a;
        try {
            const { workspaceId, bookingId, rating, review } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const reviewData = await this.reviewUseCase.addReview({
                workspaceId,
                bookingId,
                userId,
                rating,
                review
            });
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.ADD_REVIEW_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, reviewData));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.ADD_REVIEW_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getReviews(req, res) {
        try {
            const workspaceId = req.query.workspaceId;
            const response = await this.reviewUseCase.getReviews(workspaceId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.GET_REVIEW_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.GET_REVIEW_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getAllReviews(req, res) {
        var _a;
        try {
            const ownerId = (_a = req.owner) === null || _a === void 0 ? void 0 : _a.userId;
            console.log(ownerId, 'ownerId in controller');
            const workspaces = await this.reviewUseCase.getWorkspaceReviews(ownerId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.GET_REVIEW_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, workspaces));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.GET_REVIEW_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
}
exports.reviewController = reviewController;
//# sourceMappingURL=reviewController.js.map