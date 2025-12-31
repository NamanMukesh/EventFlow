import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import API from "../utils/axios.util";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/events/${id}`);
      
      if (response.data.success) {
        setEvent(response.data.event);
        if (response.data.event.dates && response.data.event.dates.length > 0) {
          setSelectedDate(response.data.event.dates[0].date);
        }
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }

    if (!selectedDate || !selectedSlot) {
      toast.error("Please select date and time slot");
      return;
    }

    // Navigate to booking page
    navigate(`/events/${id}/book`, {
      state: {
        event,
        selectedDate,
        selectedSlot,
        seats,
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedDateData = event?.dates?.find(
    (d) => new Date(d.date).toISOString().split("T")[0] === selectedDate
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Event Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {event.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${event.price}</p>
              <p className="text-sm text-gray-500">per ticket</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Book Tickets</h2>

          {/* Date Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a date</option>
              {event.dates?.map((dateEntry, idx) => (
                <option
                  key={idx}
                  value={new Date(dateEntry.date).toISOString().split("T")[0]}
                >
                  {formatDate(dateEntry.date)}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Selection */}
          {selectedDateData && selectedDateData.slots && selectedDateData.slots.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time Slot
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedDateData.slots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`px-4 py-2 border rounded-md text-sm transition ${
                      selectedSlot === slot.time
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {slot.time}
                    <br />
                    <span className="text-xs opacity-75">
                      {slot.availableSeats} seats
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seats Selection */}
          {selectedSlot && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Seats
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={selectedDateData?.slots?.find(s => s.time === selectedSlot)?.availableSeats || 1}
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-1 border border-gray-300 rounded-md text-center"
                />
                <button
                  onClick={() => {
                    const maxSeats = selectedDateData?.slots?.find(s => s.time === selectedSlot)?.availableSeats || 1;
                    setSeats(Math.min(maxSeats, seats + 1));
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  +
                </button>
                <span className="text-sm text-gray-600">
                  Total: ${(event.price * seats).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedSlot}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticated ? "Proceed to Booking" : "Login to Book"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

