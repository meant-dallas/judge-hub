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
- [x] Build event sub-pages (admin + coordinator):
  - **Participants tab**: add/edit/remove participants (individuals or teams) in an event
  - **Criteria tab**: add/edit/remove judging criteria for an event
  - **Judges tab**: assign/remove judges for an event (from users with Judge role); judges are assigned at the event level and judge all participants
- [ ] Create reports and analytics view
- [ ] Export functionality (CSV, PDF)

## Phase 6: Coordinator Interface

- [x] Create coordinator dashboard layout
- [x] Build event list view (read-only, coordinators cannot create events)
- [x] Build event sub-pages (shared with admin):
  - **Participants tab**: add/edit/remove participants within an event
  - **Criteria tab**: add/edit/remove judging criteria for an event
  - **Judges tab**: assign/remove judges for an event (from users with Judge role)
- [x] Build event progress tracking:
  - View all participants in an event
  - Monitor judging status per participant (submitted vs pending per judge)
- [ ] Create real-time progress dashboard
- [ ] Generate interim reports

## Phase 7: Judge Interface

- [x] Create judge dashboard layout
- [x] Build assigned events view (events the judge has been assigned to)
- [x] Build participants list per event (all participants the judge must score)
- [x] Create judging form per participant:
  - Dynamic criteria based on event
  - Score input fields per criterion
  - Comments/feedback section
  - Save draft functionality
  - Submit final scores
- [x] Implement validation (prevent duplicate scoring)
- [x] Show judging progress/completion status per event

## Phase 7a: Live Judging Session

This phase adds a real-time "live judging" flow driven by the coordinator. The coordinator controls which participant is currently being presented; judges see only that participant and submit scores before advancing.

### Data layer
- [x] Add `active_participant_id` field to the Events sheet (nullable) — the participant currently being presented
- [x] Add `setActiveParticipantAction(eventId, participantId | null)` server action (coordinator/admin only)
- [x] Update `Event` type and `rowToEvent` mapper to include `active_participant_id`

### Coordinator — Participants tab changes
- [x] Add "Start Event" button on the Participants tab (visible when event is `active` status and no active participant is set); clicking sets the first participant as active and disables adding new participants
- [x] While an event is live (active participant set), disable the "Add Participant" button with a tooltip explaining the event is in progress
- [x] Each participant row gets a "Set as Presenting" button; clicking calls `setActiveParticipantAction` to make that participant active
- [x] When a new participant is set as presenting, the previously active participant's status is automatically updated to `complete`
- [x] Show a "Presenting" badge (e.g. pulsing green dot) on the currently active participant row
- [x] Add "End Session" button to clear the active participant and mark the event as `completed`

### Coordinator — Judges tab changes
- [x] Show a "Scoring Progress" section at the top of the Judges tab displaying the active participant name and how many judges have submitted scores for them
- [x] Show a per-judge submitted/pending badge next to each judge (updated whenever the page refreshes)
- [x] Add a "Next Participant" button; it becomes enabled only when all assigned judges have submitted scores for the current participant (or coordinator overrides)
- [x] Clicking "Next Participant" calls `setActiveParticipantAction` with the next participant in the list (ordered by row position); if no next participant, it ends the session

### Judge interface changes
- [x] On the judge's event page (`/judge/events/[id]`), show a prominent "Now Presenting" card when there is an active participant, with a "Score Now →" button linking to the scoring form
- [x] Hide or dim all other participants while a session is live (judges should only score the active participant at a time)
- [x] After a judge submits scores, show a "Waiting for next participant…" state instead of immediately navigating away — the coordinator controls when to advance
- [x] When the coordinator advances to the next participant, the judge's event page should reflect the new active participant (page re-render on navigation)

### Notes
- `active_participant_id` is stored in the Events sheet as an additional column; null/empty means no active participant
- The "Next Participant" button for coordinators checks all assigned judges have submitted; an override toggle allows advancing anyway
- Participant ordering for "Next" follows the row order in the Participants sheet for this event
- No WebSocket/polling required — coordinator and judges navigate pages manually; the active participant state is persisted in Sheets

## Phase 7b: Scoring Criteria Template & Score Cap Enforcement

This phase introduces a standard criteria template for events and tightens score cap enforcement in the judging form so judges cannot enter or submit a score that exceeds the maximum for any criterion.

**Standard criteria template (total 100 points):**

| Criterion | Max Score |
|-----------|-----------|
| Introduction | 15 |
| Knowledge & Depth | 35 |
| Presentation & Delivery | 35 |
| Conclusion | 15 |

### Criteria tab — Standard Template
- [x] Add a "Use Standard Template" button on the Criteria tab (visible only when the event has no criteria yet)
- [x] Clicking it calls a new `applyStandardCriteriaTemplateAction(eventId)` server action that creates the four criteria above in a single operation (admin/coordinator only)
- [x] Once criteria exist, hide the button (to avoid duplicates); show it again only if all criteria are deleted

### Score cap enforcement in the judging form
- [x] Real-time cap enforcement: as the judge types, if the entered value exceeds `max_score` clamp the input to `max_score` automatically (prevent silent over-entry)
- [x] Show a "remaining points" indicator beneath each score input: e.g. `10 / 15 pts` updates live as the judge types; turns amber when within 2 pts of max, green when exactly at max
- [x] If the judge manually types a value above `max_score` (e.g. via keyboard past the clamp), show an inline red error on that field immediately — do not wait for the Save Draft / Submit button
- [x] Disable "Save Draft" and "Submit Final" buttons if any criterion has a score that exceeds its `max_score` (redundant with clamping but defensive)
- [x] Display the total score across all criteria at the bottom of the scoring form, updating in real time (e.g. `Total: 72 / 100`)

### Notes
- The standard template action should be idempotent (safe to call if criteria already exist — it will skip creation and return without error)
- Score clamping and the remaining-points indicator are purely client-side (no server change needed)
- The total score display uses each criterion's raw score (not weighted) for simplicity in the judge-facing form; weighted totals are for the leaderboard

## Phase 7c: Overtime Deduction

This phase adds an optional time-limit configuration at the event level and a per-participant overtime toggle for coordinators. When a participant exceeds their allotted time, the coordinator marks them overtime and a pre-configured deduction is automatically applied to their final score. This feature is entirely coordinator-facing — judges are not involved.

### Data layer

- [x] Add two optional fields to the `Event` type and `rowToEvent` mapper:
  - `time_limit_minutes: number` — `0` means no time limit is configured for this event
  - `overtime_deduction: number` — flat points deducted from a participant's total if marked overtime (e.g. `5`)
  - Both map to new columns in the Events sheet (columns I and J)
- [x] Add one field to the `Participant` type and `rowToParticipant` mapper:
  - `overtime: boolean` — `TRUE`/`FALSE` in the Participants sheet (new column after `event_id`)
- [x] Add `updateEventTimeLimitAction(eventId, timeLimitMinutes, overtimeDeduction)` server action (admin/coordinator only) — updates the two new event columns and revalidates the event detail page
- [x] Add `setParticipantOvertimeAction(participantId, overtime, eventId)` server action (coordinator/admin only) — updates the participant's `overtime` column and revalidates the coordinator event page

### Criteria tab — Time Limit configuration

- [x] Add a "Time Limit" card at the top of the Criteria tab (above the criteria list), visible to both admin and coordinator
- [x] The card shows two inline inputs:
  - **Time limit**: number input in minutes (placeholder "No limit", `0` = disabled)
  - **Deduction**: number input for points to deduct if overtime (e.g. `5 pts`)
- [x] Changes are saved via `updateEventTimeLimitAction` with a Save button; show a saved confirmation
- [x] When `time_limit_minutes` is `0`, the deduction field is hidden and a "No time limit set" label is shown instead
- [x] The card is read-only if the event status is `completed` or `archived`

### Coordinator — Participants tab changes

- [x] When `event.time_limit_minutes > 0`, show an **Overtime** column in the participants table (rightmost column, after the Scores column)
- [x] Each row in the Overtime column shows:
  - A toggle/checkbox for the coordinator to mark the participant as overtime
  - When toggled on: red "Overtime" badge with the deduction amount shown (e.g. `−5 pts`)
  - When toggled off: grey "On time" label
  - Clicking calls `setParticipantOvertimeAction` via a client component
- [x] When no time limit is configured (`time_limit_minutes === 0`), the Overtime column is hidden entirely

### Coordinator — scoring progress display

- [x] In the summary stats row at the top of the coordinator event detail page, if a time limit is configured show the deduction amount as a footnote: e.g. `Overtime deduction: −5 pts per participant`
- [x] In the Participants tab, rows where `participant.overtime === true` should have a subtle red tint on the row background (similar to how active participants have a green tint)

### Notes
- The overtime deduction is a flat deduction from the participant's **total** score across all judges (not per-judge). It applies once regardless of how many judges score the participant.
- Deduction logic lives in the leaderboard/results computation (Phase 8), not in the scoring form. This phase only stores the flag and displays it to the coordinator.
- The Events sheet needs two new column headers: `time_limit_minutes` (column I) and `overtime_deduction` (column J). Existing event rows without these columns will default to `0`.
- The Participants sheet needs one new column header: `overtime` (after `event_id`). Existing rows default to `FALSE`.

## Phase 8: Core Features

- [x] Implement role-based access control (RBAC)
- [ ] Create notification system (email or in-app)
- [x] Implement score normalization (per-judge z-score, toggled per event in Criteria tab)
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
