"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = void 0;
const generateId = () => {
    const prefix = "FIND";
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNumber}`;
};
exports.generateId = generateId;
//# sourceMappingURL=bookingIdGenerator.js.map