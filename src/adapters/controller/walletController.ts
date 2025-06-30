import { Request, Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { ResponseMessage } from "../../constants/responseMssg";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { IWalletUseCase } from "../../interface/Usecase/IWalletUseCase";
import { AuthenticatedRequestUser } from "../../infrastructure/middleware/userAuth";

export class walletController {
    private walletUseCase: IWalletUseCase

    constructor(walletUseCase: IWalletUseCase) {
        this.walletUseCase = walletUseCase
        this.getWallet = this.getWallet.bind(this)
        this.processWalletPayment = this.processWalletPayment.bind(this)
    }

    async getWallet(req: AuthenticatedRequestUser, res: Response) {
        try {
            const userId = req.user?.userId
            const { page = 1, limit = 10, type } = req.query;

            const pageNum = Math.max(1, parseInt(page as string) || 1);
            const limitNum = Math.min(6, Math.max(1, parseInt(limit as string) || 10));

            const wallet = await this.walletUseCase.getWallet(
                userId!,
                pageNum,
                limitNum,
                type as string
            )
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_WALLET, HttpStatusCode.OK, wallet))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_WALLET_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async processWalletPayment(req: AuthenticatedRequestUser, res: Response) {
        try {
            console.log(req)
            const { payload } = req.body
            const userId = req.user?.userId
            console.log(userId, 'userid')
            const paymentAmount = payload.grandTotal;
            console.log(paymentAmount, 'payment amount')

            await this.walletUseCase.updateDebitWallet(userId!, paymentAmount)

            await this.walletUseCase.updateBookingStatus(
                payload.bookingId,
                'completed',
                payload.seats,
                payload.paymentMethod,
                payload.workspace.workspaceId
            )
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_WALLET, HttpStatusCode.OK, payload?.bookingId))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_WALLET_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
}