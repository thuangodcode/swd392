# Changelog

All notable changes to the SWD392 Mobile App will be documented in this file.

## [1.0.0] - 2025-11-13

### 🎉 Initial Release

#### ✨ Features Added

##### Authentication
- ✅ Login screen with Student ID & Password
- ✅ Register screen with full form validation
- ✅ Auto-login with AsyncStorage
- ✅ Token-based authentication
- ✅ Logout functionality
- ✅ Profile refresh on app resume

##### Dashboard
- ✅ Welcome header with user avatar
- ✅ User information card (ID, Role, Course, Class)
- ✅ Quick action buttons (Groups, Projects, Courses, Profile)
- ✅ Pull-to-refresh functionality
- ✅ Modern gradient design

##### Groups Management
- ✅ View my current group
- ✅ Browse available groups in class
- ✅ Request to join group
- ✅ Leave group
- ✅ Group member count display
- ✅ Group status badges (Open/Closed)
- ✅ Leader name display

##### Projects
- ✅ View group project details
- ✅ Project description & objectives
- ✅ Tech stack display with badges
- ✅ GitHub repository link
- ✅ Approval status indicators
- ✅ Empty states for no project/no group
- ✅ Class code & lecturer info

##### Courses
- ✅ Browse available courses
- ✅ View enrolled courses
- ✅ Enroll in course
- ✅ Leave course
- ✅ Current class indicator
- ✅ Course details (lecturer, description, student count)
- ✅ Pull-to-refresh

##### Profile
- ✅ Personal information section
- ✅ Academic information section
- ✅ Large avatar with initial
- ✅ Role badge display
- ✅ Logout button

#### 🎨 UI/UX
- ✅ Modern card-based design
- ✅ Gradient backgrounds
- ✅ Emoji icons throughout
- ✅ Color-coded status badges
- ✅ Smooth transitions
- ✅ Loading indicators
- ✅ Empty states with helpful actions
- ✅ Pull-to-refresh animations
- ✅ Bottom tab navigation
- ✅ Responsive layout

#### 🔧 Components
- ✅ Button component (multiple variants)
- ✅ Input component with validation
- ✅ Card component
- ✅ Loading component

#### 🌐 API Integration
- ✅ Axios configuration with interceptors
- ✅ Auth service (login, register, profile)
- ✅ Group service (CRUD operations)
- ✅ Project service (CRUD operations)
- ✅ Course service (enrollment management)
- ✅ Automatic token attachment
- ✅ Token refresh handling
- ✅ Error response handling

#### 📱 Navigation
- ✅ Stack navigation for auth flow
- ✅ Bottom tab navigation for main app
- ✅ 5 main tabs (Home, Groups, Projects, Courses, Profile)
- ✅ Auto-redirect based on auth state
- ✅ Proper back navigation

#### 📚 Documentation
- ✅ Comprehensive README.md
- ✅ Quick start guide (QUICKSTART.md)
- ✅ Features documentation (FEATURES.md)
- ✅ Troubleshooting guide (TROUBLESHOOTING.md)
- ✅ Deployment guide (DEPLOYMENT.md)
- ✅ API reference (API_REFERENCE.md)
- ✅ Project summary (PROJECT_SUMMARY.md)
- ✅ Getting started (START_HERE.md)

#### 🔐 Security
- ✅ JWT token authentication
- ✅ Secure storage with AsyncStorage
- ✅ Password validation
- ✅ Email validation
- ✅ Auto-logout on token expiration
- ✅ Authorization headers

#### 📦 Configuration
- ✅ Environment example file
- ✅ App configuration (app.json)
- ✅ Constants file for API URL
- ✅ Color theme constants
- ✅ Git ignore file

#### 🛠️ Development Setup
- ✅ Expo CLI configuration
- ✅ React Navigation setup
- ✅ AsyncStorage setup
- ✅ Axios setup
- ✅ Context API for state management

---

## [Unreleased] - Planned Features

### 🚀 Coming Soon

#### High Priority
- [ ] Create Group screen with form
- [ ] Edit Profile functionality
- [ ] Group details screen with member list
- [ ] Create/Edit Project screen
- [ ] Image upload for profile avatar
- [ ] Accept/Reject group invites
- [ ] View pending join requests (for leaders)

#### Medium Priority
- [ ] Push notifications
- [ ] Group chat feature
- [ ] File attachments for projects
- [ ] Search & filter groups
- [ ] Sort courses by different criteria
- [ ] Project progress tracking
- [ ] Deadline reminders

#### Nice to Have
- [ ] Dark mode theme
- [ ] Offline mode with local cache
- [ ] Calendar integration
- [ ] Task management within projects
- [ ] Analytics dashboard
- [ ] Multiple language support
- [ ] Accessibility improvements
- [ ] Unit & integration tests

#### Bug Fixes
- [ ] None reported yet

---

## Version History

### Version Numbering
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

### Current Version: 1.0.0
- Initial release with core features
- Student flow fully functional
- Ready for testing & deployment

---

## Migration Guide

### From 0.x to 1.0.0
N/A - Initial release

---

## Deprecations

None at this time.

---

## Known Issues

None at this time.

---

## Contributors

- Development Team - Initial work and implementation
- Backend Team - API integration support
- Design Team - UI/UX design consultation

---

## Support

For issues and feature requests, please contact the development team.

---

## License

This project is private and proprietary.

---

**Last Updated:** November 13, 2025
**Maintained By:** SWD392 Development Team
