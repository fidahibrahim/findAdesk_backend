import mongoose, { Model } from "mongoose";
import { IWalletRepository } from "../../interface/Repository/walletRepository";
import { IWallet, WalletTransaction } from "../../entities/walletEntity";
import { v4 as uuidv4 } from "uuid";

export default class walletRepository implements IWalletRepository {
    private wallet: Model<IWallet>

    constructor(wallet: Model<IWallet>) {
        this.wallet = wallet
    }

    async createWallet(userId: string) {
        try {
            const wallet = await this.wallet.create({
                userId: new mongoose.Types.ObjectId(userId),
                balance: 0,
                transactions: []
            })
            return await wallet.save()
        } catch (error) {
            throw error
        }
    }

    async findWalletByUserId(userId: string) {
        try {
            return await this.wallet.findOne({ userId })
        } catch (error) {
            throw error
        }
    }

    async getWalletTransactions(userId: string, page: number, limit: number, type?: string) {
        try {
            const userObjectId = new mongoose.Types.ObjectId(userId)
            const skip = (page - 1) * limit

            const wallet = await this.wallet.findOne({ userId: userObjectId });
            if (!wallet) {
                return {
                    transactions: [],
                    totalTransactions: 0,
                    totalPages: 0,
                    balance: 0,
                    _id: null,
                    userId: userId
                };
            }
            let filteredTransactions = wallet.transactions;
            if (type && type !== 'all') {
                filteredTransactions = wallet.transactions.filter(t => t.type === type);
            }
            filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const paginatedTransactions = filteredTransactions.slice(skip, skip + limit);
            const totalTransactions = filteredTransactions.length;
            const totalPages = Math.ceil(totalTransactions / limit);

            return {
                transactions: paginatedTransactions,
                totalTransactions,
                totalPages,
                balance: wallet.balance,
                _id: wallet._id,
                userId: wallet.userId
            };
        } catch (error) {
            throw error
        }
    }

    async updateWalletAmount(userId: string, amount: number) {
        try {
            const wallet = await this.findWalletByUserId(userId)
            if (!wallet) {
                return await this.wallet.create({
                    userId,
                    balance: amount,
                    transactions: [{
                        transactionId: uuidv4(),
                        type: "credit",
                        date: new Date(),
                        amount: amount,
                        description: 'Refund for cancelled booking'
                    }]
                })
            }
            return await this.wallet.findOneAndUpdate(
                { userId },
                {
                    $inc: { balance: amount },
                    $push: {
                        transactions: {
                            $each: [{
                                transactionId: uuidv4(),
                                type: "credit",
                                date: new Date(),
                                amount: amount,
                                description: 'Refund for cancelled booking'
                            }],
                            $position: 0
                        }
                    }
                },
                { new: true }
            )
        } catch (error) {
            throw error
        }
    }

    async updateWalletBalance(userId: string, newBalance: number, transaction: WalletTransaction) {
        try {
            const updatedWallet = await this.wallet.findOneAndUpdate(
                { userId },
                {
                    balance: newBalance,
                    $push: { transactions: transaction }
                },
                { new: true }
            )
            return updatedWallet;
        } catch (error) {
            console.log(error)
            throw error
        }
    }

}