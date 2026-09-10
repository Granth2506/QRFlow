from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
CORS(app)


DATABASE = "qrflow.db"


# ============================================================
# DATABASE
# ============================================================

def get_db():

    conn = sqlite3.connect(DATABASE)

    conn.row_factory = sqlite3.Row

    return conn


# ============================================================
# INITIALIZE DATABASE
# ============================================================

def init_db():

    conn = get_db()


    # ========================================================
    # OLD TICKETS TABLE
    # ========================================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS tickets (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            ticket_number TEXT NOT NULL,

            service TEXT NOT NULL,

            status TEXT NOT NULL DEFAULT 'waiting',

            created_at TEXT NOT NULL
        )
    """)


    # ========================================================
    # EVENTS TABLE
    # ========================================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS events (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            description TEXT,

            event_date TEXT NOT NULL,

            event_time TEXT NOT NULL,

            location TEXT NOT NULL,

            capacity INTEGER NOT NULL,

            price REAL NOT NULL DEFAULT 0,

            created_at TEXT NOT NULL
        )
    """)


    # ========================================================
    # REGISTRATIONS TABLE
    # ========================================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS registrations (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            event_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            email TEXT NOT NULL,

            phone TEXT NOT NULL,

            registered_at TEXT NOT NULL,

            payment_status TEXT NOT NULL DEFAULT 'not_required',

            payment_id TEXT,

            paid_at TEXT,

            FOREIGN KEY (event_id)
                REFERENCES events(id)
        )
    """)


    # ========================================================
    # PAYMENT DATABASE MIGRATIONS
    # ========================================================

    event_columns = conn.execute("PRAGMA table_info(events)").fetchall()
    event_column_names = [column["name"] for column in event_columns]

    if "price" not in event_column_names:
        conn.execute("ALTER TABLE events ADD COLUMN price REAL NOT NULL DEFAULT 0")

    registration_columns = conn.execute("PRAGMA table_info(registrations)").fetchall()
    registration_column_names = [column["name"] for column in registration_columns]

    if "payment_status" not in registration_column_names:
        conn.execute("ALTER TABLE registrations ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'not_required'")
    if "payment_id" not in registration_column_names:
        conn.execute("ALTER TABLE registrations ADD COLUMN payment_id TEXT")
    if "paid_at" not in registration_column_names:
        conn.execute("ALTER TABLE registrations ADD COLUMN paid_at TEXT")


    # ========================================================
    # EVENT TICKETS TABLE
    # ========================================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS event_tickets (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            registration_id INTEGER NOT NULL UNIQUE,

            event_id INTEGER NOT NULL,

            ticket_code TEXT NOT NULL UNIQUE,

            status TEXT NOT NULL DEFAULT 'valid',

            issued_at TEXT NOT NULL,

            scanned_at TEXT,

            FOREIGN KEY (registration_id)
                REFERENCES registrations(id),

            FOREIGN KEY (event_id)
                REFERENCES events(id)
        )
    """)


    # ========================================================
    # DATABASE MIGRATION
    #
    # If event_tickets already existed before scanned_at was
    # added, add the column without deleting existing tickets.
    # ========================================================

    columns = conn.execute(
        "PRAGMA table_info(event_tickets)"
    ).fetchall()


    column_names = [
        column["name"]
        for column in columns
    ]


    if "scanned_at" not in column_names:

        conn.execute("""
            ALTER TABLE event_tickets
            ADD COLUMN scanned_at TEXT
        """)


    # ========================================================
    # USERS TABLE
    # ========================================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()

    conn.close()


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():

    return "QRFlow Backend is Running!"


# ============================================================
# OLD TICKETS
# ============================================================

# ------------------------------------------------------------
# Create Old Ticket
# ------------------------------------------------------------

@app.route("/api/tickets", methods=["POST"])
def create_ticket():

    data = request.get_json()


    if not data:

        return jsonify({
            "error": "Request data is required"
        }), 400


    service = data.get("service")


    if not service:

        return jsonify({
            "error": "Service is required"
        }), 400


    conn = get_db()


    count = conn.execute("""
        SELECT COUNT(*)
        FROM tickets
        WHERE service = ?
    """, (service,)).fetchone()[0]


    ticket_number = (
        f"{service[:1].upper()}-{count + 1:03d}"
    )


    created_at = datetime.now().isoformat(
        timespec="seconds"
    )


    cursor = conn.execute("""
        INSERT INTO tickets
        (
            ticket_number,
            service,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?)
    """, (
        ticket_number,
        service,
        "waiting",
        created_at
    ))


    conn.commit()


    ticket_id = cursor.lastrowid


    conn.close()


    return jsonify({

        "message": "Ticket created successfully",

        "ticket": {

            "id": ticket_id,

            "ticket_number": ticket_number,

            "service": service,

            "status": "waiting",

            "created_at": created_at
        }

    }), 201


# ------------------------------------------------------------
# Get Old Tickets
# ------------------------------------------------------------

@app.route("/api/tickets", methods=["GET"])
def get_tickets():

    conn = get_db()


    tickets = conn.execute("""
        SELECT *
        FROM tickets
        ORDER BY id DESC
    """).fetchall()


    conn.close()


    return jsonify([
        dict(ticket)
        for ticket in tickets
    ])


# ============================================================
# EVENTS
# ============================================================

# ------------------------------------------------------------
# Create Event
# ------------------------------------------------------------

@app.route("/api/events", methods=["POST"])
def create_event():

    data = request.get_json()


    if not data:

        return jsonify({
            "error": "Request data is required"
        }), 400


    name = data.get("name")

    description = data.get("description")

    event_date = data.get("event_date")

    event_time = data.get("event_time")

    location = data.get("location")

    capacity = data.get("capacity")
    price = data.get("price", 0)


    # ========================================================
    # VALIDATION
    # ========================================================

    if not name:

        return jsonify({
            "error": "Event name is required"
        }), 400


    if not event_date:

        return jsonify({
            "error": "Event date is required"
        }), 400


    if not event_time:

        return jsonify({
            "error": "Event time is required"
        }), 400


    if not location:

        return jsonify({
            "error": "Location is required"
        }), 400


    if not capacity:

        return jsonify({
            "error": "Maximum capacity is required"
        }), 400


    try:

        capacity = int(capacity)

    except (ValueError, TypeError):

        return jsonify({
            "error": "Capacity must be a number"
        }), 400


    if capacity <= 0:

        return jsonify({
            "error": "Capacity must be greater than 0"
        }), 400

    try:
        price = float(price)
    except (ValueError, TypeError):
        return jsonify({"error": "Ticket price must be a number"}), 400

    if price < 0:
        return jsonify({"error": "Ticket price cannot be negative"}), 400


    conn = get_db()


    created_at = datetime.now().isoformat(
        timespec="seconds"
    )


    cursor = conn.execute("""
        INSERT INTO events
        (
            name,
            description,
            event_date,
            event_time,
            location,
            capacity,
            price,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        name,
        description,
        event_date,
        event_time,
        location,
        capacity,
        price,
        created_at
    ))


    conn.commit()


    event_id = cursor.lastrowid


    conn.close()


    return jsonify({

        "message": "Event created successfully",

        "event": {

            "id": event_id,

            "name": name,

            "description": description,

            "event_date": event_date,

            "event_time": event_time,

            "location": location,

            "capacity": capacity,

            "price": price,

            "created_at": created_at
        }

    }), 201


# ------------------------------------------------------------
# Get Events
# ------------------------------------------------------------

@app.route("/api/events", methods=["GET"])
def get_events():

    conn = get_db()


    events = conn.execute("""
        SELECT *
        FROM events
        ORDER BY id DESC
    """).fetchall()


    conn.close()


    return jsonify([
        dict(event)
        for event in events
    ])


# ============================================================
# REGISTRATIONS
# ============================================================

# ------------------------------------------------------------
# Register User + Generate Ticket
# ------------------------------------------------------------

@app.route("/api/registrations", methods=["POST"])
def create_registration():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request data is required"}), 400

    event_id = data.get("event_id")
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()

    if not event_id:
        return jsonify({"error": "Event ID is required"}), 400
    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not phone:
        return jsonify({"error": "Phone number is required"}), 400

    conn = get_db()
    event = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
    if not event:
        conn.close()
        return jsonify({"error": "Event not found"}), 404

    registration_count = conn.execute("SELECT COUNT(*) FROM registrations WHERE event_id = ?", (event_id,)).fetchone()[0]
    if registration_count >= event["capacity"]:
        conn.close()
        return jsonify({"error": "Event capacity is full"}), 400

    existing = conn.execute("SELECT id FROM registrations WHERE event_id = ? AND email = ?", (event_id, email)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "This email is already registered for this event."}), 409

    price = float(event["price"] or 0)
    payment_status = "not_required" if price == 0 else "pending"
    registered_at = datetime.now().isoformat(timespec="seconds")

    cursor = conn.execute("""
        INSERT INTO registrations
        (event_id, name, email, phone, registered_at, payment_status, payment_id, paid_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (event_id, name, email, phone, registered_at, payment_status, None, registered_at if price == 0 else None))

    registration_id = cursor.lastrowid
    ticket = None
    if price == 0:
        ticket = create_event_ticket(conn, event_id, registration_id)

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Registration successful" if price == 0 else "Registration created. Payment required.",
        "payment_required": price > 0,
        "amount": price,
        "registration": {
            "id": registration_id, "event_id": event_id, "name": name,
            "email": email, "phone": phone, "registered_at": registered_at,
            "payment_status": payment_status
        },
        "ticket": ticket
    }), 201


def create_event_ticket(conn, event_id, registration_id):
    unique_code = uuid.uuid4().hex[:8].upper()
    ticket_code = f"QRF-{event_id}-{registration_id}-{unique_code}"
    issued_at = datetime.now().isoformat(timespec="seconds")
    cursor = conn.execute("""
        INSERT INTO event_tickets
        (registration_id, event_id, ticket_code, status, issued_at, scanned_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (registration_id, event_id, ticket_code, "valid", issued_at, None))
    return {
        "id": cursor.lastrowid, "ticket_code": ticket_code, "event_id": event_id,
        "registration_id": registration_id, "status": "valid",
        "issued_at": issued_at, "scanned_at": None
    }


@app.route("/api/payments/demo", methods=["POST"])
def demo_payment():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request data is required"}), 400

    registration_id = data.get("registration_id")
    if not registration_id:
        return jsonify({"error": "Registration ID is required"}), 400

    conn = get_db()
    registration = conn.execute("""
        SELECT registrations.*, events.name AS event_name, events.price AS event_price
        FROM registrations
        JOIN events ON registrations.event_id = events.id
        WHERE registrations.id = ?
    """, (registration_id,)).fetchone()

    if not registration:
        conn.close()
        return jsonify({"error": "Registration not found"}), 404

    price = float(registration["event_price"] or 0)
    if price <= 0:
        conn.close()
        return jsonify({"error": "This is a free event. No payment is required."}), 400

    if registration["payment_status"] == "paid":
        ticket = conn.execute("SELECT * FROM event_tickets WHERE registration_id = ?", (registration_id,)).fetchone()
        conn.close()
        return jsonify({
            "message": "Payment was already completed.",
            "payment_status": "paid", "payment_id": registration["payment_id"],
            "ticket": dict(ticket) if ticket else None
        }), 200

    payment_id = f"DEMO-{uuid.uuid4().hex[:10].upper()}"
    paid_at = datetime.now().isoformat(timespec="seconds")
    conn.execute("""
        UPDATE registrations
        SET payment_status = 'paid', payment_id = ?, paid_at = ?
        WHERE id = ?
    """, (payment_id, paid_at, registration_id))

    ticket = create_event_ticket(conn, registration["event_id"], registration_id)
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Demo payment successful", "payment_status": "paid",
        "payment_id": payment_id, "amount": price, "paid_at": paid_at,
        "ticket": ticket
    }), 200


# ============================================================
# GET REGISTRATIONS
# ============================================================

@app.route("/api/registrations", methods=["GET"])
def get_registrations():

    conn = get_db()


    registrations = conn.execute("""
        SELECT *
        FROM registrations
        ORDER BY id DESC
    """).fetchall()


    conn.close()


    return jsonify([
        dict(registration)
        for registration in registrations
    ])


# ============================================================
# GET REGISTRATIONS FOR EVENT
# ============================================================

@app.route(
    "/api/events/<int:event_id>/registrations",
    methods=["GET"]
)
def get_event_registrations(event_id):

    conn = get_db()


    registrations = conn.execute("""
        SELECT *
        FROM registrations
        WHERE event_id = ?
        ORDER BY id DESC
    """, (event_id,)).fetchall()


    conn.close()


    return jsonify([
        dict(registration)
        for registration in registrations
    ])


# ============================================================
# GET EVENT TICKETS
# ============================================================

@app.route(
    "/api/events/<int:event_id>/tickets",
    methods=["GET"]
)
def get_event_tickets(event_id):

    conn = get_db()


    tickets = conn.execute("""
        SELECT

            event_tickets.id,

            event_tickets.ticket_code,

            event_tickets.status,

            event_tickets.issued_at,

            event_tickets.scanned_at,

            event_tickets.event_id,

            registrations.id AS registration_id,

            registrations.name,

            registrations.email,

            registrations.phone

        FROM event_tickets

        JOIN registrations

        ON event_tickets.registration_id =
           registrations.id

        WHERE event_tickets.event_id = ?

        ORDER BY event_tickets.id DESC

    """, (event_id,)).fetchall()


    conn.close()


    return jsonify([
        dict(ticket)
        for ticket in tickets
    ])


# ============================================================
# GET SINGLE TICKET
# ============================================================

@app.route(
    "/api/tickets/<ticket_code>",
    methods=["GET"]
)
def get_event_ticket(ticket_code):

    conn = get_db()


    ticket = conn.execute("""
        SELECT

            event_tickets.id,

            event_tickets.ticket_code,

            event_tickets.status,

            event_tickets.issued_at,

            event_tickets.scanned_at,

            registrations.id AS registration_id,

            registrations.name,

            registrations.email,

            registrations.phone,

            events.id AS event_id,

            events.name AS event_name,

            events.event_date,

            events.event_time,

            events.location

        FROM event_tickets

        JOIN registrations

        ON event_tickets.registration_id =
           registrations.id

        JOIN events

        ON event_tickets.event_id =
           events.id

        WHERE event_tickets.ticket_code = ?

    """, (ticket_code,)).fetchone()


    conn.close()


    if not ticket:

        return jsonify({
            "error": "Ticket not found"
        }), 404


    return jsonify(dict(ticket))


# ============================================================
# SCAN / VERIFY TICKET
# ============================================================

@app.route(
    "/api/tickets/<ticket_code>/scan",
    methods=["POST"]
)
def scan_ticket(ticket_code):

    conn = get_db()


    # ========================================================
    # FIND TICKET
    # ========================================================

    ticket = conn.execute("""
        SELECT

            event_tickets.id,

            event_tickets.ticket_code,

            event_tickets.status,

            event_tickets.issued_at,

            event_tickets.scanned_at,

            registrations.id AS registration_id,

            registrations.name,

            registrations.email,

            registrations.phone,

            events.id AS event_id,

            events.name AS event_name,

            events.event_date,

            events.event_time,

            events.location

        FROM event_tickets

        JOIN registrations

        ON event_tickets.registration_id =
           registrations.id

        JOIN events

        ON event_tickets.event_id =
           events.id

        WHERE event_tickets.ticket_code = ?

    """, (ticket_code,)).fetchone()


    # ========================================================
    # TICKET NOT FOUND
    # ========================================================

    if not ticket:

        conn.close()

        return jsonify({

            "success": False,

            "valid": False,

            "message": "Invalid ticket. Ticket not found."

        }), 404


    # ========================================================
    # CHECK IF ALREADY SCANNED
    # ========================================================

    if ticket["status"] == "scanned":

        conn.close()

        return jsonify({

            "success": False,

            "valid": False,

            "already_scanned": True,

            "message": "Entry denied. This ticket has already been scanned.",

            "ticket": dict(ticket)

        }), 409


    # ========================================================
    # CHECK TICKET STATUS
    # ========================================================

    if ticket["status"] != "valid":

        conn.close()

        return jsonify({

            "success": False,

            "valid": False,

            "message": "Entry denied. This ticket is not valid.",

            "ticket": dict(ticket)

        }), 400


    # ========================================================
    # APPROVE ENTRY
    # ========================================================

    scanned_at = datetime.now().isoformat(
        timespec="seconds"
    )


    conn.execute("""
        UPDATE event_tickets

        SET
            status = ?,
            scanned_at = ?

        WHERE ticket_code = ?

          AND status = 'valid'

    """, (
        "scanned",
        scanned_at,
        ticket_code
    ))


    conn.commit()


    # ========================================================
    # GET UPDATED TICKET
    # ========================================================

    updated_ticket = conn.execute("""
        SELECT

            event_tickets.id,

            event_tickets.ticket_code,

            event_tickets.status,

            event_tickets.issued_at,

            event_tickets.scanned_at,

            registrations.id AS registration_id,

            registrations.name,

            registrations.email,

            registrations.phone,

            events.id AS event_id,

            events.name AS event_name,

            events.event_date,

            events.event_time,

            events.location

        FROM event_tickets

        JOIN registrations

        ON event_tickets.registration_id =
           registrations.id

        JOIN events

        ON event_tickets.event_id =
           events.id

        WHERE event_tickets.ticket_code = ?

    """, (ticket_code,)).fetchone()


    conn.close()


    # ========================================================
    # SUCCESS RESPONSE
    # ========================================================

    return jsonify({

        "success": True,

        "valid": True,

        "already_scanned": False,

        "message": "Entry approved successfully.",

        "ticket": dict(updated_ticket)

    }), 200


# ============================================================
# AUTHENTICATION
# ============================================================

# ------------------------------------------------------------
# Signup
# ------------------------------------------------------------

@app.route("/api/signup", methods=["POST"])
def signup():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required."
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    conn = get_db()

    existing_user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:
        conn.close()
        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    hashed_password = generate_password_hash(password)
    created_at = datetime.now().isoformat(timespec="seconds")

    cursor = conn.execute("""
        INSERT INTO users (name, email, password, created_at)
        VALUES (?, ?, ?, ?)
    """, (name, email, hashed_password, created_at))

    user_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 201


# ------------------------------------------------------------
# Login
# ------------------------------------------------------------

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required."
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    conn = get_db()

    user = conn.execute("""
        SELECT * FROM users WHERE email = ?
    """, (email,)).fetchone()

    conn.close()

    if not user or not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 200


# ============================================================
# START SERVER
# ============================================================
init_db()
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
