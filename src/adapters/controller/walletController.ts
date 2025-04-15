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
            const wallet = await this.walletUseCase.getWallet(userId!)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_WALLET, HttpStatusCode.OK, wallet))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_WALLET_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async processWalletPayment(req: Request, res: Response) {
        try {
            const { payload } = req.body

            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_WALLET, HttpStatusCode.OK, ))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_WALLET_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
}