export const emailTemplates = {
  verification: (verificationUrl: string, userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - Community Events</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Community Events!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}!</h2>
          <p>Thanks for joining Community Events! To get started, please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours for security reasons.</p>
        </div>
        <div class="footer">
          <p>© 2024 Community Events. All rights reserved.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (resetUrl: string, userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - Community Events</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}!</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p><strong>If you didn't request this reset, please ignore this email.</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 Community Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  eventUpdate: (eventTitle: string, updateMessage: string, eventUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Update - ${eventTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Event Update</h1>
        </div>
        <div class="content">
          <h2>${eventTitle}</h2>
          <p>There's an important update about an event you're registered for:</p>
          <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #059669; margin: 20px 0;">
            <p><strong>Update:</strong> ${updateMessage}</p>
          </div>
          <a href="${eventUrl}" class="button">View Event Details</a>
        </div>
        <div class="footer">
          <p>© 2024 Community Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  eventCancellation: (eventTitle: string, reason: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Cancelled - ${eventTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Event Cancelled</h1>
        </div>
        <div class="content">
          <h2>${eventTitle}</h2>
          <p>We're sorry to inform you that this event has been cancelled.</p>
          <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #DC2626; margin: 20px 0;">
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>If you purchased tickets, you will receive a full refund within 5-7 business days.</p>
          <p>We apologize for any inconvenience caused.</p>
        </div>
        <div class="footer">
          <p>© 2024 Community Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  registrationConfirmation: (eventTitle: string, eventDate: string, eventLocation: string, ticketId?: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Registration Confirmed - ${eventTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .ticket { background: #f0f9ff; padding: 20px; border: 2px dashed #059669; margin: 20px 0; text-align: center; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Registration Confirmed!</h1>
        </div>
        <div class="content">
          <h2>You're all set for ${eventTitle}!</h2>
          <p>Your registration has been confirmed. Here are the event details:</p>
          
          <div class="ticket">
            <h3>📅 ${eventTitle}</h3>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
            ${ticketId ? `<p><strong>Ticket ID:</strong> ${ticketId}</p>` : ''}
          </div>
          
          <p>We'll send you a reminder 24 hours before the event.</p>
          <p>Looking forward to seeing you there!</p>
        </div>
        <div class="footer">
          <p>© 2024 Community Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};