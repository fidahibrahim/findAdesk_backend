"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = exports.handleErrorr = exports.handleSuccesss = exports.handleSuccess = exports.handleError = void 0;
//error handler
const handleError = (message, statusCode) => {
    return { statusCode, message };
};
exports.handleError = handleError;
//sucess handler
const handleSuccess = (message, statusCode, data) => {
    return { statusCode, message, data: data || null };
};
exports.handleSuccess = handleSuccess;
// Response Handlers
const handleSuccesss = (message, statusCode, data) => {
    return {
        success: true,
        statusCode,
        message,
        data: data || null
    };
};
exports.handleSuccesss = handleSuccesss;
const handleErrorr = (message, statusCode, error) => {
    return {
        success: false,
        statusCode,
        message,
        error: error || null
    };
};
exports.handleErrorr = handleErrorr;
// Helper function to send responses
const sendResponse = (res, response) => {
    res.status(response.statusCode).json(response);
};
exports.sendResponse = sendResponse;
//# sourceMappingURL=responseHandler.js.map