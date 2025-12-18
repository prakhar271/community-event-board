import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Check if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass && smtpHost !== 'smtp.gmail.com' && smtpUser !== 'your-email@gmail.com') {
      // Use real SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      console.log('📧 EmailService initialized with SMTP:', smtpHost);
    } else {
      // Use test transporter for development
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
      console.log('📧 EmailService initialized with test transporter (no SMTP configured)');
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.API_BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    
    if (this.isRealSMTP()) {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Verify Your Email - Community Event Board',
        html: `
          <h2>Welcome to Community Event Board!</h2>
          <p>Hi ${name},</p>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        `
      };
      
      await this.transporter.sendMail(mailOptions);
      console.log('📧 Verification email sent to:', email);
    } else {
      console.log('📧 Development mode: Would send verification email to', email);
      console.log('📧 Verification URL:', verificationUrl);
    }
  }

  private isRealSMTP(): boolean {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    return !!(smtpHost && smtpUser && smtpHost !== 'smtp.gmail.com' && smtpUser !== 'your-email@gmail.com');
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.API_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    
    if (this.isRealSMTP()) {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Password Reset - Community Event Board',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="background-color: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        `
      };
      
      await this.transporter.sendMail(mailOptions);
      console.log('📧 Password reset email sent to:', email);
    } else {
      console.log('📧 Development mode: Would send password reset email to', email);
      console.log('📧 Reset URL:', resetUrl);
    }
  }

  async sendEventUpdateNotification(email: string, name: string, eventTitle: string, updateMessage: string): Promise<void> {
    if (this.isRealSMTP()) {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `Event Update: ${eventTitle}`,
        html: `
          <h2>Event Update</h2>
          <p>Hi ${name},</p>
          <p>There's an update for the event you're registered for:</p>
          <h3>${eventTitle}</h3>
          <p>${updateMessage}</p>
          <p>Visit your dashboard for more details.</p>
        `
      };
      
      await this.transporter.sendMail(mailOptions);
      console.log('📧 Event update notification sent to:', email);
    } else {
      console.log('📧 Development mode: Would send event update notification to', email);
      console.log('📧 Event:', eventTitle);
    }
  }

  async sendEventCancellationNotification(email: string, name: string, eventTitle: string, reason: string): Promise<void> {
    if (this.isRealSMTP()) {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `Event Cancelled: ${eventTitle}`,
        html: `
          <h2>Event Cancellation</h2>
          <p>Hi ${name},</p>
          <p>Unfortunately, the following event has been cancelled:</p>
          <h3>${eventTitle}</h3>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>We apologize for any inconvenience. If you paid for this event, you will receive a full refund within 5-7 business days.</p>
        `
      };
      
      await this.transporter.sendMail(mailOptions);
      console.log('📧 Event cancellation notification sent to:', email);
    } else {
      console.log('📧 Development mode: Would send event cancellation notification to', email);
      console.log('📧 Event:', eventTitle);
    }
  }

  async sendRegistrationConfirmation(email: string, name: string, eventTitle: string, eventDate: Date): Promise<void> {
    if (this.isRealSMTP()) {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `Registration Confirmed: ${eventTitle}`,
        html: `
          <h2>Registration Confirmed!</h2>
          <p>Hi ${name},</p>
          <p>Your registration has been confirmed for:</p>
          <h3>${eventTitle}</h3>
          <p><strong>Date:</strong> ${eventDate.toLocaleDateString()}</p>
          <p>We're excited to see you there! Check your dashboard for event details and updates.</p>
        `
      };
      
      await this.transporter.sendMail(mailOptions);
      console.log('📧 Registration confirmation sent to:', email);
    } else {
      console.log('📧 Development mode: Would send registration confirmation to', email);
      console.log('📧 Event:', eventTitle);
    }
  }
}