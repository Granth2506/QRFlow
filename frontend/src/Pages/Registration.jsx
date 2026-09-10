import "../App.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Registration() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // ================= FETCH EVENT =================

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/events"
        );

        const data = await response.json();

        if (response.ok) {
          const selectedEvent = data.find(
            (item) => item.id === Number(id)
          );

          setEvent(selectedEvent);
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Backend connection error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= REGISTER =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/registrations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event_id: Number(id),
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Registration failed");
        setSubmitting(false);
        return;
      }

      // ================= FREE EVENT =================

      if (!data.payment_required) {
        if (data.ticket && data.ticket.ticket_code) {
          window.location.href =
            `/ticket/${data.ticket.ticket_code}`;
        } else {
          alert(
            "Registration successful, but ticket was not generated."
          );
          setSubmitting(false);
        }

        return;
      }

      // ================= PAID EVENT =================

      sessionStorage.setItem(
        "qrflow_pending_payment",
        JSON.stringify({
          registration_id: data.registration.id,
          amount: data.amount,
          event_name: event.name,
          name: formData.name,
          email: formData.email
        })
      );

      window.location.href =
        `/payment/${data.registration.id}`;

    } catch (error) {
      console.error(error);

      alert(
        "Backend is not connected. Please make sure Flask is running."
      );

      setSubmitting(false);
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="page">
        <main className="create-event-container">
          <h1>Loading event...</h1>
        </main>
      </div>
    );
  }

  // ================= EVENT NOT FOUND =================

  if (!event) {
    return (
      <div className="page">
        <main className="create-event-container">

          <h1>Event Not Found</h1>

          <p>
            The event you are trying to register for
            does not exist.
          </p>

          <button
            className="primary-btn"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            ← Back to Dashboard
          </button>

        </main>
      </div>
    );
  }

  // ================= EVENT PRICE =================

  const eventPrice = Number(event.price || 0);

  // ================= PAGE =================

  return (
    <div className="page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">

          <span className="qr-icon">
            ▦
          </span>

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

      {/* ================= REGISTRATION ================= */}

      <main className="create-event-container">

        <div className="create-event-header">

          <p className="page-label">
            EVENT REGISTRATION
          </p>

          <h1>
            Register for {event.name}
          </h1>

          <p>
            Enter your details below to register
            for this event.
          </p>

        </div>

        {/* ================= FORM CARD ================= */}

        <div className="event-form-card">

          <h2>
            {event.name}
          </h2>

          <p className="form-subtitle">

            📅 {event.event_date}

            &nbsp; | &nbsp;

            🕐 {event.event_time}

            &nbsp; | &nbsp;

            📍 {event.location}

          </p>

          {/* ================= PRICE ================= */}

          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              borderRadius: "10px",
              background: "#111525",
              border: "1px solid #343b50"
            }}
          >

            <strong>
              Event Price:{" "}
            </strong>

            {eventPrice === 0 ? (
              <span style={{ color: "#4ade80" }}>
                FREE
              </span>
            ) : (
              <span>
                ₹{eventPrice.toFixed(2)}
              </span>
            )}

          </div>

          {/* ================= FORM ================= */}

          <form onSubmit={handleSubmit}>

            {/* Full Name */}

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>

            {/* Email */}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

            {/* Phone */}

            <div className="form-group">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

            </div>

            {/* ================= BUTTONS ================= */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                disabled={submitting}
                onClick={() => {
                  window.location.href =
                    `/event/${event.id}`;
                }}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Processing..."
                  : eventPrice > 0
                  ? "Continue to Payment →"
                  : "Register Now →"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default Registration;