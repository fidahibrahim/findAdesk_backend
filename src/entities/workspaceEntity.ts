import { Document, ObjectId } from "mongoose";

export interface IWorkspace {
    _id: string;
    ownerId: string;
    workspaceName: string;
    workspaceMail: string;
    workspaceType: string;
    capacity: number;
    place: string;
    street: string;
    state: string;
    spaceDescription: string;
    startTime: string;
    endTime: string;
    workingDays: string;
    pricePerHour: number;
    workspaceRules?: string;
    amenities: string[];
    images: string[];
    status?: "pending" | "approved" | "rejected";
}