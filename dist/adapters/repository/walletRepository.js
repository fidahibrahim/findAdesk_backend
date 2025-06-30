"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
class walletRepository {
    constructor(wallet) {
        this.wallet = wallet;
    }
    async createWallet(userId) {
        try {
            const wallet = await this.wallet.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                balance: 0,
                transactions: []
            });
            return await wallet.save();
        }
        catch (error) {
            throw error;
        }
    }
    async findWalletByUserId(userId) {
        try {
            return await this.wallet.findOne({ userId });
        }
        catch (error) {
            throw error;
        }
    }
    async getWalletTransactions(userId, page, limit, type) {
        try {
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            const skip = (page - 1) * limit;
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
        }
        catch (error) {
            throw error;
        }
    }
    async updateWalletAmount(userId, amount) {
        try {
            const wallet = await this.findWalletByUserId(userId);
            if (!wallet) {
                return await this.wallet.create({
                    userId,
                    balance: amount,
                    transactions: [{
                            transactionId: (0, uuid_1.v4)(),
                            type: "credit",
                            date: new Date(),
                            amount: amount,
                            description: 'Refund for cancelled booking'
                        }]
                });
            }
            return await this.wallet.findOneAndUpdate({ userId }, {
                $inc: { balance: amount },
                $push: {
                    transactions: {
                        $each: [{
                                transactionId: (0, uuid_1.v4)(),
                                type: "credit",
                                date: new Date(),
                                amount: amount,
                                description: 'Refund for cancelled booking'
                            }],
                        $position: 0
                    }
                }
            }, { new: true });
        }
        catch (error) {
            throw error;
        }
    }
    async updateWalletBalance(userId, newBalance, transaction) {
        try {
            const updatedWallet = await this.wallet.findOneAndUpdate({ userId }, {
                balance: newBalance,
                $push: { transactions: transaction }
            }, { new: true });
            return updatedWallet;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = walletRepository;
//# sourceMappingURL=walletRepository.js.map