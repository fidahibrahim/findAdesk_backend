"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailgen_1 = __importDefault(require("mailgen"));
class OtpService {
    generateOtp() {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(otp);
        return otp;
    }
    async sendEmail(email, otp, name) {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.NODE_MAILER_EMAIL,
                    pass: process.env.NODE_MAILER_PASS,
                },
            });
            const mailGenerator = new mailgen_1.default({
                theme: "default",
                product: {
                    name: "findAdesk",
                    link: "https://mailgen.js/"
                }
            });
            const resp = {
                body: {
                    name: `${name}`,
                    intro: 'Welcome to findAdesk ! We\'re excited to have you on board.',
                    action: {
                        instructions: 'Please use the following OTP to complete your registration: ',
                        button: {
                            color: "#22BC66",
                            text: `your OTP is ${otp}`,
                            link: 'http://localhost:5173/otp'
                        }
                    },
                    outro: 'If you did not request this mail, you can savely ignore it.'
                }
            };
            const html = mailGenerator.generate(resp);
            const message = {
                from: process.env.NODE_MAILER_EMAIL,
                to: email,
                subject: 'findAdesk OTP verification',
                html: html
            };
            await transporter.sendMail(message);
        }
        catch (error) {
            console.error("Error sending password reset email:", error);
            throw error;
        }
    }
}
exports.default = OtpService;
//# sourceMappingURL=otpService.js.map