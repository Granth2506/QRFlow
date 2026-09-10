import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import CreateEvent from "./Pages/CreateEvent";
import EventDetails from "./Pages/EventDetails";
import Registration from "./Pages/Registration";
import Payment from "./Pages/Payment";
import Ticket from "./Pages/Ticket";
import Scanner from "./Pages/Scanner";
import Analytics from "./Pages/Analytics";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Event Management */}
        <Route
          path="/create-event"
          element={<CreateEvent />}
        />

        <Route
          path="/event/:id"
          element={<EventDetails />}
        />

        {/* Registration */}
        <Route
          path="/event/:id/register"
          element={<Registration />}
        />

        {/* Payment */}
        <Route
          path="/payment/:id"
          element={<Payment />}
        />

        {/* Digital Ticket */}
        <Route
          path="/ticket/:ticketCode"
          element={<Ticket />}
        />

        {/* QR Scanner */}
        <Route
          path="/scanner"
          element={<Scanner />}
        />

        {/* Event Analytics */}
        <Route
          path="/event/:id/analytics"
          element={<Analytics />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#080b14",
                color: "white",
                flexDirection: "column",
                gap: "15px"
              }}
            >
              <h1>404</h1>

              <p>
                Page not found.
              </p>

              <button
                className="primary-btn"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                ← Go Home
              </button>
            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;