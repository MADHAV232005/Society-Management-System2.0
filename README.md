# Society Management System

A centralized, enterprise-grade residential society management platform engineered to replace manual paper registers, ad-hoc spreadsheets, fragmented communication, and disconnected administrative workflows. Built with a **React + TypeScript + Vite** frontend and a **Python + Django REST Framework (DRF)** backend with **Role-Based Access Control (RBAC)** and **JWT authentication**.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [API Overview](#api-overview)
- [Security Architecture](#security-architecture)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Demo Credentials](#demo-credentials)
- [Testing and Verification](#testing-and-verification)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Author](#author)
- [Project Purpose](#project-purpose)
- [Portfolio & Resume Summary](#portfolio--resume-summary)

---

## Overview

Managing housing societies, apartment complexes, and gated communities traditionally involves manual entry in physical logbooks, manual calculation of monthly maintenance dues, untracked resident grievances, and disorganized visitor records. 

The **Society Management System** provides a single, unified digital hub that coordinates all daily residential operations:
- **Flats & Resident Records**: Structured tracking of wings, units, owner/tenant profiles, and contact registries.
- **Financial Operations**: Automated maintenance bill generation, multi-mode payment recording (UPI, NEFT, Card, Cash, Cheque), real-time outstanding balance calculation, and digital receipt generation.
- **Complaint Management**: End-to-end ticketing workflow (Open → In Progress → Resolved → Closed) with priority levels, staff assignments, resolution remarks, and status change audit trails.
- **Gate & Visitor Control**: Digital security logbook for guests, delivery personnel, cabs, and service providers with check-in/out timestamps, vehicle numbers, and resident pre-approval.
- **Society Governance**: Digital notice board for broadcast circulars, society expense ledger, document vault (Bylaws, AGM Minutes, Audit Statements), staff registry, and comprehensive audit logs.

---

## Key Features

- **JWT Authentication**: Secure login flow with access and refresh tokens, automatic session resumption, and token refresh handling.
- **Role-Based Access Control (RBAC)**: Strict separation of privileges across four distinct roles (`SUPER_ADMIN`, `COMMITTEE`, `RESIDENT`, and `SECURITY`).
- **Interactive Dashboard**:
  - Occupancy percentage and flat distribution metrics.
  - Financial overview (Total Billed, Total Collected, Pending Dues).
  - Active complaints and live gate status (Visitors currently inside).
  - Priority notice alerts and role-scoped quick-action shortcuts.
- **Flats & Wings Management**: Multi-wing configuration with floor levels, square footage, occupancy status, and flat directory.
- **Resident Directory**: Granular records distinguishing owners and tenants, tracking lease dates, contact information, and flat mappings.
- **Maintenance Billing & Invoicing**:
  - Scheduled billing cycles (Monthly, Quarterly, Annual).
  - Itemized charges (Base Maintenance, Utility Surcharge, Sinking Fund, Late Fee Penalties).
  - Due date tracking with automatic overdue status transitions.
- **Payments & Receipts**:
  - Support for partial and full balance settlements.
  - Multiple payment instruments: UPI, Net Banking (NEFT/RTGS), Credit/Debit Card, Cheque, and Cash.
  - Auto-generated receipt numbers linked directly to billing invoices.
- **Complaints & Grievance Redressal**:
  - Categorization across Plumbing, Electrical, Lift/Elevator, Carpentry, Housekeeping, Noise, and General.
  - Priority classification: Low, Medium, High, Urgent.
  - Assignment to dedicated maintenance staff members.
  - Complete status transition history with remarks and resolution notes.
- **Visitor & Gatehouse Management**:
  - Live gate register tracking entries, exits, vehicle numbers, and destination flats.
  - Pass codes and purpose classification (Guest, Delivery, Cab, Vendor, Service).
  - Resident self-service pre-authorization.
- **Notices & Circulars**:
  - Priority broadcasting (High, Normal, Low) with pinned announcement capability.
  - Expiry date management to prevent outdated notices from cluttering the board.
- **Society Expense Tracking**:
  - Detailed ledger for operational outflows (Repairs, Security, Landscaping, Electricity, Sanitation).
  - Payment vouchers, reference IDs, and vendor records.
- **Staff & Vendor Directory**:
  - Registry of facility personnel (Security Guards, Electricians, Plumbers, Housekeeping).
  - Shift schedules, contact numbers, and active status toggling.
- **Document Repository**:
  - Centralized archive for society documents (Bylaws, Audited Financial Statements, AGM Minutes, Safety Guidelines).
  - Categorized access with direct download links.
- **Notifications & Activity Alerts**:
  - Alerts for bill generation, payment receipt acknowledgments, visitor arrivals, and urgent society notices.
- **Immutable Audit Logging**:
  - System-wide event logging recording the actor, action type (CREATE, UPDATE, DELETE), model target, IP address, and timestamp.
- **HTTP 403 Permission Handling**:
  - Client-side interceptor that detects forbidden API actions and renders an informative feedback banner displaying the restricted endpoint without breaking the application state.

---

## Role-Based Access Control (RBAC)

The system strictly enforces permissions on both the **Django REST backend** (via custom DRF permission classes) and the **React frontend** (via role-filtered navigation and conditional action controls):

| Module / Feature | SUPER_ADMIN | COMMITTEE | RESIDENT | SECURITY |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Full society overview | Operational overview | Personal flat overview | Gate & notice overview |
| **Society & Wings** | Create / Edit / Delete | View only | View only | No access |
| **Flats & Inventory** | Create / Edit / Delete | View / Update | View assigned unit | No access |
| **Resident Directory** | Full CRUD | Full CRUD | View contact directory | No access |
| **Maintenance Bills** | Generate / Void / Edit | Generate / View | View own flat bills | No access |
| **Payment Recording** | Record / Settle / Audit | Record / Settle | Submit payment for dues | No access |
| **Receipts** | Full access | Full access | View own receipts | No access |
| **Complaints** | Full management | Assign & Resolve | Lodge & track own | No access |
| **Visitor Gate Pass** | Full access | Full access | Pre-register for flat | Check-in / Check-out |
| **Notices & Circulars**| Post / Pin / Delete | Post / Pin / Delete | Read notices | Read notices |
| **Staff & Vendors** | Manage / Assign | Manage / Assign | Directory view | View team |
| **Expense Ledger** | Log / Edit / Review | Log / Review | No access | No access |
| **Document Vault** | Upload / Delete | Upload / Delete | Download public docs | No access |
| **Audit Logs** | Full visibility | View operational logs | No access | No access |

---

## Technology Stack

### Frontend
- **Framework**: React 19 (`^19.0.0`)
- **Language**: TypeScript (`^5.7.3`)
- **Build Tool**: Vite (`^6.2.0`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite ^4.0.9`, `tailwindcss ^4.0.9`)
- **Utility Libraries**: `clsx`, `tailwind-merge`
- **Icons**: Lucide React (`^1.16.0`)
- **State Management**: React custom hooks & context store (`src/store.ts`)
- **API Client**: Modular REST client with JWT Bearer authorization and token refresh logic (`src/services/api.ts`)

### Backend
- **Framework**: Django 5.2 (`5.2.17`)
- **API Engine**: Django REST Framework (DRF 3.18.1)
- **Authentication**: `djangorestframework-simplejwt` (5.5.1) (JWT Token Authentication)
- **CORS Support**: `django-cors-headers` (4.9.0)
- **Architecture**: Modular Django apps (`accounts`, `society`, `billing`, `complaints`, `visitors`, `notices`, `expenses`, `staff`, `documents`, `notifications`, `auditlogs`, `reports`)

### Database
- **Active Database**: SQLite (`db.sqlite3`) configured via `django.db.backends.sqlite3` in `config/settings.py`.
*(Note: PostgreSQL is not configured or connected in the current codebase; it is listed as a potential production enhancement.)*

---

## System Architecture

The application implements a decoupled, full-stack client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│             React 19 + TypeScript Client               │
│       (Vite Dev / Static SPA Production Bundle)        │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (Port 3000)
                           │ Bearer JWT in Auth Headers
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Vite Reverse Proxy                   │
│    Routes `/api/*`, `/admin/*`, `/media/*` to Backend   │
└──────────────────────────┬─────────────────────────────┘
                           │ Proxied Requests (Port 8001)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Django REST Framework Backend              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ JWT Authentication Middleware (SimpleJWT)        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Custom RBAC Permission Classes                   │  │
│  │ (IsSuperAdmin, IsCommitteeOrSuperAdmin, etc.)    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Modular ModelViewSets & Business Logic           │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │ Django ORM
                           ▼
┌────────────────────────────────────────────────────────┐
│                Database Storage Layer                  │
│               SQLite Engine (db.sqlite3)               │
└────────────────────────────────────────────────────────┘
```

### Request Lifecycle & Authorization
1. **User Authentication**: Client sends user credentials to `/api/auth/login/` (or alias `/api/token/`). The server verifies credentials and returns a JWT access token and refresh token.
2. **Authenticated Requests**: All subsequent API calls automatically attach the Bearer token in the `Authorization` header.
3. **Token Refresh**: If the access token expires (HTTP 401), the API client intercepts the error, calls `/api/auth/refresh/` (or `/api/token/refresh/`), and retries the original request seamlessly.
4. **Backend Authorization**: ViewSets invoke custom permission classes (`accounts/permissions.py`) to validate role clearance before executing database queries.
5. **Access Denied Handling**: If an action violates permissions, DRF returns HTTP 403 Forbidden. The client catches this and displays a non-blocking UI alert with endpoint context.

---

## API Overview

All REST API endpoints are registered under `/api/` (with admin at `/admin/`) and return standard JSON responses.

### 1. Administration & Authentication (`accounts`)
- `GET /admin/` - Django Admin panel.
- `POST /api/auth/login/` (and alias `/api/token/`) - Authenticate credentials, returns JWT access & refresh tokens.
- `POST /api/auth/refresh/` (and alias `/api/token/refresh/`) - Exchange refresh token for a fresh access token.
- `GET /api/auth/me/` - Retrieve current authenticated user profile, active role, and resident metadata.
- `GET|POST /api/users/` - List users and create new user accounts.
- `GET|PUT|PATCH|DELETE /api/users/{id}/` - Retrieve, update, or remove user account.

### 2. Society & Infrastructure (`society`)
- `GET|POST /api/societies/` - Society profile and registration details.
- `GET|POST /api/wings/` - Wing definitions.
- `GET|POST /api/flats/` - Unit records, occupancy, and floor data.
- `GET|POST /api/residents/` - Resident profiles linked to flats and user accounts.

### 3. Billing & Payments (`billing`)
- `GET|POST /api/maintenance-bills/` - Maintenance bills, pending dues, and overdue status.
- `GET|POST /api/payments/` - Payment transactions against bills with reference IDs.
- `GET /api/receipts/` - Generated payment receipts.

### 4. Complaints & Service Requests (`complaints`)
- `GET|POST /api/complaints/` - Submit and list grievances.
- `GET|PUT|PATCH|DELETE /api/complaints/{id}/` - Update complaint status, assign staff, add resolution notes.
- `GET /api/complaint-history/` - Audit history of status changes per complaint.

### 5. Gate & Security (`visitors`)
- `GET|POST /api/visitors/` - Gate log entries.
- `POST /api/visitors/{id}/check_out/` - Timestamp checkout for active visitors.

### 6. Notices & Circulars (`notices`)
- `GET|POST /api/notices/` - Society announcements with priority and pinning.
- `GET|PUT|DELETE /api/notices/{id}/` - Update or remove notices.

### 7. Expenses & Finance (`expenses`)
- `GET|POST /api/expenses/` - Society expenditure records with vouchers and categories.

### 8. Staff Management (`staff`)
- `GET|POST /api/staff/` - Service personnel and vendor registry.
- `POST /api/staff/{id}/toggle_status/` - Switch active/inactive employment state.

### 9. Documents Vault (`documents`)
- `GET|POST /api/documents/` - Uploaded bylaws, audit reports, and society meeting minutes.

### 10. Notifications, Reports & Audit (`notifications`, `reports`, `auditlogs`)
- `GET /api/notifications/` - User-specific alert stream.
- `GET /api/reports/` - Aggregate occupancy, billing collections, and complaint turnaround metrics.
- `GET /api/audit-logs/` - Immutable system activity audit log.

---

## Security Architecture

- **Stateless JWT Authentication**: Passwords are never stored on the client. Tokens are transmitted over HTTPS and validated per request.
- **Defense in Depth**: Authorization is enforced both at the Django ViewSet level (`permission_classes`) and the object level, ensuring a compromised frontend client cannot bypass database access restrictions.
- **Tenant & Resident Scoping**: Resident roles are restricted from querying records outside their assigned flat or accessing financial ledgers of other residents.
- **Audit Trails**: Critical operations (status changes, user creation, payments, and deletions) write records to `auditlogs_auditlog` capturing actor, target, timestamp, and remote IP address.
- **CORS Protection**: Whitelisted origin headers ensure external domains cannot make cross-origin requests to API endpoints.

---

## Project Structure

```
.
├── accounts/                  # User accounts, custom User model, JWT views, permissions
│   ├── management/commands/   # Database seeding scripts (seed_data.py)
│   ├── models.py              # Custom User model with Role choices
│   ├── permissions.py         # Custom DRF RBAC permission classes
│   ├── serializers.py         # User and profile serializers
│   └── views.py               # Auth and user ViewSets
├── auditlogs/                 # Activity logging and system mutation records
├── billing/                   # Maintenance bills, payments, and receipts
├── complaints/                # Complaints, priority workflows, and status history
├── config/                    # Django project root
│   ├── settings.py            # DRF, JWT, CORS, database, and app settings
│   ├── urls.py                # Main URL router and endpoint declarations
│   └── wsgi.py                # WSGI application entrypoint
├── documents/                 # Society document repository models and views
├── expenses/                  # Society operational expenditures tracking
├── notices/                   # Broadcast notices and circulars
├── notifications/             # System notification dispatch
├── reports/                   # Analytic aggregation endpoints
├── society/                   # Society, Wing, Flat, and Resident models
├── staff/                     # Facility staff and vendor management
├── visitors/                  # Gate visitor check-in/check-out logs
├── src/                       # React frontend source code
│   ├── components/            # UI components
│   │   ├── views/             # Module views (Dashboard, Billing, Complaints, ApiExplorer, etc.)
│   │   ├── LoginModal.tsx     # Role-testing & JWT authentication modal
│   │   ├── Navbar.tsx         # Top navigation bar with active user role badge
│   │   └── Sidebar.tsx        # Dynamic RBAC-scoped sidebar navigation
│   ├── services/
│   │   └── api.ts             # REST client with JWT interceptor and error handlers
│   ├── store.ts               # Global client state store
│   ├── types.ts               # TypeScript data models and role definitions
│   ├── App.tsx                # Main application component & route controller
│   ├── index.css              # Global styles with Tailwind CSS v4 import
│   └── main.tsx               # Frontend entrypoint
├── .env.example               # Example client environment variables
├── .gitignore                 # Version control exclusions
├── bun.lock                   # Lockfile
├── db.sqlite3                 # SQLite database
├── index.html                 # Single page application HTML entrypoint
├── manage.py                  # Django management CLI
├── metadata.json              # Application metadata and runtime configuration
├── package.json               # Node.js dependencies and build scripts
├── start_dev.sh               # Dual-server development bootstrapper
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite configuration with API, Admin, and Media proxying
```

---

## Installation and Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher
- **pip**: Python package installer

---

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd society-management-system
```

---

### Step 2: Backend Setup (Django & DRF)

#### On Linux / macOS:
```bash
# Create a Python virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install required Python packages
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt

# Run database migrations
python manage.py migrate

# Seed sample society records and test user accounts
python manage.py seed_data

# Start the Django API backend on port 8001
python manage.py runserver 127.0.0.1:8001
```

#### On Windows (PowerShell):
```powershell
# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# Install required Python packages
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt

# Run database migrations
python manage.py migrate

# Seed sample society records and test user accounts
python manage.py seed_data

# Start the Django API backend on port 8001
python manage.py runserver 127.0.0.1:8001
```

---

### Step 3: Frontend Setup (React & Vite)

In a separate terminal window:

```bash
# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be accessible at:
```
http://localhost:3000
```
*(Vite proxies all `/api/*` traffic automatically to the Django server running on port `8001`)*.

---

## Demo Credentials

The database comes pre-seeded with four role accounts for evaluation and testing:

| Role | Username | Password | Intended Test Workflow |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | `admin` | `admin123` | Complete administrative control, flat creation, and audit inspection |
| **COMMITTEE** | `committee` | `committee123` | Bill generation, staff management, expense logging, and notices |
| **RESIDENT** | `resident` | `resident123` | Flat A-101 portal: bill payments, complaint lodging, guest pre-passes |
| **SECURITY** | `security` | `security123` | Gatehouse kiosk: visitor check-in/out and society notices |

*To switch accounts in the running UI, click the user badge in the navigation bar to launch the authentication modal.*

---

## Testing and Verification

Verify the codebase using the built-in validation commands:

### 1. TypeScript & Type Checking
```bash
npm run lint
```
*Executes `tsc --noEmit` to verify type safety across all React components, API services, and state stores.*

### 2. Frontend Production Build
```bash
npm run build
```
*Executes the Vite production compilation and bundles optimized static assets.*

### 3. Django Backend Health Check
```bash
python manage.py check
```
*Validates Django configuration, installed apps, models, database schemas, and URL route registrations.*

---

## Screenshots

<!-- Add screenshots here after generating deployment previews -->

| Dashboard Overview | Maintenance & Billing |
| :---: | :---: |
| *Dashboard with occupancy, collections, and live alerts* | *Invoicing, dues tracking, and payment recording* |

| Complaint Redressal | Gate & Visitor Registry |
| :---: | :---: |
| *Grievance ticketing and resolution tracking* | *Digital visitor pass and security check-in/out* |

---

## Future Enhancements

- [ ] **Production Deployment**: Containerized deployment with Docker Compose and production Nginx reverse proxy.
- [ ] **PostgreSQL Database**: Transitioning the Django backend from SQLite to a managed PostgreSQL instance for production scale.
- [ ] **Automated Notifications**: Direct integration with SMS gateways (Twilio) and email services (SendGrid) for dues reminders and visitor alerts.
- [ ] **Payment Gateway Integration**: Direct payment collection via Razorpay or Stripe for automated dues settlement.
- [ ] **Exportable Financial Reports**: PDF generation for payment receipts, audit balance sheets, and maintenance invoices.
- [ ] **Mobile Progressive Web App (PWA)**: Offline-first capability for security guard visitor registration at entry gates.

---

## Author

**S. Madhav**  
Full-Stack Developer

---

## Project Purpose

This application was developed to demonstrate end-to-end full-stack software engineering capabilities, specifically:
- **RESTful API Engineering**: Designing modular, maintainable endpoints using Django REST Framework and Django ORM.
- **Enterprise Access Control**: Architecting real-world Role-Based Access Control (RBAC) enforced consistently across both client and server boundaries.
- **Complex Relational Modeling**: Structuring interconnected entities (Flats, Residents, Billing Cycles, Payments, Grievance Histories, Audit Trails).
- **State Management & UX Design**: Building responsive, role-adaptive user interfaces in React 19 and TypeScript with zero third-party UI component bloat.
- **Production Readiness**: Writing clean, type-safe, and lint-checked code equipped with comprehensive error boundaries and token-refresh resilience.

---

## Portfolio & Resume Summary

> **Society Management System**: Architected and developed a full-stack society operations platform using **React 19**, **TypeScript**, **Tailwind CSS**, and **Django REST Framework**. Implemented JWT token authentication with automated refresh lifecycles and fine-grained Role-Based Access Control (RBAC) across four user roles (`SUPER_ADMIN`, `COMMITTEE`, `RESIDENT`, and `SECURITY`). Engineered end-to-end modules for maintenance invoicing, multi-instrument payment settlements, complaint ticketing with audit histories, gatehouse visitor tracking, and immutable system audit logging. Designed a clean, decoupled architecture backed by custom DRF permission classes, strict frontend route boundaries, and HTTP 403 error interceptors.
