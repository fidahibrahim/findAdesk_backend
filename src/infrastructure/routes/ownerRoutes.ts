import express, { Router } from "express"
import ownerUseCase from "../../usecases/ownerUseCase"
import HashingService from "../utils/HashingService"
import ownerModel from "../model/ownerSchema"
import ownerRepository from "../../adapters/repository/ownerRepository"
import { ownerController } from "../../adapters/controller/ownerController"
import OtpModel from "../model/otpSchema"
import OtpService from "../utils/otpService"


const ownerRouter: Router = express.Router()

const hashingService = new HashingService()
const otpService = new OtpService()

const OwnerRepository = new ownerRepository(ownerModel, OtpModel)
const OwnerUseCase = new ownerUseCase(
    OwnerRepository,
    hashingService,
    otpService
)
const OwnerController = new ownerController(OwnerUseCase)

ownerRouter.post('/register', OwnerController.register)
ownerRouter.post('/verifyOtp', OwnerController.verifyOtp)

export default ownerRouter