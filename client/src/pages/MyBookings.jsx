import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axios.util";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/bookings/my-bookings");
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await API.patch(`/api/bookings/${bookingId}/cancel`);
      if (response.data.success) {
        toast.success("Booking cancelled successfully");
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handlePayment = (bookingId) => {
    if (bookings.find(b => b._id === bookingId)?.paymentStatus === "paid") {
      toast.info("This booking is already paid");
      return;
    }
    navigate(`/bookings/${bookingId}/payment`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-lg">No bookings found</p>
            <button
              onClick={() => navigate("/events")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.event?.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.event?.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                            booking.bookingStatus
                          )}`}
                        >
                          {booking.bookingStatus}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentBadge(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-700">Date</p>
                        <p>{formatDate(booking.eventDate)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Time</p>
                        <p>{booking.slotTime}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Seats</p>
                        <p>{booking.seatsBooked}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Total</p>
                        <p className="text-blue-600 font-semibold">
                          ${(booking.event?.price * booking.seatsBooked || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Location:</span> {booking.event?.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:w-auto">
                    {booking.bookingStatus === "pending" && booking.paymentStatus === "pending" && (
                      <button
                        onClick={() => handlePayment(booking._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Pay Now
                      </button>
                    )}
                    {booking.bookingStatus !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition text-sm font-medium"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

