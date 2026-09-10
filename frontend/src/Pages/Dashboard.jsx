import "../Dashboard.css";
import { useEffect, useState } from "react";

function Dashboard() {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // REAL DASHBOARD STATISTICS
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [ticketsScanned, setTicketsScanned] = useState(0);


  // ================= FETCH EVENTS + STATISTICS =================

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        // Fetch all events
        const eventsResponse = await fetch(
          "https://qrflow-gkjt.onrender.com/api/events"
        );

        const eventsData = await eventsResponse.json();

        if (!eventsResponse.ok) {
          console.error("Failed to fetch events");
          return;
        }

        setEvents(eventsData);


        // If there are no events
        if (eventsData.length === 0) {

          setTotalTickets(0);
          setTotalRegistrations(0);
          setTicketsScanned(0);

          return;
        }


        // Fetch registrations and tickets for every event
        const eventData = await Promise.all(

          eventsData.map(async (event) => {

            try {

              const registrationsResponse = await fetch(
                `https://qrflow-gkjt.onrender.com/api/events/${event.id}/registrations`
              );

              const ticketsResponse = await fetch(
                `https://qrflow-gkjt.onrender.com/api/events/${event.id}/tickets`
              );


              const registrations =
                await registrationsResponse.json();

              const tickets =
                await ticketsResponse.json();


              return {
                registrations: Array.isArray(registrations)
                  ? registrations.length
                  : 0,

                tickets: Array.isArray(tickets)
                  ? tickets.length
                  : 0,

                scanned: Array.isArray(tickets)
                  ? tickets.filter(
                      (ticket) =>
                        ticket.status === "scanned"
                    ).length
                  : 0
              };

            } catch (error) {

              console.error(
                `Error loading event ${event.id}:`,
                error
              );

              return {
                registrations: 0,
                tickets: 0,
                scanned: 0
              };

            }

          })

        );


        // Calculate totals
        const registrationsTotal =
          eventData.reduce(
            (total, item) =>
              total + item.registrations,
            0
          );


        const ticketsTotal =
          eventData.reduce(
            (total, item) =>
              total + item.tickets,
            0
          );


        const scannedTotal =
          eventData.reduce(
            (total, item) =>
              total + item.scanned,
            0
          );


        // Update dashboard
        setTotalRegistrations(
          registrationsTotal
        );

        setTotalTickets(
          ticketsTotal
        );

        setTicketsScanned(
          scannedTotal
        );


      } catch (error) {

        console.error(
          "Dashboard backend connection error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    fetchDashboardData();

  }, []);


  // ================= PAGE =================

  return (

    <div className="dashboard-page">


      {/* ================= NAVBAR ================= */}

      <nav className="dashboard-navbar">

        <div className="logo">

          <span className="qr-icon">
            ▦
          </span>

          QR<span>Flow</span>

        </div>


        <div className="dashboard-nav-links">

          <a href="/">
            Home
          </a>


          <a href="/dashboard">
            Dashboard
          </a>


          {/* SCANNER */}

          <button
            className="create-event-btn"
            onClick={() => {
              window.location.href =
                "/scanner";
            }}
          >
            📷 Scan Ticket
          </button>


          {/* CREATE EVENT */}

          <button
            className="create-event-btn"
            onClick={() => {
              window.location.href =
                "/create-event";
            }}
          >
            + Create Event
          </button>

        </div>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="dashboard-container">


        {/* ================= HEADER ================= */}

        <div className="dashboard-header">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Manage your events, tickets and registrations.
            </p>

          </div>

        </div>


        {/* ================= QUICK ACTIONS ================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "35px"
          }}
        >

          {/* SCANNER CARD */}

          <div
            className="dashboard-card"
            style={{
              cursor: "pointer"
            }}
            onClick={() => {
              window.location.href =
                "/scanner";
            }}
          >

            <span className="card-icon">
              📷
            </span>

            <p>
              Entry Management
            </p>

            <h2
              style={{
                fontSize: "20px"
              }}
            >
              Scan QR Tickets
            </h2>

          </div>


          {/* CREATE EVENT CARD */}

          <div
            className="dashboard-card"
            style={{
              cursor: "pointer"
            }}
            onClick={() => {
              window.location.href =
                "/create-event";
            }}
          >

            <span className="card-icon">
              📅
            </span>

            <p>
              Event Management
            </p>

            <h2
              style={{
                fontSize: "20px"
              }}
            >
              Create New Event
            </h2>

          </div>

        </div>


        {/* ================= STATISTICS ================= */}

        <div className="dashboard-stats">


          {/* TOTAL TICKETS */}

          <div className="dashboard-card">

            <span className="card-icon">
              🎟️
            </span>

            <p>
              Total Tickets
            </p>

            <h2>
              {totalTickets}
            </h2>

          </div>


          {/* TOTAL EVENTS */}

          <div className="dashboard-card">

            <span className="card-icon">
              📅
            </span>

            <p>
              Total Events
            </p>

            <h2>
              {events.length}
            </h2>

          </div>


          {/* REGISTRATIONS */}

          <div className="dashboard-card">

            <span className="card-icon">
              👥
            </span>

            <p>
              Registrations
            </p>

            <h2>
              {totalRegistrations}
            </h2>

          </div>


          {/* SCANNED */}

          <div className="dashboard-card">

            <span className="card-icon">
              ✓
            </span>

            <p>
              Tickets Scanned
            </p>

            <h2>
              {ticketsScanned}
            </h2>

          </div>

        </div>


        {/* ================= EVENTS ================= */}

        <section className="events-section">


          <div className="section-heading">

            <div>

              <h2>
                Your Events
              </h2>

              <p>
                Manage your created events.
              </p>

            </div>


            <button
              className="create-event-btn"
              onClick={() => {
                window.location.href =
                  "/create-event";
              }}
            >
              + Create Event
            </button>

          </div>


          {/* ================= LOADING ================= */}

          {loading && (

            <div className="empty-events">

              <div className="empty-icon">
                ⏳
              </div>

              <h3>
                Loading events...
              </h3>

              <p>
                Please wait while we fetch your events.
              </p>

            </div>

          )}


          {/* ================= NO EVENTS ================= */}

          {!loading &&
            events.length === 0 && (

              <div className="empty-events">

                <div className="empty-icon">
                  📅
                </div>

                <h3>
                  No events yet
                </h3>

                <p>
                  Create your first event to start
                  managing registrations and QR tickets.
                </p>


                <button
                  className="primary-btn"
                  onClick={() => {
                    window.location.href =
                      "/create-event";
                  }}
                >
                  Create Your First Event →
                </button>

              </div>

            )}


          {/* ================= EVENTS LIST ================= */}

          {!loading &&
            events.length > 0 && (

              <div className="events-list">

                {events.map((event) => (

                  <div
                    className="event-card"
                    key={event.id}
                  >

                    <div className="event-card-left">

                      <div className="event-icon">
                        📅
                      </div>


                      <div>

                        <h3>
                          {event.name}
                        </h3>

                        <p>
                          {event.description ||
                            "No description provided."}
                        </p>

                      </div>

                    </div>


                    <div className="event-card-details">

                      <span>
                        📅 {event.event_date}
                      </span>

                      <span>
                        🕐 {event.event_time}
                      </span>

                      <span>
                        📍 {event.location}
                      </span>

                      <span>
                        👥 Capacity: {event.capacity}
                      </span>

                    </div>


                    <button
                      className="event-view-btn"
                      onClick={() => {
                        window.location.href =
                          `/event/${event.id}`;
                      }}
                    >
                      View Event →
                    </button>

                  </div>

                ))}

              </div>

            )}

        </section>

      </main>

    </div>

  );

}

export default Dashboard;