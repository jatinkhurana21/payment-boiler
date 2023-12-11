

export interface ICreatePayment { 
    payerUserId : Number;
    receiverUserId : Number;
    amount: Number;
    method: string; 
    status: string; 
    mode: string;
}