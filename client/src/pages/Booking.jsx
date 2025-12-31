import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import API from "../utils/axios.util";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const Booking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (location.state) {
      setEvent(location.state.event);
      setSelectedDate(location.state.selectedDate);
      setSelectedSlot(location.state.selectedSlot);
      setSeats(location.state.seats || 1);
    } else {
      fetchEvent();
    }
  }, [id, isAuthenticated, location.state, navigate]);

  const fetchEvent = async () => {
    try {
      const response = await API.get(`/api/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.event);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load event");
      navigate("/events");
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedDate || !selectedSlot || !seats) {
      toast.error("Please complete all booking details");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/api/bookings", {
        eventId: id,
        eventDate: selectedDate,
        slotTime: selectedSlot,
        seatsBooked: seats,
      });

      if (response.data.success) {
        toast.success("Booking created successfully!");
        navigate(`/bookings/${response.data.booking._id}/payment`);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create booking";
      toast.error(message);
    } finally {
      setLoading(false);
    }
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalPrice = event.price * seats;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Confirm Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select date</option>
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

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select time</option>
                      {event.dates
                        ?.find((d) => new Date(d.date).toISOString().split("T")[0] === selectedDate)
                        ?.slots?.map((slot, idx) => (
                          <option key={idx} value={slot.time}>
                            {slot.time} ({slot.availableSeats} seats available)
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {selectedSlot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Seats
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={seats}
                        onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                      />
                      <button
                        onClick={() => {
                          const maxSeats = event.dates
                            ?.find((d) => new Date(d.date).toISOString().split("T")[0] === selectedDate)
                            ?.slots?.find((s) => s.time === selectedSlot)?.availableSeats || 1;
                          setSeats(Math.min(maxSeats, seats + 1));
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Price Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Price per ticket</span>
                  <span>${event.price}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Number of seats</span>
                  <span>{seats}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCreateBooking}
                disabled={loading || !selectedDate || !selectedSlot}
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Booking..." : "Confirm & Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

