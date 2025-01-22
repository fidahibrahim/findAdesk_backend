import mongoose, { Schema } from "mongoose";
import IWorkspace from "../../entities/workspaceEntity";

const workspaceSchema = new Schema <IWorkspace>({
    workspaceName: {
        type: String,
        required: true
    },
    workspaceType: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    spaceDescription: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    workingDays: {
        type: String,
        required: true
    },
    pricePerHour: {
        type: Number,
        required: true
    },
    workspaceRules: {
        type: String,
    },
    aminities: {
        type: [String],
        required: true
    },
    images: [{ type: String }],
})

const workspaceModel = mongoose.model<IWorkspace>('Workspace', workspaceSchema)
export default workspaceModel