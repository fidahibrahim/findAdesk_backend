import { IWallet, IWalletResponse } from "../../entities/walletEntity";

export interface IWalletUseCase {
    getWallet(userId: string, page: number, limit: number, type?: string | undefined): Promise<any>
    updateBookingStatus(
        bookingId: string,
        status: string,
        seat: number,
        paymentMethod: string,
        worksapceId: string
    ): Promise<any>;
    updateDebitWallet(userId: string, amount: number): Promise<IWallet | null>
}