"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const userSchema_1 = __importDefault(require("../model/userSchema"));
class SubscriptionService {
    async checkExpiredSubscriptions() {
        try {
            const currentDate = new Date();
            const expiredUsers = await userSchema_1.default.find({
                isSubscribed: true,
                subscriptionEndDate: { $lt: currentDate }
            });
            console.log(`Found ${expiredUsers.length} expired subscriptions`);
            for (const user of expiredUsers) {
                user.isSubscribed = false;
                await user.save();
                console.log(`Expired subscription for user: ${user._id}`);
            }
            return {
                success: true,
                processedCount: expiredUsers.length
            };
        }
        catch (error) {
            console.error('Error checking expired subscriptions:', error);
            return {
                success: false,
                error
            };
        }
    }
}
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscriptionService.js.map