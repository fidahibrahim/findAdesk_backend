"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletController = void 0;
const httpStatusCode_1 = require("../../constants/httpStatusCode");
const responseMssg_1 = require("../../constants/responseMssg");
const responseHandler_1 = require("../../infrastructure/utils/responseHandler");
class walletController {
    constructor(walletUseCase) {
        this.walletUseCase = walletUseCase;
        this.getWallet = this.getWallet.bind(this);
        this.processWalletPayment = this.processWalletPayment.bind(this);
    }
    async getWallet(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { page = 1, limit = 10, type } = req.query;
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(6, Math.max(1, parseInt(limit) || 10));
            const wallet = await this.walletUseCase.getWallet(userId, pageNum, limitNum, type);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.FETCH_WALLET, httpStatusCode_1.HttpStatusCode.OK, wallet));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_WALLET_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async processWalletPayment(req, res) {
        var _a;
        try {
            console.log(req);
            const { payload } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            console.log(userId, 'userid');
            const paymentAmount = payload.grandTotal;
            console.log(paymentAmount, 'payment amount');
            await this.walletUseCase.updateDebitWallet(userId, paymentAmount);
            await this.walletUseCase.updateBookingStatus(payload.bookingId, 'completed', payload.seats, payload.paymentMethod, payload.workspace.workspaceId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.FETCH_WALLET, httpStatusCode_1.HttpStatusCode.OK, payload === null || payload === void 0 ? void 0 : payload.bookingId));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_WALLET_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
}
exports.walletController = walletController;
//# sourceMappingURL=walletController.js.map