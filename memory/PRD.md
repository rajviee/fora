# ForaTask Enhancement - Product Requirements Document

## Project Overview
ForaTask is a comprehensive task and workforce management system with a Node.js backend and React Native mobile app. This enhancement adds a web frontend for administration and extends existing features.

## Original Problem Statement
Enhance Foratask by extending the existing architecture with:
1. Chat (same organization only) - Real-time via existing WebSocket
2. Attendance - Geotag-based check-in/out with 200m geofence
3. Tasks - Multi-location support, remote task flag, status updates
4. Timeline & Discussion - Chronological activity, comments with tagging
5. Viewer Approval - Per-location and full task approval
6. Admin Employee Page - Tasks, attendance, salary breakdown
7. Salary Module - Admin-defined components, attendance-based calculation

## User Personas

### Admin (Rajvi)
- Full access to all features
- Can manage employees, salary, organization settings
- Can create/assign/approve tasks
- Views all employee analytics

### Supervisor (Shubh)
- Can create and assign tasks to subordinates
- Can view assigned employees' attendance and tasks
- Limited admin capabilities

### Employee (Tushar)
- Can view assigned tasks and update status
- Can mark attendance (check-in/out)
- Can participate in chat
- Can add comments/discussions on tasks

## Core Requirements (Completed)

### Authentication
- [x] JWT-based authentication
- [x] Role-based access control (Admin, Supervisor, Employee)
- [x] Seed data with 3 users

### Tasks Module
- [x] Task creation with multi-location support
- [x] Remote task toggle (auto if org default)
- [x] Add/remove location controls
- [x] Task status management (Pending, In Progress, Completed, For Approval)
- [x] Doer and Viewer assignment
- [x] Task filtering (All, Assigned, Created, Viewing)

### Attendance Module
- [x] Check-in with geotag
- [x] Check-out (EOTD) with geotag
- [x] Monthly calendar view
- [x] Working days configuration
- [x] 200m office geofence support

### Chat Module
- [x] Direct messaging
- [x] Group chat support
- [x] Real-time via WebSocket
- [x] File attachments support

### Admin Features
- [x] Employee list with stats
- [x] Employee detail with attendance/tasks/salary tabs
- [x] Organization settings management
- [x] Working days configuration
- [x] Office locations with geofence radius

### Salary Module
- [x] Basic salary configuration
- [x] Salary components (earnings/deductions)
- [x] Standard deductions (PF, Professional Tax)
- [x] Attendance-based calculation

## What's Been Implemented (Feb 26, 2026)

### Backend Enhancements
- Added admin employee analytics endpoints (/admin/employee/:id/attendance, tasks, salary)
- Added monthly-stats endpoint for attendance
- Updated seed data script for Varient Worldwide

### Frontend (New React App)
- Complete web application at /app/frontend
- All pages: Dashboard, Tasks, AddTask, TaskDetail, Attendance, Chat, Employees, EmployeeDetail, Salary, Settings
- Responsive layout with sidebar navigation
- Light theme with primary color #1360C6

## Technical Architecture

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Socket.io for real-time
- JWT authentication
- Port: 3333 (proxied via FastAPI at 8001)

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Socket.io-client for real-time
- Recharts for charts
- Lucide React for icons
- Port: 3000

### Database Collections
- users, companies, subscriptions
- tasks, taskLocations, taskTimeline, taskDiscussions
- attendance, organizationSettings
- chatRooms, chatMessages
- salaryConfig, salaryRecord

## Seed Data
- Company: Varient Worldwide
- Admin: rajvi@varientworld.com / Rajvi@123
- Supervisor: shubh@varientworld.com / Shubh@123
- Employee: tushar@varientworld.com / Tushar@123

## Backlog / Future Enhancements

### P0 - Critical
- [ ] Timeline endpoint implementation for task detail
- [ ] Discussion endpoint implementation with @mentions

### P1 - High Priority
- [ ] Holiday calendar management
- [ ] Leave request workflow
- [ ] Task documents upload
- [ ] Push notifications

### P2 - Medium Priority
- [ ] Bulk task assignment
- [ ] Attendance reports export
- [ ] Salary slip generation
- [ ] Employee performance metrics

### P3 - Nice to Have
- [ ] Dark mode toggle
- [ ] Custom dashboard widgets
- [ ] Integration with calendar apps
- [ ] Mobile-responsive optimizations

## Next Action Items
1. Implement task timeline and discussion API endpoints
2. Add @mention functionality in discussions
3. Test with React Native mobile app compatibility
4. Add comprehensive error handling
5. Implement leave management workflow
