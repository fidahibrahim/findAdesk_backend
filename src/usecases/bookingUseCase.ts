import { IBookingRepository } from "../interface/Repository/bookingRepository";
import { IWorkspaceRepository } from "../interface/Repository/workspaceRepository";
import { IBookingUseCase, AvailabilityRequest } from "../interface/Usecase/IBookingUseCase";

export default class bookingUseCase implements IBookingUseCase {
    private bookingRepository: IBookingRepository;
    private workspaceRepository: IWorkspaceRepository;
    constructor(
        bookingRepository: IBookingRepository,
        workspaceRepository: IWorkspaceRepository
    ) {
        this.bookingRepository = bookingRepository
        this.workspaceRepository = workspaceRepository
    }

    async checkAvailability(data: AvailabilityRequest) {
        try {
            const { workspaceId, date, startTime, endTime, seats, day } = data;
            const workspace = await this.workspaceRepository.findWorkspace(workspaceId)
            if (!workspace) {
                return {
                    isAvailable: false,
                    message: 'Workspace not found'
                };
            }
            console.log(workspace, "workspace in usecase")
            const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            const weekends = ['saturday', 'sunday'];
            const dayLower = day.toLowerCase();

            if (workspace.workingDays === 'weekdays' && !weekdays.includes(dayLower)) {
                return {
                    isAvailable: false,
                    message: 'Workspace not available on weekends'
                };
            } else if (workspace.workingDays === 'weekends' && !weekends.includes(dayLower)) {
                return {
                    isAvailable: false,
                    message: 'Workspace only available on weekends'
                };
            }

            const workspaceStartTime = new Date(workspace?.startTime).toTimeString().slice(0, 5);
            const workspaceEndTime = new Date(workspace?.endTime).toTimeString().slice(0, 5);

            if (startTime < workspaceStartTime || endTime > workspaceEndTime) {
                return {
                    isAvailable: false,
                    message: 'Requested time is outside workspace operating hours',
                };
            }

            if (workspace.capacity < seats) {
                return {
                    isAvailable: false,
                    message: 'Not enough seats available for the requested time',
                };
            }
            return {
                isAvailable: true,
                message: 'Workspace is available for the requested time',
            }

        } catch (error) {
            throw error
        }
    }
}