import { NextFunction, Request, Response, Router } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import ApiError from '../../abstractions/ApiError';
import BaseApi from '../BaseApi';
import UserRepository from '../../repositories/user.repository'
import { sign, SignOptions } from 'jsonwebtoken';
import { isAuthenticated } from '../../middleware/isAuthenticated'

/**
 * Status controller
 */
export default class UserController extends BaseApi {
	/**
	 *
	 */
	constructor() {
		super();
	}

	/**
	 *
	 */

    // we should also make a refresh access token
    // api for a fresh token with a longer expiry and so on., because we are making a token with an expiry.
    // So one more api should be made for .get('/refreshAccessToken')
	public register(): Router {
		this.router.get('/error', this.getError.bind(this));
		this.router.post('/create', this.createUser.bind(this));
        this.router.get('/details', async (req, res, next) => await this.getUser(req, res, next));
        this.router.patch('/update', async (req, res, next) => await this.updateUser(req, res, next))
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

	public createUser(req: Request, res: Response, next: NextFunction): any {
        const { body } = req;
        const { mobile, email, countryCode, role } = body;
        const TOKEN_SECRET = 'validSecret'
        const ACCESS_TOKEN_ALGO = 'HS384'


        const userId = UserRepository.create({ mobile, email, countryCode, role, createdAt: new Date(), isActive: 1 });

        const token = sign(
            { id: userId, role },
            TOKEN_SECRET,
            <SignOptions>{
                expiresIn: '7d',
                algorithm: ACCESS_TOKEN_ALGO
            }
        );

		const response = {
			userId,
            token
		};
		res.locals.data = response;
		super.send(res);
	}

    public async getUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        const { query } = req;
        const { token, queryUserId, isAdminDetails } = query;

        // if token doesnt exist, its a bad request, we can also say 403 forbidden.
        if (!token) {
            res.locals.data = { data: null, message: 'BadRequest', statusCode: 400 };
            super.send(res, 400)
        }

       

        const result = await isAuthenticated(token);

        // if token isnt valid, or extincted, we say forbidden, we can also implement
        // refresh access token logic for the same.

        if (result.isValid == false) {
            res.locals.data = { data: null, message: 'Forbidden', statusCode: 403 };
            super.send(res)
        }

        if (result.role == 'admin') {
            if (queryUserId && !isAdminDetails) {
                const userData = UserRepository.get(queryUserId);

                res.locals.data = !userData
                    ? { data: null, message: 'User Not Found', statusCode: 204 }
                    : res.locals.data = { data: userData, message: 'Successful fetch' };

                super.send(res)
            }
        }


        const userId = result.id;

        const userData = UserRepository.get(userId);

        res.locals.data = !userData
            ? { data: null, message: 'User Not Found' , statusCode: 204}
            : res.locals.data = { data: userData, message: 'Successful fetch' };

        super.send(res)
        
    
    }

    public async updateUser(req: Request, res: Response, next: NextFunction): Promise<any>{
        const { headers , body} = req;
        const { token } = headers;
        const { queryUserId, updateData } = body;

        const result = await isAuthenticated(token);

        if (result.isValid == false) {
            res.locals.data = { data: null, message: 'Forbidden', statusCode: 403 };
            super.send(res)
        }

         // if its not admin, user cannot be updated.
         if (result.role != 'admin') {
            return;
        }
        UserRepository.update(queryUserId, updateData);
        res.locals.data = {data : null , message : 'Successful fetch'};
        super.send(res)
    }
}
