import { IWallet } from "../entities/walletEntity";
import { IWalletRepository } from "../interface/Repository/walletRepository";
import { IWalletUseCase } from "../interface/Usecase/IWalletUseCase";

export default class walletUseCase implements IWalletUseCase {
    private walletRepository: IWalletRepository

    constructor(walletRepository: IWalletRepository) {
        this.walletRepository = walletRepository
    }

    async getWallet(userId: string) {
        try {
            let wallet = await this.walletRepository.findWalletByUserId(userId)
            if(!wallet) {
                wallet = await this.walletRepository.createWallet(userId)
            }
            return wallet 
        } catch (error) {
            throw error
        }
    }
}