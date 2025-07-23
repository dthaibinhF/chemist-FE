# PRD: timetable feature

## 1. Product overview

### 1.1 Document title and version

- PRD: timetable feature  
- Version: 1.0  

### 1.2 Product summary

The timetable feature enables students, teachers, and administrators to view and manage class schedules in a clear, interactive interface. It supports filtering, searching, creating, and editing schedule entries, ensuring up-to-date information for all stakeholders. By introducing modular UI components and leveraging existing API endpoints, the feature delivers a seamless user experience while maintaining maintainability and scalability.

## 2. Goals

### 2.1 Business goals

- Reduce schedule-related support requests by 30 % within three months.  
- Increase weekly active users engaging with schedule data by 25 %.  
- Provide a foundation for future premium scheduling capabilities (e.g., room occupancy analytics).  

### 2.2 User goals

- Quickly find relevant schedule information using filters and search.  
- Create or edit schedules with minimal steps and immediate confirmation.  
- Trust that displayed schedules are accurate and up to date.  

### 2.3 Non-goals

- Real-time collaborative editing of schedules.  
- Automatic conflict detection between multiple group schedules.  
- Mobile-native application (web-responsive only for now).  

## 3. User personas

### 3.1 Key user types

- Students  
- Teachers  
- School administrators  

### 3.2 Basic persona details

- **Sophia (Student)**: Needs to know her daily class times and room locations.  
- **Mr. Nguyen (Teacher)**: Maintains class schedules and occasionally adjusts times for special sessions.  
- **Ms. Tran (Administrator)**: Oversees all group schedules, ensuring there are no room clashes and that data is complete.  

### 3.3 Role-based access

- **Student**: View schedules relevant to their enrolled groups.  
- **Teacher**: View, create, and edit schedules for groups they teach.  
- **Administrator**: Full CRUD access to all schedules, including bulk operations.  

## 4. Functional requirements

- **Display timetable** (Priority: High)  
  - Show schedules in weekly and daily calendar views.  
  - Highlight current date and ongoing sessions.  
  - Support pagination when viewing lists.  
- **Filter and search** (Priority: High)  
  - Filter by group, date range, teacher, and room.  
  - Search by keyword (group name, teacher name, room).  
- **Create schedule entry** (Priority: High)  
  - Open a modal dialog with required fields pre-validated.  
  - Persist data via `POST /api/v1/schedule`.  
- **Edit schedule entry** (Priority: High)  
  - Open modal prefilled with existing data.  
  - Persist changes via `PUT /api/v1/schedule/{id}`.  
- **Delete schedule entry** (Priority: Medium)  
  - Soft delete with confirmation dialog.  
- **Authentication & authorization** (Priority: High)  
  - Verify user roles before permitting create, edit, or delete actions.  

## 5. User experience

### 5.1 Entry points & first-time user flow

- Sidebar “Timetable” link.  
- Dashboard widget linking to the full timetable.  

### 5.2 Core experience

- **Open timetable**: User clicks “Timetable” in sidebar.  
  - Page loads the current week’s schedules in under 1 s.  
- **Browse sessions**: User scrolls or navigates by date.  
  - Sessions are color-coded by group for quick identification.  
- **Filter schedules**: User selects a filter chip (e.g., their group).  
  - List updates instantly without full page reload.  
- **Search schedules**: User types in search bar.  
  - Results update after 300 ms debounce.  
- **Create schedule**: Authorized user clicks “Add”.  
  - Dialog opens with required fields; validation errors show inline.  
- **Edit schedule**: User clicks on an event, chooses “Edit”.  
  - Dialog opens with prefilled data; saving updates list immediately.  

### 5.3 Advanced features & edge cases

- Display warning when overlapping schedules detected (administrator only).  
- Graceful handling when API returns no schedules (empty state).  
- Offline/read-only fallback if network unavailable.  

### 5.4 UI/UX highlights

- Drag-and-drop calendar for quick date navigation.  
- Accessible color palette meeting WCAG AA contrast ratios.  
- Toast notifications for success or error states.  

## 6. Narrative

Sophia is a student who often forgets her classroom locations and times. She opens the timetable and instantly sees her personalized weekly schedule, color-coded by subject. When the math class is rescheduled, Mr. Nguyen edits the session through a simple dialog, and the change is reflected for Sophia in real time. Ms. Tran monitors all group schedules, filters by room to avoid clashes, and confidently maintains an up-to-date timetable for the entire school.

## 7. Success metrics

### 7.1 User-centric metrics

- Average time to locate a specific class < 10 s.  
- ≥ 90 % positive feedback on schedule usability surveys.  

### 7.2 Business metrics

- 25 % increase in self-service schedule updates by teachers.  
- 30 % reduction in support tickets related to scheduling errors.  

### 7.3 Technical metrics

- ≥ 99 % successful API call rate for schedule endpoints.  
- Initial timetable view renders in < 1 s on broadband connections.  

## 8. Technical considerations

### 8.1 Integration points

- Schedule API (`/api/v1/schedule`, `/search`, `/weekly`, `/schedule/{id}`).  
- Existing authentication service for JWT validation.  

### 8.2 Data storage & privacy

- Store minimal schedule data in browser cache; purge on logout.  
- Ensure timestamps include time zone data to avoid ambiguity.  

### 8.3 Scalability & performance

- Lazy load weeks outside current view.  
- Index common query parameters (group_id, start_time, end_time) on BE.  

### 8.4 Potential challenges

- Handling daylight-saving or time-zone differences for international teachers.  
- Preventing double bookings when multiple admins edit simultaneously.  

## 9. Milestones & sequencing

### 9.1 Project estimate

- Medium: 3-4 weeks  

### 9.2 Team size & composition

- Medium team: 3-4 total  
  - 1 product manager, 2 frontend engineers, 1 QA specialist  

### 9.3 Suggested phases

- **Phase 1**: Dialog components for create/edit (1 week)  
  - Key deliverables: reusable form fields, validation, API hooks.  
- **Phase 2**: Timetable display component (1 week)  
  - Key deliverables: weekly/daily views, event cards, empty states.  
- **Phase 3**: Filter and search functionality (1 week)  
  - Key deliverables: filter chips, debounced search bar, pagination.  
- **Phase 4**: Polish, edge-case handling, QA (0.5-1 week)  
  - Key deliverables: accessibility audit, performance optimizations, test coverage.  

## 10. User stories

### 10.1 View weekly timetable

- **ID**: US-001  
- **Description**: As a student, I want to view my weekly timetable so that I know when and where my classes are.  
- **Acceptance criteria**:  
  - Timetable displays sessions for the selected week.  
  - Current date is highlighted.  
  - Each session shows group name, room, start and end times.  

### 10.2 Filter timetable by group

- **ID**: US-002  
- **Description**: As a teacher, I want to filter schedules by my group so that I only see relevant sessions.  
- **Acceptance criteria**:  
  - Filter chip lists all groups assigned to the teacher.  
  - Selecting a chip updates the view instantly.  
  - Clearing filters returns to full view.  

### 10.3 Search timetable by keyword

- **ID**: US-003  
- **Description**: As an administrator, I want to search schedules by teacher name or room so that I can quickly locate sessions.  
- **Acceptance criteria**:  
  - Search input supports partial and case-insensitive matches.  
  - Results update within 300 ms after typing stops.  
  - “No results” message appears when nothing matches.  

### 10.4 Create schedule entry

- **ID**: US-004  
- **Description**: As an authorized user, I want to create a schedule entry so that new classes are reflected in the timetable.  
- **Acceptance criteria**:  
  - “Add schedule” button opens a dialog with required fields.  
  - Form validation prevents submission of incomplete data.  
  - On success, timetable updates without full page reload.  

### 10.5 Edit schedule entry

- **ID**: US-005  
- **Description**: As an authorized user, I want to edit an existing schedule so that changes are accurately reflected.  
- **Acceptance criteria**:  
  - Clicking an event opens an edit dialog prefilled with current data.  
  - Changes are saved via the correct API call.  
  - Updated session appears in timetable immediately.  

### 10.6 Delete schedule entry

- **ID**: US-006  
- **Description**: As an administrator, I want to delete a schedule entry so that outdated sessions are removed.  
- **Acceptance criteria**:  
  - Delete option appears only for users with proper role.  
  - Confirmation dialog prevents accidental deletion.  
  - Timetable refreshes to reflect removal.  

### 10.7 Secure access

- **ID**: US-007  
- **Description**: As any user, I want the timetable to respect my authentication status so that I only access information I’m permitted to see.  
- **Acceptance criteria**:  
  - Unauthenticated users are redirected to the login page.  
  - Role-based permissions dictate available actions (view, create, edit, delete).  
  - Unauthorized API calls return 401/403 and are handled gracefully.  