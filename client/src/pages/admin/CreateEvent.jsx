import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/axios.util";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    price: "",
    dates: [{ date: "", slots: [{ time: "", availableSeats: "" }] }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (dateIndex, value) => {
    const newDates = [...formData.dates];
    newDates[dateIndex].date = value;
    setFormData({ ...formData, dates: newDates });
  };

  const handleSlotChange = (dateIndex, slotIndex, field, value) => {
    const newDates = [...formData.dates];
    newDates[dateIndex].slots[slotIndex][field] = value;
    setFormData({ ...formData, dates: newDates });
  };

  const addDate = () => {
    setFormData({
      ...formData,
      dates: [...formData.dates, { date: "", slots: [{ time: "", availableSeats: "" }] }],
    });
  };

  const addSlot = (dateIndex) => {
    const newDates = [...formData.dates];
    newDates[dateIndex].slots.push({ time: "", availableSeats: "" });
    setFormData({ ...formData, dates: newDates });
  };

  const removeDate = (dateIndex) => {
    const newDates = formData.dates.filter((_, idx) => idx !== dateIndex);
    setFormData({ ...formData, dates: newDates });
  };

  const removeSlot = (dateIndex, slotIndex) => {
    const newDates = [...formData.dates];
    newDates[dateIndex].slots = newDates[dateIndex].slots.filter((_, idx) => idx !== slotIndex);
    setFormData({ ...formData, dates: newDates });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        price: parseFloat(formData.price),
        dates: formData.dates.map((dateEntry) => ({
          date: new Date(dateEntry.date),
          slots: dateEntry.slots.map((slot) => ({
            time: slot.time,
            availableSeats: parseInt(slot.availableSeats),
          })),
        })),
      };

      const response = await API.post("/api/events", eventData);
      if (response.data.success) {
        toast.success("Event created successfully");
        navigate("/admin/events");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Concert", "Conference", "Workshop", "Sports", "Stand-Up", "Other"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Event</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dates and Slots */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">Dates & Time Slots</label>
              <button
                type="button"
                onClick={addDate}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                + Add Date
              </button>
            </div>

            {formData.dates.map((dateEntry, dateIndex) => (
              <div key={dateIndex} className="mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <input
                    type="date"
                    value={dateEntry.date}
                    onChange={(e) => handleDateChange(dateIndex, e.target.value)}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeDate(dateIndex)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Remove Date
                  </button>
                </div>

                <div className="space-y-2">
                  {dateEntry.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex gap-2">
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => handleSlotChange(dateIndex, slotIndex, "time", e.target.value)}
                        required
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Available seats"
                        value={slot.availableSeats}
                        onChange={(e) => handleSlotChange(dateIndex, slotIndex, "availableSeats", e.target.value)}
                        required
                        min="1"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(dateIndex, slotIndex)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(dateIndex)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    + Add Time Slot
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

