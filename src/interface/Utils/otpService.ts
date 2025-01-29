
export default interface IotpService{
    generateOtp(): string,
    sendEmail(email: string, otp: string, name: string): Promise<void>,
    sendEmailForgotPassword(resetLink: string, email: string): Promise<void>
    sendEmailToOwner(email: string|undefined, status: string|undefined, name: string): Promise<void>
}