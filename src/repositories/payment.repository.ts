/*
Payments Table:

Fields: id, invoice_id, payer_id, receiver_id, amount, payment_method, status (completed, failed).
*/


import Cache from '../cache/cache';

export default class PaymentRepository {
    public static create(data: {payerUserId; receiverUserId; amount; method; status;}) {
        const { payerUserId, receiverUserId, amount, method, status } = data;
        const paymentId = Date.now();

        // using node cache to mock a database
        Cache.setData(paymentId,  { payerUserId, receiverUserId, amount, method, status });
        return paymentId;
    }

    public static get(paymentId) {
        const response = Cache.getData(paymentId);
        return response;
    }

    public static update(paymentId, updateData) {
        const paymentData = PaymentRepository.get(paymentId);
        if (!paymentId) return {
            isValid: false,
            completed: false
        };

        const updateKeys = Object.keys(updateData);

        updateKeys.forEach(key => {
            paymentData[key] = updateData[key];
        });
        Cache.setData(paymentId, paymentData);
        return {
            isValid: true,
            completed: true
        };
    }
}