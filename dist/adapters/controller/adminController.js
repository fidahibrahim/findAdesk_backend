"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const httpStatusCode_1 = require("../../constants/httpStatusCode");
const responseHandler_1 = require("../../infrastructure/utils/responseHandler");
const responseMssg_1 = require("../../constants/responseMssg");
class adminController {
    constructor(adminUsecase) {
        this.adminUsecase = adminUsecase;
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.blockUser = this.blockUser.bind(this);
        this.getOwners = this.getOwners.bind(this);
        this.blockOwner = this.blockOwner.bind(this);
        this.getWorkspaces = this.getWorkspaces.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.viewWorkspaceDetails = this.viewWorkspaceDetails.bind(this);
        this.getAdminRevenue = this.getAdminRevenue.bind(this);
        this.fetchDashboardData = this.fetchDashboardData.bind(this);
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const response = await this.adminUsecase.login(email, password);
            if ((response === null || response === void 0 ? void 0 : response.message) == "Invalid Email") {
                res.status(403).json({ message: "Invalid Email" });
            }
            if ((response === null || response === void 0 ? void 0 : response.message) == "Incorrect Password") {
                res.status(403).json({ message: "incorrect password" });
            }
            if ((response === null || response === void 0 ? void 0 : response.message) == "Logined successfully") {
                res.cookie("adminToken", response.token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 60 * 60 * 1000,
                }).cookie("adminRefreshToken", response.adminRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.status(200).json({ message: "logined Successfully", admin: response.admin });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async logout(req, res) {
        try {
            res.cookie("adminToken", "", {
                httpOnly: true, secure: true,
                sameSite: 'none', expires: new Date()
            });
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.LOGIN_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, { status: true }));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.LOGOUT_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getUsers(req, res) {
        var _a;
        try {
            const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            const page = parseInt(req.query.page, 10) || 1;
            const limit = 6;
            const { users, totalPages } = await this.adminUsecase.getUsers(search, page, limit);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.FETCH_USERS_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, { users, totalPages }));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_USERS_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async blockUser(req, res) {
        try {
            const { userId } = req.body;
            const response = await this.adminUsecase.blockUser(userId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.USER_BLOCKED, httpStatusCode_1.HttpStatusCode.OK, { response }));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.USER_UNBLOCKED, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getOwners(req, res) {
        var _a;
        try {
            const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            const page = parseInt(req.query.page, 10) || 1;
            const limit = 6;
            const { owners, totalPages } = await this.adminUsecase.getOwners(search, page, limit);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.FETCH_OWNERS_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, { owners, totalPages }));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_OWNERS_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async blockOwner(req, res) {
        try {
            const { ownerId } = req.body;
            const response = await this.adminUsecase.blockOwner(ownerId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.OWNER_BLOCKED, httpStatusCode_1.HttpStatusCode.OK, { response }));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.OWNER_UNBLOCKED, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getWorkspaces(req, res) {
        var _a, _b;
        try {
            const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            const page = parseInt(req.query.page, 10) || 1;
            const status = ((_b = req.query.filter) === null || _b === void 0 ? void 0 : _b.toString()) || 'all';
            const limit = 6;
            const { workspaces, totalPages } = await this.adminUsecase.getWorkspaces(search, page, limit, status);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.USER_BLOCKED, httpStatusCode_1.HttpStatusCode.OK, { workspaces, totalPages }));
        }
        catch (error) {
            console.log(error);
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_WORKSPACE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async updateStatus(req, res) {
        try {
            const { workspaceId, status } = req.body;
            const response = await this.adminUsecase.updateStatus(workspaceId, status);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.USER_BLOCKED, httpStatusCode_1.HttpStatusCode.OK, { response }));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.UPDATE_WORKSPACE_STATUS_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async viewWorkspaceDetails(req, res) {
        try {
            const workspaceId = req.query.workspaceId;
            const response = await this.adminUsecase.workspaceDetails(workspaceId);
            if (response) {
                res.status(httpStatusCode_1.HttpStatusCode.OK)
                    .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.WORKSPACE_VIEW_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
            }
            else {
                res.status(httpStatusCode_1.HttpStatusCode.NOT_FOUND)
                    .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_NOT_FOUND, httpStatusCode_1.HttpStatusCode.NOT_FOUND));
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_VIEW_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getAdminRevenue(req, res) {
        try {
            const filter = req.query.filter;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const { totalRevenue, filteredRevenue, bookings, totalCount } = await this.adminUsecase.getAdminRevenue(filter, page, limit);
            const response = {
                totalRevenue: Number(totalRevenue.toFixed(2)),
                filteredRevenue: Number(filteredRevenue.toFixed(2)),
                bookings: bookings,
                pagination: {
                    totalItems: totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    currentPage: page,
                    itemsPerPage: limit
                }
            };
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.REVENUE_FETCHED_SUCCESSFULLY, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.REVENUE_FETCHED_FAILED, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async fetchDashboardData(req, res) {
        try {
            const userCount = await this.adminUsecase.getUserCount();
            const workspaceCount = await this.adminUsecase.getWorkspaceCount();
            const recentUsers = await this.adminUsecase.getRecentUsers();
            const recentWorkspaces = await this.adminUsecase.getRecentWorkspaces();
            const totalRevenue = await this.adminUsecase.getTotalRevenue();
            const monthlyRevenue = await this.adminUsecase.getMonthlyRevenue();
            const yearlyRevenue = await this.adminUsecase.getYearlyRevenue();
            const response = {
                stats: {
                    userCount,
                    workspaceCount,
                    totalRevenue
                },
                recentUsers,
                recentWorkspaces,
                monthlyRevenue,
                yearlyRevenue
            };
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.FETCH_DASHBOARD, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_DASHBOARD_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
}
exports.adminController = adminController;
//# sourceMappingURL=adminController.js.map