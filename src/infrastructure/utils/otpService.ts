import IotpService from "../../interface/Utils/otpService";
import nodemailer from "nodemailer"
import Mailgen from "mailgen";

export default class OtpService implements IotpService {
    generateOtp() {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(otp)
        return otp
    }
    async sendEmail(email: string, otp: string, name: string): Promise<void> {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.NODE_MAILER_EMAIL,
                    pass: process.env.NODE_MAILER_PASS,
                },
            })

            const mailGenerator = new Mailgen({
                theme: "default",
                product: {
                    name: "findAdesk",
                    link: `${process.env.SUCCESS_URL_PRO}/`
                }
            })

            const resp = {
                body: {
                    name: `${name}`,
                    intro: 'Welcome to findAdesk ! We\'re excited to have you on board.',
                    action: {
                        instructions: 'Please use the following OTP to complete your registration: ',
                        button: {
                            color: "#22BC66",
                            text: `your OTP is ${otp}`,
                            link: `${process.env.SUCCESS_URL_PRO}/otp`
                        }
                    },
                    outro: 'If you did not request this mail, you can savely ignore it.'
                }
            };
            const html = mailGenerator.generate(resp)

            const message = {
                from: process.env.NODE_MAILER_EMAIL,
                to: email,
                subject: 'findAdesk OTP verification',
                html: html
            }
            await transporter.sendMail(message)
        } catch (error) {
            console.error("Error sending password reset email:", error);
            throw error;
        }
    }
    async sendEmailForgotPassword(resetLink: string, email: string) {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.NODE_MAILER_EMAIL,
                    pass: process.env.NODE_MAILER_PASS,
                },
            })
            const mailGenerator = new Mailgen({
                theme: "default",
                product: {
                    name: "findAdesk",
                    link: `${process.env.SUCCESS_URL_PRO}/`
                }
            })
            const emailContent = {
                body: {
                    name: "User",
                    intro: "You are receiving this email because we received a password reset request from your account.",
                    action: {
                        instructions: "To reset your password, here is the Reset Link:",
                        button: {
                            color: "#22BC66",
                            text: "Reset Password",
                            link: resetLink,
                        },
                    },
                    outro: "If you didn't request a password reset, no further action is required.",
                },
            };
            const html = mailGenerator.generate(emailContent);
            const message = {
                from: process.env.NODE_MAILER_EMAIL,
                to: email,
                subject: 'findAdesk Password Reset',
                html: html
            }
            await transporter.sendMail(message)

        } catch (error) {
            console.error("Error sending password reset email:", error);
            throw error;
        }
    }
    async sendEmailToOwner(email: string, status: string, name: string) {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.NODE_MAILER_EMAIL,
                    pass: process.env.NODE_MAILER_PASS,
                },
            });

            const mailGenerator = new Mailgen({
                theme: "default",
                product: {
                    name: "findAdesk",
                    link: `${process.env.SUCCESS_URL_PRO}/`,
                },
            });

            let intro = "";
            let outro = "";

            if (status === "Approved") {
                intro = "We are thrilled to inform you that your workspace submission has been approved!";
                outro = "You can now manage your workspace and start welcoming users. If you have any questions, feel free to contact us at support@findadesk.com.";
            } else if (status === "Rejected") {
                intro = "We regret to inform you that your workspace submission has been rejected.";
                outro = "Please review the submission guidelines and make necessary adjustments. If you have any questions, feel free to contact us at support@findadesk.com.";
            }

            const emailContent = {
                body: {
                    name: `${name}`,
                    intro: intro,
                    outro: outro,
                },
            };

            const html = mailGenerator.generate(emailContent);

            const message = {
                from: process.env.NODE_MAILER_EMAIL,
                to: email,
                subject: `findAdesk Workspace Submission ${status}`,
                html: html,
            };

            await transporter.sendMail(message);

        } catch (error) {
            console.error("Error sending password reset email:", error);
            throw error;
        }
    }

    async contactEmailService(name: string, email: string, subject: string, message: string) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.NODE_MAILER_EMAIL,
                    pass: process.env.NODE_MAILER_PASS,
                },
            });

            const mailOptions = {
                from: email,
                to: process.env.NODE_MAILER_EMAIL,
                subject: `New Contact Form Submission: ${subject}`,
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            }; 
            await transporter.sendMail(mailOptions)

        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }


}