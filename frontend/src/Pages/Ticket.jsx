import "../App.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";

function Ticket() {

  const { ticketCode } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrImage, setQrImage] = useState("");


  // ============================================================
  // FETCH TICKET
  // ============================================================

  useEffect(() => {

    const fetchTicket = async () => {

      try {

        const response = await fetch(
          `http://127.0.0.1:5000/api/tickets/${ticketCode}`
        );

        const data = await response.json();


        if (response.ok) {

          setTicket(data);

        } else {

          console.error(
            "Failed to fetch ticket:",
            data
          );

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


    fetchTicket();

  }, [ticketCode]);


  // ============================================================
  // GENERATE QR CODE
  // ============================================================

  useEffect(() => {

    const generateQRCode = async () => {

      if (!ticket) {
        return;
      }


      try {

        const qrData = JSON.stringify({

          ticket_code: ticket.ticket_code,

          event_id: ticket.event_id,

          registration_id: ticket.registration_id

        });


        const imageData = await QRCode.toDataURL(
          qrData,
          {
            width: 220,
            margin: 2,
            errorCorrectionLevel: "H"
          }
        );


        setQrImage(imageData);


      } catch (error) {

        console.error(
          "QR generation error:",
          error
        );

      }

    };


    generateQRCode();

  }, [ticket]);


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="page">

        <main className="create-event-container">

          <h1>
            Loading ticket...
          </h1>

        </main>

      </div>

    );

  }


  // ============================================================
  // TICKET NOT FOUND
  // ============================================================

  if (!ticket) {

    return (

      <div className="page">

        <main className="create-event-container">

          <h1>
            Ticket Not Found
          </h1>

          <p>
            This ticket could not be found.
          </p>


          <button
            className="primary-btn"
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
          >
            ← Back to Dashboard
          </button>

        </main>

      </div>

    );

  }


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div className="page">


      {/* ========================================================
          NAVBAR
      ========================================================= */}

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


      {/* ========================================================
          MAIN
      ========================================================= */}

      <main className="create-event-container">


        <div className="create-event-header">

          <p className="page-label">
            DIGITAL TICKET
          </p>


          <h1>
            Your Ticket is Ready 🎉
          </h1>


          <p>
            Show this QR code at the event entrance.
          </p>

        </div>


        {/* ======================================================
            TICKET CARD
        ======================================================= */}

        <div className="event-form-card">


          {/* EVENT TITLE */}

          <div
            style={{
              textAlign: "center",
              marginBottom: "30px"
            }}
          >

            <div
              style={{
                fontSize: "55px",
                marginBottom: "15px"
              }}
            >
              🎟️
            </div>


            <h2>
              {ticket.event_name}
            </h2>


            <p className="form-subtitle">
              Event Ticket
            </p>

          </div>


          {/* ====================================================
              EVENT DETAILS
          ===================================================== */}

          <div className="event-details-grid">


            {/* TICKET CODE */}

            <div className="detail-item">

              <span className="detail-icon">
                🎫
              </span>

              <div>

                <small>
                  Ticket Code
                </small>

                <strong>
                  {ticket.ticket_code}
                </strong>

              </div>

            </div>


            {/* ATTENDEE */}

            <div className="detail-item">

              <span className="detail-icon">
                👤
              </span>

              <div>

                <small>
                  Attendee
                </small>

                <strong>
                  {ticket.name}
                </strong>

              </div>

            </div>


            {/* DATE */}

            <div className="detail-item">

              <span className="detail-icon">
                📅
              </span>

              <div>

                <small>
                  Event Date
                </small>

                <strong>
                  {ticket.event_date}
                </strong>

              </div>

            </div>


            {/* TIME */}

            <div className="detail-item">

              <span className="detail-icon">
                🕐
              </span>

              <div>

                <small>
                  Event Time
                </small>

                <strong>
                  {ticket.event_time}
                </strong>

              </div>

            </div>


            {/* LOCATION */}

            <div className="detail-item">

              <span className="detail-icon">
                📍
              </span>

              <div>

                <small>
                  Location
                </small>

                <strong>
                  {ticket.location}
                </strong>

              </div>

            </div>


            {/* STATUS */}

            <div className="detail-item">

              <span className="detail-icon">
                ✓
              </span>

              <div>

                <small>
                  Ticket Status
                </small>

                <strong>
                  {ticket.status}
                </strong>

              </div>

            </div>


          </div>


          {/* ====================================================
              REAL QR CODE
          ===================================================== */}

          <div
            style={{
              textAlign: "center",
              marginTop: "35px",
              padding: "30px",
              border: "1px dashed #343b50",
              borderRadius: "12px"
            }}
          >

            <h3
              style={{
                marginBottom: "20px"
              }}
            >
              Scan at Entry
            </h3>


            {qrImage ? (

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  background: "#ffffff",
                  padding: "20px",
                  width: "fit-content",
                  margin: "0 auto",
                  borderRadius: "12px"
                }}
              >

                <img
                  src={qrImage}
                  alt="Ticket QR Code"
                  width="220"
                  height="220"
                />

              </div>

            ) : (

              <p
                style={{
                  color: "#9298ad"
                }}
              >
                Generating QR code...
              </p>

            )}


            <p
              style={{
                color: "#9298ad",
                marginTop: "18px"
              }}
            >
              Scan this QR code to verify your ticket.
            </p>

          </div>


          {/* ====================================================
              BUTTONS
          ===================================================== */}

          <div className="form-actions">


            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                window.location.href =
                  "/dashboard";
              }}
            >
              ← Dashboard
            </button>


            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                window.print();
              }}
            >
              Print Ticket 🖨️
            </button>


          </div>


        </div>


      </main>


    </div>

  );

}


export default Ticket;