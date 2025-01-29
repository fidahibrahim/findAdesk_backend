import { Request, Response } from "express";
import { IAdminController } from "../../interface/Controller/IAdminController";
import { IadminUseCase } from "../../interface/Usecase/IadminUseCase";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { handleError } from "../../infrastructure/utils/responseHandler";
import { ResponseMessage } from "../../constants/responseMssg";
import { stat } from "fs";


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
                    maxAge: 3600000,
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
            res.status(200).json({ status: true })
            console.log(req.cookies, "cookiee after logout")

        } catch (error) {
            console.log(error)
        }
    }
    async getUsers(req: Request, res: Response) {
        try {
            const search = req.query.search?.toString() || ''
            const page = parseInt(req.query.page as string, 10) || 1
            const limit = 6
            const { users, totalPages } = await this.adminUsecase.getUsers(search, page, limit)
            res.status(200).json({ users, totalPages });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "An error occurred while fetching users" });
        }
    }
    async blockUser(req: Request, res: Response) {
        try {
            const { userId } = req.body
            const response = await this.adminUsecase.blockUser(userId)
            res.status(200).json(response);
        } catch (error) {
            console.log(error)
        }
    }
    async getOwners(req: Request, res: Response): Promise<void> {
        try {
            const search = req.query.search?.toString() || ''
            const page = parseInt(req.query.page as string, 10) || 1
            const limit = 6
            const { owners, totalPages } = await this.adminUsecase.getOwners(search, page, limit)
            res.status(200).json({ owners, totalPages });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "An error occurred while fetching users" });
        }
    }
    async blockOwner(req: Request, res: Response): Promise<void> {
        try {
            const { ownerId } = req.body
            const response = await this.adminUsecase.blockOwner(ownerId)
            res.status(200).json(response)
        } catch (error) {
            console.log(error)

        }
    }
    async getWorkspaces(req: Request, res: Response) {
        try {
            const response = await this.adminUsecase.getWorkspaces()
            res.status(200).json(response)
        } catch (error) {
            console.log(error)
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(handleError(ResponseMessage.FETCH_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async updateStatus(req: Request, res: Response) {
        try {
            const { workspaceId, status } = req.body
            const response = await this.adminUsecase.updateStatus(workspaceId, status)
            res.status(200).json(response)
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(handleError(ResponseMessage.UPDATE_WORKSPACE_STATUS_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
}