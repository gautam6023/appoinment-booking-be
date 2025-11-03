import { Resend } from "resend";
import { format } from "date-fns";
import { env } from "../config/env";
import { logInfo, logError } from "../utils/logger.utils";

const resend = new Resend(env.RESEND_API_KEY);

interface AppointmentEmailData {
  appointmentId: string;
  ownerName: string;
  ownerEmail: string;
  guestName: string;
  guestEmail: string;
  startTime: Date;
  endTime: Date;
  reason?: string;
  guests: string[];
}

/**
 * Format date and time for email display
 */
function formatDateTime(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
}

/**
 * Format time only for email display
 */
function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

/**
 * Generate HTML email template for appointment booked
 */
function getBookedEmailTemplate(data: AppointmentEmailData): string {
  const allGuests = [data.guestEmail, ...data.guests].filter(Boolean);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      margin: 12px 0;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #666;
      display: inline-block;
      width: 120px;
    }
    .value {
      color: #333;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Appointment Confirmed</h1>
    </div>
    
    <p>Hello,</p>
    <p>Your appointment with <strong>${data.ownerName}</strong> has been successfully booked.</p>
    
    <div class="details">
      <div class="detail-row">
        <span class="label">Date & Time:</span>
        <span class="value">${formatDateTime(data.startTime)} (UTC)</span>
      </div>
      <div class="detail-row">
        <span class="label">Duration:</span>
        <span class="value">${formatTime(data.startTime)} - ${formatTime(data.endTime)} UTC</span>
      </div>
      <div class="detail-row">
        <span class="label">With:</span>
        <span class="value">${data.ownerName} (${data.ownerEmail})</span>
      </div>
      ${data.reason ? `
      <div class="detail-row">
        <span class="label">Purpose:</span>
        <span class="value">${data.reason}</span>
      </div>
      ` : ''}
      ${allGuests.length > 1 ? `
      <div class="detail-row">
        <span class="label">Attendees:</span>
        <span class="value">${allGuests.join(', ')}</span>
      </div>
      ` : ''}
    </div>
    
    <p><strong>Note:</strong> All times are shown in UTC. Please convert to your local timezone if needed.</p>
    
    <div class="footer">
      <p>This is an automated confirmation email. If you have any questions, please contact ${data.ownerEmail}.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML email template for appointment cancelled
 */
function getCancelledEmailTemplate(data: AppointmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .header {
      background-color: #f44336;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      margin: 12px 0;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #666;
      display: inline-block;
      width: 120px;
    }
    .value {
      color: #333;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✗ Appointment Cancelled</h1>
    </div>
    
    <p>Hello,</p>
    <p>Your appointment with <strong>${data.ownerName}</strong> has been cancelled.</p>
    
    <div class="details">
      <div class="detail-row">
        <span class="label">Date & Time:</span>
        <span class="value">${formatDateTime(data.startTime)} (UTC)</span>
      </div>
      <div class="detail-row">
        <span class="label">Duration:</span>
        <span class="value">${formatTime(data.startTime)} - ${formatTime(data.endTime)} UTC</span>
      </div>
      <div class="detail-row">
        <span class="label">With:</span>
        <span class="value">${data.ownerName} (${data.ownerEmail})</span>
      </div>
    </div>
    
    <p>If you wish to reschedule, please contact ${data.ownerEmail} or book a new appointment.</p>
    
    <div class="footer">
      <p>This is an automated cancellation notice. If you have any questions, please contact ${data.ownerEmail}.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML email template for appointment rescheduled
 */
function getRescheduledEmailTemplate(data: AppointmentEmailData & { oldStartTime: Date; oldEndTime: Date }): string {
  const allGuests = [data.guestEmail, ...data.guests].filter(Boolean);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .header {
      background-color: #FF9800;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      margin: 12px 0;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #666;
      display: inline-block;
      width: 120px;
    }
    .value {
      color: #333;
    }
    .old-time {
      text-decoration: line-through;
      color: #999;
      font-size: 14px;
    }
    .new-time {
      color: #FF9800;
      font-weight: 600;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>↻ Appointment Rescheduled</h1>
    </div>
    
    <p>Hello,</p>
    <p>Your appointment with <strong>${data.ownerName}</strong> has been rescheduled.</p>
    
    <div class="details">
      <div class="detail-row">
        <span class="label">Old Time:</span>
        <span class="value old-time">${formatDateTime(data.oldStartTime)} (UTC)</span>
      </div>
      <div class="detail-row">
        <span class="label">New Time:</span>
        <span class="value new-time">${formatDateTime(data.startTime)} (UTC)</span>
      </div>
      <div class="detail-row">
        <span class="label">Duration:</span>
        <span class="value">${formatTime(data.startTime)} - ${formatTime(data.endTime)} UTC</span>
      </div>
      <div class="detail-row">
        <span class="label">With:</span>
        <span class="value">${data.ownerName} (${data.ownerEmail})</span>
      </div>
      ${data.reason ? `
      <div class="detail-row">
        <span class="label">Purpose:</span>
        <span class="value">${data.reason}</span>
      </div>
      ` : ''}
      ${allGuests.length > 1 ? `
      <div class="detail-row">
        <span class="label">Attendees:</span>
        <span class="value">${allGuests.join(', ')}</span>
      </div>
      ` : ''}
    </div>
    
    <p><strong>Note:</strong> All times are shown in UTC. Please convert to your local timezone if needed.</p>
    
    <div class="footer">
      <p>This is an automated reschedule notification. If you have any questions, please contact ${data.ownerEmail}.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send appointment booked email to all guests
 */
export async function sendAppointmentBookedEmail(data: AppointmentEmailData): Promise<void> {
  try {
    const allGuests = [data.guestEmail, ...data.guests].filter(Boolean);
    
    // Send email to all attendees
    for (const guest of allGuests) {
      try {
        await resend.emails.send({
          from: "Birdchime <appointments@resend.dev>",
          to: guest,
          subject: `Appointment Confirmed with ${data.ownerName}`,
          html: getBookedEmailTemplate(data),
        });
        logInfo(`Booking confirmation email sent to ${guest}`);
      } catch (error) {
        logError(`Failed to send booking email to ${guest}`, error);
      }
    }
  } catch (error) {
    logError("Error sending booking emails", error);
    // Don't throw - we don't want to fail the booking if email fails
  }
}

/**
 * Send appointment cancelled email to all guests
 */
export async function sendAppointmentCancelledEmail(data: AppointmentEmailData): Promise<void> {
  try {
    const allGuests = [data.guestEmail, ...data.guests].filter(Boolean);
    
    // Send email to all attendees
    for (const guest of allGuests) {
      try {
        await resend.emails.send({
          from: "Birdchime <appointments@resend.dev>",
          to: guest,
          subject: `Appointment Cancelled with ${data.ownerName}`,
          html: getCancelledEmailTemplate(data),
        });
        logInfo(`Cancellation email sent to ${guest}`);
      } catch (error) {
        logError(`Failed to send cancellation email to ${guest}`, error);
      }
    }
  } catch (error) {
    logError("Error sending cancellation emails", error);
    // Don't throw - we don't want to fail the cancellation if email fails
  }
}

/**
 * Send appointment rescheduled email to all guests
 */
export async function sendAppointmentRescheduledEmail(
  data: AppointmentEmailData & { oldStartTime: Date; oldEndTime: Date }
): Promise<void> {
  try {
    const allGuests = [data.guestEmail, ...data.guests].filter(Boolean);
    
    // Send email to all attendees
    for (const guest of allGuests) {
      try {
        await resend.emails.send({
          from: "Birdchime <appointments@resend.dev>",
          to: guest,
          subject: `Appointment Rescheduled with ${data.ownerName}`,
          html: getRescheduledEmailTemplate(data),
        });
        logInfo(`Reschedule email sent to ${guest}`);
      } catch (error) {
        logError(`Failed to send reschedule email to ${guest}`, error);
      }
    }
  } catch (error) {
    logError("Error sending reschedule emails", error);
    // Don't throw - we don't want to fail the reschedule if email fails
  }
}

