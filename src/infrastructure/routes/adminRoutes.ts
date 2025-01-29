import express, { Router } from "express"
import { adminController } from "../../adapters/controller/adminController"
import user from "../model/userSchema"
import ownerModel from "../model/ownerSchema"
import adminRepository from "../../adapters/repository/adminRepository"
import adminUseCase from "../../usecases/adminUseCase"
import JwtToken from '../utils/jwtService'
import HashingService from "../utils/HashingService"
import otpService from "../utils/otpService"
import adminAuth from "../middleware/adminAuth"
import workspaceModel from "../model/workspaceSchema"

const JwtService = new JwtToken()
const HashingServiceInstance = new HashingService()
const OtpService = new otpService()
const AdminRepository = new adminRepository(user, user, ownerModel, workspaceModel)

const AdminUseCaseInstance = new adminUseCase(
    AdminRepository,
    HashingServiceInstance,
    JwtService,
    OtpService
)

const adminRouter: Router = express.Router()
const AdminController = new adminController(AdminUseCaseInstance)

adminRouter.post('/login', AdminController.login)
adminRouter.post('/logout', AdminController.logout)

// user management 
adminRouter.get("/getUsers", adminAuth, AdminController.getUsers)
adminRouter.patch("/blockUser", adminAuth, AdminController.blockUser)

// owner management
adminRouter.get("/getOwners", adminAuth,  AdminController.getOwners)
adminRouter.patch("/blockOwner", adminAuth, AdminController.blockOwner)

// workspace management
adminRouter.get("/getWorkspaces", adminAuth, AdminController.getWorkspaces)
adminRouter.put("/updateStatus", adminAuth, AdminController.updateStatus)

export default adminRouter