import "../App.css";
import "./Analytics.css";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function Analytics() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const eventsResponse = await fetch(
          "http://127.0.0.1:5000/api/events"
        );
        const eventsData = await eventsResponse.json();

        const selectedEvent = eventsData.find(
          (item) => item.id === Number(id)
        );

        setEvent(selectedEvent);

        const registrationsResponse = await fetch(
          `http://127.0.0.1:5000/api/events/${id}/registrations`
        );

        const registrationsData = await registrationsResponse.json();
        setRegistrations(registrationsData);

        const ticketsResponse = await fetch(
          `http://127.0.0.1:5000/api/events/${id}/tickets`
        );

        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [id]);

  if (loading) {
    return <h2 className="analytics-loading">Loading analytics...</h2>;
  }

  if (!event) {
    return <h2 className="analytics-loading">Event not found.</h2>;
  }

  const totalRegistrations = registrations.length;
  const totalTickets = tickets.length;

  const scannedTickets = tickets.filter(
    (ticket) => ticket.status === "scanned"
  ).length;

  const validTickets = tickets.filter(
    (ticket) => ticket.status === "valid"
  ).length;

  const capacity = Number(event.capacity) || 0;

  const registrationPercentage =
    capacity > 0
      ? Math.round((totalRegistrations / capacity) * 100)
      : 0;

  const attendancePercentage =
    totalTickets > 0
      ? Math.round((scannedTickets / totalTickets) * 100)
      : 0;

  return (
    <div className="analytics-page">

      <div className="analytics-header">
        <div>
          <h1>📊 Event Analytics</h1>
          <p>{event.name}</p>
        </div>

        <Link to={`/event/${event.id}`} className="back-button">
          ← Back to Event
        </Link>
      </div>

      <div className="analytics-cards">

        <div className="analytics-card">
          <span className="analytics-icon">👥</span>
          <h3>Total Registrations</h3>
          <strong>{totalRegistrations}</strong>
        </div>

        <div className="analytics-card">
          <span className="analytics-icon">🎟️</span>
          <h3>Total Tickets</h3>
          <strong>{totalTickets}</strong>
        </div>

        <div className="analytics-card">
          <span className="analytics-icon">✅</span>
          <h3>Tickets Scanned</h3>
          <strong>{scannedTickets}</strong>
        </div>

        <div className="analytics-card">
          <span className="analytics-icon">⏳</span>
          <h3>Not Scanned</h3>
          <strong>{validTickets}</strong>
        </div>

      </div>

      <div className="analytics-section">

        <h2>Registration Overview</h2>

        <div className="progress-container">

          <div className="progress-info">
            <span>Event Capacity</span>
            <strong>
              {totalRegistrations} / {capacity}
            </strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(registrationPercentage, 100)}%`,
              }}
            ></div>
          </div>

          <p>{registrationPercentage}% capacity filled</p>

        </div>

      </div>

      <div className="analytics-section">

        <h2>Attendance Overview</h2>

        <div className="attendance-box">

          <div>
            <span>Tickets Issued</span>
            <strong>{totalTickets}</strong>
          </div>

          <div>
            <span>Entry Scanned</span>
            <strong>{scannedTickets}</strong>
          </div>

          <div>
            <span>Attendance Rate</span>
            <strong>{attendancePercentage}%</strong>
          </div>

        </div>

      </div>

      <div className="analytics-section">

        <h2>Event Information</h2>

        <div className="event-info">

          <p>
            <strong>📅 Date:</strong> {event.event_date}
          </p>

          <p>
            <strong>⏰ Time:</strong> {event.event_time}
          </p>

          <p>
            <strong>📍 Location:</strong> {event.location}
          </p>

          <p>
            <strong>👥 Capacity:</strong> {event.capacity}
          </p>

        </div>

      </div>

    </div>
  );
}

export default Analytics;