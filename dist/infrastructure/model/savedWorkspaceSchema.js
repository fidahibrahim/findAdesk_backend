"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const savedWorkspaceSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspaceId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
const SavedWorkspace = mongoose_1.default.model('SavedWorkspace', savedWorkspaceSchema);
exports.default = SavedWorkspace;
//# sourceMappingURL=savedWorkspaceSchema.js.map