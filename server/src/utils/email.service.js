import nodemailer from "nodemailer";

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, 
      pass: process.env.SMTP_PASS, 
    },
  });

  return transporter;
};

// Send email function
const sendEmail = async (to, subject, html, text) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email service not configured. SMTP credentials missing.");
      console.log("Would send email to:", to);
      console.log("Subject:", subject);
      return { success: false, message: "Email service not configured" };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"EventFlow" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Email templates

// Payment confirmation email
export const sendPaymentConfirmationEmail = async (booking, user, event) => {
  const eventDate = new Date(booking.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalPrice = event.price * booking.seatsBooked;

  const subject = `Payment Confirmed - ${event.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hello ${user.name},</p>
          <p>Your payment has been successfully processed. Your booking is now confirmed!</p>
          
          <div class="success-badge">✅ Booking Confirmed</div>
          
          <div class="details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Event:</strong>
              <span>${event.title}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${booking.slotTime}</span>
            </div>
            <div class="detail-row">
              <strong>Location:</strong>
              <span>${event.location}</span>
            </div>
            <div class="detail-row">
              <strong>Seats:</strong>
              <span>${booking.seatsBooked}</span>
            </div>
            <div class="detail-row">
              <strong>Total Amount:</strong>
              <span>$${totalPrice.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <strong>Payment Status:</strong>
              <span style="color: #10b981; font-weight: bold;">Paid</span>
            </div>
          </div>
          
          <p>We look forward to seeing you at the event!</p>
          <p>You will receive reminder emails 24 hours and 1 hour before the event.</p>
          
          <div class="footer">
            <p>Thank you for using EventFlow!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Confirmed - ${event.title}

Hello ${user.name},

Your payment has been successfully processed. Your booking is now confirmed!

Booking Details:
- Event: ${event.title}
- Date: ${formattedDate}
- Time: ${booking.slotTime}
- Location: ${event.location}
- Seats: ${booking.seatsBooked}
- Total Amount: $${totalPrice.toFixed(2)}
- Payment Status: Paid

We look forward to seeing you at the event!
You will receive reminder emails 24 hours and 1 hour before the event.

Thank you for using EventFlow!
  `;

  return await sendEmail(user.email, subject, html, text);
};

// Cancellation email
export const sendCancellationEmail = async (booking, user, event) => {
  const eventDate = new Date(booking.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalPrice = event.price * booking.seatsBooked;

  const subject = `Booking Cancelled - ${event.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cancelled-badge { background: #ef4444; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hello ${user.name},</p>
          <p>Your booking has been cancelled as requested.</p>
          
          <div class="cancelled-badge">🚫 Booking Cancelled</div>
          
          <div class="details">
            <h3>Cancelled Booking Details</h3>
            <div class="detail-row">
              <strong>Event:</strong>
              <span>${event.title}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${booking.slotTime}</span>
            </div>
            <div class="detail-row">
              <strong>Location:</strong>
              <span>${event.location}</span>
            </div>
            <div class="detail-row">
              <strong>Seats:</strong>
              <span>${booking.seatsBooked}</span>
            </div>
            <div class="detail-row">
              <strong>Amount:</strong>
              <span>$${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <p>If you paid for this booking, your refund will be processed according to our refund policy.</p>
          <p>We hope to see you at future events!</p>
          
          <div class="footer">
            <p>Thank you for using EventFlow!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Booking Cancelled - ${event.title}

Hello ${user.name},

Your booking has been cancelled as requested.

Cancelled Booking Details:
- Event: ${event.title}
- Date: ${formattedDate}
- Time: ${booking.slotTime}
- Location: ${event.location}
- Seats: ${booking.seatsBooked}
- Amount: $${totalPrice.toFixed(2)}

If you paid for this booking, your refund will be processed according to our refund policy.
We hope to see you at future events!

Thank you for using EventFlow!
  `;

  return await sendEmail(user.email, subject, html, text);
};

// Event reminder email (24 hours before)
export const send24HourReminderEmail = async (booking, user, event) => {
  const eventDate = new Date(booking.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Reminder: ${event.title} is Tomorrow!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-badge { background: #f59e0b; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Event Reminder</h1>
        </div>
        <div class="content">
          <p>Hello ${user.name},</p>
          <p>This is a friendly reminder that your event is <strong>tomorrow</strong>!</p>
          
          <div class="reminder-badge">📅 24 Hours Until Event</div>
          
          <div class="details">
            <h3>Event Details</h3>
            <div class="detail-row">
              <strong>Event:</strong>
              <span>${event.title}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${booking.slotTime}</span>
            </div>
            <div class="detail-row">
              <strong>Location:</strong>
              <span>${event.location}</span>
            </div>
            <div class="detail-row">
              <strong>Seats:</strong>
              <span>${booking.seatsBooked}</span>
            </div>
          </div>
          
          <p>We're excited to see you there! Don't forget to mark your calendar.</p>
          <p>You'll receive another reminder 1 hour before the event starts.</p>
          
          <div class="footer">
            <p>Thank you for using EventFlow!</p>
            <p>See you tomorrow!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reminder: ${event.title} is Tomorrow!

Hello ${user.name},

This is a friendly reminder that your event is tomorrow!

Event Details:
- Event: ${event.title}
- Date: ${formattedDate}
- Time: ${booking.slotTime}
- Location: ${event.location}
- Seats: ${booking.seatsBooked}

We're excited to see you there! Don't forget to mark your calendar.
You'll receive another reminder 1 hour before the event starts.

Thank you for using EventFlow!
See you tomorrow!
  `;

  return await sendEmail(user.email, subject, html, text);
};

// Event reminder email (1 hour before)
export const send1HourReminderEmail = async (booking, user, event) => {
  const eventDate = new Date(booking.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Final Reminder: ${event.title} Starts in 1 Hour!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-badge { background: #ef4444; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Final Reminder!</h1>
        </div>
        <div class="content">
          <p>Hello ${user.name},</p>
          <p>Your event starts in <strong>1 hour</strong>! Time to get ready!</p>
          
          <div class="reminder-badge">⏰ 1 Hour Until Event</div>
          
          <div class="details">
            <h3>Event Details</h3>
            <div class="detail-row">
              <strong>Event:</strong>
              <span>${event.title}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${booking.slotTime}</span>
            </div>
            <div class="detail-row">
              <strong>Location:</strong>
              <span>${event.location}</span>
            </div>
            <div class="detail-row">
              <strong>Seats:</strong>
              <span>${booking.seatsBooked}</span>
            </div>
          </div>
          
          <p><strong>Don't forget to bring your booking confirmation!</strong></p>
          <p>We can't wait to see you there!</p>
          
          <div class="footer">
            <p>Thank you for using EventFlow!</p>
            <p>See you soon!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Final Reminder: ${event.title} Starts in 1 Hour!

Hello ${user.name},

Your event starts in 1 hour! Time to get ready!

Event Details:
- Event: ${event.title}
- Date: ${formattedDate}
- Time: ${booking.slotTime}
- Location: ${event.location}
- Seats: ${booking.seatsBooked}

Don't forget to bring your booking confirmation!
We can't wait to see you there!

Thank you for using EventFlow!
See you soon!
  `;

  return await sendEmail(user.email, subject, html, text);
};

export default { sendEmail, sendPaymentConfirmationEmail, sendCancellationEmail, send24HourReminderEmail, send1HourReminderEmail };

