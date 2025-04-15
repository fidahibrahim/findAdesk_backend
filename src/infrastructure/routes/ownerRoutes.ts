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
import bookingRepository from "../../adapters/repository/bookingRepository"
import bookingModel from "../model/bookingSchema"
import bookingUseCase from "../../usecases/bookingUseCase"
import userRepository from "../../adapters/repository/userRepository"
import userModel from "../model/userSchema"
import { bookingController } from "../../adapters/controller/bookingController"
import SavedWorkspace from "../model/savedWorkspaceSchema"
import reviewModel from "../model/reviewSchema"
import reviewRepository from "../../adapters/repository/reviewRepository"
import walletRepository from "../../adapters/repository/walletRepository"
import Wallet from "../model/walletSchema"
import reviewUseCase from "../../usecases/reviewUseCase"
import { reviewController } from "../../adapters/controller/reviewController"

const ownerRouter: Router = express.Router()
const upload = multer()

const hashingService = new HashingService()
const otpService = new OtpService()
const jwtService = new JwtService()

const OwnerRepository = new ownerRepository(ownerModel, OtpModel, workspaceModel, bookingModel)
const BookingRepository = new bookingRepository(bookingModel, workspaceModel, SavedWorkspace, reviewModel)
const UserRepository = new userRepository(userModel, OtpModel, workspaceModel, SavedWorkspace, reviewModel)
const WorkspaceRepository = new workspaceRepository(workspaceModel, SavedWorkspace)
const ReviewRepository = new reviewRepository(reviewModel, bookingModel, workspaceModel)
const WalletRepository = new walletRepository(Wallet)

const OwnerUseCase = new ownerUseCase(
    OwnerRepository,
    hashingService,
    otpService,
    jwtService
)
const WorkspaceUseCase = new workspaceUseCase(
    WorkspaceRepository,
    OwnerRepository
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

const OwnerController = new ownerController(OwnerUseCase)
const WorkspaceController = new workspaceController(WorkspaceUseCase)
const BookingController = new bookingController(BookingUseCase)
const ReviewController = new reviewController(ReviewUseCase)

ownerRouter.post('/register', OwnerController.register)
ownerRouter.post('/verifyOtp', OwnerController.verifyOtp)
ownerRouter.post('/resendOtp', OwnerController.resendOtp)
ownerRouter.post('/', OwnerController.login)
ownerRouter.post('/logout', OwnerController.logout)

// dashboard
ownerRouter.get('/dashboardData', ownerAuth, OwnerController.getDashboardData)

// workspace management 
ownerRouter.get('/listWorkspaces', ownerAuth, WorkspaceController.listWorkspaces)
ownerRouter.post('/addWorkspace', ownerAuth, upload.array('images'), WorkspaceController.addWorkspace)
ownerRouter.get("/viewDetails", ownerAuth, WorkspaceController.workspaceDetails)
ownerRouter.delete('/deleteWorkspace', ownerAuth, WorkspaceController.deleteWorkspace)
ownerRouter.put('/editWorkspace', ownerAuth, upload.array('images'), WorkspaceController.editWorkspace)

// booking management
ownerRouter.get('/listBookings', ownerAuth, BookingController.listBookings)
ownerRouter.get('/bookingViewDetails', ownerAuth, BookingController.getBookingDetailsOwner)

ownerRouter.get('/getAllReviews', ownerAuth, ReviewController.getAllReviews)

export default ownerRouter