import { IWallet, WalletTransaction } from "../entities/walletEntity";
import { IBookingRepository } from "../interface/Repository/bookingRepository";
import { IWalletRepository } from "../interface/Repository/walletRepository";
import { IWalletUseCase } from "../interface/Usecase/IWalletUseCase";

export default class walletUseCase implements IWalletUseCase {
    private walletRepository: IWalletRepository
    private bookingRepository: IBookingRepository

    constructor(walletRepository: IWalletRepository, bookingRepository: IBookingRepository) {
        this.walletRepository = walletRepository
        this.bookingRepository = bookingRepository
    }

    async getWallet(userId: string, page: number = 1, limit: number = 10, type?: string | undefined) {
        try {
            let wallet = await this.walletRepository.findWalletByUserId(userId)
            if (!wallet) {
                wallet = await this.walletRepository.createWallet(userId)
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
            const paginatedTransactions = await this.walletRepository.getWalletTransactions(
                userId,
                page,
                limit,
                type
            );

            return {
                balance: wallet.balance,
                _id: wallet._id,
                userId: wallet.userId,
                transactions: paginatedTransactions?.transactions,
                totalTransactions: paginatedTransactions?.totalTransactions,
                totalPages: paginatedTransactions?.totalPages,
                currentPage: page
            };
        } catch (error) {
            throw error
        }
    }
    async updateBookingStatus(bookingId: string, status: string, seat: number, paymentMethod: string, worksapceId: string) {
        try {
            const response = await this.bookingRepository.updateBookingStatus(
                bookingId,
                status,
                seat,
                paymentMethod,
                worksapceId
            );
            return response;
        } catch (error) {
            throw error;
        }
    }
    async updateDebitWallet(userId: string, amount: number) {
        try {
            const wallet = await this.walletRepository.findWalletByUserId(userId!)
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            if (wallet.balance < amount) {
                throw new Error('Insufficient wallet balance');
            }
            const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const transaction: WalletTransaction = {
                transactionId,
                type: 'debit',
                date: new Date(),
                amount,
                description: 'Workspace booking payment'
            };
            const updatedWallet = await this.walletRepository.updateWalletBalance(
                userId,
                wallet.balance - amount,
                transaction
            );
            console.log(updatedWallet, 'updated wallet in usecase')
            return updatedWallet;
        } catch (error) {
            throw error
        }
    }
}