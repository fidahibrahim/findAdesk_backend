import express, { Router } from 'express'
import { UserController } from '../../adapters/controller/userController'
import userUseCase from '../../usecases/userUseCase'
import userRepository from '../../adapters/repository/userRepository'
import users from "../model/userSchema"
import HashingService from "../utils/HashingService"
import OtpSchema from "../model/otpSchema"
import OtpService from "../utils/otpService"
import JwtToken from "../utils/jwtService"

const userRouter: Router = express.Router()

const hashingService = new HashingService()
const otpService = new OtpService()
const jwtService = new JwtToken()

const UserRepository = new userRepository(users, OtpSchema)

const UserUseCase = new userUseCase(
    UserRepository,
    hashingService,
    otpService,
    jwtService
)
const userController = new UserController(UserUseCase)

userRouter.post('/register', userController.register)
userRouter.post('/verifyOtp', userController.verifyOtp)
userRouter.post('/resendOtp', userController.resendOtp)
userRouter.post('/login', userController.login)
userRouter.post('/logout', userController.logout)

export default userRouter