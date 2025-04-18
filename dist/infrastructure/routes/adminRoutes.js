"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../../adapters/controller/adminController");
const userSchema_1 = __importDefault(require("../model/userSchema"));
const ownerSchema_1 = __importDefault(require("../model/ownerSchema"));
const adminRepository_1 = __importDefault(require("../../adapters/repository/adminRepository"));
const adminUseCase_1 = __importDefault(require("../../usecases/adminUseCase"));
const jwtService_1 = __importDefault(require("../utils/jwtService"));
const HashingService_1 = __importDefault(require("../utils/HashingService"));
const otpService_1 = __importDefault(require("../utils/otpService"));
const adminAuth_1 = __importDefault(require("../middleware/adminAuth"));
const workspaceSchema_1 = __importDefault(require("../model/workspaceSchema"));
const bookingRepository_1 = __importDefault(require("../../adapters/repository/bookingRepository"));
const bookingSchema_1 = __importDefault(require("../model/bookingSchema"));
const savedWorkspaceSchema_1 = __importDefault(require("../model/savedWorkspaceSchema"));
const reviewSchema_1 = __importDefault(require("../model/reviewSchema"));
const JwtService = new jwtService_1.default();
const HashingServiceInstance = new HashingService_1.default();
const OtpService = new otpService_1.default();
const AdminRepository = new adminRepository_1.default(userSchema_1.default, userSchema_1.default, ownerSchema_1.default, workspaceSchema_1.default, bookingSchema_1.default);
const BookingRepository = new bookingRepository_1.default(bookingSchema_1.default, workspaceSchema_1.default, savedWorkspaceSchema_1.default, reviewSchema_1.default);
const AdminUseCaseInstance = new adminUseCase_1.default(AdminRepository, BookingRepository, HashingServiceInstance, JwtService, OtpService);
const adminRouter = express_1.default.Router();
const AdminController = new adminController_1.adminController(AdminUseCaseInstance);
adminRouter.post('/login', AdminController.login);
adminRouter.post('/logout', AdminController.logout);
// dashboard
adminRouter.get('/dashboardData', adminAuth_1.default, AdminController.fetchDashboardData);
// user management 
adminRouter.get("/getUsers", adminAuth_1.default, AdminController.getUsers);
adminRouter.patch("/blockUser", adminAuth_1.default, AdminController.blockUser);
// owner management
adminRouter.get("/getOwners", adminAuth_1.default, AdminController.getOwners);
adminRouter.patch("/blockOwner", adminAuth_1.default, AdminController.blockOwner);
// workspace management
adminRouter.get("/getWorkspaces", adminAuth_1.default, AdminController.getWorkspaces);
adminRouter.get('/workspaceDetails', adminAuth_1.default, AdminController.viewWorkspaceDetails);
adminRouter.put("/updateStatus", adminAuth_1.default, AdminController.updateStatus);
adminRouter.get('/adminRevenue', adminAuth_1.default, AdminController.getAdminRevenue);
exports.default = adminRouter;
//# sourceMappingURL=adminRoutes.js.map