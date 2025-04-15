export interface WalletTransaction {
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
