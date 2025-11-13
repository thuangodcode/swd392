# API Endpoints Reference

## 📡 Backend API Documentation

Base URL: `http://YOUR_IP:5000/api`

---

## 🔐 Authentication

### POST `/auth/login`
Login student

**Request:**
```json
{
  "studentId": "SE123456",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "studentId": "SE123456",
      "email": "student@email.com",
      "fullName": "John Doe",
      "role": "student",
      "course": "K17",
      "major": "Software Engineering",
      "currentClass": "SE1742",
      "currentGroup": null
    }
  }
}
```

### POST `/auth/register`
Register new student

**Request:**
```json
{
  "studentId": "SE123456",
  "email": "student@email.com",
  "fullName": "John Doe",
  "password": "password123",
  "role": "student",
  "course": "K17",
  "major": "Software Engineering"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

### GET `/auth/me`
Get current user profile

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "studentId": "SE123456",
    "email": "student@email.com",
    "fullName": "John Doe",
    ...
  }
}
```

---

## 👥 Groups

### GET `/groups/class/{classCode}`
Get groups by class code (enrolled students only)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "group_id",
      "groupName": "Team Alpha",
      "classCode": "SE1742",
      "leader": {
        "_id": "user_id",
        "fullName": "Leader Name",
        "studentId": "SE123456"
      },
      "members": [
        {
          "user": {
            "_id": "user_id",
            "fullName": "Member Name",
            "studentId": "SE123457"
          },
          "joinedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "status": "open",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET `/groups/class/{classCode}/public`
Get public groups (anyone can view)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** Same as above

### POST `/groups`
Create new group

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "groupName": "Team Alpha",
  "courseId": "course_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": { ... }
}
```

### GET `/groups/{id}`
Get group details

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "group_id",
    "groupName": "Team Alpha",
    "leader": { ... },
    "members": [ ... ],
    "pendingInvites": [ ... ],
    "pendingRequests": [ ... ],
    "status": "open"
  }
}
```

### POST `/groups/{id}/request`
Request to join group

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Join request sent successfully"
}
```

### POST `/groups/{id}/leave`
Leave group

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Left group successfully"
}
```

### POST `/groups/{id}/invite`
Invite student to group (leader only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "studentId": "SE123457"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully"
}
```

---

## 📋 Projects

### POST `/projects`
Create project (leader only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "groupId": "group_id",
  "projectName": "E-Commerce Platform",
  "description": "Build an online shopping platform",
  "objectives": "Learn full-stack development",
  "techStack": ["React", "Node.js", "MongoDB"],
  "githubRepository": "https://github.com/user/repo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "project_id",
    "projectName": "E-Commerce Platform",
    "group": { ... },
    "approvalStatus": "draft",
    ...
  }
}
```

### GET `/projects/group/{groupId}`
Get project by group ID

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "project_id",
    "projectName": "E-Commerce Platform",
    "description": "Build an online shopping platform",
    "objectives": "Learn full-stack development",
    "techStack": ["React", "Node.js", "MongoDB"],
    "githubRepository": "https://github.com/user/repo",
    "approvalStatus": "pending",
    "group": { ... },
    "createdBy": { ... },
    "lecturer": { ... }
  }
}
```

### PUT `/projects/{id}`
Update project (leader only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "projectName": "Updated Name",
  "description": "Updated description",
  "techStack": ["React", "Node.js", "PostgreSQL"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": { ... }
}
```

### POST `/projects/{id}/submit-for-approval`
Submit project for lecturer approval (leader only)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Project submitted to lecturer for approval",
  "data": { ... }
}
```

### GET `/projects/my-class`
Get all projects in current class

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [ ... ]
}
```

---

## 📚 Courses

### GET `/courses`
Get all courses

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "course_id",
      "courseName": "Software Development",
      "courseCode": "SWD392",
      "classCode": "SE1742",
      "lecturer": {
        "_id": "lecturer_id",
        "fullName": "Dr. Smith"
      },
      "enrolledStudents": ["user_id1", "user_id2"],
      "description": "Course description",
      "semester": "Fall 2024"
    }
  ]
}
```

### GET `/courses/available`
Get available courses for student

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** Same format as above

### GET `/courses/enrolled`
Get enrolled courses

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** Same format as above

### POST `/courses/{id}/enroll`
Enroll in course

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Enrolled successfully",
  "data": { ... }
}
```

### POST `/courses/{id}/leave`
Leave course

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Left course successfully"
}
```

### GET `/courses/{id}`
Get course details

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 🔑 Authentication Headers

All protected endpoints require JWT token:

```
Authorization: Bearer {your_jwt_token}
```

Token is received from login/register endpoints.

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Notes

1. All dates are in ISO 8601 format
2. All requests/responses use JSON
3. Token expires after 7 days (default)
4. Base URL should be updated in `src/utils/constants.js`
5. CORS should be configured on backend for mobile app

---

## 🧪 Testing APIs

### Using Postman
1. Import API collection
2. Set base URL
3. Login to get token
4. Add token to Authorization header
5. Test endpoints

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"studentId":"SE123456","password":"password123"}'

# Get groups (with token)
curl -X GET http://localhost:5000/api/groups/class/SE1742 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔄 API Flow Examples

### Complete Student Journey
```
1. POST /auth/register → Get token
2. GET /courses/available → Browse courses
3. POST /courses/{id}/enroll → Enroll in course
4. GET /groups/class/{classCode}/public → Browse groups
5. POST /groups/{id}/request → Request to join
6. GET /projects/group/{groupId} → View project
```

---

For implementation details, see services in `src/services/`
