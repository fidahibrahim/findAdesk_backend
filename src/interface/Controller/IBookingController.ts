import { Request, Response } from "express";

export interface IBooking {
    checkAvailability(req: Request, res: Response): Promise<void>
    createBooking(req: Request, res: Response): Promise<void>
}