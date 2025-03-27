import { IBooking } from "../entities/bookingEntity";
import { IBookingRepository } from "../interface/Repository/bookingRepository";
import { IuserRepository } from "../interface/Repository/userRepository";
import { IWorkspaceRepository } from "../interface/Repository/workspaceRepository";
import { IBookingUseCase, AvailabilityRequest, CreateBookingData, bookingDetails } from "../interface/Usecase/IBookingUseCase";

export default class bookingUseCase implements IBookingUseCase {
    private bookingRepository: IBookingRepository;
    private workspaceRepository: IWorkspaceRepository;
    private userRepository: IuserRepository;

    constructor(
        bookingRepository: IBookingRepository,
        workspaceRepository: IWorkspaceRepository,
        userRepository: IuserRepository
    ) {
        this.bookingRepository = bookingRepository
        this.workspaceRepository = workspaceRepository
        this.userRepository = userRepository
    }

    async checkAvailability(data: AvailabilityRequest) {
        try {
            const { workspaceId, startTime, endTime, seats, day } = data;
            const workspace = await this.workspaceRepository.findWorkspace(workspaceId)
            if (!workspace) {
                return {
                    isAvailable: false,
                    message: 'Workspace not found'
                };
            }
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
    // async createBooking(data: CreateBookingData) {
    //     try {
    //         const bookingId = `BOOK-${Date.now()}`;
    //         const booking = {
    //             ...data,
    //             bookingId
    //         }
    //         if (data.mobile) {
    //             const userId = data.userId.toString();
    //             await this.userRepository.updateUserMobile(userId, data.mobile)
    //         }
    //         const response = await this.bookingRepository.createBooking(booking)
    //         return response
    //     } catch (error) {
    //         throw error
    //     }
    // }

    async createBooking(
        userId: string,
        workspaceId: string,
        bookingId: string,
        pricePerHour: number,
        bookingDetails: bookingDetails
    ) {
        try {
            const booking = {
                userId,
                workspaceId,
                bookingId,
                pricePerHour,
                bookingDetails,
            };
            const response = await this.bookingRepository.createBooking(booking);
            return response;
        } catch (error) {
            throw error;
        }
    }
    async getBookingDetails(bookingId: string) {
        console.log("inside useCase", bookingId);
    
        try {
          const response = await this.bookingRepository.getBookingDetails(
            bookingId
          );
          return response;
        } catch (error) {
          throw error;
        }
      }
    async findProductName(workspaceId: string) {
        try {
            const workspace = await this.workspaceRepository.findWorkspace(workspaceId)
            return workspace?.workspaceName
        } catch (error) {
            throw error
        }
    }
    async listBookings(ownerId: string, search: string, page: number, limit: number) {
        try {
            const { bookings, totalCount } = await this.bookingRepository.listBookings(ownerId, search, page, limit)
            const totalPages = Math.ceil(totalCount / limit)
            return { bookings, totalPages }
        } catch (error) {
            throw error
        }
    }
    async bookingViewDetails(bookingId: string) {
        try {
            const response = await this.bookingRepository.bookingViewDetails(bookingId)
            return response
        } catch (error) {
            throw error
        }
    }
    async bookingConfirmDetails(bookingId: string) {
        try {
            const response = await this.bookingRepository.bookingConfirmDetails(bookingId)
            return response
        } catch (error) {
            throw error
        }
    }
    async updateBookingStatus(bookingId: string, status: string) {
        try {
            const response = await this.bookingRepository.updateBookingStatus(bookingId, status)
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}