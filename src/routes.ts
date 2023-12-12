import { Router } from 'express';
import SystemStatusController from './components/system-status/system-status.controller';
import UserController from './components/payment/user.api';
import PaymentsController from './components/payment/payment.api';
/**
 * Here, you can register routes by instantiating the controller.
 *
 */
export default function registerRoutes(): Router {
	const router = Router();

	// System Status Controller
	const systemStatusController: SystemStatusController =
		new SystemStatusController();
	router.use('/api/status', systemStatusController.register());

	/*
	Ideal flow will be,
	-- online
	the user click on the purchase button for a listing/landingPage
	a form appears for the detail.
	a user account is created for the same and token is given out in response.
	the razorpay (any payment provider page opens then user completes the payment)
	//
	-- this api is pending,
	the payment amount we recieve from razorpay back should match with equally with the amount
	we calculated for the order, else we refund the amount.
	//
	if the order is a success, we call our createOrder api, to populate
	our database.


	-- offline
	if a user has paid in an offline mode, using upi to owner or whatever
	the flow should be, admin creates that user if it doesnt exist 
	(by checking out getUserDetails api the filter will be mobile/email not userId as mentioned
	but as i am using node-cache i cannot filter with key userId, or i can make a key with userId_mobile 
	and search on pattern with mobile here and find out if he exist or not.)

	he creates the user, and calls the createOrder api with offline mode and other details.

	Note: 
	Admin shouldnt use postman.
	Admin should be given a admin-utility for the same where he just puts the in fields.
	It is more safe.
	We can use keyStone for the same, its secure and easy to maintain and use.

	A better option instead of just having modifiedAt in invoice table
	We should have a paymentInvoiceMap table, where if payment is successfull
	and we update or create entry in invoice table, we just create a mapping
	in paymentInvoiceMap table that, this record has been updated because of this payment.
	The payment details will be in payment table, net invoices will be in invoices table,
	and its map we will in paymentInvoiceMap table.
	*/ 
	router.use('/user', new UserController().register());
	
	router.use('/payment', new PaymentsController().register());

	return router;
}
