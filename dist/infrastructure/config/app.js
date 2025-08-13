"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("../routes/adminRoutes"));
const ownerRoutes_1 = __importDefault(require("../routes/ownerRoutes"));
const node_cron_1 = __importDefault(require("node-cron"));
const subscriptionService_1 = require("../utils/subscriptionService");
const app = (0, express_1.default)();
dotenv_1.default.config();
const logDirPath = path_1.default.join(__dirname, '../config/logs');
if (!fs_1.default.existsSync(logDirPath)) {
    fs_1.default.mkdirSync(logDirPath, { recursive: true });
}
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(logDirPath, '/access.log'), { flags: "a" });
app.use((0, morgan_1.default)("dev"));
app.use((0, morgan_1.default)("combined", { stream: accessLogStream }));
node_cron_1.default.schedule('0 0 * * *', async () => {
    console.log('Running subscription expiration check...');
    const subscriptionService = new subscriptionService_1.SubscriptionService();
    await subscriptionService.checkExpiredSubscriptions();
});
app.use((0, cookie_parser_1.default)());
app.use("/api/webhook", express_1.default.raw({ type: "application/json" }));
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
app.use((0, cors_1.default)({
    origin: "https://find-adesk-frontend.vercel.app",
    // origin: "http://localhost:5000",
    credentials: true
}));
//Routes 
app.use('/api', userRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
app.use('/owner', ownerRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map