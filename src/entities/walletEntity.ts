export interface WalletTransaction {
    _id?: string;
    transactionId: string;
    type: 'credit' | 'debit';
    date: Date;
    amount: number;
    description?: string;
}

export interface IWallet {
    _id: String;
    userId: String;
    balance: number;
    transactions: WalletTransaction[];
}

export interface IWalletResponse {
    balance: number;
    _id: string;
    userId: string;
    transactions: WalletTransaction[];
    totalTransactions: number;
    totalPages: number;
    currentPage: number;
}
