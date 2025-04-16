import { IWallet, WalletTransaction } from "../../entities/walletEntity";

export interface IWalletRepository {
    createWallet(userId: string): Promise<IWallet>
    findWalletByUserId(userId: string): Promise<IWallet|null>
    updateWalletAmount(userId: string|undefined, amount: number|undefined): Promise<any>
    updateWalletBalance(userId: string, newBalance: number, transaction: WalletTransaction): Promise<IWallet|null>
}