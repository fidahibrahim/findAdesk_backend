import { Request, Response } from "express";

export interface IBooking {
    checkAvailability(req: Request, res: Response): Promise<void>
    createBooking(req: Request, res: Response): Promise<void>
    createStripeSession(req: Request, res: Response): Promise<void>
    stripeWebhook(req: Request, res: Response): Promise<void>
}