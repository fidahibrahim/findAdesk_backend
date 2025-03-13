export interface AvailabilityRequest {
    workspaceId: string;
    date: string; 
    startTime: string; 
    endTime: string; 
    seats: number;
    day: string; 
}
interface AvailabilityResponse {
    isAvailable: boolean;
    message: string;
}

export interface IBookingUseCase {
    checkAvailability(data: AvailabilityRequest): Promise<AvailabilityResponse>
}