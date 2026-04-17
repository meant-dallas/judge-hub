# JudgeHub - Task List

A Next.js judging application with Google authentication, three user personas (Admin, Coordinator, Judge), and Google Sheets backend. Events are the top-level entity with three sub-sections: Participants, Criteria, and Judges. Judges are users with the Judge role and are assigned at the event level (they judge all participants in that event).

## Phase 1: Project Setup & Foundation

- [x] Initialize Next.js project with TypeScript
- [x] Set up project structure (app router recommended)
- [x] Configure Tailwind CSS or preferred styling solution
- [x] Set up ESLint and Prettier
- [x] Create .env.local template with required environment variables
- [x] Initialize Git repository (if not already done)
- [x] Create README.md with project overview

## Phase 2: Authentication & User Management

- [x] Set up NextAuth.js for authentication
- [x] Configure Google OAuth provider
- [ ] Create Google Cloud Console project and OAuth credentials
- [x] Set up authentication callbacks and session handling
- [x] Create user role management system (Admin, Coordinator, Judge)
- [x] Build protected route middleware based on user roles
- [x] Create login page with Google Sign-In button
- [x] Implement logout functionality
- [x] Create user profile page

## Phase 3: Google Sheets Integration

- [x] Set up Google Sheets API access
- [x] Create service account and download credentials
- [x] Set up Google Sheets client library
- [x] Create API routes for Google Sheets operations (read/write)
- [x] Design Google Sheets schema for:
  - Users and roles
  - Judging criteria/rubrics
  - Scores and evaluations
  - Participants (individuals/teams)
- [x] Implement data validation and error handling
- [x] Create helper functions for common Sheets operations

## Phase 4: Database Schema & Data Models

- [x] Define TypeScript interfaces/types for:
  - User (with role)
  - Participant (individual/team entered into an event)
  - Judging Criteria
  - Score/Evaluation
  - Event/Competition
- [x] Create data validation schemas (Zod recommended)
- [ ] Set up initial Google Sheets with proper structure

## Phase 5: Admin Dashboard

- [x] Create admin dashboard layout
- [x] Build user management interface (admin only):
  - View all users
  - Assign/modify user roles (admin, coordinator, judge)
  - Deactivate users
- [x] Build event management (admin only):
  - Create new events
  - Edit event details (name, date, description)
  - Archive/delete events
- [ ] Build event sub-pages (admin + coordinator):
  - **Participants tab**: add/edit/remove participants (individuals or teams) in an event
  - **Criteria tab**: add/edit/remove judging criteria for an event
  - **Judges tab**: assign/remove judges for an event (from users with Judge role); judges are assigned at the event level and judge all participants
- [ ] Create reports and analytics view
- [ ] Export functionality (CSV, PDF)

## Phase 6: Coordinator Interface

- [x] Create coordinator dashboard layout
- [x] Build event list view (read-only, coordinators cannot create events)
- [ ] Build event sub-pages (shared with admin):
  - **Participants tab**: add/edit/remove participants within an event
  - **Criteria tab**: add/edit/remove judging criteria for an event
  - **Judges tab**: assign/remove judges for an event (from users with Judge role)
- [x] Build event progress tracking:
  - View all participants in an event
  - Monitor judging status per participant (submitted vs pending per judge)
- [ ] Create real-time progress dashboard
- [ ] Generate interim reports

## Phase 7: Judge Interface

- [ ] Create judge dashboard layout
- [ ] Build assigned events view (events the judge has been assigned to)
- [ ] Build participants list per event (all participants the judge must score)
- [ ] Create judging form per participant:
  - Dynamic criteria based on event
  - Score input fields per criterion
  - Comments/feedback section
  - Save draft functionality
  - Submit final scores
- [ ] Implement validation (prevent duplicate scoring)
- [ ] Create judging history view
- [ ] Show judging progress/completion status per event

## Phase 8: Core Features

- [ ] Implement role-based access control (RBAC)
- [ ] Create notification system (email or in-app)
- [ ] Build conflict of interest handling
- [ ] Implement score normalization/calibration
- [ ] Create leaderboard/results view
- [ ] Add search and filter functionality
- [ ] Implement pagination for large datasets

## Phase 9: UI/UX Polish

- [ ] Design consistent layout and navigation
- [ ] Create loading states and skeletons
- [ ] Implement error boundaries and error pages
- [ ] Add toast notifications for user actions
- [ ] Ensure mobile responsiveness
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Create help/documentation pages

## Phase 10: Testing

- [ ] Write unit tests for utility functions
- [ ] Write integration tests for API routes
- [ ] Test authentication flows
- [ ] Test role-based access control
- [ ] Test Google Sheets integration
- [ ] Perform end-to-end testing
- [ ] Test across different browsers
- [ ] Mobile device testing

## Phase 11: Deployment & DevOps

- [ ] Set up Vercel project
- [ ] Configure environment variables in Vercel
- [ ] Set up production Google OAuth credentials
- [ ] Configure production Google Sheets API access
- [ ] Set up custom domain (if applicable)
- [ ] Configure deployment settings and build optimization
- [ ] Set up monitoring and error tracking (Sentry/LogRocket)
- [ ] Create deployment documentation

## Phase 12: Documentation & Handoff

- [ ] Write user documentation for each persona
- [ ] Create admin guide for setup and configuration
- [ ] Document API endpoints
- [ ] Create troubleshooting guide
- [ ] Document Google Sheets schema
- [ ] Create video tutorials (optional)

## Future Enhancements (Optional)

- [ ] Add real-time collaboration features
- [ ] Implement advanced analytics and insights
- [ ] Add multi-language support
- [ ] Create mobile app version
- [ ] Implement offline support with sync
- [ ] Add integration with other platforms (Slack, Discord)
- [ ] Implement automated judge assignment algorithms
- [ ] Add rubric templates library

## Notes

- Events have three sub-sections: Participants, Criteria, and Judges
- Judges are users with the Judge role; they are assigned at the event level and automatically judge all participants in that event
- Coordinators can manage Participants, Criteria, and Judges within events but cannot create events
- Priority should be given to core authentication and role management first
- Google Sheets integration should be tested thoroughly with rate limiting in mind
- Consider caching strategies for frequently accessed data
- Ensure data privacy and security compliance
- Plan for scalability (consider if Google Sheets will handle expected load)
