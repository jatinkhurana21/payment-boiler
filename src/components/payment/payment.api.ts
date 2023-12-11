import { NextFunction, Request, Response, Router } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import ApiError from '../../abstractions/ApiError';
import BaseApi from '../BaseApi';
import { isAuthenticated } from '../../middleware/isAuthenticated'
import InvoiceRepository from '../../repositories/invoice.repository';
import PaymentRepository from '../../repositories/payment.repository';
import { ICreatePayment } from './interface'
/**
 * Status controller
 */
export default class PaymentsController extends BaseApi {
	/**
	 *
	 */
	constructor() {
		super();
	}

	/**
	 *
	 */
	public register(): Router {
		this.router.get('/error', this.getError.bind(this));
		this.router.post('/createOrder', this.createOrder.bind(this));
		return this.router;
	}

	/**
	 *
	 * @param req
	 * @param res
	 * @param next
	 */
	public getError(req: Request, res: Response, next: NextFunction): void {
		try {
			throw new ApiError(
				ReasonPhrases.BAD_REQUEST,
				StatusCodes.BAD_REQUEST,
			);
		} catch (error) {
			// from here error handler will get call
			next(error);
		}
	}

	// this is the flow which will happen after the payment has been made.
	// we should also make an api, which will generate a payment link from razorpay.
	// we should also store a userId vs paymentLink mapping table for the same.
	public async createOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
		const { headers, body } = req;
		const { token } = headers;

		let { receiverUserId, amount, method, status, mode, payerUserId } = body

		const result = await isAuthenticated(token);

		if (result.isValid == false) {
			res.locals.data = { data: null, message: 'Forbidden', statusCode: 403 };
			super.send(res)
		}

		// we can also use strategy design pattern here as the work is similar
		// for offline and only they will be two strategies (or factories.)
		// mode will be offline and online
		if (mode == 'offline') {
			// now token will be of admin.
			// an offline payment order creation should only happen with admin.
			if (result.role != 'admin') {
				res.locals.data = { data: null, message: 'Bad Request', statusCode: 400 };
				super.send(res)
			}

			// if admin, it should specify which userId paid for it.
			// so now i need payerUserId before hand as request isnt coming 
			// from front end and the token present is of admin.

			if (!payerUserId) {
				res.locals.data = { data: null, message: 'Bad Request', statusCode: 400 };
				super.send(res)
			}
		}

		// if payerUserId is set it means, it was admin and mode was offline, else it was 
		// from frontEnd and online payment, so we take payerUserId from 
		payerUserId = (payerUserId && mode == 'offline' && result.role == 'admin') ? payerUserId : result.id
		const response = this.createPayment({ payerUserId, receiverUserId, amount, method, status, mode })
		res.locals.data = response;
		super.send(res);
	}

	private async createPayment(data: ICreatePayment): Promise<{ paymentId; invoice; }> {
		const { payerUserId, receiverUserId, amount, method, status, mode } = data;

		// the problem we discussed, that more webhooks might come instead of one, we will just be making more entries
		// of it in our payments table, we are not updating it.
		// and we only update in Invoice Table when the payment is 'Success'.
		// No service provider ideally should send two success webhooks for the same.
		// If more comes, after success, it will be failure or in pending state
		// what if two webhooks come for success?
		// i need to have a razorpayId for the same then, something unique to identify it is for the same
		// purchase.
		// because a user can have two or more payment in a positive case as well.
		const paymentId = PaymentRepository.create({ payerUserId, receiverUserId, amount, method, status, mode })

		let invoice = InvoiceRepository.get(receiverUserId);

		if (invoice) {
			// update amount for that userId if status is success
			if (status == 'success') {
				invoice = InvoiceRepository.update(receiverUserId, { amount: invoice.amount + amount });
			}
		} else {
			// create invoice entry for receiverUserId if status is success
			if (status == 'success') {
				invoice = InvoiceRepository.create({ receiverUserId, amount });
			}
		}

		return {
			paymentId,
			invoice
		}
	}
}
