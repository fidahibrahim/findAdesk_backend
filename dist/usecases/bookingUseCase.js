"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class bookingUseCase {
    constructor(bookingRepository, workspaceRepository, userRepository, reviewRepository, walletRepository) {
        this.bookingRepository = bookingRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.walletRepository = walletRepository;
    }
    // async checkAvailability(data: AvailabilityRequest) {
    //     try {
    //         const { workspaceId, startTime, endTime, seats, day } = data;
    //         const workspace = await this.workspaceRepository.findWorkspace(workspaceId)
    //         if (!workspace) {
    //             return {
    //                 isAvailable: false,
    //                 message: 'Workspace not found'
    //             };
    //         }
    //         const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    //         const weekends = ['saturday', 'sunday'];
    //         const dayLower = day.toLowerCase();
    //         if (workspace.workingDays === 'weekdays' && !weekdays.includes(dayLower)) {
    //             return {
    //                 isAvailable: false,
    //                 message: 'Workspace not available on weekends'
    //             };
    //         } else if (workspace.workingDays === 'weekends' && !weekends.includes(dayLower)) {
    //             return {
    //                 isAvailable: false,
    //                 message: 'Workspace only available on weekends'
    //             };
    //         }
    //         const workspaceStartTime = new Date(workspace?.startTime).toTimeString().slice(0, 5);
    //         console.log('workspaceStartTime: ', workspaceStartTime);
    //         const workspaceEndTime = new Date(workspace?.endTime).toTimeString().slice(0, 5);
    //         console.log('workspaceEndTime: ', workspaceEndTime);
    //         if (startTime < workspaceStartTime || endTime > workspaceEndTime) {
    //             return {
    //                 isAvailable: false,
    //                 message: 'Requested time is outside workspace operating hours',
    //             };
    //         }
    //         if (workspace.capacity < seats) {
    //             return {
    //                 isAvailable: false,
    //                 message: 'Not enough seats available for the requested time',
    //             };
    //         }
    //         return {
    //             isAvailable: true,
    //             message: 'Workspace is available for the requested time',
    //         }
    //     } catch (error) {
    //         throw error
    //     }
    // }
    async checkAvailability(data) {
        try {
            const { workspaceId, startTime, endTime, seats, day } = data;
            const workspace = await this.workspaceRepository.findWorkspace(workspaceId);
            if (!workspace) {
                return {
                    isAvailable: false,
                    message: "Workspace not found",
                };
            }
            const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
            const weekends = ["saturday", "sunday"];
            const dayLower = day.toLowerCase();
            if (workspace.workingDays === "weekdays" && !weekdays.includes(dayLower)) {
                return {
                    isAvailable: false,
                    message: "Workspace not available on weekends",
                };
            }
            else if (workspace.workingDays === "weekends" &&
                !weekends.includes(dayLower)) {
                return {
                    isAvailable: false,
                    message: "Workspace only available on weekends",
                };
            }
            // ✅ Always use IST for time comparison
            const options = {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Kolkata",
            };
            const workspaceStartTime = new Date(workspace.startTime).toLocaleTimeString("en-IN", options);
            const workspaceEndTime = new Date(workspace.endTime).toLocaleTimeString("en-IN", options);
            const requestedStartTime = new Date(startTime).toLocaleTimeString("en-IN", options);
            const requestedEndTime = new Date(endTime).toLocaleTimeString("en-IN", options);
            console.log("workspaceStartTime (IST):", workspaceStartTime);
            console.log("workspaceEndTime (IST):", workspaceEndTime);
            console.log("requestedStartTime (IST):", requestedStartTime);
            console.log("requestedEndTime (IST):", requestedEndTime);
            // Compare times (HH:mm strings work correctly lexicographically)
            if (requestedStartTime < workspaceStartTime || requestedEndTime > workspaceEndTime) {
                return {
                    isAvailable: false,
                    message: "Requested time is outside workspace operating hours",
                };
            }
            if (workspace.capacity < seats) {
                return {
                    isAvailable: false,
                    message: "Not enough seats available for the requested time",
                };
            }
            return {
                isAvailable: true,
                message: "Workspace is available for the requested time",
            };
        }
        catch (error) {
            throw error;
        }
    }
    async createBooking(userId, workspaceId, bookingId, pricePerHour, bookingDetails) {
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
        }
        catch (error) {
            throw error;
        }
    }
    async getBookingDetails(bookingId) {
        try {
            const response = await this.bookingRepository.getBookingDetails(bookingId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async findProductName(workspaceId) {
        try {
            const workspace = await this.workspaceRepository.findWorkspace(workspaceId);
            return workspace === null || workspace === void 0 ? void 0 : workspace.workspaceName;
        }
        catch (error) {
            throw error;
        }
    }
    async listBookings(ownerId, search, page, limit) {
        try {
            const { bookings, totalCount } = await this.bookingRepository.listBookings(ownerId, search, page, limit);
            const totalPages = Math.ceil(totalCount / limit);
            return { bookings, totalPages };
        }
        catch (error) {
            throw error;
        }
    }
    async bookingViewDetails(bookingId) {
        try {
            const booking = await this.bookingRepository.bookingViewDetails(bookingId);
            const review = await this.reviewRepository.findByBookingId(bookingId);
            const response = {
                ...booking,
                ratings: (review === null || review === void 0 ? void 0 : review.ratings) || []
            };
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async bookingConfirmDetails(bookingId) {
        try {
            const response = await this.bookingRepository.bookingConfirmDetails(bookingId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async updateBookingStatus(bookingId, status, seat, paymentMethod, worksapceId) {
        try {
            const response = await this.bookingRepository.updateBookingStatus(bookingId, status, seat, paymentMethod, worksapceId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async cancelBooking(bookingId) {
        try {
            const booking = await this.bookingRepository.findBookingById(bookingId);
            if ((booking === null || booking === void 0 ? void 0 : booking.status) === "cancelled") {
                throw new Error("Booking is already cancelled");
            }
            if (typeof (booking === null || booking === void 0 ? void 0 : booking.seats) !== 'number' || isNaN(booking.seats)) {
                throw new Error(`Invalid booking seats: ${booking === null || booking === void 0 ? void 0 : booking.seats}`);
            }
            const userId = booking.userId._id.toString();
            const userData = await this.userRepository.findById(userId);
            console.log(userData, 'userdata in repo');
            const isSubscribed = (userData === null || userData === void 0 ? void 0 : userData.isSubscribed) || false;
            const now = new Date();
            const startTime = new Date(booking.startTime);
            const timeDifference = startTime.getTime() - now.getTime();
            const hoursDifference = timeDifference / (1000 * 60 * 60);
            if (isSubscribed && hoursDifference <= 1) {
                throw new Error("Subscribed users can only cancel bookings at least 1 hour before start time");
            }
            else if (!isSubscribed && hoursDifference <= 24) {
                throw new Error("Bookings can only be cancelled at least 24 hours before start time");
            }
            const workspaceId = booking.workspaceId._id.toString();
            await this.workspaceRepository.updateBookedSeats(workspaceId, booking === null || booking === void 0 ? void 0 : booking.seats);
            const refundAmount = isSubscribed ? booking === null || booking === void 0 ? void 0 : booking.grandTotal : booking === null || booking === void 0 ? void 0 : booking.subTotal;
            await this.walletRepository.updateWalletAmount(userId, refundAmount);
            const updatedBooking = await this.bookingRepository.updateCancelledStatus(bookingId, 'cancelled');
            console.log(updatedBooking, 'updattdebooking in usecase');
            return updatedBooking;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = bookingUseCase;
//# sourceMappingURL=bookingUseCase.js.map