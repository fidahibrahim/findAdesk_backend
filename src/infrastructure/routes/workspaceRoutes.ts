import express, { Router } from "express"
import multer from "multer"
import workspaceRepository from "../../adapters/repository/workspaceRepository"
import workspaceModel from "../model/workspaceSchema"
import workspaceUseCase from "../../usecases/workspaceUseCase"
import { workspaceController } from "../../adapters/controller/workspaceController"


const workspaceRouter: Router = express.Router()

const upload = multer()

const WorkspaceRepository = new workspaceRepository(workspaceModel)
const WorkspaceUseCase = new workspaceUseCase(
    WorkspaceRepository,

)
const WorkspaceController = new workspaceController(WorkspaceUseCase)

workspaceRouter.post('/addWorkspace',  upload.array('images'), WorkspaceController.addWorkspace)

