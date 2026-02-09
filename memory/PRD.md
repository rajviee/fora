# ForaTask PRD - Product Requirements Document

## Original Problem Statement
Implementation of critical features for ForaTask, a multi-tenant SaaS task management application, including:
1. SaaS Model with Razorpay payment gateway
2. Recurring Tasks with completion history
3. Master Admin Panel
4. Marketing Website with SEO

## Architecture

### Tech Stack
- **Backend**: Node.js, Express, MongoDB
- **Frontend (Mobile)**: React Native (Expo)
- **Admin Panel**: React + Vite + TailwindCSS
- **Marketing Website**: Next.js 14 + TailwindCSS
- **Payment Gateway**: Razorpay

### Service Architecture
```
/app/foratask-backend (Port 3000) - Main API
/app/foratask-admin (Port 3001) - Master Admin Panel
/app/foratask-marketing (Port 3002) - Marketing Website
/app/foratask-frontend - Mobile App (React Native)
```

## User Personas

### 1. Company Admin
- Registers company and manages subscription
- Full access to all tasks, users, and settings
- Read-only access when subscription expires

### 2. Supervisor
- Manages team tasks
- Can approve task completions
- Blocked when subscription expires

### 3. Employee
- Works on assigned tasks
- Creates self-tasks
- Blocked when subscription expires

### 4. Master Admin
- Platform-wide access
- Manages all companies and subscriptions
- Can restrict/unrestrict companies
- Views analytics and revenue data

## Core Requirements

### Subscription System
- 90-day free trial (no credit card required)
- Base plan: ₹249/month for 5 users
- Additional users: ₹50/user/month
- Billing anchored to signup date
- No partial month refunds

### Recurring Tasks
- Schedules: Daily, Weekly, Monthly, 3-Months
- Completion history preserved across cycles
- Auto-reset at midnight
- Notification rescheduling on reset

### Master Admin Features
- Dashboard with KPIs (MRR, churn, conversion)
- Company management (view, restrict, extend trial)
- Payment tracking and reporting
- Full data access across all companies

## What's Been Implemented (February 2026)

### Priority 1: SaaS Model ✅
- [x] Subscription model with trial/active/expired/cancelled states
- [x] Payment model for invoice tracking
- [x] Razorpay integration (placeholder keys - ready for production)
- [x] Usage-based pricing calculator
- [x] Subscription middleware for access control
- [x] Pre-expiry notifications (7, 3, 1 day alerts)
- [x] Auto-subscription cancellation on company deletion
- [x] Billing anchor date logic

### Priority 2: Recurring Tasks ✅
- [x] TaskCompletionHistory model
- [x] Completion history tracking on task completion
- [x] Enhanced cron job preserving history before reset
- [x] API endpoint for viewing task completion history
- [x] Statistics (on-time %, avg days overdue)

### Priority 3: Master Admin Panel ✅
- [x] MasterAdmin model with separate JWT auth
- [x] Dashboard with platform statistics
- [x] Companies list with search and filter
- [x] Company details with full data access
- [x] Extend trial functionality
- [x] Restrict/Unrestrict companies
- [x] Revenue analytics
- [x] React admin UI with TailwindCSS

### Priority 4: Marketing Website ✅
- [x] Next.js 14 marketing site
- [x] Homepage with hero, features, testimonials
- [x] Features page
- [x] Pricing page with interactive calculator
- [x] Two-step signup flow
- [x] Login page
- [x] About and Contact pages
- [x] Legal pages (Privacy, Terms, Refund)
- [x] SEO optimized with meta tags and JSON-LD

## Prioritized Backlog

### P0 (Critical)
- [ ] Configure production Razorpay keys
- [ ] Deploy marketing website
- [ ] Set up email service (SMTP) for notifications

### P1 (High Priority)
- [ ] Webhook signature verification testing
- [ ] Invoice PDF generation
- [ ] Email templates for subscription notifications
- [ ] Mobile app subscription management screens

### P2 (Medium Priority)
- [ ] Master admin audit logs UI
- [ ] Export reports to CSV/PDF
- [ ] Multi-language support
- [ ] Custom branding for enterprise

### P3 (Low Priority)
- [ ] API rate limiting on payment endpoints
- [ ] Stripe alternative payment gateway
- [ ] Advanced analytics (cohort analysis)

## Next Tasks
1. Configure production Razorpay credentials
2. Deploy marketing website to Vercel
3. Set up transactional email service
4. Create mobile app subscription management UI
5. Add webhook security testing

## API Endpoints Added

### Payment Routes (`/payment`)
- `GET /calculate-price` - Price calculator
- `POST /create-order` - Create Razorpay order
- `POST /verify-payment` - Verify payment signature
- `POST /create-subscription` - Create new subscription
- `PATCH /update-subscription` - Update user count
- `POST /cancel-subscription` - Cancel subscription
- `GET /subscription-status` - Get current status
- `GET /invoice-history` - Get payment history
- `POST /webhook` - Razorpay webhook handler

### Master Admin Routes (`/master-admin`)
- `POST /login` - Admin authentication
- `GET /profile` - Admin profile
- `GET /dashboard` - Platform statistics
- `GET /companies` - List all companies
- `GET /companies/:id` - Company details
- `POST /companies/:id/restrict` - Restrict company
- `POST /companies/:id/unrestrict` - Unrestrict company
- `POST /companies/:id/extend-trial` - Extend trial
- `GET /payments` - All payments
- `GET /analytics/revenue` - Revenue analytics

### Task Routes (Updated)
- `GET /task/:id/history` - Get task completion history

## Environment Variables Added

```bash
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# Subscription Settings
BASE_PLAN_PRICE=249
PER_USER_PRICE=50
BASE_PLAN_USER_LIMIT=5
FREE_TRIAL_DAYS=90

# Master Admin
MASTER_ADMIN_JWT_SECRET=xxx
MASTER_ADMIN_DEFAULT_EMAIL=admin@foratask.com
MASTER_ADMIN_DEFAULT_PASSWORD=Varient23@123
```

## Database Models Added

1. **Subscription** - `/models/subscription.js`
2. **Payment** - `/models/payment.js`
3. **MasterAdmin** - `/models/masterAdmin.js`
4. **TaskCompletionHistory** - `/models/taskCompletionHistory.js`

---
*Last Updated: February 9, 2026*
