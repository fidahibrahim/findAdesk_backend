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
import SavedWorkspace from '../model/savedWorkspaceSchema'
import reviewRepository from '../../adapters/repository/reviewRepository'
import reviewUseCase from '../../usecases/reviewUseCase'
import { reviewController } from '../../adapters/controller/reviewController'
import reviewModel from '../model/reviewSchema'
import walletRepository from '../../adapters/repository/walletRepository'
import Wallet from '../model/walletSchema'
import walletUseCase from '../../usecases/walletUseCase'
import { walletController } from '../../adapters/controller/walletController'

const userRouter: Router = express.Router()
const upload = multer()

const hashingService = new HashingService()
const otpService = new OtpService()
const jwtService = new JwtToken()

const UserRepository = new userRepository(users, OtpSchema, workspaceModel, SavedWorkspace, reviewModel)
const BookingRepository = new bookingRepository(bookingModel, workspaceModel, SavedWorkspace, reviewModel)
const WorkspaceRepository = new workspaceRepository(workspaceModel, SavedWorkspace)
const ReviewRepository = new reviewRepository(reviewModel, bookingModel, workspaceModel)
const WalletRepository = new walletRepository(Wallet)

const UserUseCase = new userUseCase(
    UserRepository,
    BookingRepository,
    WorkspaceRepository,
    hashingService,
    otpService,
    jwtService
)
const BookingUseCase = new bookingUseCase(
    BookingRepository,
    WorkspaceRepository,
    UserRepository,
    ReviewRepository,
    WalletRepository
)
const ReviewUseCase = new reviewUseCase(
    ReviewRepository
)
const WalletUseCase = new walletUseCase(
    WalletRepository
)

const userController = new UserController(UserUseCase)
const BookingController = new bookingController(BookingUseCase)
const ReviewController = new reviewController(ReviewUseCase)
const WalletController = new walletController(WalletUseCase)

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
userRouter.get('/bookingHistory', authenticateUser, userController.getBookingHistory)
userRouter.get('/fetchBookingDetails', authenticateUser, BookingController.fetchBookingDetails)

userRouter.get('/recents', userController.getRecentWorkspaces)
userRouter.post('/searchWorkspaces', authenticateUser, userController.filterWorkspaces)
userRouter.get('/workspaceDetails', authenticateUser, userController.workspaceDetails)
userRouter.post('/checkAvailability', authenticateUser, BookingController.checkAvailability)
userRouter.post('/pendingBookings', authenticateUser, BookingController.createBooking)
userRouter.get("/bookings/details", authenticateUser, BookingController.getBookingDetails)
userRouter.post('/bookings/createStripeSession', BookingController.createStripeSession)
userRouter.post('/webhook', express.raw({ type: "application/json" }), BookingController.stripeWebhook)
userRouter.get('/bookingConfirmDetails', authenticateUser, BookingController.bookingConfirmDetails)
userRouter.patch('/booking/cancel', authenticateUser, BookingController.cancelBooking)

userRouter.post('/saveWorkspace', authenticateUser, userController.saveWorkspace)

//Review
userRouter.post('/addReview', authenticateUser, ReviewController.addReview)
userRouter.get('/getReviews', authenticateUser, ReviewController.getReviews)

userRouter.get('/wallet', authenticateUser, WalletController.getWallet)
userRouter.post('/bookings/walletPayment', WalletController.processWalletPayment)


export default userRouter