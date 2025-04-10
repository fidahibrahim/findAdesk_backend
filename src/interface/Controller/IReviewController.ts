import { Request, Response } from "express";

export interface IReview {
    addReview(req: Request, res: Response): Promise<void>
    getReviews(req: Request, res: Response): Promise<void>
}