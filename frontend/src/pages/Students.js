import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  Space,
  Tag,
  Button,
  Drawer,
  message,
  Row,
  Col,
  Statistic,
  Spin
} from 'antd';
import { SearchOutlined, EyeOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Users, Filter, UserCheck, UserX, GraduationCap, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const { Search } = Input;
const { Option } = Select;

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterGroupStatus, setFilterGroupStatus] = useState('all');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    withGroup: 0,
    withoutGroup: 0,
    enrolled: 0,
    notEnrolled: 0
  });

  // Available filters
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, searchText, filterCourse, filterClass, filterGroupStatus]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users/students/all');
      const studentData = response.data.data || [];
      setStudents(studentData);

      // Extract unique courses and classes
      const courses = [...new Set(studentData.map(s => s.course).filter(Boolean))];
      const classes = [...new Set(studentData.map(s => s.currentClass).filter(Boolean))];
      
      setAvailableCourses(courses.sort());
      setAvailableClasses(classes.sort());

      // Calculate statistics
      calculateStats(studentData);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const withGroup = data.filter(s => s.currentGroup !== null).length;
    const withoutGroup = total - withGroup;
    const enrolled = data.filter(s => s.currentClass !== null).length;
    const notEnrolled = total - enrolled;

    setStats({
      total,
      withGroup,
      withoutGroup,
      enrolled,
      notEnrolled
    });
  };

  const applyFilters = () => {
    let filtered = [...students];

    // Search filter (name, email, studentId)
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(student => 
        student.fullName?.toLowerCase().includes(search) ||
        student.email?.toLowerCase().includes(search) ||
        student.studentId?.toLowerCase().includes(search)
      );
    }

    // Course filter
    if (filterCourse !== 'all') {
      filtered = filtered.filter(s => s.course === filterCourse);
    }

    // Class filter
    if (filterClass !== 'all') {
      filtered = filtered.filter(s => s.currentClass === filterClass);
    }

    // Group status filter
    if (filterGroupStatus === 'with-group') {
      filtered = filtered.filter(s => s.currentGroup !== null);
    } else if (filterGroupStatus === 'without-group') {
      filtered = filtered.filter(s => s.currentGroup === null);
    } else if (filterGroupStatus === 'enrolled') {
      filtered = filtered.filter(s => s.currentClass !== null);
    } else if (filterGroupStatus === 'not-enrolled') {
      filtered = filtered.filter(s => s.currentClass === null);
    }

    setFilteredStudents(filtered);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setFilterCourse('all');
    setFilterClass('all');
    setFilterGroupStatus('all');
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120,
      sorter: (a, b) => a.studentId.localeCompare(b.studentId),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      width: 100,
      render: (course) => course || <Tag color="default">N/A</Tag>,
      sorter: (a, b) => (a.course || '').localeCompare(b.course || ''),
    },
    {
      title: 'Current Class',
      dataIndex: 'currentClass',
      key: 'currentClass',
      width: 120,
      render: (currentClass) => 
        currentClass ? (
          <Tag color="blue">{currentClass}</Tag>
        ) : (
          <Tag color="default">Not Enrolled</Tag>
        ),
    },
    {
      title: 'Group',
      key: 'group',
      width: 150,
      render: (_, record) => {
        if (record.currentGroup) {
          return (
            <Tag color="green">
              {record.currentGroup.groupName || 'In Group'}
            </Tag>
          );
        }
        return <Tag color="orange">No Group</Tag>;
      },
    },
    {
      title: 'Major',
      dataIndex: 'major',
      key: 'major',
      width: 150,
      render: (major) => major || 'N/A',
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.currentClass && record.currentGroup) {
          return <Tag color="success">Complete</Tag>;
        } else if (record.currentClass && !record.currentGroup) {
          return <Tag color="warning">Need Group</Tag>;
        } else {
          return <Tag color="error">Not Enrolled</Tag>;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  if (user?.role !== 'moderator') {
    return (
      <div style={{ padding: '20px' }}>
        <Card>
          <p>Access denied. Only moderators can view this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Page Header */}
          <div className="card border-0 shadow-lg rounded-4 mb-4 p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-4"
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
                  }}>
                  <Users size={36} color="white" />
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Student Management</h1>
                  <p className="text-muted mb-0">View and manage all students</p>
                </div>
              </div>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchStudents}
                loading={loading}
                size="large"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <motion.div whileHover={{ y: -5 }} className="h-100">
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}></div>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: '60px', height: '60px', background: 'rgba(102, 126, 234, 0.1)' }}>
                      <Users size={28} color="#667eea" />
                    </div>
                    <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Students</p>
                    <h3 className="h2 fw-bold mb-0">{stats.total}</h3>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-md-6 col-lg-3">
              <motion.div whileHover={{ y: -5 }} className="h-100">
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)' }}></div>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: '60px', height: '60px', background: 'rgba(17, 153, 142, 0.1)' }}>
                      <UserCheck size={28} color="#11998e" />
                    </div>
                    <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>With Group</p>
                    <h3 className="h2 fw-bold mb-0">{stats.withGroup} <span className="h6 text-muted">/ {stats.total}</span></h3>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-md-6 col-lg-3">
              <motion.div whileHover={{ y: -5 }} className="h-100">
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #f2994a 0%, #f2c94c 100%)' }}></div>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: '60px', height: '60px', background: 'rgba(242, 153, 74, 0.1)' }}>
                      <UserX size={28} color="#f2994a" />
                    </div>
                    <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Without Group</p>
                    <h3 className="h2 fw-bold mb-0">{stats.withoutGroup} <span className="h6 text-muted">/ {stats.total}</span></h3>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-md-6 col-lg-3">
              <motion.div whileHover={{ y: -5 }} className="h-100">
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' }}></div>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: '60px', height: '60px', background: 'rgba(79, 172, 254, 0.1)' }}>
                      <GraduationCap size={28} color="#4facfe" />
                    </div>
                    <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Enrolled</p>
                    <h3 className="h2 fw-bold mb-0">{stats.enrolled} <span className="h6 text-muted">/ {stats.total}</span></h3>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 rounded-top-4 py-3">
              <div className="d-flex align-items-center gap-2">
                <Filter size={20} />
                <h5 className="mb-0 fw-bold">Student List</h5>
              </div>
            </div>
            <div className="card-body p-4">
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search by name, email, or ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Course"
              value={filterCourse}
              onChange={setFilterCourse}
            >
              <Option value="all">All Courses</Option>
              {availableCourses.map(course => (
                <Option key={course} value={course}>{course}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Class"
              value={filterClass}
              onChange={setFilterClass}
            >
              <Option value="all">All Classes</Option>
              {availableClasses.map(cls => (
                <Option key={cls} value={cls}>{cls}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Status"
              value={filterGroupStatus}
              onChange={setFilterGroupStatus}
            >
              <Option value="all">All Students</Option>
              <Option value="with-group">With Group</Option>
              <Option value="without-group">Without Group</Option>
              <Option value="enrolled">Enrolled in Class</Option>
              <Option value="not-enrolled">Not Enrolled</Option>
            </Select>
          </Col>
        </Row>

        <Row style={{ marginBottom: '10px' }}>
          <Col>
            <Space>
              <span style={{ color: '#999' }}>
                Showing {filteredStudents.length} of {students.length} students
              </span>
              {(searchText || filterCourse !== 'all' || filterClass !== 'all' || filterGroupStatus !== 'all') && (
                <Button size="small" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredStudents}
            rowKey="_id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} students`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            scroll={{ x: 1400 }}
          />
        </Spin>
            </div>
          </div>

          {/* Student Details Drawer */}
          <Drawer
            title="Student Details"
            placement="right"
            width={600}
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
          >
            {selectedStudent && (
              <div>
                <Card title="Personal Information" style={{ marginBottom: '20px' }}>
                  <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                  <p><strong>Full Name:</strong> {selectedStudent.fullName}</p>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</p>
                  <p><strong>Major:</strong> {selectedStudent.major || 'N/A'}</p>
                  <p><strong>Course (Cohort):</strong> {selectedStudent.course || 'N/A'}</p>
                </Card>

                <Card title="Academic Information" style={{ marginBottom: '20px' }}>
                  <p><strong>Current Class:</strong> {
                    selectedStudent.currentClass ? (
                      <Tag color="blue">{selectedStudent.currentClass}</Tag>
                    ) : (
                      <Tag color="default">Not Enrolled</Tag>
                    )
                  }</p>
                  <p><strong>Enrolled Classes History:</strong></p>
                  {selectedStudent.enrolledClasses && selectedStudent.enrolledClasses.length > 0 ? (
                    <ul>
                      {selectedStudent.enrolledClasses.map((cls, idx) => (
                        <li key={idx}>{cls}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#999', marginLeft: '20px' }}>No enrollment history</p>
                  )}
                </Card>

                <Card title="Group Information">
                  <p><strong>Group Status:</strong> {
                    selectedStudent.currentGroup ? (
                      <Tag color="green">In Group</Tag>
                    ) : (
                      <Tag color="orange">No Group</Tag>
                    )
                  }</p>
                  {selectedStudent.currentGroup && (
                    <>
                      <p><strong>Group Name:</strong> {selectedStudent.currentGroup.groupName || 'N/A'}</p>
                      <p><strong>Group Leader:</strong> {selectedStudent.currentGroup.leader?.fullName || 'N/A'}</p>
                      <p><strong>Group Members:</strong> {selectedStudent.currentGroup.members?.length || 0}/5</p>
                    </>
                  )}
                  <p><strong>Group Invites:</strong> {
                    selectedStudent.groupInvites && selectedStudent.groupInvites.length > 0 ? (
                      <Tag color="blue">{selectedStudent.groupInvites.length} pending</Tag>
                    ) : (
                      <span>None</span>
                    )
                  }</p>
                </Card>

                <Card title="Account Status" style={{ marginTop: '20px' }}>
                  <p><strong>Role:</strong> <Tag color="purple">{selectedStudent.role?.toUpperCase()}</Tag></p>
                  <p><strong>Status:</strong> {
                    selectedStudent.isActive ? (
                      <Tag color="success">Active</Tag>
                    ) : (
                      <Tag color="error">Inactive</Tag>
                    )
                  }</p>
                  <p><strong>Created At:</strong> {new Date(selectedStudent.createdAt).toLocaleString()}</p>
                </Card>
              </div>
            )}
          </Drawer>
        </motion.div>
      </div>
    </div>
  );
};

export default Students;
