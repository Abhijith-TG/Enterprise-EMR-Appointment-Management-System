# Engineering Decisions — Enterprise EMR Appointment Management System

This document outlines the architectural patterns, database design, and key engineering decisions implemented for this Electronic Medical Record (EMR) Appointment Management Platform.

---

## 1. Project Architecture

We implemented a **modular, layered architecture** split cleanly between the Frontend and Backend:

### Backend Architecture
- **Layered Structure**: Follows a strict Controller-Service-Model-Repository pattern.
  - **Controllers**: Responsible only for parsing client input (using Zod schemas), calling services, and writing HTTP responses.
  - **Services**: Contain all domain business logic (e.g., dynamic slot generation, state machine transitions, audit logging).
  - **Models**: Monogose schemas defining types, validations, and indexes.
  - **Validators**: Centralized Zod validators that parse incoming query parameters and requests.
  - **Middlewares**: Custom token validation and role-based access control (RBAC) guards.

### Frontend Architecture
- **Vite + React + TypeScript**: Chosen for sub-second build times, fast hot reloading (HMR), and compile-time type safety.
- **Strict Role-Based Routing**: Gated by custom react-router guards (`PrivateRoute` and `RoleRoute`). Users are dynamically redirected to specific features based on their verified system role:
  - `SUPER_ADMIN` gets redirected to Doctor / Staff CRUD & Schedules.
  - `RECEPTIONIST` gets redirected to Scheduler & Patient Check-ins.
  - `DOCTOR` gets redirected to personal consultation list.
- **Modular File Division**: Context providers, services, layout wrappers, and pages are stored in isolated, clean files rather than bloated single components.

---

## 2. MongoDB Schema Design

The database contains 8 collections structured to optimize queries and avoid joins on hot paths:

1. **User**: Common account details (firstName, lastName, email, hashed password, isActive) for all system actors. Gated by roles: `SUPER_ADMIN`, `RECEPTIONIST`, `DOCTOR`.
2. **Doctor**: Associated 1-to-1 with a User record. Contains clinical attributes (specialization, consultationFee, department).
3. **Department**: Standard EMR clinical units (e.g., Cardiology, General Practice).
4. **Patient**: Patient demographics (patientId, name, DOB, gender, mobile, address) and emergency contact information.
5. **DoctorSchedule**: Stores doctor session configurations (working days, slot duration, session time blocks).
6. **Appointment**: Stores the core visit detail, linking `patient`, `doctor`, and `department`. Maintains status (`Scheduled`, `Arrived`, `Completed`, `Cancelled`).
7. **RefreshToken**: Stores persistent session tokens for token renewal rotation.
8. **AuditLog**: Stores logging trails for security audit compliance.

---

## 3. Concurrency Handling & Double Booking Prevention

Double booking is prevented on the database level using a **Unique Compound Constraint** and transactional checks:

1. **Database-Level Compound Index**:
   A unique compound index is created on the `Appointment` collection:
   ```javascript
   appointmentSchema.index({ doctor: 1, appointmentDate: 1, slotTime: 1 }, { unique: true })
   ```
   If two receptionists attempt to book the exact same slot for the same doctor on the same date simultaneously, MongoDB's unique key constraint will reject the second transaction with a `11000` duplicate key error, guaranteeing absolute data consistency.
2. **Validation Logic**:
   Before performing a write, `appointmentService.createAppointment` checks if a slot is already booked for that physician. If it exists, the service immediately throws a `400 Bad Request` code.

---

## 4. Database Indexing Strategy

To keep database retrieval sub-millisecond, we configured critical indexes:

- **User**: `email` (unique index) for instant authentication lookups.
- **Patient**: `mobile` (index) and `patientId` (unique index) for fast receptionist typeahead searching during patient lookups.
- **Appointment**: 
  - `{ doctor: 1, appointmentDate: 1, slotTime: 1 }` (unique compound index) to enforce booking uniqueness and speed up calendar rendering.
  - `{ status: 1 }` to optimize receptionist list queues.
- **RefreshToken**: `{ expiresAt: 1 }` (TTL index) to automatically clean up expired refresh tokens from the database.

---

## 5. Security Measures

- **JWT Dual Token Authentication**: Access tokens expire in `15m` to limit exposure. Refresh tokens expire in `7d` and are securely stored in HTTP-Only cookies to protect them from XSS attacks.
- **Role-Based Access Control (RBAC)**: All clinical endpoints are protected by `roleMiddleware` verifying roles on the access token payload.
- **Secure Password Hashing**: Passwords hashed using `bcrypt` with a work factor of 10 salt rounds.
- **Input Validation**: Centralized Zod validation blocks malicious payloads before hitting database handlers.
- **Safe CORS Configuration**: Explicit origin listing (`http://localhost:5173`) with credentials authorization allowed, preventing wildcard CSRF leakage.

---

## 6. Performance Optimizations

- **Axios Token Interceptors**: Automated silent token refresh handling (POST /auth/refresh) on 401 errors, providing seamless session recovery without forcing user relogins.
- **Server-Side Pagination & Filtering**: Large collections (like Appointments) use `skip` and `limit` on the database query level rather than pulling entire collections to memory.
- **Compound Database Indexes**: Added covering indexes on common query filters to prevent database collscans.
- **Lazy Populates**: Populated fields selectively exclude password hashes (`select: "-password"`) to keep payloads light.

---

## 7. Scaling to Millions of Appointments

To support an enterprise-grade workload with millions of records, we would implement the following updates:

1. **Database Sharding**: Shard the `Appointment` collection in MongoDB using `{ doctor: 1, appointmentDate: 1 }` as the shard key to distribute calendar query writes across multi-node clusters.
2. **Redis Caching**: Cache doctor schedule slots and active available slot computations in a Redis cluster to avoid hitting MongoDB for real-time slot generation queries.
3. **Queue-Based Booking (Broker Pattern)**: Process appointment bookings asynchronously using a message broker like RabbitMQ or Kafka to absorb spike loads during peak booking hours.
4. **Horizontal Scaling**: Containerize backend services using Docker and deploy on Kubernetes (EKS/GKE) with horizontal pod autoscalers based on CPU/Memory load.
