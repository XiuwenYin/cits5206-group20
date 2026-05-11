# API Reference

**Ground Support Testing Data System Group 20**

Base URL: `http://127.0.0.1:8000` (development)

All endpoints that require authentication must include a valid JWT access token in the request header:

```
Authorization: Bearer <access_token>
```

---

## Table of Contents

- [Authentication](#authentication)
- [Bolt Products](#bolt-products)
- [Test Statistics](#test-statistics)
- [Curve Data](#curve-data)
- [Admin Approval](#admin-approval)
- [File Upload](#file-upload)

---

## Authentication

### Obtain Token

**POST** `/api/auth/token/`

Authenticate with admin credentials and receive a JWT token pair.

**Request body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci..."
}
```

The `access` token expires after 60 minutes. The `refresh` token expires after 1 day.

---

### Refresh Token

**POST** `/api/auth/token/refresh/`

Exchange a refresh token for a new access token.

**Request body:**
```json
{
  "refresh": "eyJhbGci..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGci..."
}
```

---

### Verify Admin Status

**GET** `/api/auth/check/`

Requires authentication

Verify that the current token is valid and the user has admin privileges.

**Response (200 OK):**
```json
{
  "username": "admin",
  "is_staff": true,
  "message": "Authenticated successfully"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## Bolt Products

### List and Filter Products

**GET** `/api/bolts/products/`

Returns a list of rock bolt products. Supports optional query parameter filtering.

**Query parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `supplier` | string | Case-insensitive substring match on supplier name | `?supplier=acme` |
| `length` | float | Exact match on bolt length in metres | `?length=2.4` |
| `category` | string/int | Category name (substring) or category ID | `?category=Encapsulated` |
| `methodology` | string | Filter by test methodology: `static` or `dynamic` | `?methodology=dynamic` |

Multiple filters can be combined: `/api/bolts/products/?supplier=acme&methodology=dynamic`

**Response (200 OK):**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "supplier": "Supplier A",
      "name": "Hollow Core Bolt A D20 mm x 2.4 m",
      "length_m": 2.4,
      "diameter_mm": 20.0,
      "category": {
        "id": 1,
        "categoryName": "Encapsulated"
      },
      "equipment": [
        {"id": 1, "equipment_type_name": "Drop Hammer"}
      ]
    }
  ]
}
```

---

### List All Tests

**GET** `/api/bolts/tests/`

Returns a simplified list of all tests, used by the frontend upload page to associate curve data with a test.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "label": "Supplier A — Hollow Core Bolt A D20 mm x 2.4 m (dynamic)"
  },
  {
    "id": 2,
    "label": "Supplier A — Friction Bolt B D25 mm x 2.4 m (static)"
  }
]
```

---

## Test Statistics

### Get Statistics for a Test

**GET** `/api/bolts/tests/<test_id>/statistics/`

Returns summary statistics computed from a test's force-displacement curve data.

**Path parameter:** `test_id` — integer ID of the test

**Response (200 OK):**
```json
{
  "test_id": 1,
  "data_points_count": 404,
  "load_statistics": {
    "mean": 187.4,
    "median": 195.2,
    "min": 0.0,
    "max": 432.6,
    "percentile_25": 120.3,
    "percentile_75": 268.9
  },
  "displacement_statistics": {
    "mean": 142.1,
    "median": 148.5,
    "min": 0.0,
    "max": 298.7,
    "percentile_25": 72.4,
    "percentile_75": 214.8
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Test with ID 99 not found."
}
```

---

## Curve Data

### Get Raw Curve Data for a Test

**GET** `/api/bolts/tests/<test_id>/curve-data/`

Returns the raw force-displacement data points for a test as arrays, ordered by displacement (ascending).

**Path parameter:** `test_id` — integer ID of the test

**Response (200 OK):**
```json
{
  "test_id": 1,
  "data_points_count": 404,
  "displacement_mm": [0.0, 0.75, 1.5, "..."],
  "load_kn": [0.0, 12.3, 24.1, "..."],
  "energy_absorbed_kj": [null, null, 0.02, "..."]
}
```

> **Note:** Load values have been converted from tonnes to kN (multiplied by 9.80665) during the upload parsing process.

---

## Admin Approval

All endpoints in this section require admin authentication.

### List Pending Tests

**GET** `/api/bolts/tests/pending/`

🔒 Requires admin authentication

Returns all test records that have been uploaded but not yet approved.

**Response (200 OK):**
```json
{
  "count": 3,
  "pending_tests": [
    {
      "test_id": 5,
      "bolt_name": "Hollow Core Bolt A D20 mm x 2.4 m",
      "supplier": "Supplier A",
      "methodology": "dynamic",
      "uploaded_at": "2026-05-01T03:00:00Z"
    }
  ]
}
```

---

### Approve a Test

**POST** `/api/bolts/tests/<test_id>/approve/`

🔒 Requires admin authentication

Marks a test record as approved, making it publicly visible.

**Path parameter:** `test_id` — integer ID of the test

**Response (200 OK):**
```json
{
  "message": "Test 5 approved successfully",
  "test_id": 5,
  "is_approved": true
}
```

**Response (404 Not Found):**
```json
{
  "error": "Test with id 5 not found"
}
```

---

### Reject a Test

**POST** `/api/bolts/tests/<test_id>/reject/`

🔒 Requires admin authentication

Marks a test record as rejected, keeping it hidden from public view.

**Path parameter:** `test_id` — integer ID of the test

**Response (200 OK):**
```json
{
  "message": "Test 5 rejected successfully",
  "test_id": 5,
  "is_approved": false
}
```

---

## File Upload

### Upload Test Data

**POST** `/api/upload/`

🔒 Requires admin authentication

Accepts uploaded data files and parses them into the database.

**Supported upload modes:**

#### Mode 1 — Upload bolt products and test data

Send `products` and `tests` as multipart form files:

```bash
curl -X POST http://127.0.0.1:8000/api/upload/ \
  -H "Authorization: Bearer <token>" \
  -F "products=@products.json" \
  -F "tests=@tests.json"
```

#### Mode 2 — Upload curve data for a specific test

Send `curves` file and the associated `test_id`:

```bash
curl -X POST http://127.0.0.1:8000/api/upload/ \
  -H "Authorization: Bearer <token>" \
  -F "curves=@testdata.csv" \
  -F "test_id=1"
```

**Response (200 OK):**
```json
{
  "message": "Success"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Both products and tests files are required"
}
```

> **Note:** Load values in uploaded CSV files must be in **tonnes**. The system automatically converts them to kN by multiplying by 9.80665 during parsing.

---

## Error Responses

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad request — invalid input or missing required fields |
| 401 | Unauthorized — missing or invalid JWT token |
| 403 | Forbidden — valid token but insufficient permissions |
| 404 | Not found — resource does not exist |
| 500 | Server error |
