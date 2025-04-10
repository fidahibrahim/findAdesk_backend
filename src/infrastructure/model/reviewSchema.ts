
import mongoose, { Schema, Types, model } from 'mongoose';
import { IReview } from '../../entities/reviewEntity';

const RatingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    review: {
      type: String,
      required: false,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reviewSchema = new Schema<IReview>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    ratings: [RatingSchema],
  },
  {
    timestamps: true,
  }
);

const reviewModel = mongoose.model<IReview>('Review', reviewSchema);
export default reviewModel