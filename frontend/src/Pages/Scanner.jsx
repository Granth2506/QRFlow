import "../App.css";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function Scanner() {

  const scannerRef = useRef(null);

  // IMPORTANT:
  // Prevent the same QR from being processed multiple times
  const processingRef = useRef(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);


  // ============================================================
  // START SCANNER
  // ============================================================

  const startScanner = async () => {

    // Prevent starting another scanner
    if (scanning || processingRef.current) {
      return;
    }

    setError("");
    setResult(null);

    processingRef.current = false;

    setScanning(true);


    try {

      const scanner = new Html5Qrcode("qr-reader");

      scannerRef.current = scanner;


      await scanner.start(

        { facingMode: "environment" },

        {
          fps: 10,

          qrbox: {
            width: 250,
            height: 250
          }
        },


        // ======================================================
        // QR DETECTED
        // ======================================================

        async (decodedText) => {

          // VERY IMPORTANT
          // Ignore repeated detections
          if (processingRef.current) {
            return;
          }


          processingRef.current = true;


          console.log(
            "QR detected:",
            decodedText
          );


          // Stop scanner immediately

          try {

            await scanner.stop();

            console.log(
              "Scanner stopped"
            );

          } catch (stopError) {

            console.error(
              "Scanner stop error:",
              stopError
            );

          }


          // Clear scanner reference

          scannerRef.current = null;


          setScanning(false);


          // Verify ticket only ONCE

          await verifyTicket(decodedText);

        },


        // Ignore continuous scanning errors

        () => {}

      );


    } catch (error) {

      console.error(
        "Camera error:",
        error
      );


      processingRef.current = false;

      setScanning(false);


      setError(
        "Unable to access camera. Please allow camera permission."
      );

    }

  };


  // ============================================================
  // VERIFY + SCAN TICKET
  // ============================================================

  const verifyTicket = async (qrData) => {

    try {

      let ticketCode = qrData;


      // ========================================================
      // TRY TO READ JSON FROM QR
      // ========================================================

      try {

        const parsedData = JSON.parse(qrData);


        if (parsedData.ticket_code) {

          ticketCode =
            parsedData.ticket_code;

        }

      } catch {

        // QR contains plain text
        // Use decodedText directly

      }


      console.log(
        "Verifying ticket:",
        ticketCode
      );


      // ========================================================
      // CALL BACKEND
      // ========================================================

      const response = await fetch(

        `http://127.0.0.1:5000/api/tickets/${ticketCode}/scan`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          }
        }

      );


      const data = await response.json();


      console.log(
        "Backend response:",
        data
      );


      // ========================================================
      // VALID TICKET
      // ========================================================

      if (response.ok) {

        setResult({

          valid: true,

          alreadyScanned: false,

          ticket: data.ticket,

          message:
            data.message ||
            "Entry approved successfully."

        });

        return;

      }


      // ========================================================
      // ALREADY SCANNED
      // ========================================================

      if (response.status === 409) {

        setResult({

          valid: false,

          alreadyScanned: true,

          ticket: data.ticket,

          message:
            data.message ||
            "This ticket has already been scanned."

        });

        return;

      }


      // ========================================================
      // INVALID
      // ========================================================

      setResult({

        valid: false,

        alreadyScanned: false,

        message:
          data.message ||
          data.error ||
          "Invalid ticket."

      });


    } catch (error) {

      console.error(
        "Ticket verification error:",
        error
      );


      setResult({

        valid: false,

        alreadyScanned: false,

        message:
          "Unable to connect to backend."

      });

    }

  };


  // ============================================================
  // CLEANUP
  // ============================================================

  useEffect(() => {

    return () => {

      if (scannerRef.current) {

        scannerRef.current
          .stop()
          .catch(() => {});

        scannerRef.current = null;

      }

    };

  }, []);


  // ============================================================
  // RESET
  // ============================================================

  const resetScanner = () => {

    setResult(null);

    setError("");

    processingRef.current = false;


    // Give React a moment to recreate scanner area

    setTimeout(() => {

      startScanner();

    }, 300);

  };


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div className="page">


      {/* ======================================================
          NAVBAR
      ======================================================= */}

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


      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="create-event-container">


        <div className="create-event-header">

          <p className="page-label">
            TICKET VERIFICATION
          </p>


          <h1>
            QR Ticket Scanner 📷
          </h1>


          <p>
            Scan an attendee's QR ticket to verify entry.
          </p>

        </div>


        {/* ====================================================
            CARD
        ===================================================== */}

        <div className="event-form-card">


          {/* ==================================================
              CAMERA
          ================================================== */}

          {!result && (

            <>

              <h2>
                Scan Ticket
              </h2>


              <p className="form-subtitle">
                Point the camera at the attendee's QR code.
              </p>


              <div
                id="qr-reader"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  margin: "25px auto"
                }}
              >
              </div>


              {/* START BUTTON */}

              {!scanning && (

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "25px"
                  }}
                >

                  <button
                    className="primary-btn"
                    onClick={startScanner}
                  >
                    📷 Start Scanner
                  </button>

                </div>

              )}


              {/* SCANNING */}

              {scanning && (

                <p
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                    color: "#9298ad"
                  }}
                >
                  📷 Camera is active. Scan a QR code...
                </p>

              )}


              {/* ERROR */}

              {error && (

                <p
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                    color: "#ff6b6b"
                  }}
                >
                  {error}
                </p>

              )}

            </>

          )}


          {/* ==================================================
              ENTRY APPROVED
          ================================================== */}

          {result && result.valid && (

            <div
              style={{
                textAlign: "center"
              }}
            >

              <div
                style={{
                  fontSize: "70px",
                  marginBottom: "15px"
                }}
              >
                ✅
              </div>


              <h2>
                Entry Approved
              </h2>


              <p className="form-subtitle">
                {result.message}
              </p>


              <div
                style={{
                  marginTop: "30px",
                  padding: "25px",
                  border: "1px solid #343b50",
                  borderRadius: "12px",
                  textAlign: "left"
                }}
              >

                <p>
                  <strong>Event:</strong>{" "}
                  {result.ticket.event_name}
                </p>


                <p>
                  <strong>Attendee:</strong>{" "}
                  {result.ticket.name}
                </p>


                <p>
                  <strong>Ticket:</strong>{" "}
                  {result.ticket.ticket_code}
                </p>


                <p>
                  <strong>Date:</strong>{" "}
                  {result.ticket.event_date}
                </p>


                <p>
                  <strong>Time:</strong>{" "}
                  {result.ticket.event_time}
                </p>


                <p>
                  <strong>Location:</strong>{" "}
                  {result.ticket.location}
                </p>


                <p>
                  <strong>Status:</strong>{" "}
                  {result.ticket.status}
                </p>


                <p>
                  <strong>Scanned At:</strong>{" "}
                  {result.ticket.scanned_at}
                </p>

              </div>


              <div
                style={{
                  marginTop: "30px"
                }}
              >

                <button
                  className="primary-btn"
                  onClick={resetScanner}
                >
                  Scan Another Ticket →
                </button>

              </div>

            </div>

          )}


          {/* ==================================================
              ALREADY SCANNED
          ================================================== */}

          {result &&
            !result.valid &&
            result.alreadyScanned && (

              <div
                style={{
                  textAlign: "center"
                }}
              >

                <div
                  style={{
                    fontSize: "70px",
                    marginBottom: "15px"
                  }}
                >
                  🚫
                </div>


                <h2>
                  Entry Denied
                </h2>


                <p className="form-subtitle">
                  {result.message}
                </p>


                {result.ticket && (

                  <div
                    style={{
                      marginTop: "30px",
                      padding: "25px",
                      border: "1px solid #343b50",
                      borderRadius: "12px",
                      textAlign: "left"
                    }}
                  >

                    <p>
                      <strong>Event:</strong>{" "}
                      {result.ticket.event_name}
                    </p>


                    <p>
                      <strong>Attendee:</strong>{" "}
                      {result.ticket.name}
                    </p>


                    <p>
                      <strong>Ticket:</strong>{" "}
                      {result.ticket.ticket_code}
                    </p>


                    <p>
                      <strong>Status:</strong>{" "}
                      {result.ticket.status}
                    </p>


                    <p>
                      <strong>First Scanned At:</strong>{" "}
                      {result.ticket.scanned_at}
                    </p>

                  </div>

                )}


                <div
                  style={{
                    marginTop: "30px"
                  }}
                >

                  <button
                    className="primary-btn"
                    onClick={resetScanner}
                  >
                    Scan Another Ticket →
                  </button>

                </div>

              </div>

          )}


          {/* ==================================================
              INVALID TICKET
          ================================================== */}

          {result &&
            !result.valid &&
            !result.alreadyScanned && (

              <div
                style={{
                  textAlign: "center"
                }}
              >

                <div
                  style={{
                    fontSize: "70px",
                    marginBottom: "15px"
                  }}
                >
                  ❌
                </div>


                <h2>
                  Invalid Ticket
                </h2>


                <p className="form-subtitle">
                  {result.message}
                </p>


                <div
                  style={{
                    marginTop: "30px"
                  }}
                >

                  <button
                    className="primary-btn"
                    onClick={resetScanner}
                  >
                    Try Again →
                  </button>

                </div>

              </div>

          )}


        </div>

      </main>

    </div>

  );

}


export default Scanner;