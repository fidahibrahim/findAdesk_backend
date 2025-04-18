"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceController = void 0;
const httpStatusCode_1 = require("../../constants/httpStatusCode");
const responseHandler_1 = require("../../infrastructure/utils/responseHandler");
const responseMssg_1 = require("../../constants/responseMssg");
class workspaceController {
    constructor(workspaceUseCase) {
        this.workspaceUseCase = workspaceUseCase;
        this.addWorkspace = this.addWorkspace.bind(this);
        this.listWorkspaces = this.listWorkspaces.bind(this);
        this.workspaceDetails = this.workspaceDetails.bind(this);
        this.deleteWorkspace = this.deleteWorkspace.bind(this);
        this.editWorkspace = this.editWorkspace.bind(this);
    }
    async addWorkspace(req, res) {
        var _a;
        try {
            const formData = {
                ...req.body,
                images: req.files,
                ownerId: (_a = req.owner) === null || _a === void 0 ? void 0 : _a.userId
            };
            const response = await this.workspaceUseCase.addWorkspace(formData);
            if (!response.status) {
                if (response.message === "Workspace already exists with this email") {
                    res.status(httpStatusCode_1.HttpStatusCode.FORBIDDEN)
                        .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_EXIST, httpStatusCode_1.HttpStatusCode.FORBIDDEN));
                    return;
                }
                res.status(500).json({
                    status: false,
                    message: response.message,
                });
                return;
            }
            if (response) {
                res.status(200).json({
                    success: true,
                    message: "Workspace created successfully",
                });
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_REGISTER_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async listWorkspaces(req, res) {
        var _a, _b;
        try {
            const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            const page = parseInt(req.query.page, 10) || 1;
            const limit = 6;
            const ownerId = (_b = req.owner) === null || _b === void 0 ? void 0 : _b.userId;
            if (!ownerId) {
                throw new Error("Owner ID is required");
            }
            const { workspaces, totalPages } = await this.workspaceUseCase.listWorkspaces(ownerId, search, page, limit);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.WORKSPACE_LISTING_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, { workspaces, totalPages }));
            return;
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_LISTING_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async workspaceDetails(req, res) {
        try {
            const workspaceId = req.query.workspaceId;
            const response = await this.workspaceUseCase.viewDetails(workspaceId);
            if (response) {
                res.status(httpStatusCode_1.HttpStatusCode.OK).json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.WORKSPACE_VIEW_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
            }
            else {
                res.status(httpStatusCode_1.HttpStatusCode.NOT_FOUND).json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_NOT_FOUND, httpStatusCode_1.HttpStatusCode.NOT_FOUND));
            }
        }
        catch (error) {
            console.log(error);
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_VIEW_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async deleteWorkspace(req, res) {
        try {
            const workspaceId = req.query.workspaceId;
            const response = await this.workspaceUseCase.deleteWorkspace(workspaceId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.DELETE_WORKSPACE_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            console.log(error);
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.DELETE_WORKSPACE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async editWorkspace(req, res) {
        try {
            const workspaceId = req.query.workspaceId;
            const existingImages = JSON.parse(req.body.existingImages || '[]');
            const formData = {
                ...req.body,
                existingImages,
                newImages: req.files,
            };
            const updatedWorkspace = await this.workspaceUseCase.editWorkspace(workspaceId, formData);
            if (updatedWorkspace) {
                res.status(200).json({
                    success: true,
                    message: "Workspace updated successfully",
                });
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.EDIT_WORKSPACE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
}
exports.workspaceController = workspaceController;
//# sourceMappingURL=workspaceController.js.map