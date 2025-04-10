import { Response } from 'express'


//error handler
export const handleError = (message: string, statusCode: number) => {
    return { statusCode, message };
};

//sucess handler
export const handleSuccess = (message: string, statusCode: number, data?: any) => {
    return { statusCode, message, data: data || null };
};



// Response Types
interface BaseResponse {
    statusCode: number;
    message: string;
  }
  
  interface SuccessResponse<T = any> extends BaseResponse {
    success: true;
    data: T | null;
  }
  
  interface ErrorResponse extends BaseResponse {
    success: false;
    error?: any;
  }
  
  type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
  
  // Response Handlers
  export const handleSuccesss = <T>(message: string, statusCode: number, data?: T): SuccessResponse<T> => {
    return {
      success: true,
      statusCode,
      message,
      data: data || null
    };
  };
  
  export const handleErrorr = (message: string, statusCode: number, error?: any): ErrorResponse => {
    return {
      success: false,
      statusCode,
      message,
      error: error || null
    };
  };
  
  // Helper function to send responses
  export const sendResponse = <T>(res: Response, response: ApiResponse<T>): void => {
    res.status(response.statusCode).json(response);
  };