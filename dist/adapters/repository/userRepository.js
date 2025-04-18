"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class userRepository {
    constructor(user, otp, workspace, savedWorkspace, review) {
        this.user = user;
        this.otp = otp;
        this.workspace = workspace;
        this.savedWorkspace = savedWorkspace;
        this.review = review;
    }
    async createUser(data) {
        try {
            const user = new this.user(data);
            return await user.save();
        }
        catch (error) {
            throw error;
        }
    }
    async checkEmailExists(email) {
        try {
            return await this.user.findOne({ email });
        }
        catch (error) {
            throw error;
        }
    }
    async findById(userId) {
        try {
            return await this.user.findById(userId);
        }
        catch (error) {
            throw error;
        }
    }
    async saveOtp(email, otp) {
        try {
            await this.otp.deleteMany({ email });
            const newOtp = new this.otp({ email, otp });
            await newOtp.save();
        }
        catch (error) {
            throw error;
        }
    }
    async verifyOtp(email) {
        try {
            return await this.otp.findOne({ email });
        }
        catch (error) {
            throw error;
        }
    }
    async updateUserVerified(email) {
        try {
            return await this.user.findOneAndUpdate({ email }, { $set: { isVerified: true } }, { new: true });
        }
        catch (error) {
            throw error;
        }
    }
    async googleUser(data) {
        try {
            const existUser = await this.user.findOne({ email: data.email });
            let user;
            if (!existUser) {
                const newUser = new this.user({
                    name: data.name,
                    email: data.email,
                    image: data.picture,
                    isVerified: true
                });
                user = await newUser.save();
            }
            else {
                user = existUser;
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async changePassword(userId, password) {
        try {
            return await this.user.findByIdAndUpdate(userId, { password: password }, { new: true });
        }
        catch (error) {
            throw error;
        }
    }
    async getProfile(userId) {
        try {
            const response = await this.user.findById(userId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async updateProfile(data) {
        try {
            if (!data)
                throw new Error("Invalid user data");
            const updatedUser = await this.user.findOneAndUpdate({ email: data.email }, {
                $set: {
                    name: data.name,
                    email: data.email,
                    image: data.image
                }
            }, { new: true });
            return updatedUser;
        }
        catch (error) {
            throw error;
        }
    }
    async resetPassword(userId, newPassword) {
        try {
            if (!userId)
                throw new Error("Invalid user data");
            const updatedUser = await this.user.findOneAndUpdate({ _id: userId }, {
                $set: {
                    password: newPassword
                }
            }, { new: true });
            return updatedUser;
        }
        catch (error) {
            throw error;
        }
    }
    async getRecentWorkspaces() {
        try {
            return await this.workspace
                .find()
                .sort({ createdAt: -1 })
                .limit(6)
                .exec();
        }
        catch (error) {
            throw error;
        }
    }
    async findWorkspaces(filters) {
        try {
            const query = {};
            const sortOptions = {};
            if (filters.type)
                query.workspaceType = filters.type;
            if (filters.location) {
                query.$or = [
                    { place: { $regex: filters.location, $options: "i" } },
                    { street: { $regex: filters.location, $options: "i" } },
                    { state: { $regex: filters.location, $options: "i" } }
                ];
            }
            if (filters.day) {
                const day = filters.day.toLowerCase();
                const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                const weekends = ['saturday', 'sunday'];
                let dayCategories = ['allDays'];
                if (weekdays.includes(day)) {
                    dayCategories.push('weekdays');
                }
                else if (weekends.includes(day)) {
                    dayCategories.push('weekends');
                }
                query.workingDays = { $in: dayCategories };
            }
            if (filters.amenities && filters.amenities.length > 0) {
                query.amenities = filters.amenities.length ?
                    { $all: filters.amenities.split(",").map(item => item.trim()) } :
                    undefined;
            }
            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'recommended':
                        sortOptions.createdAt = -1;
                        break;
                    case 'price-low':
                        sortOptions.pricePerHour = 1;
                        break;
                    case 'price-high':
                        sortOptions.pricePerHour = -1;
                        break;
                }
            }
            query.status = "Approved";
            return await this.workspace.find(query).sort(sortOptions);
        }
        catch (error) {
            throw error;
        }
    }
    async workspaceDetails(workspaceId, userId) {
        try {
            const workspace = await this.workspace.findById(workspaceId);
            const workspaceObject = workspace === null || workspace === void 0 ? void 0 : workspace.toObject();
            let isSaved = false;
            if (userId) {
                const savedWorkspace = await this.savedWorkspace.findOne({ userId, workspaceId, isActive: true });
                isSaved = !!savedWorkspace;
            }
            return { ...workspaceObject, isSaved };
        }
        catch (error) {
            throw error;
        }
    }
    async updateUserMobile(userId, mobile) {
        try {
            await this.user.findByIdAndUpdate(userId, { mobile });
            return true;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = userRepository;
//# sourceMappingURL=userRepository.js.map