import mongoose from "mongoose";
import { ISavedWorkspace } from "../../entities/savedWorkspaceEntity";

const savedWorkspaceSchema = new mongoose.Schema<ISavedWorkspace>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const SavedWorkspace = mongoose.model<ISavedWorkspace>('SavedWorkspace', savedWorkspaceSchema)
export default SavedWorkspace