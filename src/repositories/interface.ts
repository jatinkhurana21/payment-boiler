
export interface ICreatePayment {
    payerUserId: Number;
    receiverUserId: Number;
    amount: Number;
    method: string;
    status: string;
    mode: string;
}

export interface ICreateInvoice {
    amount: Number;
    receiverUserId: Number;
}

export interface ICreateUser {
    mobile: string;
    email: string;
    countryCode: number;
    isActive: Number;
    role: string;
    createdAt: Date;
}