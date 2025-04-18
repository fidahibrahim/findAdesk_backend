"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMessage = void 0;
var ResponseMessage;
(function (ResponseMessage) {
    //common - use
    ResponseMessage["LOGIN_SUCCESS"] = "Login successful";
    ResponseMessage["LOGIN_FAILURE"] = "An error occurred during login";
    ResponseMessage["LOGOUT_SUCCESS"] = "Logout successful";
    ResponseMessage["LOGOUT_FAILURE"] = "Failed to logout";
    ResponseMessage["AUTHENTICATION_FAILURE"] = "Failed to authenticate";
    ResponseMessage["OTP_VERIFIED"] = "OTP verified successfully";
    ResponseMessage["OTP_VERIFICATION_FAILED"] = "Failed to verify OTP";
    ResponseMessage["PASSWORD_RESET_LINK_SENT"] = "Password reset link sent to your email";
    ResponseMessage["PASSWORD_RESET_FAILURE"] = "Failed to reset password";
    ResponseMessage["PASSWORD_RESET_SUCCESS"] = "Password has been reset";
    ResponseMessage["MAIL_SEND_SUCCESSFULLY"] = "Mail sended successfully";
    ResponseMessage["FAILED_SENDING_MAIL"] = "Failed to send Mail";
    ResponseMessage["FIELDS_REQUIRED"] = "All fields are required";
    ResponseMessage["ACCOUND_NOT_VERIFIED"] = "Account not verified. Please verify your account.";
    ResponseMessage["ACCOUNT_BLOCKED"] = "Your account has been blocked";
    ResponseMessage["INVALID_MAIL"] = "Invalid email";
    ResponseMessage["INVALID_PASSWORD"] = "Invalid password";
    //admin
    ResponseMessage["USER_BLOCKED"] = "User blocked successfully";
    ResponseMessage["USER_UNBLOCKED"] = "User unblocked successfully";
    ResponseMessage["OWNER_BLOCKED"] = "Owner blocked successfully";
    ResponseMessage["OWNER_UNBLOCKED"] = "Owner unblocked successfully";
    ResponseMessage["BLOCK_USER_FAILURE"] = "Failed to block/unblock user";
    ResponseMessage["FETCH_WORKSPACE_SUCCESS"] = "Data fetched successfully";
    ResponseMessage["FETCH_USERS_SUCCESS"] = "Data fetched successfully";
    ResponseMessage["FETCH_USERS_FAILURE"] = "Failed to fetch data";
    ResponseMessage["FETCH_OWNERS_SUCCESS"] = "Data fetched successfully";
    ResponseMessage["FETCH_OWNERS_FAILURE"] = "Failed to fetch data";
    ResponseMessage["FETCH_WORKSPACE_FAILURE"] = "Failed to fetch workspace";
    ResponseMessage["UPDATE_WORKSPACE_STATUS_SUCCESS"] = "Status Updated Successfully";
    ResponseMessage["UPDATE_WORKSPACE_STATUS_FAILURE"] = "Failed to update status";
    ResponseMessage["REVENUE_FETCHED_SUCCESSFULLY"] = "Successfully fetched your revenue";
    ResponseMessage["REVENUE_FETCHED_FAILED"] = "Failed to fetch revenue";
    //user
    ResponseMessage["USER_NOT_FOUND"] = "User not found";
    ResponseMessage["USER_REGISTER_SUCCESS"] = "User registered successfully!";
    ResponseMessage["USER_REGISTER_FAILURE"] = "Failed to register user";
    ResponseMessage["GOOGLE_LOGIN_SUCCESS"] = "Successfully authenticated with Google";
    ResponseMessage["GOOGLE_LOGIN_FAILURE"] = "Google authentication failed";
    ResponseMessage["GOOGLE_CREDENTIAL_REQUIRED"] = "Google credential is required";
    ResponseMessage["FETCH_USER"] = "Users fetched successfully";
    ResponseMessage["FETCH_USER_FAILURE"] = "Failed to fetch users";
    ResponseMessage["FETCH_PROFILE"] = "User profile fetched successfully";
    ResponseMessage["FETCH_PROFILE_FAILURE"] = "Failed to fetch user profile";
    ResponseMessage["UPDATE_PROFILE_SUCCESS"] = "Profile updated successfully";
    ResponseMessage["UPDATE_PROFILE_FAILURE"] = "Failed to update";
    ResponseMessage["SUBSCRIPTION_SESSION"] = "subscription session created";
    ResponseMessage["SUBSCRIPTION_VERIFIED"] = "subscription successfully completed";
    //owner
    ResponseMessage["OWNER_REGISTER_SUCCESS"] = "Owner registered successfully!";
    ResponseMessage["OWNER_REGISTER_FAILURE"] = "Failed to register owner";
    ResponseMessage["OWNER_NOT_FOUND"] = "Owner not found";
    //admin
    ResponseMessage["FETCH_DASHBOARD"] = "Dashboard data fetched successfully";
    ResponseMessage["FETCH_DASHBOARD_FAILURE"] = "Failed to fetch dashboard data";
    //workspace
    ResponseMessage["WORKSPACE_REGISTER_SUCCESS"] = "Workspace registered successfully";
    ResponseMessage["WORKSPACE_REGISTER_FAILURE"] = "Failed to register Workspace";
    ResponseMessage["WORKSPACE_EXIST"] = "Workspace already exist";
    ResponseMessage["WORKSPACE_NOT_FOUND"] = "Workspace not found";
    ResponseMessage["WORKSPACE_LISTING_SUCCESS"] = "Workspaces fetched successfully!";
    ResponseMessage["WORKSPACE_LISTING_FAILURE"] = "Failed to fetch Worksaces";
    ResponseMessage["WORKSPACE_VIEW_SUCCESS"] = "Workspace details fetched successfully!";
    ResponseMessage["WORKSPACE_VIEW_FAILURE"] = "Failed to fetch Worksace details";
    ResponseMessage["DELETE_WORKSPACE_SUCCESS"] = "Workspace deleted successfully";
    ResponseMessage["DELETE_WORKSPACE_FAILURE"] = "Failed to delete workspace";
    ResponseMessage["EDIT_WORKSPACE_SUCCESS"] = "Workspace updated successfully";
    ResponseMessage["EDIT_WORKSPACE_FAILURE"] = "Failed to update workspace";
    ResponseMessage["SAVE_WORKSPACE_SUCCESS"] = "Workspace has been added to saved list";
    ResponseMessage["SAVE_WORKSPACE_FAILURE"] = "Failed to save workspace. Please try again.";
    //Booking
    ResponseMessage["AVAILABILITY_CHECK_SUCCESS"] = "Workspace is available for Booking";
    ResponseMessage["AVAILABILITY_CHECK_FAILURE"] = "Availability check failed!";
    ResponseMessage["BOOKING_CONFIRMATION"] = "Your booking has been confirmed";
    ResponseMessage["BOOKING_FAILURE"] = "Your booking has been failed";
    ResponseMessage["BOOKING_LISTING_SUCCESS"] = "Bookings fetched successfully";
    ResponseMessage["BOOKING_LISTING_FAILURE"] = "Failed to fetch bookings";
    ResponseMessage["BOOKING_VIEWDETAILS_SUCCESS"] = "Booking details fetched successfully";
    ResponseMessage["BOOKING_VIEWDETAILS_FAILURE"] = "Failed to fetch booking details";
    ResponseMessage["CANCEL_BOOKING"] = "Booking cancelled successfully";
    ResponseMessage["CANCEL_BOOKING_FAILURE"] = "Failed to cancel booking";
    //Review
    ResponseMessage["ADD_REVIEW_SUCCESS"] = "Review submitted successfully!";
    ResponseMessage["ADD_REVIEW_FAILURE"] = "Failed to add your review";
    ResponseMessage["GET_REVIEW_SUCCESS"] = "Reviews fetched successfully";
    ResponseMessage["GET_REVIEW_FAILURE"] = "Failed to fetch reviews";
    //Wallet 
    ResponseMessage["FETCH_WALLET"] = "Wallet fetched successfully";
    ResponseMessage["FETCH_WALLET_FAILURE"] = "Failed to fetch wallet";
})(ResponseMessage || (exports.ResponseMessage = ResponseMessage = {}));
//# sourceMappingURL=responseMssg.js.map