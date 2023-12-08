import { Router } from 'express';
import SystemStatusController from './components/system-status/system-status.controller';
import PaymentsController from './components/payment/payment.controller';
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

	router.use('/payment/status', new PaymentsController().register());

	return router;
}
