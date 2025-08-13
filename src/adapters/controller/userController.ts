import { HttpStatusCode } from "../../constants/httpStatusCode";
import { ResponseMessage } from "../../constants/responseMssg";
import { AuthenticatedRequestUser } from "../../infrastructure/middleware/userAuth";
import { handleError, handleErrorr, handleSuccess, handleSuccesss, sendResponse } from "../../infrastructure/utils/responseHandler";
import { IuserUseCase } from "../../interface/Usecase/IUserUseCase";
import { Request, Response } from "express"
import Stripe from "stripe";

export class UserController {
    private userUseCase: IuserUseCase
    constructor(userUseCase: IuserUseCase) {
        this.userUseCase = userUseCase
        this.register = this.register.bind(this)
        this.verifyOtp = this.verifyOtp.bind(this)
        this.resendOtp = this.resendOtp.bind(this)
        this.login = this.login.bind(this)
        this.googleLogin = this.googleLogin.bind(this)
        this.forgotPassword = this.forgotPassword.bind(this)
        this.changePassword = this.changePassword.bind(this)
        this.getProfile = this.getProfile.bind(this)
        this.editProfile = this.editProfile.bind(this)
        this.resetPassword = this.resetPassword.bind(this)
        this.contactService = this.contactService.bind(this)
        this.getRecentWorkspaces = this.getRecentWorkspaces.bind(this)
        this.filterWorkspaces = this.filterWorkspaces.bind(this)
        this.workspaceDetails = this.workspaceDetails.bind(this)
        this.getBookingHistory = this.getBookingHistory.bind(this)
        this.saveWorkspace = this.saveWorkspace.bind(this)
        this.addSubscription = this.addSubscription.bind(this)
        this.verifySubscription = this.verifySubscription.bind(this)
    }
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { username: name, email, password } = req.body
            if (!name || !email || !password) {
                res.status(HttpStatusCode.BAD_REQUEST)
                    .json(handleError(ResponseMessage.FIELDS_REQUIRED, HttpStatusCode.BAD_REQUEST))
                return
            }
            const data = { name, email, password }
            const response = await this.userUseCase.register(data)
            res.status(HttpStatusCode.CREATED)
                .json(handleSuccess(ResponseMessage.USER_REGISTER_SUCCESS, HttpStatusCode.CREATED, response));
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.USER_REGISTER_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async verifyOtp(req: Request, res: Response) {
        try {
            const { otp, email } = req.body
            if (!email || !otp) {
                res.status(400).json({ status: false, message: "Email and OTP are required" });
                return;
            }
            const response = await this.userUseCase.verifyOtp(email, otp)
            if (!response?.status) {
                res.status(401).json(response)
                return
            }
            res.status(200).json(response)
        } catch (error) {
            res.json(error)
        }
    }
    async resendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body
            const response = await this.userUseCase.resendOtp(email)
            if (response == "ResendOtp successfull") {
                res.json({ status: 200 });
            } else {
                res.status(400).json({ message: "Invalid email" })
            }
        } catch (error) {
            res.json(error)
        }
    }
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            const data = {
                email,
                password
            }
            const response = await this.userUseCase.login(data)
            if (response?.status && response.message == "Logined Successfully") {
                const { token, refreshToken } = response
                res.cookie("userToken", token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000,
                    sameSite: 'none',
                    secure: true
                }).cookie("userRefreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    sameSite: 'none',
                    secure: true
                })
                res.status(200).json({ status: true, message: 'Logined Successfully', user: response.user })
            } else if (
                response?.status === false && response.message == "Your account is blocked. Please contact support."
            ) {
                res.status(403).json({ status: false, message: response.message });
            }
            else if (
                !response?.status && response?.message == "Otp is not verified"
            ) {
                res.cookie("otpEmail", email, { maxAge: 3600000 })
                res.status(403).json({ isVerified: "false" });
            } else if (response?.status) {
                res.status(200).json(response);
            } else if (!response?.status && response?.message == "Incorrect Password") {
                res.status(403).json(response);
            } else {
                res.status(403).json(response);
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.LOGIN_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async logout(req: Request, res: Response) {
        try {
            res.cookie("userToken", "", { httpOnly: true, expires: new Date() }).cookie("userRefreshToken", "", { httpOnly: true, expires: new Date() })
            res
                .status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.LOGOUT_SUCCESS, HttpStatusCode.OK, { status: true }));
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.LOGOUT_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async googleLogin(req: Request, res: Response) {
        try {
            const { access_token } = req.body
            const response = await this.userUseCase.fetchGoogleUserDetails(access_token)
            if (response?.status && response.message == "Successfull") {
                const { token, refreshToken } = response
                res.cookie("userToken", token, {
                    httpOnly: true,
                    maxAge: 360000,
                }).cookie("userRefreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                res
                    .status(200).json({ status: true, message: 'Successfull', user: response.user })
            }

        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.GOOGLE_LOGIN_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body
            const response = await this.userUseCase.validateForgotPassword(email)
            if (response == "Email sended to the user") {
                res.status(HttpStatusCode.OK)
                    .json(handleSuccess(ResponseMessage.MAIL_SEND_SUCCESSFULLY, HttpStatusCode.OK))
                return;
            } else if (response == "user not exist with this email") {
                res
                    .status(HttpStatusCode.FORBIDDEN)
                    .json(handleError(ResponseMessage.INVALID_MAIL, HttpStatusCode.FORBIDDEN));
                return;
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.PASSWORD_RESET_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async changePassword(req: Request, res: Response) {
        try {
            const { token, password } = req.body
            await this.userUseCase.changePassword(token, password)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.PASSWORD_RESET_SUCCESS, HttpStatusCode.OK))

        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.PASSWORD_RESET_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async contactService(req: Request, res: Response) {
        try {
            const { name, email, subject, message } = req.body
            const response = await this.userUseCase.contactService(name, email, subject, message)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.MAIL_SEND_SUCCESSFULLY, HttpStatusCode.OK, response))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FAILED_SENDING_MAIL, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async getProfile(req: AuthenticatedRequestUser, res: Response) {
        try {
            const userId = req.user?.userId
            const response = await this.userUseCase.getProfile(userId)
            if (response) {
                sendResponse(res, handleSuccesss(ResponseMessage.FETCH_PROFILE, HttpStatusCode.OK, response));
            } else {
                sendResponse(res, handleErrorr(ResponseMessage.AUTHENTICATION_FAILURE, HttpStatusCode.NOT_FOUND));
            }
        } catch (error) {
            sendResponse(res, handleErrorr(ResponseMessage.FETCH_PROFILE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR, error));
        }
    }
    async editProfile(req: Request, res: Response) {
        try {
            const formData = {
                ...req.body,
                image: req.file,
            }
            const response = await this.userUseCase.editProfile(formData)
            if (response) {
                res.status(HttpStatusCode.OK)
                    .json(handleSuccess(ResponseMessage.UPDATE_PROFILE_SUCCESS, HttpStatusCode.OK))
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.UPDATE_PROFILE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async resetPassword(req: AuthenticatedRequestUser, res: Response) {
        try {
            const userId = req.user?.userId
            const { currentPassword, newPassword } = req.body
            await this.userUseCase.resetPassword(userId, currentPassword, newPassword)
            res.status(HttpStatusCode.OK)
                .json(handleError(ResponseMessage.PASSWORD_RESET_SUCCESS, HttpStatusCode.OK))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.PASSWORD_RESET_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async getBookingHistory(req: AuthenticatedRequestUser, res: Response) {
        try {
            const userId = req.user?.userId
            const filter = req.query.filter as string || 'all';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const response = await this.userUseCase.getBookingHistory(userId, filter, page, limit)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, HttpStatusCode.OK, response));
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.BOOKING_VIEWDETAILS_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async getRecentWorkspaces(req: Request, res: Response) {
        try {
            const response = await this.userUseCase.getRecentWorkspaces()
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_WORKSPACE_SUCCESS, HttpStatusCode.OK, response))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async filterWorkspaces(req: Request, res: Response) {
        try {
            const filters = req.body
            const workspaces = await this.userUseCase.searchWorkspaces(filters)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_WORKSPACE_SUCCESS, HttpStatusCode.OK, workspaces))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async workspaceDetails(req: AuthenticatedRequestUser, res: Response) {
        try {
            const workspaceId = req.query.workspaceId as string
            const userId = req.user?.userId;
            const response = await this.userUseCase.workspaceDetails(workspaceId, userId)
            if (response) {
                res.status(HttpStatusCode.OK)
                    .json(handleSuccess(ResponseMessage.WORKSPACE_VIEW_SUCCESS, HttpStatusCode.OK, response));
            } else {
                res.status(HttpStatusCode.NOT_FOUND)
                    .json(handleError(ResponseMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND));
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.WORKSPACE_VIEW_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async saveWorkspace(req: AuthenticatedRequestUser, res: Response) {
        try {
            const { workspaceId, isSaved } = req.body
            const userId = req.user?.userId
            const result = await this.userUseCase.saveWorkspace(userId, workspaceId, isSaved)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.SAVE_WORKSPACE_SUCCESS, HttpStatusCode.OK, result));
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.SAVE_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async addSubscription(req: AuthenticatedRequestUser, res: Response) {
        try {
            const { planType, amount } = req.body;
            const userId = req.user?.userId;
            if (!process.env.STRIPE_SECRET_KEY) {
                throw new Error(
                    "STRIPE_SECRET_KEY is not defined in environment variables"
                );
            }
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: planType,
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                metadata: {
                    userId: userId!,
                    planType: planType,
                    amount: amount,
                },
                success_url: `${process.env.SUCCESS_URL_PRO}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.SUCCESS_URL_PRO}/profile`,
            });
            res.status(HttpStatusCode.OK).json(handleSuccess(ResponseMessage.SUBSCRIPTION_SESSION, HttpStatusCode.OK, session));
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(handleError(ResponseMessage.SAVE_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async verifySubscription(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            if (!process.env.STRIPE_SECRET_KEY) {
                throw new Error(
                    "STRIPE_SECRET_KEY is not defined in environment variables"
                );
            }
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            const userId = session.metadata?.userId;

            const userDetails = await this.userUseCase.userDetails(userId!);

            if (session.payment_status === "paid") {
                const planType = session.metadata?.planType;
                const subscriptionStartDate = new Date();
                let subscriptionEndDate = new Date();

                if (planType === 'monthly') {
                    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
                } else if (planType === 'yearly') {
                    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
                }

                userDetails.isSubscribed = true;
                userDetails.subscriptionType = planType;
                userDetails.subscriptionStartDate = subscriptionStartDate;
                userDetails.subscriptionEndDate = subscriptionEndDate;

                await userDetails.save();

                const result = {
                    planType: planType,
                    amount: parseInt(session.metadata?.amount!),
                    subscriptionEndDate: subscriptionEndDate
                };

                res.status(HttpStatusCode.OK).json(handleSuccess(ResponseMessage.SUBSCRIPTION_VERIFIED, HttpStatusCode.OK, result));
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(handleError(ResponseMessage.SAVE_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
}