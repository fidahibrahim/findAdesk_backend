export enum ResponseMessage {
    //common - use
    LOGIN_SUCCESS = "Login successful",
    LOGIN_FAILURE = "An error occurred during login",
    LOGOUT_SUCCESS = "Logout successful",
    LOGOUT_FAILURE = "Failed to logout",
    AUTHENTICATION_FAILURE = "Failed to authenticate",
    OTP_VERIFIED = "OTP verified successfully",
    OTP_VERIFICATION_FAILED = "Failed to verify OTP",
    PASSWORD_RESET_LINK_SENT = "Password reset link sent to your email",
    PASSWORD_RESET_FAILURE = "Failed to reset password",
    PASSWORD_RESET_SUCCESS = "Password has been reset",
    MAIL_SEND_SUCCESSFULLY = "Mail sended successfully",
    FAILED_SENDING_MAIL = "Failed to send Mail",
    FIELDS_REQUIRED = "All fields are required",
    ACCOUND_NOT_VERIFIED = "Account not verified. Please verify your account.",
    ACCOUNT_BLOCKED = "Your account has been blocked",
    INVALID_MAIL = "Invalid email",
    INVALID_PASSWORD = "Invalid password",
  
    //admin
    USER_BLOCKED = "User blocked successfully",
    USER_UNBLOCKED = "User unblocked successfully",
    OWNER_BLOCKED = "Owner blocked successfully",
    OWNER_UNBLOCKED = "Owner unblocked successfully",
    BLOCK_USER_FAILURE = "Failed to block/unblock user",
    FETCH_WORKSPACE_SUCCESS = "Data fetched successfully",
    FETCH_USERS_SUCCESS = "Data fetched successfully",
    FETCH_USERS_FAILURE = "Failed to fetch data",
    FETCH_OWNERS_SUCCESS = "Data fetched successfully",
    FETCH_OWNERS_FAILURE = "Failed to fetch data",
    FETCH_WORKSPACE_FAILURE = "Failed to fetch workspace",
    UPDATE_WORKSPACE_STATUS_SUCCESS = "Status Updated Successfully",
    UPDATE_WORKSPACE_STATUS_FAILURE = "Failed to update status",
    REVENUE_FETCHED_SUCCESSFULLY = 'Successfully fetched your revenue',
    REVENUE_FETCHED_FAILED = 'Failed to fetch revenue',
  
    //user
    USER_NOT_FOUND = "User not found",
    USER_REGISTER_SUCCESS = "User registered successfully!",
    USER_REGISTER_FAILURE = "Failed to register user",
    GOOGLE_LOGIN_SUCCESS = "Successfully authenticated with Google",
    GOOGLE_LOGIN_FAILURE = "Google authentication failed",
    GOOGLE_CREDENTIAL_REQUIRED = "Google credential is required",
    FETCH_USER = "Users fetched successfully",
    FETCH_USER_FAILURE = "Failed to fetch users",
    FETCH_PROFILE = "User profile fetched successfully",
    FETCH_PROFILE_FAILURE = "Failed to fetch user profile",
    UPDATE_PROFILE_SUCCESS = "Profile updated successfully",
    UPDATE_PROFILE_FAILURE = "Failed to update",
  
    //owner
    OWNER_REGISTER_SUCCESS = "Owner registered successfully!",
    OWNER_REGISTER_FAILURE = "Failed to register owner",
    OWNER_NOT_FOUND = "Owner not found",
    
    
    //workspace
    WORKSPACE_REGISTER_SUCCESS = "Workspace registered successfully",
    WORKSPACE_REGISTER_FAILURE = "Failed to register Workspace",
    WORKSPACE_EXIST = "Workspace already exist",
    WORKSPACE_NOT_FOUND = "Workspace not found",
    WORKSPACE_LISTING_SUCCESS = "Workspaces fetched successfully!",
    WORKSPACE_LISTING_FAILURE = "Failed to fetch Worksaces",
    WORKSPACE_VIEW_SUCCESS = "Workspace details fetched successfully!",
    WORKSPACE_VIEW_FAILURE = "Failed to fetch Worksace details",
    DELETE_WORKSPACE_SUCCESS = "Workspace deleted successfully",
    DELETE_WORKSPACE_FAILURE = "Failed to delete workspace",
    EDIT_WORKSPACE_SUCCESS = "Workspace updated successfully",
    EDIT_WORKSPACE_FAILURE = "Failed to update workspace",
    SAVE_WORKSPACE_SUCCESS = 'Workspace has been added to saved list',
    SAVE_WORKSPACE_FAILURE = 'Failed to save workspace. Please try again.',

    //Booking
    AVAILABILITY_CHECK_SUCCESS = "Workspace is available for Booking",
    AVAILABILITY_CHECK_FAILURE = "Availability check failed!",
    BOOKING_CONFIRMATION = "Your booking has been confirmed",
    BOOKING_FAILURE = "Your booking has been failed",
    BOOKING_LISTING_SUCCESS = "Bookings fetched successfully",
    BOOKING_LISTING_FAILURE = "Failed to fetch bookings",
    BOOKING_VIEWDETAILS_SUCCESS = "Booking details fetched successfully",
    BOOKING_VIEWDETAILS_FAILURE = "Failed to fetch booking details"
  }
  