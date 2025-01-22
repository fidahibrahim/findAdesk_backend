export default interface IWorkspace {
    _id: string;
    workspaceName: string;
    workspaceType: string;
    capacity: number;
    place: string;
    street: string;
    state: string;
    spaceDescription: string;
    startTime: Date;
    endTime: Date;
    workingDays: string;
    pricePerHour: number;
    workspaceRules?: string;
    aminities: string[];
    images: string[];
}