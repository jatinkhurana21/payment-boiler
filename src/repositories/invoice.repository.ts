/*
Invoices Table:

Fields: id, amount, receiverUserId.
*/


import Cache from '../cache/cache';

export default class InvoiceRepository {
    public static create(data: { amount; receiverUserId;}) {
        const { receiverUserId, amount } = data;
        const invoiceId = Date.now();

        // using node cache to mock a database
        Cache.setData(receiverUserId,  { invoiceId, amount });
        return { invoiceId, amount, receiverUserId };
    }

    public static get(receiverUserId) {
        const response = Cache.getData(receiverUserId);
        return response ? { ...response, receiverUserId } : null;
    }

    public static update(receiverUserId, updateData) {
        const invoiceData = InvoiceRepository.get(receiverUserId);
        if (!receiverUserId) return {
            isValid: false,
            completed: false
        };

        const updateKeys = Object.keys(updateData);

        updateKeys.forEach(key => {
            invoiceData[key] = updateData[key];
        });
        Cache.setData(receiverUserId, invoiceData);
        return {
            isValid: true,
            data: { ...invoiceData, receiverUserId }
        };
    }
}