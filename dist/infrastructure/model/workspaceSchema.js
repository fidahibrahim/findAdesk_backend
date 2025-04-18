"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const workspaceSchema = new mongoose_1.Schema({
    ownerId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Owner",
        required: true
    },
    workspaceName: {
        type: String,
        required: true
    },
    workspaceMail: {
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
    bookedSeats: {
        type: Number,
        default: 0
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
        default: ''
    },
    amenities: {
        type: [String],
        required: true
    },
    images: [{ type: String }],
    status: {
        type: String,
        enum: ["pending", "Approved", "Rejected"],
        default: "pending"
    }
}, {
    timestamps: true
});
const workspaceModel = mongoose_1.default.model('Workspace', workspaceSchema);
exports.default = workspaceModel;
//# sourceMappingURL=workspaceSchema.js.map