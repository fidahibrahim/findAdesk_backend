import { Types } from "mongoose";

export interface RatingData {
    userId: Types.ObjectId;
    review?: string;
    rating: number;
    createdAt: Date;
}

export interface IReview {
    workspaceId: String;
    bookingId: String;
    ratings: RatingData[];
}
export interface AddReviewRequest {
    workspaceId: string;
    bookingId: string;
    userId: string | undefined;
    rating: number;
    review?: string;
}

interface PopulatedRating extends Omit<RatingData, 'userId'> {
    userId: {
        _id: Types.ObjectId;
        name: string;
        image: string;
    };
}

export interface PopulatedReview extends Omit<IReview, 'ratings'> {
    ratings: PopulatedRating[];
}