"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("../routes/adminRoutes"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
app.use((0, cors_1.default)({
    origin: "http://localhost:5000",
    credentials: true
}));
//Routes 
app.use('/api', userRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map