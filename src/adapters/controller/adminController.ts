import { Request, Response } from "express";
import { IAdminController } from "../../interface/Controller/IAdminController";
import { IadminUseCase } from "../../interface/Usecase/IadminUseCase";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { ResponseMessage } from "../../constants/responseMssg";


export class adminController implements IAdminController {
    private adminUsecase: IadminUseCase;
    constructor(adminUsecase: IadminUseCase) {
        this.adminUsecase = adminUsecase
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.getUsers = this.getUsers.bind(this)
        this.blockUser = this.blockUser.bind(this)
        this.getOwners = this.getOwners.bind(this)
        this.blockOwner = this.blockOwner.bind(this)
        this.getWorkspaces = this.getWorkspaces.bind(this)
        this.updateStatus = this.updateStatus.bind(this)
        this.viewWorkspaceDetails = this.viewWorkspaceDetails.bind(this)
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const response = await this.adminUsecase.login(email, password)
            if (response?.message == "Invalid Email") {
                res.status(403).json({ message: "Invalid Email" });
            }
            if (response?.message == "Incorrect Password") {
                res.status(403).json({ message: "incorrect password" });
            }
            if (response?.message == "Logined successfully") {
                res.cookie("adminToken", response.token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000,
                }).cookie("adminRefreshToken", response.adminRefreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.status(200).json({ message: "logined Successfully", admin: response.admin });
            }
        } catch (error) {
            console.log(error)
        }
    }
    async logout(req: Request, res: Response) {
        try {
            console.log(req.cookies, "cookiee before")
            res.cookie("adminToken", "", { httpOnly: true, expires: new Date() })
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.LOGIN_SUCCESS, HttpStatusCode.OK, { status: true }))

        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.LOGOUT_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const search = req.query.search?.toString() || ''
            const page = parseInt(req.query.page as string, 10) || 1
            const limit = 6
            const { users, totalPages } = await this.adminUsecase.getUsers(search, page, limit)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_USERS_SUCCESS, HttpStatusCode.OK, { users, totalPages }))

        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_USERS_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async blockUser(req: Request, res: Response) {
        try {
            const { userId } = req.body
            const response = await this.adminUsecase.blockUser(userId)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.USER_BLOCKED, HttpStatusCode.OK, { response }))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.USER_UNBLOCKED, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async getOwners(req: Request, res: Response): Promise<void> {
        try {
            const search = req.query.search?.toString() || ''
            const page = parseInt(req.query.page as string, 10) || 1
            const limit = 6
            const { owners, totalPages } = await this.adminUsecase.getOwners(search, page, limit)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_OWNERS_SUCCESS, HttpStatusCode.OK, { owners, totalPages }))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_OWNERS_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async blockOwner(req: Request, res: Response): Promise<void> {
        try {
            const { ownerId } = req.body
            const response = await this.adminUsecase.blockOwner(ownerId)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.OWNER_BLOCKED, HttpStatusCode.OK, { response }))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.OWNER_UNBLOCKED, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async getWorkspaces(req: Request, res: Response) {
        try {
            const search = req.query.search?.toString() || ''
            const page = parseInt(req.query.page as string, 10) || 1
            const status = req.query.filter?.toString() || 'all';
            const limit = 6
            const { workspaces, totalPages } = await this.adminUsecase.getWorkspaces(search, page, limit, status)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.USER_BLOCKED, HttpStatusCode.OK, { workspaces, totalPages }))
        } catch (error) {
            console.log(error)
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const { workspaceId, status } = req.body
            const response = await this.adminUsecase.updateStatus(workspaceId, status)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.USER_BLOCKED, HttpStatusCode.OK, { response }))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.UPDATE_WORKSPACE_STATUS_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async viewWorkspaceDetails(req: Request, res: Response) {
        try {
            const workspaceId = req.query.workspaceId as string
            const response = await this.adminUsecase.workspaceDetails(workspaceId)
            console.log(response, "response in controller")
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
}