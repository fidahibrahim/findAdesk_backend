"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../../adapters/controller/userController");
const userUseCase_1 = __importDefault(require("../../usecases/userUseCase"));
const userRepository_1 = __importDefault(require("../../adapters/repository/userRepository"));
const userSchema_1 = __importDefault(require("../model/userSchema"));
const HashingService_1 = __importDefault(require("../utils/HashingService"));
const otpSchema_1 = __importDefault(require("../model/otpSchema"));
const otpService_1 = __importDefault(require("../utils/otpService"));
const jwtService_1 = __importDefault(require("../utils/jwtService"));
const userRouter = express_1.default.Router();
const hashingService = new HashingService_1.default();
const otpService = new otpService_1.default();
const jwtService = new jwtService_1.default();
const UserRepository = new userRepository_1.default(userSchema_1.default, otpSchema_1.default);
const UserUseCase = new userUseCase_1.default(UserRepository, hashingService, otpService, jwtService);
const userController = new userController_1.UserController(UserUseCase);
userRouter.post('/register', userController.register);
userRouter.post('/verifyOtp', userController.verifyOtp);
userRouter.post('/resendOtp', userController.resendOtp);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);
exports.default = userRouter;
//# sourceMappingURL=userRoutes.js.map