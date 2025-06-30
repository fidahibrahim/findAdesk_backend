"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class bookingRepository {
    constructor(booking, workspace, savedWorkspace, review) {
        this.booking = booking;
        this.workspace = workspace;
        this.savedWorkspace = savedWorkspace;
        this.review = review;
    }
    async createBooking(booking) {
        try {
            const workspace = await this.workspace.findById(booking.workspaceId);
            if (!workspace) {
                throw new Error("Workspace not found");
            }
            const bookingDate = new Date(booking.bookingDetails.date);
            const startTime = new Date(`${booking.bookingDetails.date}T${booking.bookingDetails.startTime}:00Z`);
            const endTime = new Date(`${booking.bookingDetails.date}T${booking.bookingDetails.endTime}:00Z`);
            const hours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
            const additionalSeats = Math.max(parseInt(booking.bookingDetails.seats) - 1, 0);
            const total = Math.round(hours * booking.pricePerHour);
            const additionalSeatsTotal = Math.round(additionalSeats * total);
            const subTotal = Math.round(total + additionalSeatsTotal);
            const serviceFee = Math.round(subTotal * 0.1);
            const grandTotal = Math.round(subTotal + serviceFee);
            const bookingDetails = {
                userId: new mongoose_1.default.Types.ObjectId(booking.userId),
                workspaceId: new mongoose_1.default.Types.ObjectId(booking.workspaceId),
                workspaceOwnerId: new mongoose_1.default.Types.ObjectId(workspace.ownerId),
                bookingId: booking.bookingId,
                date: bookingDate,
                startTime,
                endTime,
                hours,
                additionalSeats,
                additionalSeatsAmount: additionalSeatsTotal,
                serviceFee,
                day: booking.bookingDetails.day,
                seats: parseInt(booking.bookingDetails.seats),
                pricePerHour: booking.pricePerHour,
                total,
                subTotal,
                grandTotal,
                status: "pending",
            };
            const createdBooking = await this.booking.create(bookingDetails);
            return createdBooking;
        }
        catch (error) {
            console.error("Error creating booking:", error);
            throw new Error("Failed to create booking");
        }
    }
    async getBookingDetails(bookingId) {
        try {
            const response = await this.booking.aggregate([
                {
                    $match: {
                        bookingId: bookingId,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $lookup: {
                        from: "workspaces",
                        localField: "workspaceId",
                        foreignField: "_id",
                        as: "workspaceDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$userDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $unwind: {
                        path: "$workspaceDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        bookingId: 1,
                        date: 1,
                        startTime: 1,
                        endTime: 1,
                        hours: 1,
                        additionalSeats: 1,
                        additionalSeatsAmount: 1,
                        serviceFee: 1,
                        day: 1,
                        seats: 1,
                        pricePerHour: 1,
                        total: 1,
                        subTotal: 1,
                        grandTotal: 1,
                        user: {
                            name: "$userDetails.name",
                            email: "$userDetails.email",
                            mobile: "$userDetails.mobile",
                        },
                        workspace: {
                            workspaceId: "$workspaceDetails._id",
                            workspaceName: "$workspaceDetails.workspaceName",
                            spaceDescription: "$workspaceDetails.spaceDescription",
                            amenities: "$workspaceDetails.amenities",
                            images: { $arrayElemAt: ["$workspaceDetails.images", 0] },
                        },
                    },
                },
            ]);
            if (!response)
                throw new Error("Booking not found");
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async listBookings(ownerId, search, page, limit) {
        try {
            const filter = {
                workspaceOwnerId: new mongoose_1.default.Types.ObjectId(ownerId),
                ...(search && {
                    $or: [
                        { bookingId: { $regex: search, $options: "i" } },
                    ],
                }),
            };
            const bookings = await this.booking
                .find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ _id: -1 });
            const totalCount = await this.booking.countDocuments(filter);
            return { bookings, totalCount };
        }
        catch (error) {
            throw error;
        }
    }
    async bookingViewDetails(bookingId) {
        try {
            const response = await this.booking.findById(bookingId)
                .populate({
                path: 'userId',
                select: 'name email mobile isSubscribed'
            })
                .populate({
                path: 'workspaceId',
            });
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getBookingHistory(userId, filter, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            if (filter === 'saved') {
                const totalItems = await this.savedWorkspace.countDocuments({
                    userId: userId,
                    isActive: true
                });
                const savedWorkspaces = await this.savedWorkspace.find({ userId: userId, isActive: true })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate({
                    path: 'workspaceId',
                    select: 'workspaceName workspaceMail spaceDescription place street state images'
                });
                const data = savedWorkspaces.map(item => ({
                    _id: item._id,
                    userId: item.userId,
                    workspaceId: item.workspaceId,
                    status: 'saved',
                }));
                return {
                    data,
                    totalPages: Math.ceil(totalItems / limit),
                    currentPage: page,
                    totalItems
                };
            }
            let query = { userId: userId };
            if (filter !== 'all') {
                query.status = filter;
            }
            const totalItems = await this.booking.countDocuments(query);
            const bookings = await this.booking.find(query)
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                path: 'workspaceId',
                select: 'workspaceName workspaceMail place street state images'
            });
            return {
                data: bookings,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                totalItems
            };
        }
        catch (error) {
            throw error;
        }
    }
    async bookingConfirmDetails(bookingId) {
        try {
            const response = await this.booking.find({ bookingId: bookingId })
                .populate({
                path: 'userId',
                select: 'name email mobile'
            })
                .populate({
                path: 'workspaceId',
                select: 'workspaceName workspaceMail place street state'
            });
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async updateBookingStatus(bookingId, status, seats, paymentMethod, worksapceId) {
        try {
            const workspace = await this.workspace.findById(worksapceId);
            if (!workspace) {
                throw new Error("Workspace not found");
            }
            if (workspace.capacity < seats) {
                throw new Error("Not enough capacity in the workspace");
            }
            workspace.bookedSeats += seats;
            await workspace.save();
            const updatedBooking = await this.booking.findOneAndUpdate({ bookingId: bookingId }, {
                status: status,
                paymentMethod: paymentMethod,
                updatedAt: new Date(),
            }, {
                new: true,
            });
            return updatedBooking;
        }
        catch (error) {
            throw error;
        }
    }
    async findBookingById(bookingId) {
        try {
            const booking = await this.booking.findById(bookingId)
                .populate("workspaceId")
                .populate({
                path: "userId",
                select: "_id name email isSubscribed"
            })
                .lean()
                .exec();
            return booking;
        }
        catch (error) {
            throw error;
        }
    }
    async updateCancelledStatus(bookingId, status) {
        try {
            return await this.booking.findByIdAndUpdate(bookingId, { status }, { new: true });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = bookingRepository;
//# sourceMappingURL=bookingRepository.js.map