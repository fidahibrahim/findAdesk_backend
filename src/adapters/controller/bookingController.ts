import { Request, Response } from "express";
import { IBookingUseCase } from "../../interface/Usecase/IBookingUseCase";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { ResponseMessage } from "../../constants/responseMssg";

export class bookingController {
    private bookingUseCase: IBookingUseCase
    constructor(bookingUseCase: IBookingUseCase){
        this.bookingUseCase = bookingUseCase
        this.checkAvailability = this.checkAvailability.bind(this)
    }
    async checkAvailability(req: Request, res: Response) {
        try {
            const workspaceId = req.query.workspaceId as string
            const { date, startTime, endTime, seats, day } = req.body;
            const data = {
                workspaceId,
                date,
                startTime,
                endTime,
                seats: parseInt(seats, 10),
                day
            }
            const response = await this.bookingUseCase.checkAvailability(data)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.AVAILABILITY_CHECK_SUCCESS, HttpStatusCode.OK, response))

        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.AVAILABILITY_CHECK_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
}