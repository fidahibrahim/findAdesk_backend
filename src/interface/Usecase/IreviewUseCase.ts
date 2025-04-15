import { AddReviewRequest, IReview } from "../../entities/reviewEntity";

export interface IReviewUseCase {
    addReview(reviewData: AddReviewRequest): Promise<IReview|null|undefined>,
    getReviews(workspaceId: string): Promise<IReview|null>
    getWorkspaceReviews(ownerId: string): Promise<any>
}