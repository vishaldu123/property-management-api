"use strict";
/**
 * Email Service
 * Mock email service for development/testing
 * Can be replaced with SendGrid, Mailgun, AWS SES, etc. in production
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class EmailService {
    /**
     * Send email (mock implementation - logs to console)
     * In production, replace with actual email provider
     */
    async send(payload) {
        logger_1.default.info('Email sent (mock)', {
            to: payload.to,
            subject: payload.subject,
        });
        // In production environment, use real email service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Implement SendGrid/Mailgun/AWS SES integration
            logger_1.default.warn('Production email service not configured', { to: payload.to });
        }
        else {
            // Development: Log full email to console
            console.log('\n=== EMAIL (MOCK) ===');
            console.log(`To: ${payload.to}`);
            console.log(`Subject: ${payload.subject}`);
            console.log('---');
            console.log(payload.text || payload.html);
            console.log('===================\n');
        }
    }
    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email, resetLink, userName) {
        const html = `
      <h2>Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this reset, please ignore this email.</p>
      <p>Best regards,<br>Property Management Team</p>
    `;
        const text = `
Password Reset Request

Hello ${userName},

You requested a password reset. Visit the link below to reset your password:
${resetLink}

This link will expire in 15 minutes.

If you did not request this reset, please ignore this email.

Best regards,
Property Management Team
    `;
        await this.send({
            to: email,
            subject: 'Password Reset Request',
            html,
            text,
        });
    }
    /**
     * Send account verification email
     */
    async sendVerificationEmail(email, verificationLink, userName) {
        const html = `
      <h2>Verify Your Email</h2>
      <p>Hello ${userName},</p>
      <p>Welcome to Property Management! Please verify your email address to complete your registration:</p>
      <p><a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create this account, please contact support.</p>
      <p>Best regards,<br>Property Management Team</p>
    `;
        const text = `
Verify Your Email

Hello ${userName},

Welcome to Property Management! Please verify your email address by visiting:
${verificationLink}

This link will expire in 24 hours.

If you did not create this account, please contact support.

Best regards,
Property Management Team
    `;
        await this.send({
            to: email,
            subject: 'Verify Your Email',
            html,
            text,
        });
    }
    /**
     * Send password changed confirmation email
     */
    async sendPasswordChangedEmail(email, userName) {
        const html = `
      <h2>Password Changed</h2>
      <p>Hello ${userName},</p>
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please reset your password immediately or contact support.</p>
      <p>Best regards,<br>Property Management Team</p>
    `;
        const text = `
Password Changed

Hello ${userName},

Your password has been successfully changed.

If you did not make this change, please reset your password immediately or contact support.

Best regards,
Property Management Team
    `;
        await this.send({
            to: email,
            subject: 'Password Changed',
            html,
            text,
        });
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
