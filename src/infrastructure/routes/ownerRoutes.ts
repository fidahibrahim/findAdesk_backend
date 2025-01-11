import express, { Router } from "express"
import ownerUseCase from "../../usecases/ownerUseCase"
import HashingService from "../utils/HashingService"
import ownerModel from "../model/ownerSchema"
import ownerRepository from "../../adapters/repository/ownerRepository"
import { ownerController } from "../../adapters/controller/ownerController"
import OtpModel from "../model/otpSchema"
import OtpService from "../utils/otpService"
import JwtService from "../utils/jwtService"


const ownerRouter: Router = express.Router()

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

ownerRouter.post('/register', OwnerController.register)
ownerRouter.post('/verifyOtp', OwnerController.verifyOtp)
ownerRouter.post('/resendOtp', OwnerController.resendOtp)
ownerRouter.post('/', OwnerController.login)
ownerRouter.post('/logout', OwnerController.logout)

export default ownerRouter