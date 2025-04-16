import { IWallet } from "../../entities/walletEntity";

export interface IWalletUseCase {
    getWallet(userId: string): Promise<IWallet>
    updateBookingStatus(
        bookingId: string,
        status: string,
        seat: number,
        paymentMethod: string,
        worksapceId: string
    ): Promise<any>;
    updateDebitWallet(userId: string, amount: number): Promise<IWallet|null>
}