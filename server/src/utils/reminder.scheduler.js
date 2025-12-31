import cron from "node-cron";
import Booking from "../models/booking.model.js";
import { send24HourReminderEmail, send1HourReminderEmail } from "./email.service.js";


const getEventDateTime = (eventDate, slotTime) => {
  
  const [time, period] = slotTime.split(" ");
  let [hours, minutes] = time.split(":");
  
  hours = parseInt(hours);
  minutes = parseInt(minutes || 0);

  if (period) {
    if (period.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }
  }

  const eventDateTime = new Date(eventDate);
  eventDateTime.setHours(hours, minutes, 0, 0);

  return eventDateTime;
};

// Send 24-hour reminders
const send24HourReminders = async () => {
  try {
    console.log("Checking for 24-hour reminders...");
    
    const now = new Date();
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

    const bookings = await Booking.find({
      bookingStatus: "confirmed",
      reminder24hSent: false,
    })
      .populate("user", "name email")
      .populate("event", "title location");

    let sentCount = 0;

    for (const booking of bookings) {
      const eventDateTime = getEventDateTime(booking.eventDate, booking.slotTime);
      
      if (eventDateTime >= in23Hours && eventDateTime <= in25Hours) {
        try {
          await send24HourReminderEmail(booking, booking.user, booking.event);
          
          booking.reminder24hSent = true;
          await booking.save();
          
          sentCount++;
          console.log(`24h reminder sent for booking ${booking._id}`);
        } catch (error) {
          console.error(`Failed to send 24h reminder for booking ${booking._id}:`, error);
        }
      }
    }

    console.log(`24-hour reminders: ${sentCount} sent`);
  } catch (error) {
    console.error("Error sending 24-hour reminders:", error);
  }
};

// Send 1-hour reminders
const send1HourReminders = async () => {
  try {
    console.log("Checking for 1-hour reminders...");
    
    const now = new Date();
    const in45Minutes = new Date(now.getTime() + 45 * 60 * 1000); // 45 minutes from now
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    const bookings = await Booking.find({
      bookingStatus: "confirmed",
      reminder1hSent: false,
    })
      .populate("user", "name email")
      .populate("event", "title location");

    let sentCount = 0;

    for (const booking of bookings) {
      const eventDateTime = getEventDateTime(booking.eventDate, booking.slotTime);
      
      if (eventDateTime >= in45Minutes && eventDateTime <= in2Hours) {
        try {
          await send1HourReminderEmail(booking, booking.user, booking.event);
          
          booking.reminder1hSent = true;
          await booking.save();
          
          sentCount++;
          console.log(`1h reminder sent for booking ${booking._id}`);
        } catch (error) {
          console.error(`Failed to send 1h reminder for booking ${booking._id}:`, error);
        }
      }
    }

    console.log(`1-hour reminders: ${sentCount} sent`);
  } catch (error) {
    console.error("Error sending 1-hour reminders:", error);
  }
};

// Initialize cron jobs
export const initializeReminderScheduler = () => {
  cron.schedule("*/15 * * * *", () => {
    console.log("Running reminder scheduler...");
    send24HourReminders();
    send1HourReminders();
  });

  console.log("✅ Reminder scheduler initialized (runs every 15 minutes)");
};

export default { initializeReminderScheduler, send24HourReminders, send1HourReminders };

