import { Request, Response } from "express";
import { IAdminController } from "../../interface/Controller/IAdminController";
import { IadminUseCase } from "../../interface/Usecase/IadminUseCase";


export class adminController implements IAdminController {
    private adminUsecase: IadminUseCase;
    constructor(adminUsecase: IadminUseCase) {
        this.adminUsecase = adminUsecase
        this.login = this.login.bind(this)
        this.getUsers = this.getUsers.bind(this)

    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const response = await this.adminUsecase.login(email, password)
            console.log("responseee from contr", response)
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
            res.cookie("adminToken", "", { httpOnly: true, expires: new Date() })
            res.status(200).json({ status: true })
        } catch (error) {
            console.log(error)
        }
    }
    async getUsers(req: Request, res: Response) {
        try {
            const users = this.adminUsecase.getUsers()
            console.log(users, "uuuuuuu")
            res.status(200).json({ users });
        } catch (error) {
            console.log(error);
        }
    }
}