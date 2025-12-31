import Event from "../models/event.model.js";

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { category, location } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = location;
    }

    const events = await Event.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res
    .status(200)
    .json({success: true, events, count: events.length, message: "Events fetched successfully"})
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Get single event
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate("createdBy", "name email");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    return res
    .status(200)
    .json({success: true, event, message: "Event fetched successfully"})

  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Create event (Admin only)
const createEvent = async (req, res) => {
  try {
    const { title, description, category, location, price, dates } = req.body;

    if (!title?.trim() || !description?.trim() || !category?.trim() || !location?.trim() || !price|| !dates) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!Array.isArray(dates) || dates.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one date with slots is required" });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      price: price,
      dates,
      createdBy: req.user._id
    });

    const populatedEvent = await Event.findById(event._id).populate(
      "createdBy",
      "name email"
    );

    return res
    .status(201)
    .json({success: true, event: populatedEvent, message: "Event created successfully"})
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Update event (Admin only)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, price, dates } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (location) event.location = location;
    if (price) event.price = price;
    if (dates) event.dates = dates;

    await event.save();

    const updatedEvent = await Event.findById(id).populate(
      "createdBy",
      "name email"
    );

    return res
    .status(200)
    .json({success: true, event: updatedEvent, message: "Event updated successfully"})
    
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Delete event (Admin only)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    await Event.findByIdAndDelete(id);

    return res
    .status(200)
    .json({success: true, message: "Event deleted successfully"})
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Check availability
const checkAvailability = async (req, res) => {
  try {
    const { eventId, date, slotTime } = req.query;

    if (!eventId || !date || !slotTime) {
      return res
        .status(400)
        .json({ success: false, message: "Event ID, date, and slot time are required" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const eventDate = new Date(date);
    const dateEntry = event.dates.find(
      (d) => d.date.toISOString().split("T")[0] === eventDate.toISOString().split("T")[0]
    );

    if (!dateEntry) {
      return res
      .status(200)
      .json({success: true, available: false, availableSeats: 0, message: "Date not found for this event"})
    }

    const slot = dateEntry.slots.find((s) => s.time === slotTime);

    if (!slot) {
      return res
      .status(200)
      .json({success: true, available: false, availableSeats: 0, message: "Time slot not found"})
    }

    return res
    .status(200)
    .json({success: true, available: slot.availableSeats > 0, availableSeats: slot.availableSeats})
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

export { 
    getAllEvents, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    checkAvailability 
};