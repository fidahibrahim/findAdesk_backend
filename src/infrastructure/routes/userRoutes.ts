import express, { Router } from 'express'
import { UserController } from '../../adapters/controller/userController'
import userUseCase from '../../usecases/userUseCase'
import userRepository from '../../adapters/repository/userRepository'
import users from "../model/userSchema"
import HashingService from "../utils/HashingService"
import OtpSchema from "../model/otpSchema"
import OtpService from "../utils/otpService"
import JwtToken from "../utils/jwtService"
import authenticateUser from '../middleware/userAuth'
import workspaceModel from '../model/workspaceSchema'

const userRouter: Router = express.Router()

const hashingService = new HashingService()
const otpService = new OtpService()
const jwtService = new JwtToken()

const UserRepository = new userRepository(users, OtpSchema, workspaceModel)

const UserUseCase = new userUseCase(
    UserRepository,
    hashingService,
    otpService,
    jwtService
)
const userController = new UserController(UserUseCase)

// user authentication
userRouter.post('/register', userController.register)
userRouter.post('/verifyOtp', userController.verifyOtp)
userRouter.post('/resendOtp', userController.resendOtp)
userRouter.post('/login', userController.login)
userRouter.post('/logout', userController.logout)
userRouter.post('/googleLogin', userController.googleLogin)
userRouter.post('/forgotPassword', userController.forgotPassword)
userRouter.post('/changePassword', userController.changePassword)
userRouter.post('/contactUs', userController.contactService)

userRouter.get('/getProfile', authenticateUser, userController.getProfile)

userRouter.get('/recents', userController.getRecentWorkspaces)
userRouter.post('/searchWorkspaces', authenticateUser, userController.filterWorkspaces)
userRouter.get('/workspaceDetails', authenticateUser, userController.workspaceDetails)
userRouter.post('/checkAvailability', authenticateUser, userController.checkAvailability)

export default userRouter