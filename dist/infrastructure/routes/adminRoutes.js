"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../../adapters/controller/adminController");
const userSchema_1 = __importDefault(require("../model/userSchema"));
const adminRepository_1 = __importDefault(require("../../adapters/repository/adminRepository"));
const adminUseCase_1 = __importDefault(require("../../usecases/adminUseCase"));
const jwtService_1 = __importDefault(require("../utils/jwtService"));
const HashingService_1 = __importDefault(require("../utils/HashingService"));
const JwtService = new jwtService_1.default();
const HashingServiceInstance = new HashingService_1.default();
const AdminRepository = new adminRepository_1.default(userSchema_1.default, userSchema_1.default);
const AdminUseCaseInstance = new adminUseCase_1.default(AdminRepository, HashingServiceInstance, JwtService);
const adminRouter = express_1.default.Router();
const AdminController = new adminController_1.adminController(AdminUseCaseInstance);
adminRouter.post('/login', AdminController.login);
adminRouter.post('/logout', AdminController.logout);
// user management 
adminRouter.get("/getUsers", AdminController.getUsers);
exports.default = adminRouter;
//# sourceMappingURL=adminRoutes.js.map