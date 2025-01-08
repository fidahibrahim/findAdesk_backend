"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./infrastructure/config/app"));
const db_1 = __importDefault(require("./infrastructure/config/db"));
const PORT = process.env.PORT;
const httpServer = (0, http_1.createServer)(app_1.default);
(0, db_1.default)();
httpServer.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map