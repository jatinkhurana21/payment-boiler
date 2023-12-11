/*
Invoices Table:

Fields: id, amount, receiverUserId, createdAt, modifiedAt
*/


import Cache from '../cache/cache';
import { ICreateInvoice } from './interface'
export default class InvoiceRepository {
    public static create(data: ICreateInvoice) {
        const { receiverUserId, amount } = data;
        const createdAt = new Date(), modifiedAt = new Date()
        const invoiceId = Date.now();

        // using node cache to mock a database
        Cache.setData(receiverUserId, { invoiceId, amount, createdAt, modifiedAt });
        return { invoiceId, amount, receiverUserId, createdAt, modifiedAt };
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

        invoiceData["modifiedAt"] = new Date();
        Cache.setData(receiverUserId, invoiceData);
        return {
            isValid: true,
            data: { ...invoiceData, receiverUserId }
        };
    }
}