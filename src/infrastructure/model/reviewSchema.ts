
import { Schema, Types, model } from 'mongoose';

const RatingSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
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

const reviewSchema = new Schema(
  {
    workspaceId: {
      type: Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
    },
    ratings: [RatingSchema],
  },
  {
    timestamps: true,
  }
);

export const WorkspaceReview = model('WorkspaceReview', reviewSchema);