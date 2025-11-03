# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Authentication is required only for:

- User profile endpoints (`/api/users/me`)
- Regenerating sharableId (`POST /api/users/me/regenerate-sharable-id`)
- Editing appointments (`PATCH /api/appointments/:id`)
- Deleting appointments (`DELETE /api/appointments/:id`)

Authentication uses JWT tokens stored in HTTP-only cookies named `token`.

### Headers for Authenticated Requests

```
Content-Type: application/json
Cookie: token=<jwt_token>
```

---

## Authentication Endpoints

### POST /auth/signup

Create a new user account and automatically generate initial slots for the entire current month.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "timezone": "+05:30"
}
```

**Fields:**

- `name` (string, required): User's full name (minimum 2 characters)
- `email` (string, required): Valid email address
- `password` (string, required): Password (minimum 6 characters)
- `timezone` (string, required): UTC offset in format `[+-]HH:MM`
  - Examples: `"+05:30"` (India/IST), `"-08:00"` (US Pacific), `"+00:00"` (UTC)
  - This determines when the user's working hours (9 AM - 5 PM local) occur in UTC

**Response:** `201 Created`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "name": "John Doe",
  "userId": "507f1f77bcf86cd799439011",
  "sharableId": "550e8400-e29b-41d4-a716-446655440000",
  "timezone": "+05:30"
}
```

**Important:** Save the `sharableId` - this is what clients will use to access your calendar!

**Errors:**

- `400` - User already exists or validation error
- `500` - Internal server error

---

### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "name": "John Doe",
  "userId": "507f1f77bcf86cd799439011",
  "sharableId": "550e8400-e29b-41d4-a716-446655440000",
  "timezone": "+05:30"
}
```

**Errors:**

- `401` - Invalid credentials
- `400` - Validation error
- `500` - Internal server error

---

### POST /auth/logout

Log out the current user by clearing the authentication cookie.

**Response:** `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/me

Get the currently authenticated user's information.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "name": "John Doe",
  "userId": "507f1f77bcf86cd799439011",
  "sharableId": "550e8400-e29b-41d4-a716-446655440000",
  "timezone": "+05:30"
}
```

**Note:** All users have a fixed schedule: Monday-Friday, 9 AM - 5 PM in their local timezone (as defined by the `timezone` field), 30-minute intervals. Slots are stored in UTC.

**Errors:**

- `401` - Not authenticated
- `404` - User not found
- `500` - Internal server error

---

## Appointment Endpoints (No Authentication Required)

### GET /appointments

Get all appointments for a user with pagination support. Returns either past or future appointments.

**Authentication:** Not Required

**Query Parameters:**

- `sharableId` (required): User's sharableId (UUID)
- `type` (required): Type of appointments to retrieve
  - `past` = Past appointments (sorted by most recent first)
  - `future` = Future appointments (sorted by nearest first)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 10)

**Examples:**

Get future appointments (page 1):

```
GET /api/appointments?sharableId=550e8400-e29b-41d4-a716-446655440000&type=future&page=1&limit=10
```

Get past appointments:

```
GET /api/appointments?sharableId=550e8400-e29b-41d4-a716-446655440000&type=past&page=1&limit=10
```

**Response:** `200 OK`

```json
{
  "appointments": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "slotId": "507f1f77bcf86cd799439013",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "guests": ["guest1@example.com", "guest2@example.com"],
      "reason": "Business meeting",
      "status": "pending",
      "slot": {
        "startTime": "2025-11-03T14:00:00.000Z",
        "endTime": "2025-11-03T14:30:00.000Z",
        "date": "2025-11-03T00:00:00.000Z"
      },
      "createdAt": "2025-11-02T10:00:00.000Z",
      "updatedAt": "2025-11-02T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Response Format:**

- `appointments`: Array of appointment objects
- `pagination`: Pagination information
  - `page`: Current page number
  - `limit`: Results per page
  - `total`: Total number of appointments
  - `totalPages`: Total number of pages
  - `hasNextPage`: Boolean indicating if there's a next page
  - `hasPrevPage`: Boolean indicating if there's a previous page

**Sorting:**

- **Past appointments**: Sorted by slot start time in descending order (most recent first)
- **Future appointments**: Sorted by slot start time in ascending order (nearest first)

**Errors:**

- `400` - sharableId is required, or type is required/invalid
- `404` - User not found
- `500` - Internal server error

---

### GET /appointments/available

Get all slots (both booked and available) for a user for a given week, grouped by day. The client can filter available slots using the `isBooked` property.

**Authentication:** Not Required

**Query Parameters:**

- `sharableId` (required): User's sharableId (UUID)
- `weekOffset` (optional): Number of weeks from current week (default: 0)

**Example:**

```
GET /api/appointments/available?sharableId=550e8400-e29b-41d4-a716-446655440000&weekOffset=1
```

**Response:** `200 OK`

Slots are grouped by day of week and sorted by dayId (0=Sunday, 1=Monday, ..., 6=Saturday).
Within each day, slots are sorted by startTime. Only future slots are returned.

**Important:** All times are returned in **UTC format** with ISO 8601 format (e.g., `2025-11-03T09:00:00.000Z`). The "Z" suffix indicates UTC timezone. The client is responsible for converting these times to the user's local timezone for display.

```json
[
  {
    "dayId": 1,
    "slots": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "startTime": "2025-11-03T09:00:00.000Z",
        "endTime": "2025-11-03T09:30:00.000Z",
        "date": "2025-11-03T00:00:00.000Z",
        "isBooked": false
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "startTime": "2025-11-03T09:30:00.000Z",
        "endTime": "2025-11-03T10:00:00.000Z",
        "date": "2025-11-03T00:00:00.000Z",
        "isBooked": true
      }
    ]
  },
  {
    "dayId": 2,
    "slots": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "startTime": "2025-11-04T09:00:00.000Z",
        "endTime": "2025-11-04T09:30:00.000Z",
        "date": "2025-11-04T00:00:00.000Z",
        "isBooked": false
      }
    ]
  }
]
```

**Response Format:**

- `dayId`: Day of week (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday)
- `slots`: Array of all slots for that day (both booked and available), sorted by startTime
  - `_id`: Unique slot identifier
  - `startTime`: Slot start time (ISO 8601)
  - `endTime`: Slot end time (ISO 8601)
  - `date`: Date of the slot (ISO 8601)
  - `isBooked`: Boolean indicating if the slot is booked (`true` = booked, `false` = available)

**Errors:**

- `400` - sharableId is required
- `404` - User not found
- `500` - Internal server error

---

### POST /appointments

Create a new appointment by booking a specific slot for a user.

**Authentication:** Not Required

**Request Body:**

```json
{
  "sharableId": "550e8400-e29b-41d4-a716-446655440000",
  "slotId": "507f1f77bcf86cd799439013",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "guests": ["guest1@example.com", "guest2@example.com"],
  "reason": "Business meeting"
}
```

**Field Descriptions:**

- `sharableId` (required): User's sharableId (UUID)
- `slotId` (required): ID of the slot to book
- `name` (required): Name of the person booking
- `email` (required): Email of the person booking
- `phone` (optional): Phone number
- `guests` (optional): Array of additional guest identifiers (emails/names)
- `reason` (optional): Reason for the appointment (max 500 characters)

**Response:** `201 Created`

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "slotId": "507f1f77bcf86cd799439013",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "guests": ["guest1@example.com", "guest2@example.com"],
  "reason": "Business meeting",
  "status": "pending",
  "slot": {
    "startTime": "2025-11-03T14:00:00.000Z",
    "endTime": "2025-11-03T14:30:00.000Z",
    "date": "2025-11-03T00:00:00.000Z"
  },
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T10:00:00.000Z"
}
```

**Email Notifications:**

When an appointment is successfully created, a confirmation email is automatically sent to all attendees (email and guests) with the appointment details.

**Errors:**

- `400` - sharableId required, slot already booked, slot in the past, slot doesn't belong to user, or validation error
- `404` - User or slot not found
- `500` - Internal server error

---

### PATCH /appointments/:id

Edit/Update an appointment. You can reschedule it by changing the slot, update guest information, or both. Only the calendar owner (authenticated user) can edit appointments.

**Authentication:** Required

**URL Parameters:**

- `id`: Appointment ID

**Request Body:**

All fields are optional, but at least one field must be provided:

```json
{
  "newSlotId": "507f1f77bcf86cd799439016",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890",
  "guests": ["guest1@example.com", "guest2@example.com"],
  "reason": "Updated meeting agenda"
}
```

**Field Descriptions:**

- `newSlotId` (optional): ID of the new slot to move the appointment to (for rescheduling)
- `name` (optional): Guest's name
- `email` (optional): Guest's email address
- `phone` (optional): Guest's phone number
- `guests` (optional): Array of additional guest email addresses
- `reason` (optional): Purpose/notes for the appointment (max 500 characters)

**Note:** You can update any combination of these fields. For example:

- Only reschedule: Send just `newSlotId`
- Only update details: Send any combination of `name`, `email`, `phone`, `guests`, `reason`
- Both: Send `newSlotId` along with updated details

**Example:**

```
PATCH /api/appointments/507f1f77bcf86cd799439012
```

**Response:** `200 OK`

The message will be "Appointment rescheduled successfully" if the slot was changed, or "Appointment updated successfully" if only details were updated.

```json
{
  "message": "Appointment updated successfully",
  "appointment": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "slotId": "507f1f77bcf86cd799439016",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "guests": ["guest1@example.com", "guest2@example.com"],
    "reason": "Business meeting",
    "status": "pending",
    "slot": {
      "startTime": "2025-11-04T10:00:00.000Z",
      "endTime": "2025-11-04T10:30:00.000Z",
      "date": "2025-11-04T00:00:00.000Z"
    },
    "createdAt": "2025-11-02T10:00:00.000Z",
    "updatedAt": "2025-11-03T14:20:00.000Z"
  }
}
```

**Email Notifications:**

When an appointment is rescheduled (slot changed via `newSlotId`), an email notification is automatically sent to all attendees (email and guests) informing them of the schedule change, including both the old and new times. If only appointment details are updated (without changing the slot), no email is sent.

**Errors:**

- `400` - At least one field must be provided, cannot edit a deleted appointment, cannot edit a past appointment, new slot already booked, new slot is in the past, new slot doesn't belong to user, new slot must be different from current slot, or validation error
- `401` - Not authenticated
- `403` - Appointment doesn't belong to authenticated user
- `404` - Appointment not found or new slot not found
- `500` - Internal server error

---

### DELETE /appointments/:id

Delete (soft delete) an appointment and free up the associated slot.

**Authentication:** Required

**URL Parameters:**

- `id`: Appointment ID

**Example:**

```
DELETE /api/appointments/507f1f77bcf86cd799439012
```

**Response:** `200 OK`

```json
{
  "message": "Appointment deleted successfully",
  "appointment": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "slotId": "507f1f77bcf86cd799439013",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "guests": ["guest1@example.com"],
    "reason": "Business meeting",
    "status": "pending",
    "isDeleted": true,
    "createdAt": "2025-11-02T10:00:00.000Z",
    "updatedAt": "2025-11-02T10:30:00.000Z"
  }
}
```

**Email Notifications:**

When an appointment is cancelled, an email notification is automatically sent to all attendees (email and guests) informing them of the cancellation.

**Errors:**

- `400` - Appointment already deleted or appointment is in the past
- `401` - Not authenticated
- `403` - Appointment doesn't belong to authenticated user
- `404` - Appointment not found
- `500` - Internal server error

---

## User Profile Endpoints (Authentication Required)

### GET /users/me

Get the authenticated user's profile information.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "userId": "507f1f77bcf86cd799439011",
  "sharableId": "550e8400-e29b-41d4-a716-446655440000",
  "timezone": "+05:30"
}
```

**Field Descriptions:**

- `name`: User's full name
- `email`: User's email address
- `userId`: User's unique identifier
- `sharableId`: UUID for calendar sharing
- `timezone`: User's UTC offset (e.g., "+05:30" for India/IST)

**Errors:**

- `401` - Not authenticated
- `404` - User not found
- `500` - Internal server error

---

### POST /users/me/regenerate-sharable-id

Regenerate the sharableId for the authenticated user. This is useful if you want to revoke access to your calendar and generate a new sharing link.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "sharableId": "660f9511-f3ac-52e5-b827-557766551111",
  "message": "Sharable ID regenerated successfully"
}
```

**Errors:**

- `401` - Not authenticated
- `404` - User not found
- `500` - Internal server error

**Note:** All slots are generated with a fixed schedule: Monday-Friday, 9 AM - 5 PM (UTC), with 30-minute intervals.

---

## Health Check

### GET /health

Check if the server is running.

**Response:** `200 OK`

```json
{
  "status": "ok"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data or business logic error
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Authenticated but not authorized for this resource
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Data Types

### Appointment Status

- `pending` - Appointment is scheduled and pending
- `done` - Appointment has been completed

### Weekday Numbers

- `0` - Sunday
- `1` - Monday
- `2` - Tuesday
- `3` - Wednesday
- `4` - Thursday
- `5` - Friday
- `6` - Saturday

### Date/Time Format

All dates and times are in ISO 8601 format in UTC timezone:

```
2025-11-03T14:00:00.000Z
```

**Key Points:**

- The "Z" suffix indicates UTC timezone (zero offset from UTC)
- All times are stored in UTC on the backend
- No timezone conversions are performed by the API
- Clients must convert to local timezone for display if needed
- Example: `2025-11-03T09:00:00.000Z` represents 9:00 AM UTC, which is 2:30 PM IST (UTC+5:30)

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting in production.

---

## CORS

CORS is enabled for the frontend URL specified in the `FRONTEND_URL` environment variable (default: `http://localhost:5173`).

Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

Credentials (cookies) are supported.

---

## Email Notifications

The system automatically sends email notifications to all appointment attendees (primary email and guests) for the following events:

### Appointment Booked

**When:** Immediately after a new appointment is created via `POST /appointments`

**Recipients:** All attendees (email field + guests array)

**Content:**

- Confirmation of booking
- Appointment date and time (displayed in UTC)
- Calendar owner's name and email
- Purpose/reason (if provided)
- List of all attendees

### Appointment Cancelled

**When:** Immediately after an appointment is deleted via `DELETE /appointments/:id`

**Recipients:** All attendees (email field + guests array)

**Content:**

- Cancellation notice
- Original appointment date and time
- Calendar owner's contact information

### Appointment Rescheduled

**When:** Immediately after an appointment is moved to a new slot via `PATCH /appointments/:id`

**Recipients:** All attendees (email field + guests array)

**Content:**

- Reschedule notification
- Old date and time (crossed out)
- New date and time (highlighted)
- Calendar owner's contact information
- Purpose/reason (if provided)
- List of all attendees

**Important Notes:**

- All email times are displayed in UTC timezone
- Email delivery errors are logged but do not cause API operations to fail
- Emails are sent from `appointments@resend.dev`
- Only guests/attendees receive emails (not the calendar owner who makes the change)

---

## Cron Jobs

The system runs automated background jobs:

### Weekly Slot Generation

- **Schedule:** Every Sunday at 00:00 (midnight)
- **Action:** Generates slots for the next week for all users

### Daily Slot Cleanup

- **Schedule:** Every day at 02:00 AM
- **Action:** Deletes past unbooked slots to keep the database clean

---

## Examples

### Complete Booking Flow

1. **Get user's available slots:**

```bash
curl -X GET "http://localhost:3001/api/appointments/available?sharableId=550e8400-e29b-41d4-a716-446655440000&weekOffset=0"
```

2. **Book an appointment:**

```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "sharableId": "550e8400-e29b-41d4-a716-446655440000",
    "slotId": "507f1f77bcf86cd799439013",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "reason": "Consultation"
  }'
```

3. **View user's future appointments:**

```bash
curl -X GET "http://localhost:3001/api/appointments?sharableId=550e8400-e29b-41d4-a716-446655440000&type=future&page=1&limit=10"
```

4. **View user's past appointments:**

```bash
curl -X GET "http://localhost:3001/api/appointments?sharableId=550e8400-e29b-41d4-a716-446655440000&type=past&page=1&limit=10"
```

### Complete Authenticated User Flow

1. **Sign up:**

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

2. **Get your sharableId from the response, then view your future appointments:**

```bash
curl -X GET "http://localhost:3001/api/appointments?sharableId=YOUR_SHARABLE_ID&type=future&page=1&limit=10"
```

3. **Get your profile (requires authentication):**

```bash
curl -X GET http://localhost:3001/api/users/me \
  -b cookies.txt
```

4. **Regenerate your sharableId (requires authentication):**

```bash
curl -X POST http://localhost:3001/api/users/me/regenerate-sharable-id \
  -b cookies.txt
```

5. **Reschedule an appointment (requires authentication):**

```bash
curl -X PATCH http://localhost:3001/api/appointments/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -d '{
    "newSlotId": "507f1f77bcf86cd799439016"
  }' \
  -b cookies.txt
```

6. **Delete an appointment (requires authentication):**

```bash
curl -X DELETE http://localhost:3001/api/appointments/507f1f77bcf86cd799439012 \
  -b cookies.txt
```

7. **Logout:**

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

---

## Key Features

### sharableId-Based Access

- Users share their `sharableId` (UUID) to allow others to book appointments
- No authentication required for viewing/booking
- sharableId can be regenerated for security

### What Requires Auth

- `GET /api/auth/me` - Get current user info
- `GET /api/users/me` - Get user profile
- `POST /api/users/me/regenerate-sharable-id` - Regenerate sharableId
- `PATCH /api/appointments/:id` - Edit/reschedule appointment
- `DELETE /api/appointments/:id` - Delete appointment

### What Doesn't Require Auth

- Viewing appointments (with sharableId)
- Viewing slots (with sharableId) - returns both booked and available
- Booking appointments (with sharableId)

---

## Notes

### Fixed Schedule

- All users have the same fixed schedule: **Monday-Friday, 9 AM - 5 PM (UTC)**
- All slot times are **30 minutes** in duration
- No custom availability settings - schedule is fixed for all users

### Slot Generation

- Slots are automatically generated for new users (entire current month)
- Slots are generated weekly for all users (every Sunday at 00:00)
- Past unbooked slots are automatically cleaned up daily (02:00)

### Appointments

- Appointments use soft deletion (isDeleted flag)
- When an appointment is deleted, the associated slot becomes available again
- All times are stored and returned in UTC

### Security

- sharableId is a UUID that can be shared publicly
- sharableId can be regenerated by the user for security purposes
- Regenerating sharableId effectively revokes all previous sharing links
