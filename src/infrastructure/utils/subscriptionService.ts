import userModel from "../model/userSchema";

export class SubscriptionService {
    async checkExpiredSubscriptions() {
        try {
            const currentDate = new Date();
            const expiredUsers = await userModel.find({
                isSubscribed: true,
                subscriptionEndDate: { $lt: currentDate }
            });
            console.log(`Found ${expiredUsers.length} expired subscriptions`);
            for (const user of expiredUsers) {
                user.isSubscribed = false;
                await user.save();
                console.log(`Expired subscription for user: ${user._id}`)
            }
            return {
                success: true,
                processedCount: expiredUsers.length
            };
        } catch (error) {
            console.error('Error checking expired subscriptions:', error);
            return {
                success: false,
                error
            };
        }
    }
}
