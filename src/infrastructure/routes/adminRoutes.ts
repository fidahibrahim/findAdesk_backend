import express, { Router } from "express"
import { adminController } from "../../adapters/controller/adminController"
import user from "../model/userSchema"
import adminRepository from "../../adapters/repository/adminRepository"
import adminUseCase from "../../usecases/adminUseCase"
import JwtToken from '../utils/jwtService'
import HashingService from "../utils/HashingService"

const JwtService = new JwtToken()
const HashingServiceInstance = new HashingService()
const AdminRepository = new adminRepository(user, user)

const AdminUseCaseInstance = new adminUseCase(
    AdminRepository,
    HashingServiceInstance,
    JwtService
)

const adminRouter: Router = express.Router()
const AdminController = new adminController(AdminUseCaseInstance)

adminRouter.post('/login', AdminController.login)
adminRouter.post('/logout', AdminController.logout)

// user management 
adminRouter.get("/getUsers", AdminController.getUsers)
adminRouter.patch("/blockUser", AdminController.blockUser)


export default adminRouter