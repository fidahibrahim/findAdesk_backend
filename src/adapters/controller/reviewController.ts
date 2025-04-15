import { Request, Response } from "express";
import { IReviewUseCase } from "../../interface/Usecase/IreviewUseCase";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { ResponseMessage } from "../../constants/responseMssg";
import { AuthenticatedRequestUser } from "../../infrastructure/middleware/userAuth";
import { AuthenticatedRequest } from "../../infrastructure/middleware/ownerAuth";

export class reviewController {
    private reviewUseCase: IReviewUseCase

    constructor(reviewUseCase: IReviewUseCase) {
        this.reviewUseCase = reviewUseCase
        this.addReview = this.addReview.bind(this)
        this.getReviews = this.getReviews.bind(this)
    }

    async addReview(req: AuthenticatedRequestUser, res: Response) {
        try {
            const { workspaceId, bookingId, rating, review } = req.body;
            const userId = req.user?.userId;
            const reviewData = await this.reviewUseCase.addReview({
                workspaceId,
                bookingId,
                userId,
                rating,
                review
            })
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.ADD_REVIEW_SUCCESS, HttpStatusCode.OK, reviewData))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.ADD_REVIEW_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async getReviews(req: Request, res: Response) {
        try {
            const workspaceId = req.query.workspaceId as string
            const response = await this.reviewUseCase.getReviews(workspaceId)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.GET_REVIEW_SUCCESS, HttpStatusCode.OK, response))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.GET_REVIEW_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async getAllReviews(req: AuthenticatedRequest, res: Response) {
        try {
            const ownerId = req.owner?.userId
            console.log(ownerId,'ownerid in controller')
            const workspaces = await this.reviewUseCase.getWorkspaceReviews(ownerId!)
            console.log(workspaces, 'workspaces in controller')
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.GET_REVIEW_SUCCESS, HttpStatusCode.OK, workspaces))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.GET_REVIEW_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
}