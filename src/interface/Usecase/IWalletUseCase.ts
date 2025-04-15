import { IWallet } from "../../entities/walletEntity";

export interface IWalletUseCase {
    getWallet(userId: string): Promise<IWallet>
    
}