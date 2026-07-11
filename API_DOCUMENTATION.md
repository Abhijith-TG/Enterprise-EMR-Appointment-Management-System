# API Documentation

## Base URL
All API endpoints are prefixed with `/api/v1`.

---

## Authentication (`/auth`)

### 1. Login User
- **Method**: `POST`
- **Path**: `/auth/login`
- **Description**: Authenticates a user and returns an access token, while setting an HTTP-only refresh token cookie.
- **Body**: 
  ```json
  {
    "email": "user@hospital.com",
    "password": "password123"
  }
  ```

### 2. Logout User
- **Method**: `POST`
- **Path**: `/auth/logout`
- **Description**: Invalidates the user's refresh token and clears the cookie.

### 3. Refresh Token
- **Method**: `POST`
- **Path**: `/auth/refresh`
- **Description**: Uses the HTTP-only refresh token cookie to generate a new short-lived access token.

---

## Appointments (`/appointments`)

### 1. List Appointments
- **Method**: `GET`
- **Path**: `/appointments`
- **Description**: Retrieve a list of appointments. Supports pagination and filtering.
- **Query Params**: `page`, `limit`, `status`, `doctorId`, `patientId`, `date`
- **Permissions**: `SUPER_ADMIN`, `RECEPTIONIST`, `DOCTOR`

### 2. Book Appointment
- **Method**: `POST`
- **Path**: `/appointments`
- **Description**: Creates a new appointment. Prevents double-booking and past-date booking.
- **Body**:
  ```json
  {
    "patientId": "...",
    "doctorId": "...",
    "appointmentDate": "YYYY-MM-DD",
    "slotTime": "10:00",
    "purpose": "Checkup",
    "notes": ""
  }
  ```
- **Permissions**: `SUPER_ADMIN`, `RECEPTIONIST`

### 3. Update Appointment Details
- **Method**: `PUT`
- **Path**: `/appointments/:id`
- **Description**: Update the purpose of visit or consultation notes.
- **Permissions**: `SUPER_ADMIN`, `RECEPTIONIST`, `DOCTOR`

### 4. Update Appointment Status
- **Method**: `PATCH`
- **Path**: `/appointments/:id/status`
- **Description**: General endpoint to change an appointment status (e.g. to CANCELLED).
- **Body**: `{ "status": "Cancelled" }`
- **Permissions**: `SUPER_ADMIN`, `RECEPTIONIST`, `DOCTOR`

### 5. Mark as Arrived
- **Method**: `POST`
- **Path**: `/appointments/:id/arrive`
- **Description**: Specifically marks an appointment as `ARRIVED`.
- **Permissions**: `SUPER_ADMIN`, `RECEPTIONIST`

### 6. Delete (Cancel) Appointment
- **Method**: `DELETE`
- **Path**: `/appointments/:id`
- **Description**: Soft deletes an appointment by changing its status to `CANCELLED`.
- **Permissions**: `SUPER_ADMIN`, `RECEPTIONIST`

### 7. Get Available Slots
- **Method**: `GET`
- **Path**: `/appointments/available-slots`
- **Description**: Generates and returns available time slots for a given doctor and date.
- **Query Params**: `doctorId`, `date`

---

## Patients (`/patients`)

### 1. Register Patient
- **Method**: `POST`
- **Path**: `/patients`
- **Description**: Registers a new patient.

### 2. Search Patients
- **Method**: `GET`
- **Path**: `/patients/search`
- **Query Params**: `q` (Search query by name, ID, or phone)

---

## Audit Logs (`/auditlogs`)

### 1. List Audit Logs
- **Method**: `GET`
- **Path**: `/auditlogs`
- **Description**: Retrieves system audit logs.
- **Permissions**: `SUPER_ADMIN`
