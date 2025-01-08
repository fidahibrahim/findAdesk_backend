export default interface IotpService{
    generateOtp(): string,
    sendEmail(email: string, otp: string, name: string): Promise<void>
}