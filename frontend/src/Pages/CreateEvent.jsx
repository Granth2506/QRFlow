import "../App.css";
import { useState } from "react";

function CreateEvent() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    capacity: "",
    price: "0"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (Number(formData.capacity) < 1) {
      alert("Capacity must be at least 1.");
      return;
    }

    if (Number(formData.price) < 0) {
      alert("Price cannot be negative.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...formData,
            capacity: Number(formData.capacity),
            price: Number(formData.price)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create event");
        return;
      }

      alert("Event created successfully! 🎉");

      window.location.href = "/dashboard";

    } catch (error) {
      console.error(error);

      alert(
        "Backend is not connected. Please make sure Flask is running."
      );
    }
  };

  return (
    <div className="page">

      {/* Navbar */}
      <nav className="navbar">

        <div className="logo">
          <span className="qr-icon">▦</span>
          QR<span>Flow</span>
        </div>

        <div className="nav-actions">

          <a
            href="/dashboard"
            className="login-btn"
          >
            Dashboard
          </a>

          <button
            className="get-started-btn"
            onClick={() => {
              localStorage.removeItem("qrflow_user");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* Create Event */}
      <main className="create-event-container">

        <div className="create-event-header">

          <p className="page-label">
            EVENT MANAGEMENT
          </p>

          <h1>
            Create Your Event
          </h1>

          <p>
            Set up your event and start managing registrations
            and QR tickets.
          </p>

        </div>


        <form
          className="event-form-card"
          onSubmit={handleSubmit}
        >

          <h2>
            Event Details
          </h2>

          <p className="form-subtitle">
            Enter the basic information about your event.
          </p>


          {/* Event Name */}
          <div className="form-group">

            <label>
              Event Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="e.g. Tech Fest 2026"
              value={formData.name}
              onChange={handleChange}
              required
            />

          </div>


          {/* Description */}
          <div className="form-group">

            <label>
              Event Description
            </label>

            <textarea
              name="description"
              placeholder="Describe your event..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />

          </div>


          {/* Date + Time */}
          <div className="form-row">

            <div className="form-group">

              <label>
                Event Date
              </label>

              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Event Time
              </label>

              <input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* Location */}
          <div className="form-group">

            <label>
              Location
            </label>

            <input
              type="text"
              name="location"
              placeholder="e.g. AKGEC Auditorium"
              value={formData.location}
              onChange={handleChange}
              required
            />

          </div>


          {/* Capacity */}
          <div className="form-group">

            <label>
              Maximum Capacity
            </label>

            <input
              type="number"
              name="capacity"
              placeholder="e.g. 500"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
            />

          </div>


          {/* Event Price */}
          <div className="form-group">

            <label>
              Event Price (₹)
            </label>

            <input
              type="number"
              name="price"
              placeholder="Enter 0 for a free event"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />

            <small style={{
              color: "#8b93a7",
              display: "block",
              marginTop: "6px"
            }}>
              ₹0 = Free event • Paid events will use demo payment
            </small>

          </div>


          {/* Buttons */}
          <div className="form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
            >
              Create Event →
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CreateEvent;