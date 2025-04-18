"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class reviewUseCase {
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async addReview(reviewData) {
        try {
            const existingReview = await this.reviewRepository.findByWorkspaceId(reviewData.workspaceId);
            if (existingReview) {
                const userReviewExists = existingReview.ratings.some(r => r.userId.toString() === reviewData.userId);
                if (userReviewExists) {
                    return await this.reviewRepository.updateReview(reviewData);
                }
            }
            return await this.reviewRepository.addReview(reviewData);
        }
        catch (error) {
            throw error;
        }
    }
    async getReviews(workspaceId) {
        try {
            const response = await this.reviewRepository.getReviews(workspaceId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getWorkspaceReviews(ownerId) {
        try {
            const workspaceWithReviews = await this.reviewRepository.getWorkspaceReviews(ownerId);
            return workspaceWithReviews;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = reviewUseCase;
//# sourceMappingURL=reviewUseCase.js.map