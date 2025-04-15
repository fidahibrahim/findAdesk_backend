import mongoose, { Schema } from "mongoose"
import { IWallet } from "../../entities/walletEntity"

const walletTransactionSchema = new Schema(
    {
        transactionId: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            default: ""
        }
    }
)

const walletSchema = new Schema<IWallet>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        balance: {
            type: Number,
            required: true,
            default: 0
        },
        transactions: {
            type: [walletTransactionSchema],
            default: []
        }
    },
    { timestamps: true }
);
const Wallet = mongoose.model<IWallet>('Wallet', walletSchema)
export default Wallet