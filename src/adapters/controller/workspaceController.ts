import { Request, response, Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure/middleware/ownerAuth";
import IWorkspaceUseCase from "../../interface/Usecase/IWorkspaceUseCase";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { ResponseMessage } from "../../constants/responseMssg";

export class workspaceController {
    private workspaceUseCase: IWorkspaceUseCase

    constructor(workspaceUseCase: IWorkspaceUseCase) {
        this.workspaceUseCase = workspaceUseCase
        this.addWorkspace = this.addWorkspace.bind(this)
        this.listWorkspaces = this.listWorkspaces.bind(this)
        this.workspaceDetails = this.workspaceDetails.bind(this)
        this.deleteWorkspace = this.deleteWorkspace.bind(this)
        this.editWorkspace = this.editWorkspace.bind(this)
    }

    async addWorkspace(req: AuthenticatedRequest, res: Response) {
        try {
            const formData = {
                ...req.body,
                images: req.files,
                ownerId: req.owner?.userId
            }
            const response = await this.workspaceUseCase.addWorkspace(formData)
            if (!response.status) {
                if (response.message === "Workspace already exists with this email") {
                    // res.status(403).json({
                    //     status: false,
                    //     message: response.message,
                    // });
                    // return
                    res.status(HttpStatusCode.FORBIDDEN)
                        .json(handleError(ResponseMessage.WORKSPACE_EXIST, HttpStatusCode.FORBIDDEN))
                    return
                }
                res.status(500).json({
                    status: false,
                    message: response.message,
                });
                return
            }
            if (response) {
                res.status(200).json({
                    success: true,
                    message: "Workspace created successfully",
                });
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.WORKSPACE_REGISTER_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async listWorkspaces(req: AuthenticatedRequest, res: Response) {
        try {
            const search = req.query.search?.toString() || ''
            const page = parseInt(req.query.page as string, 10) || 1
            const limit = 6
            const ownerId = req.owner?.userId
            if (!ownerId) {
                throw new Error("Owner ID is required")
            }
            const { workspaces, totalPages } = await this.workspaceUseCase.listWorkspaces(ownerId, search, page, limit)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.WORKSPACE_LISTING_SUCCESS, HttpStatusCode.OK, { workspaces, totalPages }));
            return
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.WORKSPACE_LISTING_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async workspaceDetails(req: Request, res: Response): Promise<void> {
        try {
            const workspaceId = req.query.workspaceId as string
            const response = await this.workspaceUseCase.viewDetails(workspaceId)
            if (response) {
                res.status(HttpStatusCode.OK).json(handleSuccess(ResponseMessage.WORKSPACE_VIEW_SUCCESS, HttpStatusCode.OK, response));
            } else {
                res.status(HttpStatusCode.NOT_FOUND).json(handleError(ResponseMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND));
            }
        } catch (error) {
            console.log(error)
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.WORKSPACE_VIEW_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async deleteWorkspace(req: Request, res: Response) {
        try {
            const workspaceId = req.query.workspaceId as string
            const response = await this.workspaceUseCase.deleteWorkspace(workspaceId)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.DELETE_WORKSPACE_SUCCESS, HttpStatusCode.OK, response))
        } catch (error) {
            console.log(error)
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.DELETE_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async editWorkspace(req: Request, res: Response) {
        try {
            const workspaceId = req.query.workspaceId as string
            const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
            const formData = {
                ...req.body,
                images: req.files,
                existingImages
            }
            delete formData.existingImages;
            const updatedWorkspace = await this.workspaceUseCase.editWorkspace(workspaceId, formData)
            console.log(updatedWorkspace, "workspace updated in contro")
            if (updatedWorkspace) {
                res.status(200).json({
                    success: true,
                    message: "Workspace updated successfully",
                });
            }
            // return res.status(HttpStatusCode.OK)
            //     .json(handleSuccess(ResponseMessage.EDIT_WORKSPACE_SUCCESS, HttpStatusCode.OK, {data: updatedWorkspace}))
        } catch (error) {
            console.log(error)
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.EDIT_WORKSPACE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
}