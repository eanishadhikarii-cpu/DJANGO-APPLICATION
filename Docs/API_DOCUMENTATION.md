# Book Exchange (API + Backend Viva Docs)

> Project note: The codebase in this repo is named **BookExchange** (Django + DRF + JWT) and implements a similar “items exchange/lost & found” workflow: users post books/items, exchange requests are created, reviews notify admins, and notifications are generated.

---

## 1. Project Overview

### Purpose
A REST API that supports:
- User registration/login using **JWT**
- Uploading items (Book) with optional image + cover URL
- Creating **exchange requests** between users
- Viewing own items and received/sent exchanges
- Leaving **reviews** and generating **notifications**
- OTP email verification endpoints

### Features
- DRF CRUD (List/Create, Retrieve/Update/Destroy)
- Search + filtering on listings
- Role-based permissions (Admin/Librarian/User)
- Custom standardized API error responses
- JWT access/refresh tokens + automatic refresh on the frontend

### Tech stack
- **Django 5.x**
- **Django REST Framework (DRF)**
- **djangorestframework-simplejwt**
- **PostgreSQL**
- **django-filter** (used in views)
- **React (frontend)** with Axios

### Role system
Roles live on the custom user model (`role`):
- `admin`
- `librarian`
- `user`

---

## 2. Folder Structure (important parts only)

- `backend/bookexchange/settings.py`
  - Global settings: DB, JWT, DRF, AUTH_USER_MODEL, static/media.
- `backend/books/`
  - **Core app**: models, serializers, permissions, views, URLs.
- `backend/books/models.py`
  - DB models for users/items/exchanges/reviews/notifications/OTP.
- `backend/books/serializers.py`
  - Input/output validation + representation for API.
- `backend/books/views.py`
  - DRF views + function views (OTP).
- `backend/books/urls.py`
  - API route definitions under `/api/`.
- `backend/books/permissions.py`
  - Custom DRF permission classes.
- `backend/books/exceptions.py`
  - Custom DRF exception handler to return consistent `{"success": false, "error": ...}`.

- `backend/media/`
  - Uploaded images (e.g., profile pictures, book covers).
- `frontend/`
  - React UI and Axios integration (token refresh, error toasts).
- `Docs/`
  - This documentation file.

---

## 3. Database Models

All models are in:
- `backend/books/models.py`

| Model | Purpose | Main fields | Relationships |
|---|---|---|---|
| `User` | Custom auth user with roles and profile | `email (unique)`, `city`, `profile_picture`, `role` | Inherits `AbstractUser`; owns `books` + `sent_requests/received_requests` + `reviews/notifications` |
| `EmailOTP` | Store email OTP codes for verification | `email`, `otp`, `created_at`, `is_verified` | No FK (email-based) |
| `Category` | Item category | `name` | `Book.category (FK)` |
| `Book` | The “item” being listed | `title`, `author`, `category`, `condition`, `image`, `cover_image_url`, `city`, `owner`, `created_at` | `owner -> User`, `category -> Category` |
| `ExchangeRequest` | Request to exchange/swaps | `sender`, `receiver`, `book_from`, `book_to`, `status`, `message`, `created_at` | Multiple FKs to `User` + `Book`; `unique_together=['sender','book_from','book_to']` |
| `Review` | Rating/comment on a book | `book`, `user`, `rating`, `comment`, `created_at` | `book -> Book`, `user -> User` |
| `Notification` | Notifications for users | `recipient`, `message`, `created_at`, `read` | `recipient -> User` |

**Extra behavior**
- Post-save signal on `Review` creates notifications for all users with roles `admin` and `librarian`.

---

## 4. Custom User Model

Defined in:
- `backend/books/models.py` (`class User(AbstractUser)`) 

### Why `AbstractUser`
- Reuses Django’s auth functionality (password hashing, username field support, permissions hooks).

### Unique email system
- `email = models.EmailField(unique=True)` ensures each email maps to exactly one account.

### `USERNAME_FIELD`
- This codebase uses `AbstractUser` default `USERNAME_FIELD='username'`.
- Login serializer expects `username` + `password`.

### Roles
- `role` choices:
  - `admin`
  - `librarian`
  - `user`

---

## 5. Views Documentation (important endpoints)

Routes are defined in:
- `backend/books/urls.py`

### Auth
1) **Register**
- **File**: `backend/books/views.py` → `RegisterView`
- **URL**: `/api/auth/register/`
- **Method**: `POST`
- **Purpose**: Create a new user via `RegisterSerializer`
- **Trigger source**: DRF `generics.CreateAPIView`
- **Permissions**: `AllowAny`

2) **Login (JWT token issue)**
- **File**: `backend/books/views.py` → `custom_login`
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Purpose**: Validate username/password and return `{access, refresh, user}`
- **Trigger source**: DRF function-based view (`@api_view`)
- **Permissions**: `AllowAny`

3) **Token refresh**
- **File**: `backend/books/urls.py` (uses SimpleJWT)
- **URL**: `/api/auth/refresh/`
- **Method**: `POST`
- **Purpose**: Get a new `access` using refresh token
- **Permissions**: handled by SimpleJWT

4) **User profile update**
- **File**: `backend/books/views.py` → `UserUpdateView`
- **URL**: `/api/auth/user/`
- **Method**: `PATCH`
- **Purpose**: Update current user profile; returns standardized success wrapper
- **Trigger source**: DRF `RetrieveUpdateAPIView` override
- **Permissions**: `IsAuthenticated`

### Categories
5) **List categories**
- **File**: `backend/books/views.py` → `CategoryListView`
- **URL**: `/api/categories/`
- **Method**: `GET`
- **Purpose**: Provide categories for the frontend
- **Permissions**: `AllowAny`

### Books (“items”)
6) **List + Create books**
- **File**: `backend/books/views.py` → `BookListCreateView`
- **URL**: `/api/books/`
- **Method**: 
  - `GET` → list
  - `POST` → create
- **Purpose**:
  - `GET`: public listing ordered by `-created_at`
  - `POST`: create item (assigns `owner=request.user`)
- **Trigger source**: DRF `ListCreateAPIView` + `get_serializer_class()`
- **Permissions**:
  - `GET`: `AllowAny`
  - `POST`: `CanManageStock` (admin/librarian)

7) **Book detail (read/update/delete)**
- **File**: `backend/books/views.py` → `BookDetailView`
- **URL**: `/api/books/<pk>/`
- **Method**:
  - `GET`: retrieve
  - `PUT/PATCH/DELETE`: modify
- **Purpose**: Standard CRUD for a single book
- **Permissions**:
  - safe methods: `AllowAny`
  - write/delete: `CanManageStock`

8) **My books**
- **File**: `backend/books/views.py` → `MyBooksView`
- **URL**: `/api/my-books/`
- **Method**: `GET`
- **Purpose**: List books owned by the logged-in user
- **Permissions**: `IsAuthenticated`

### Exchange requests
9) **Create exchange request (sender)** + list sender requests
- **File**: `backend/books/views.py` → `ExchangeRequestListCreateView`
- **URL**: `/api/exchanges/`
- **Method**:
  - `GET`: list where `sender=request.user`
  - `POST`: create exchange request
- **Purpose**: Manage outgoing exchange requests
- **Trigger source**:
  - `perform_create`: validates `book_from_id` and ensures ownership of `book_from`
- **Permissions**: `IsAuthenticated`

10) **Exchange detail (receiver can update status)**
- **File**: `backend/books/views.py` → `ExchangeRequestDetailView`
- **URL**: `/api/exchanges/<pk>/`
- **Method**:
  - `GET`: retrieve exchange request
  - `PATCH`: receiver updates status to `accepted/rejected`
- **Purpose**: Receiver-only status changes
- **Permissions**: `IsAuthenticated` + manual check `if instance.receiver != request.user: 403`

11) **Received requests**
- **File**: `backend/books/views.py` → `ReceivedRequestsView`
- **URL**: `/api/received-requests/`
- **Method**: `GET`
- **Purpose**: List where `receiver=request.user`
- **Permissions**: `IsAuthenticated`

### OTP (email verification)
12) **Send OTP**
- **File**: `backend/books/views.py` → `send_otp`
- **URL**: `/api/send-otp/`
- **Method**: `POST`
- **Purpose**: Generate 6-digit OTP and email it
- **Permissions**: `AllowAny`
- **Trigger source**: `EmailOTP.objects.create(...)` + `send_mail(...)`

13) **Verify OTP**
- **File**: `backend/books/views.py` → `verify_otp`
- **URL**: `/api/verify-otp/`
- **Method**: `POST`
- **Purpose**: Validate OTP + expiry, mark verified, issue JWT
- **Permissions**: `AllowAny`

### Reviews
14) **List + Create reviews**
- **File**: `backend/books/views.py` → `ReviewListCreateView`
- **URL**: `/api/reviews/`
- **Method**:
  - `GET`: list all reviews
  - `POST`: create review (authenticated)
- **Purpose**: Submit ratings/comments; signal triggers notifications
- **Permissions**:
  - `GET`: `AllowAny`
  - `POST`: `IsAuthenticated`

### Notifications
15) **List notifications**
- **File**: `backend/books/views.py` → `NotificationListView`
- **URL**: `/api/notifications/`
- **Method**: `GET`
- **Purpose**: Show current user notifications
- **Permissions**: `IsAuthenticated`

16) **Update notification** (mark read)
- **File**: `backend/books/views.py` → `NotificationUpdateView`
- **URL**: `/api/notifications/<pk>/`
- **Method**: `PATCH`
- **Purpose**: Update notification fields for the owner
- **Permissions**: `IsAuthenticated` (queryset is filtered by recipient)

---

## 6. Serializers Documentation

All serializers are in:
- `backend/books/serializers.py`

| Serializer | Purpose | Validation logic | Why it exists |
|---|---|---|---|
| `RegisterSerializer` | User registration input | password match, unique username/email, password length ≥ 6, email regex | Ensures safe user creation |
| `LoginSerializer` | Login payload | none (DRF fields only) | Simple input contract for login view |
| `UserSerializer` | User representation + password write | `create()` uses `set_password`, `update()` hashes if password present | DRF-safe password handling |
| `CategorySerializer` | Category list output | none | Simple FK-less representation |
| `BookListSerializer` | Book list fields | none | Avoids huge payloads for listing |
| `BookDetailSerializer` | Book detail output | none | Uses `fields='__all__'` |
| `BookCreateSerializer` | Book create payload | validates `category` exists, `title/author` non-empty | Prevents invalid references |
| `ExchangeRequestSerializer` | Exchange representation | marks sender/receiver & book titles read-only | Shows human-friendly labels |
| `ExchangeRequestCreateSerializer` | Exchange creation input | sets `sender`, `book_from` from view context; sets receiver from `book_to.owner` | Prevents client spoofing of ownership |
| `ReviewSerializer` | Review representation | none explicit in serializer | `Review.user` set by view |
| `NotificationSerializer` | Notification representation | none explicit | Used by list + update |

---

## 7. API Documentation (endpoints + examples)

Base URL: `/api`

> Response style: errors are standardized by `books.exceptions.custom_exception_handler` and middleware.

### Auth
**POST** `/auth/register/`
- Auth: `none`
- Purpose: register
- Example request:
```json
{
  "username": "sam",
  "email": "sam@example.com",
  "password": "secret123",
  "password2": "secret123",
  "city": "Kathmandu",
  "role": "user"
}
```
- Example response (200/201):
```json
{"id": 1, "username": "sam", "email": "sam@example.com", "role": "user"}
```

**POST** `/auth/login/`
- Auth: `none`
- Purpose: JWT issue
- Example request:
```json
{"username": "sam", "password": "secret123"}
```
- Example response:
```json
{
  "access": "<jwt_access>",
  "refresh": "<jwt_refresh>",
  "user": {"id": 1, "username": "sam", "role": "user"}
}
```

### Books
**GET** `/books/`
- Auth: `none`
- Purpose: browse items
- Permissions: `AllowAny`
- Example request: (query params)
  - `?city=...&condition=...&search=title`
- Example response (list):
```json
{
  "results": [{"id": 10, "title": "Clean Code", "owner_username": "sam"}]
}
```

**POST** `/books/`
- Auth: JWT
- Purpose: create item
- Permissions: `CanManageStock` (admin/librarian)
- Example request:
```json
{
  "title": "My Book",
  "author": "Me",
  "category": 1,
  "condition": "new",
  "city": "Lalitpur"
}
```

**GET** `/books/<pk>/`
- Auth: `none`
- Purpose: view one item

**PUT/PATCH/DELETE** `/books/<pk>/`
- Auth: JWT
- Purpose: update/delete item
- Permissions: `CanManageStock`

### My books
**GET** `/my-books/`
- Auth: JWT
- Purpose: items owned by logged-in user

### Exchange
**GET** `/exchanges/`
- Auth: JWT
- Purpose: list outgoing requests (`sender=request.user`)

**POST** `/exchanges/`
- Auth: JWT
- Purpose: create exchange request
- Example request:
```json
{ "book_from_id": 10, "book_to": 25, "message": "Let's swap." }
```
- Example response:
```json
{ "id": 3, "status": "pending", "sender_username": "sam" }
```

**GET** `/exchanges/<pk>/`
- Auth: JWT
- Purpose: retrieve exchange

**PATCH** `/exchanges/<pk>/`
- Auth: JWT
- Purpose: receiver updates status
- Example request:
```json
{ "status": "accepted" }
```
- Permission: only if `request.user == receiver` else `403`

**GET** `/received-requests/`
- Auth: JWT
- Purpose: list incoming exchanges (`receiver=request.user`)

### Reviews
**GET** `/reviews/`
- Auth: none
- Purpose: list reviews

**POST** `/reviews/`
- Auth: JWT
- Purpose: create review; triggers notifications to admin/librarian
- Example request:
```json
{ "book": 10, "rating": 5, "comment": "Great condition" }
```

### Notifications
**GET** `/notifications/`
- Auth: JWT
- Purpose: list your notifications

**PATCH** `/notifications/<pk>/`
- Auth: JWT
- Purpose: update notification (e.g., mark `read=true`)

### OTP
**POST** `/send-otp/`
- Auth: none
- Purpose: email OTP
- Example request:
```json
{ "email": "sam@example.com" }
```

**POST** `/verify-otp/`
- Auth: none
- Purpose: validate OTP and issue JWT
- Example request:
```json
{ "email": "sam@example.com", "otp": "123456" }
```

---

## 8. Authentication & Authorization

### Login / Registration
- Registration: `POST /api/auth/register/` (AllowAny)
- Login: `POST /api/auth/login/` → returns JWT access + refresh

### Token refresh
- `POST /api/auth/refresh/` (SimpleJWT)

### Auth mechanism
- DRF default authentication:
  - `JWTAuthentication` (`backend/bookexchange/settings.py`)
- Frontend stores tokens in `localStorage` keys:
  - `access`, `refresh`

### Role permissions
- `books/permissions.py`:
  - `IsAdminUser`: `role == 'admin'` (or `is_superuser`)
  - `IsLibrarianUser`: `role == 'librarian'`
  - `IsNormalUser`: `role == 'user'`
  - `CanManageStock`: allows `admin` or `librarian`

---

## 9. Role-Based System

### Admin abilities
- Can list/create/manage users (`UserListView`, `UserDetailView`)
- Can manage items (create/update/delete books) via `CanManageStock`
- Receives notifications generated from reviews

### User abilities
- Can browse items (`GET /books/`)
- Can view own items (`GET /my-books/`)
- Can create exchange requests (outgoing requests)
- Can create reviews (authenticated)
- Receives notifications and can update them

### Moderator/Librarian abilities
- Librarian role is treated as “staff who can manage items” using `CanManageStock`

### Backend restrictions (key checks)
- Exchange status update only when user is the `receiver` (`ExchangeRequestDetailView.patch`)
- Item modifications require `CanManageStock`

### Frontend UI rendering (role-based)
- React uses `ProtectedRoute` and `RoleProtectedRoute` components and `AuthContext`.
- Axios interceptor uses JWT and refreshes on `401`.

---

## 10. Templates & Frontend

This repo primarily uses React for UI.
- `frontend/index.html`: mounts React app (`/src/main.jsx`).

Role-based UI is typically done in:
- `frontend/src/components/RoleProtectedRoute.jsx` (mentioned in structure)

---

## 11. Static & Media Files

Settings in:
- `backend/bookexchange/settings.py`

- `STATIC_URL = '/static/'`
- `STATIC_ROOT = <BASE_DIR>/staticfiles`
- `MEDIA_URL = '/media/'`
- `MEDIA_ROOT = <BASE_DIR>/media`

Uploads:
- `User.profile_picture` → `upload_to='profile_pics/'`
- `Book.image` → `upload_to='book_covers/'`

---

## 12. JavaScript Features (frontend)

From `frontend/src/services/api.js`:
- **Auth header injection**: adds `Authorization: Bearer <access>` to each request
- **Auto token refresh**: on `401`, calls `/api/auth/refresh/` then retries
- **Global error toasts**: toast errors for 403/404/5xx and network failures

(Other UI behaviors like search/filter/image preview/delete confirmation exist in React components and modals.)

---

## 13. Request Flow (short)

### Standard flow
Browser → URL (Django routing) → DRF View → Model ORM → Serializer → JSON Response

### Login → dashboard → create item
- Login:
  - Browser → `POST /api/auth/login/` → JWT returned
- Dashboard:
  - Frontend stores `access` token
- Create Item:
  - `POST /api/books/` with JWT
  - View saves `Book.owner = request.user`

---

## 14. Validation & Security

### CSRF
- DRF API uses JWT; CSRF is not the primary control for token-based requests.

### Password hashing
- `UserSerializer.create/update` uses `instance.set_password(...)`

### Serializer validation
- `BookCreateSerializer` validates:
  - category exists
  - title/author are non-empty
- `RegisterSerializer` validates:
  - password match
  - email format + uniqueness

### Role-based access control
- `CanManageStock` for book write/delete
- `IsAdminUser` for user management
- Receiver-only exchange status update

### Error handling
- `books/exceptions.py`: standardized error response format


---

## 15. PostgreSQL Usage

Configured in:
- `backend/bookexchange/settings.py` `DATABASES['default']`

What it enables here:
- Normalized relational tables:
  - `Book` references `User` and `Category`
  - `ExchangeRequest` references `User` + `Book` multiple times
- Constraints:
  - `User.email` unique
  - `ExchangeRequest` `unique_together=['sender','book_from','book_to']`

---

## 16. Testing Guide (Postman / manual)

### Postman API testing
1. Register a user:
   - `POST /api/auth/register/`
2. Login:
   - `POST /api/auth/login/`
3. Call protected endpoints with `Authorization: Bearer <access>`

### Role testing
- Create accounts with roles:
  - admin/librarian should be able to `POST/PATCH/DELETE /api/books/`
  - user can only browse, manage own books, send exchanges, create reviews

### Authentication testing
- Verify `401` triggers frontend refresh logic
- Verify `403` occurs when role checks fail (e.g., normal user trying to create a book)

---

## 17. Viva Questions & Answers (short)

### ORM
**Q:** What is the role of `ForeignKey` in this project?
**A:** Links entities like `Book→Category` and `Book→User` so queries and integrity are handled at DB level.

### DRF
**Q:** Why use `Serializer` classes?
**A:** They validate input and control how model instances become API-safe JSON.

**Q:** Why `ListCreateAPIView`?
**A:** To support both listing and creating with consistent DRF patterns.

### Models
**Q:** What does `unique_together` do in `ExchangeRequest`?
**A:** Prevents duplicate exchange requests for the same sender/book_from/book_to.

### Serializers
**Q:** Why `BookCreateSerializer.validate_category`?
**A:** Avoids creating a book with a non-existent category.

### Authentication
**Q:** Why JWT?
**A:** Stateless auth: tokens are used for API calls and refreshes extend sessions.

### APIs
**Q:** How are errors standardized?
**A:** Custom DRF exception handler rewrites responses to `{success:false, error:"..."}`.

### PostgreSQL
**Q:** Why is unique email important?
**A:** Ensures one-to-one account mapping and prevents login ambiguity.

### Permissions
**Q:** Where do role checks happen?
**A:** In `books/permissions.py` and per-view `permission_classes` plus additional receiver check in `ExchangeRequestDetailView.patch`.

### Templates
**Q:** What UI tech is used?
**A:** React (mounted by `frontend/index.html`), not Django server templates.

### Static files
**Q:** Where do static/media paths come from?
**A:** `STATIC_URL/STATIC_ROOT` and `MEDIA_URL/MEDIA_ROOT` in `backend/bookexchange/settings.py`.

