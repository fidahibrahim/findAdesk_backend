import { AddReviewRequest, IReview, PopulatedReview } from "../../entities/reviewEntity";

export interface IReviewRepository {
    findByWorkspaceId(workspaceId: string): Promise<IReview | null>
    findByBookingId(bookingId: string): Promise<IReview|null>
    addReview(reviewData: AddReviewRequest): Promise<IReview| undefined>
    updateReview(reviewData: AddReviewRequest): Promise<IReview | null>
    getReviews(workspaceId: string): Promise<any>
}