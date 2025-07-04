"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class walletUseCase {
    constructor(walletRepository, bookingRepository) {
        this.walletRepository = walletRepository;
        this.bookingRepository = bookingRepository;
    }
    async getWallet(userId, page = 1, limit = 10, type) {
        try {
            let wallet = await this.walletRepository.findWalletByUserId(userId);
            if (!wallet) {
                wallet = await this.walletRepository.createWallet(userId);
                return {
                    balance: 0,
                    _id: wallet._id,
                    userId: wallet.userId,
                    transactions: [],
                    totalTransactions: 0,
                    totalPages: 0,
                    currentPage: page
                };
            }
            const paginatedTransactions = await this.walletRepository.getWalletTransactions(userId, page, limit, type);
            return {
                balance: wallet.balance,
                _id: wallet._id,
                userId: wallet.userId,
                transactions: paginatedTransactions === null || paginatedTransactions === void 0 ? void 0 : paginatedTransactions.transactions,
                totalTransactions: paginatedTransactions === null || paginatedTransactions === void 0 ? void 0 : paginatedTransactions.totalTransactions,
                totalPages: paginatedTransactions === null || paginatedTransactions === void 0 ? void 0 : paginatedTransactions.totalPages,
                currentPage: page
            };
        }
        catch (error) {
            throw error;
        }
    }
    async updateBookingStatus(bookingId, status, seat, paymentMethod, worksapceId) {
        try {
            const response = await this.bookingRepository.updateBookingStatus(bookingId, status, seat, paymentMethod, worksapceId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async updateDebitWallet(userId, amount) {
        try {
            const wallet = await this.walletRepository.findWalletByUserId(userId);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            if (wallet.balance < amount) {
                throw new Error('Insufficient wallet balance');
            }
            const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const transaction = {
                transactionId,
                type: 'debit',
                date: new Date(),
                amount,
                description: 'Workspace booking payment'
            };
            const updatedWallet = await this.walletRepository.updateWalletBalance(userId, wallet.balance - amount, transaction);
            console.log(updatedWallet, 'updated wallet in usecase');
            return updatedWallet;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = walletUseCase;
//# sourceMappingURL=walletUseCase.js.map