import express, { Router } from "express"
import multer from "multer"
import ownerUseCase from "../../usecases/ownerUseCase"
import HashingService from "../utils/HashingService"
import ownerModel from "../model/ownerSchema"
import ownerRepository from "../../adapters/repository/ownerRepository"
import { ownerController } from "../../adapters/controller/ownerController"
import OtpModel from "../model/otpSchema"
import OtpService from "../utils/otpService"
import JwtService from "../utils/jwtService"
import { workspaceController } from "../../adapters/controller/workspaceController"
import workspaceRepository from "../../adapters/repository/workspaceRepository"
import workspaceUseCase from "../../usecases/workspaceUseCase"
import workspaceModel from "../model/workspaceSchema"
import ownerAuth from "../middleware/ownerAuth"


const ownerRouter: Router = express.Router()
const upload = multer()

const hashingService = new HashingService()
const otpService = new OtpService()
const jwtService = new JwtService()

const OwnerRepository = new ownerRepository(ownerModel, OtpModel)
const OwnerUseCase = new ownerUseCase(
    OwnerRepository,
    hashingService,
    otpService,
    jwtService
)
const OwnerController = new ownerController(OwnerUseCase)

const WorkspaceRepository = new workspaceRepository(workspaceModel)
const WorkspaceUseCase = new workspaceUseCase(
    WorkspaceRepository,
    OwnerRepository

)
const WorkspaceController = new workspaceController(WorkspaceUseCase)

ownerRouter.post('/register', OwnerController.register)
ownerRouter.post('/verifyOtp', OwnerController.verifyOtp)
ownerRouter.post('/resendOtp', OwnerController.resendOtp)
ownerRouter.post('/', OwnerController.login)
ownerRouter.post('/logout', OwnerController.logout)

// workspace management 
ownerRouter.use(ownerAuth)
ownerRouter.post('/addWorkspace',  upload.array('images'), WorkspaceController.addWorkspace)

export default ownerRouter