import mongoose, { Model } from "mongoose";
import { IWalletRepository } from "../../interface/Repository/walletRepository";
import { IWallet } from "../../entities/walletEntity";
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

}