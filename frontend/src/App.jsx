import "./App.css";

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import CreateEvent from "./Pages/CreateEvent";
import EventDetails from "./Pages/EventDetails";
import Registration from "./Pages/Registration";
import Ticket from "./Pages/Ticket";
import Scanner from "./Pages/Scanner";
import Analytics from "./Pages/Analytics";


function Home() {
  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo">
          QR<span>Flow</span>
        </div>

        <div className="nav-actions">

          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/signup" className="get-started-btn">
            Get Started
          </Link>

        </div>

      </nav>


      {/* HERO */}
      <section className="hero">

        <div className="hero-content">

          <div className="badge">
            SMART EVENT MANAGEMENT
          </div>

          <h1>
            Smart Event Management
            <br />
            with <span>QRFlow</span>
          </h1>

          <p>
            Create events, register attendees, generate digital
            tickets and verify entry using QR codes.
          </p>

          <div className="hero-buttons">

            <Link to="/signup" className="primary-btn">
              Get Started
            </Link>

            <Link to="/login" className="secondary-btn">
              Login
            </Link>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section className="features">

        <div className="feature">

          <div className="feature-number">
            QR
          </div>

          <div className="feature-title">
            Digital Tickets
          </div>

          <div className="feature-description">
            Generate unique QR tickets
          </div>

        </div>


        <div className="feature">

          <div className="feature-number">
            01
          </div>

          <div className="feature-title">
            Fast Verification
          </div>

          <div className="feature-description">
            Scan and verify instantly
          </div>

        </div>


        <div className="feature">

          <div className="feature-number">
            ∞
          </div>

          <div className="feature-title">
            Event Analytics
          </div>

          <div className="feature-description">
            Track registrations and attendance
          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="how-section">

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            Simple. <span>Fast. Digital.</span>
          </h2>

          <p>
            QRFlow simplifies the complete event entry process,
            from registration to attendance tracking.
          </p>

        </div>


        <div className="steps">

          <div className="step-card">

            <div className="step-icon">
              📅
            </div>

            <div className="step-number">
              01
            </div>

            <h3>
              Create Event
            </h3>

            <p>
              Create your event with details such as date,
              time, location and capacity.
            </p>

          </div>


          <div className="step-card">

            <div className="step-icon">
              🎟️
            </div>

            <div className="step-number">
              02
            </div>

            <h3>
              Register & Get Ticket
            </h3>

            <p>
              Attendees register for the event and receive
              a unique digital QR ticket.
            </p>

          </div>


          <div className="step-card">

            <div className="step-icon">
              📷
            </div>

            <div className="step-number">
              03
            </div>

            <h3>
              Scan & Verify
            </h3>

            <p>
              Scan the QR code at the entrance and instantly
              verify whether the ticket is valid.
            </p>

          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="cta">

        <div className="cta-badge">
          READY TO GET STARTED?
        </div>

        <h2>
          Manage events with
          <span> QRFlow.</span>
        </h2>

        <p>
          Make event registration and entry verification
          simple, fast and completely digital.
        </p>

        <Link to="/signup" className="primary-btn">
          Create Your Event
        </Link>

      </section>


      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-logo">
          QR<span>Flow</span>
        </div>

        <p>
          Smart QR-based event ticketing and entry management.
        </p>

        <div className="footer-bottom">
          © 2026 QRFlow. All rights reserved.
        </div>

      </footer>

    </div>
  );
}


function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* CREATE EVENT */}
        <Route
          path="/create-event"
          element={<CreateEvent />}
        />

        {/* EVENT DETAILS */}
        <Route
          path="/event/:id"
          element={<EventDetails />}
        />

        {/* REGISTRATION */}
        <Route
          path="/event/:id/register"
          element={<Registration />}
        />

        {/* ANALYTICS */}
        <Route
          path="/event/:id/analytics"
          element={<Analytics />}
        />

        {/* TICKET */}
        <Route
          path="/ticket/:ticketCode"
          element={<Ticket />}
        />

        {/* SCANNER */}
        <Route
          path="/scanner"
          element={<Scanner />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;