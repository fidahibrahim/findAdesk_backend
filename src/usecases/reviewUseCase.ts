import { AddReviewRequest, IReview } from "../entities/reviewEntity";
import { IReviewRepository } from "../interface/Repository/reviewRepository";
import { IReviewUseCase } from "../interface/Usecase/IreviewUseCase";

export default class reviewUseCase implements IReviewUseCase {
    private reviewRepository: IReviewRepository;

    constructor(reviewRepository: IReviewRepository) {
        this.reviewRepository = reviewRepository
    }

    async addReview(reviewData: AddReviewRequest) {
        try {
            const existingReview = await this.reviewRepository.findByWorkspaceId(reviewData.workspaceId)
            if(existingReview) {
                const userReviewExists = existingReview.ratings.some(
                    r => r.userId.toString() === reviewData.userId
                )
                if(userReviewExists) {
                    return await this.reviewRepository.updateReview(reviewData)
                }
            }
            return await this.reviewRepository.addReview(reviewData)
        } catch (error) {
           throw error 
        }
    }

    async getReviews(workspaceId: string) {
        try {
            const response = await this.reviewRepository.getReviews(workspaceId)
            return response
        } catch (error) {
            throw error
        }
    }

    async getWorkspaceReviews(ownerId: string) {
        try {
            const workspaceWithReviews = await this.reviewRepository.getWorkspaceReviews(ownerId)
            return workspaceWithReviews
        } catch (error) {
            throw error
        }
    }
}