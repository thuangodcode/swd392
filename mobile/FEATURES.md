# Features Documentation

## 📱 Student Flow Features

### 1. Authentication

#### Login
- Students đăng nhập bằng Student ID và Password
- Token được lưu vào AsyncStorage
- Auto-login khi mở lại app
- Session timeout handling

**Usage:**
1. Open app → Login screen appears
2. Enter Student ID (e.g., SE123456)
3. Enter Password
4. Tap "Sign In"
5. Navigate to Dashboard

#### Register
- Tạo tài khoản mới cho student
- Validate email format
- Password minimum 6 characters
- Auto-login sau khi đăng ký thành công

**Required Fields:**
- Student ID (unique)
- Email (unique, valid format)
- Full Name
- Course (e.g., K15, K16, K17)
- Major (e.g., Software Engineering)
- Password (min 6 chars)
- Confirm Password (must match)

#### Logout
- Clear authentication token
- Clear user data from storage
- Navigate back to Login screen

---

### 2. Dashboard

Main screen sau khi login, hiển thị:

#### User Info Card
- Student ID
- Role (Student/Leader)
- Course (K15, K16, etc.)
- Current Class (if enrolled)

#### Quick Actions
4 main actions:
- **My Groups** → Navigate to Groups screen
- **Projects** → Navigate to Projects screen
- **Courses** → Navigate to Courses screen
- **Profile** → Navigate to Profile screen

#### Features
- Pull-to-refresh để update data
- Avatar with first letter of name
- Welcome message with user's name

---

### 3. Groups Management

#### View Groups
- **My Group:** Group mà student đang tham gia
- **Available Groups:** Các groups khác có thể join

#### Group Information
Mỗi group card hiển thị:
- Group name
- Leader name
- Number of members (e.g., 3/5)
- Class code
- Status (Open/Closed)

#### Join Group
1. Browse available groups
2. Tap "Request to Join" button
3. Wait for leader approval
4. Receive notification when accepted

#### Leave Group
1. Navigate to your group
2. Tap "Leave Group"
3. Confirm action
4. Return to group browsing

#### Create Group (Coming Soon)
- Leaders can create new groups
- Set group name
- Auto-assign as leader
- Invite members

**Business Rules:**
- Maximum 5 members per group
- Must be enrolled in a class to join/create group
- Can only be in one group at a time
- Must leave current group before joining another

---

### 4. Projects

#### View Project
- View project của group hiện tại
- Project details: name, description, objectives
- Tech stack badges
- GitHub repository link
- Approval status

#### Project Status
- **Draft:** Project chưa submit
- **Pending:** Đang chờ lecturer approval
- **Approved:** Được duyệt, có thể bắt đầu
- **Rejected:** Bị từ chối, cần chỉnh sửa
- **Completed:** Hoàn thành

#### Leader Actions
- Create project (if no project exists)
- Update project details
- Submit for approval
- Add tech stack
- Update GitHub repository

#### Member View
- View project details
- See approval status
- Cannot edit (leader only)

**Requirements:**
- Must be in a group to view projects
- Only one project per group
- Leader creates and manages project

---

### 5. Courses

#### Browse Courses
- View all available courses
- See course details:
  - Course name
  - Course code
  - Class code
  - Lecturer name
  - Number of enrolled students
  - Description

#### Enroll in Course
1. Browse available courses
2. Tap "Enroll Now"
3. Confirm enrollment
4. Automatically set as current class
5. Can now join groups in this class

#### My Courses
- View enrolled courses
- See current class badge
- Leave course (if needed)

#### Leave Course
1. View enrolled course
2. Tap "Leave Course"
3. Confirm action
4. Removed from class
5. Automatically leave group (if in one)

**Business Rules:**
- Can enroll in multiple courses
- Only one current class at a time
- Current class determines available groups
- Leaving course = leaving group

---

### 6. Profile

#### View Profile

**Personal Information:**
- Student ID
- Full Name
- Email
- Role

**Academic Information:**
- Course (K15, K16, etc.)
- Major
- Current Class

#### Features
- Large avatar with initial
- Role badge
- Organized sections
- Edit profile button (Coming Soon)
- Logout button

#### Edit Profile (Coming Soon)
Will allow updating:
- Full name
- Email
- Password
- Major

---

## 🔄 User Journeys

### First Time User
```
1. Open App
2. Tap "Sign Up"
3. Fill registration form
4. Auto-login
5. Dashboard → Browse Courses
6. Enroll in a course
7. Browse Groups
8. Join or Create group
9. View/Create project
```

### Returning User
```
1. Open App
2. Auto-login (if token valid)
3. Dashboard
4. Quick access to all features
5. Pull-to-refresh for updates
```

### Joining a Group
```
1. Dashboard → My Groups
2. Browse Available Groups
3. Find suitable group
4. Tap "Request to Join"
5. Wait for approval
6. Access group features
```

### Managing Project (Leader)
```
1. Join/Create Group (become leader)
2. Dashboard → Projects
3. Create Project
4. Fill project details
5. Add tech stack
6. Submit for Approval
7. Wait for lecturer review
8. Update if needed
```

---

## 🎨 UI Components

### Reusable Components

#### Button
```javascript
<Button 
  title="Submit"
  variant="primary" // primary, secondary, outline, danger
  size="medium" // small, medium, large
  loading={false}
  disabled={false}
  onPress={() => {}}
/>
```

#### Input
```javascript
<Input
  label="Student ID"
  placeholder="Enter your ID"
  value={studentId}
  onChangeText={setStudentId}
  secureTextEntry={false}
  error={error}
/>
```

#### Card
```javascript
<Card style={customStyle}>
  <Text>Content</Text>
</Card>
```

#### Loading
```javascript
<Loading fullScreen={true} />
```

---

## 🔐 Security Features

- JWT token authentication
- Token stored in AsyncStorage (encrypted)
- Auto-logout on token expiration
- Password validation (min 6 chars)
- Email validation
- API request authentication headers
- Error handling for unauthorized access

---

## 📊 Data Flow

### Authentication Flow
```
Login → API Call → Token + User Data → AsyncStorage → Navigate to Dashboard
```

### Data Refresh
```
Pull to Refresh → API Call → Update State → Re-render UI
```

### Navigation Flow
```
Auth Stack (Login/Register)
    ↓ (if authenticated)
Main Stack (Bottom Tabs)
    - Dashboard
    - Groups
    - Projects
    - Courses
    - Profile
```

---

## 🚀 Coming Soon Features

- [ ] Push notifications for group invites
- [ ] Real-time chat in groups
- [ ] File upload for projects
- [ ] Calendar for deadlines
- [ ] Task management per project
- [ ] Peer review system
- [ ] Project progress tracking
- [ ] Lecturer feedback comments
- [ ] Group leader transfer
- [ ] Multiple project versions

---

## 📝 API Integration

All features integrate with backend REST API:
- Base URL configured in `src/utils/constants.js`
- API services in `src/services/`
- Axios interceptors for auth headers
- Error handling middleware
- Auto-retry on failure

---

For technical details, see README.md
For issues, see TROUBLESHOOTING.md
