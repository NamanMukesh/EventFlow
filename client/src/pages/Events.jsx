import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import API from "../utils/axios.util";
import toast from "react-hot-toast";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const { user, logout } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (location) params.append("location", location);

      const response = await API.get(`/api/events?${params.toString()}`);
      
      if (response.data.success) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [category, location]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const categories = ["concert", "conference", "workshop", "sports", "other"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">EventFlow</h1>
            <div className="flex items-center gap-4">
              {user && <span className="text-gray-700">Hi, {user.name || user.email}</span>}
              <button
                onClick={logout}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {event.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <p>📍 {event.location}</p>
                  <p>💰 ${event.price}</p>
                  {event.dates && event.dates.length > 0 && (
                    <p>📅 {event.dates.length} date{event.dates.length > 1 ? "s" : ""}</p>
                  )}
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
