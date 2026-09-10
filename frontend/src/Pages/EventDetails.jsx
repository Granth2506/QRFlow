import "../App.css";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function EventDetails() {

  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH EVENT =================

  useEffect(() => {

    const fetchEvent = async () => {

      try {

        const response = await fetch(
          "https://qrflow-gkjt.onrender.com/api/events"
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

        console.error(
          "Backend connection error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    fetchEvent();

  }, [id]);


  // ================= LOADING =================

  if (loading) {

    return (
      <div className="page">

        <main className="create-event-container">

          <h1>
            Loading event...
          </h1>

        </main>

      </div>
    );

  }


  // ================= EVENT NOT FOUND =================

  if (!event) {

    return (
      <div className="page">

        <main className="create-event-container">

          <h1>
            Event Not Found
          </h1>

          <p>
            The event you are looking for does not exist.
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


  // ================= EVENT DETAILS PAGE =================

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

          <button className="get-started-btn">
            Logout
          </button>

        </div>

      </nav>


      {/* ================= EVENT DETAILS ================= */}

      <main className="create-event-container">

        <div className="create-event-header">

          <p className="page-label">
            EVENT DETAILS
          </p>

          <h1>
            {event.name}
          </h1>

          <p>
            View event information and register for this event.
          </p>

        </div>


        {/* ================= EVENT CARD ================= */}

        <div className="event-form-card">

          <h2>
            {event.name}
          </h2>

          <p className="form-subtitle">
            {event.description || "No description provided."}
          </p>


          {/* ================= EVENT INFORMATION ================= */}

          <div className="event-details-grid">

            {/* Date */}

            <div className="detail-item">

              <span className="detail-icon">
                📅
              </span>

              <div>

                <small>
                  Event Date
                </small>

                <strong>
                  {event.event_date}
                </strong>

              </div>

            </div>


            {/* Time */}

            <div className="detail-item">

              <span className="detail-icon">
                🕐
              </span>

              <div>

                <small>
                  Event Time
                </small>

                <strong>
                  {event.event_time}
                </strong>

              </div>

            </div>


            {/* Location */}

            <div className="detail-item">

              <span className="detail-icon">
                📍
              </span>

              <div>

                <small>
                  Location
                </small>

                <strong>
                  {event.location}
                </strong>

              </div>

            </div>


            {/* Capacity */}

            <div className="detail-item">

              <span className="detail-icon">
                👥
              </span>

              <div>

                <small>
                  Maximum Capacity
                </small>

                <strong>
                  {event.capacity}
                </strong>

              </div>

            </div>

          </div>


          {/* ================= BUTTONS ================= */}

          <div className="form-actions">

            {/* Back Button */}

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              ← Back
            </button>


            {/* Analytics Button */}

            <Link
              to={`/event/${event.id}/analytics`}
              className="secondary-btn"
              style={{
                border: "1px solid #343b50",
                borderRadius: "8px",
                padding: "12px 22px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              📊 Analytics
            </Link>


            {/* Register Button */}

            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                window.location.href =
                  `/event/${event.id}/register`;
              }}
            >
              Register for Event →
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default EventDetails;