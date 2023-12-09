import { NextFunction, Request, Response, Router } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import ApiError from '../../abstractions/ApiError';
import BaseApi from '../BaseApi';
import { isAuthenticated } from '../../middleware/isAuthenticated'
import InvoiceRepository from '../../repositories/invoice.repository';
import PaymentRepository from '../../repositories/payment.repository';

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

	public async createOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
        const { headers , body} = req;
        const { token } = headers;

        let {receiverUserId, amount, method, status} = body

        const result = await isAuthenticated(token);

        if (result.isValid == false) {
            res.locals.data = { data: null, message: 'Forbidden', statusCode: 403 };
            super.send(res)
        }
        const payerUserId = result.id;

        //create payment entry regardless of the status
        const paymentId = PaymentRepository.create({ payerUserId, receiverUserId, amount, method, status })

        let invoice = InvoiceRepository.get(receiverUserId);

        if(invoice) {
            // update amount for that userId if status is success
            if (status == 'success') {
                invoice = InvoiceRepository.update( receiverUserId , { amount : invoice.amount + amount });
            }
        } else {
            // create invoice entry for receiverUserId if status is success
            if (status == 'success') {
                invoice = InvoiceRepository.create( { receiverUserId, amount });
            }
        }
		const response = {
            paymentId,
            invoice
		};
		res.locals.data = response;
		super.send(res);
	}
}
