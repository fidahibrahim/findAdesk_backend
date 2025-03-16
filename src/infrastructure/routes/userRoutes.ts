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
import multer from 'multer'
import bookingRepository from '../../adapters/repository/bookingRepository'
import bookingModel from '../model/bookingSchema'
import bookingUseCase from '../../usecases/bookingUseCase'
import { bookingController } from '../../adapters/controller/bookingController'
import workspaceRepository from '../../adapters/repository/workspaceRepository'

const userRouter: Router = express.Router()
const upload = multer()

const hashingService = new HashingService()
const otpService = new OtpService()
const jwtService = new JwtToken()

const UserRepository = new userRepository(users, OtpSchema, workspaceModel)
const BookingRepository = new bookingRepository(bookingModel)
const WorkspaceRepository = new workspaceRepository(workspaceModel)


const UserUseCase = new userUseCase(
    UserRepository,
    hashingService,
    otpService,
    jwtService
)
const BookingUseCase = new bookingUseCase(
    BookingRepository,
    WorkspaceRepository,
    UserRepository
)

const userController = new UserController(UserUseCase)
const BookingController = new bookingController(BookingUseCase)


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
userRouter.put('/editProfile', authenticateUser, upload.single('image'), userController.editProfile)
userRouter.post('/profile/resetPassword', authenticateUser, userController.resetPassword)

userRouter.get('/recents', userController.getRecentWorkspaces)
userRouter.post('/searchWorkspaces', authenticateUser, userController.filterWorkspaces)
userRouter.get('/workspaceDetails', authenticateUser, userController.workspaceDetails)
userRouter.post('/checkAvailability', authenticateUser, BookingController.checkAvailability)
userRouter.post('/bookings', authenticateUser, BookingController.createBooking)

export default userRouter