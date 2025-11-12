import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Button, Tabs, Table, message, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roles = {
      'student': 'Student',
      'lecturer': 'Lecturer',
      'moderator': 'Moderator',
      'leader': 'Group Leader'
    };
    return roles[role?.toLowerCase()] || role;
  };

  // Moderator Dashboard
  if (user?.role && user.role.toLowerCase() === 'moderator') {
    return <ModeratorDashboard user={user} />;
  }

  // Student/Lecturer Dashboard
  return (
    <div style={{ padding: '20px' }}>
      <Card title={<h2>Welcome, {user?.fullName}!</h2>}>
        <Row gutter={16}>
          <Col span={user?.role === 'student' ? 8 : 12}>
            <Card>
              <Statistic 
                title="Role" 
                value={getRoleLabel(user?.role)} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={user?.role === 'student' ? 8 : 12}>
            <Card>
              <Statistic 
                title={user?.role === 'lecturer' ? 'Lecturer ID' : 'Student ID'}
                value={user?.studentId} 
              />
            </Card>
          </Col>
          {user?.role === 'student' && (
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Course" 
                  value={user?.course || 'N/A'} 
                />
              </Card>
            </Col>
          )}
        </Row>
        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={12}>
            <Card>
              <Statistic 
                title="Email" 
                value={user?.email} 
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic 
                title="Major" 
                value={user?.major || 'N/A'} 
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// Moderator Dashboard Component
const ModeratorDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({ totalLecturers: 0, totalClasses: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStats = async () => {
    try {
      const [lecturersRes, classesRes] = await Promise.all([
        axios.get('/users/lecturer/all'),
        axios.get('/courses/available')
      ]);

      const lecturersData = lecturersRes.data.data || [];
      const classesData = classesRes.data.data || [];
      
      const totalStudents = classesData.reduce((sum, cls) => sum + (cls.enrolledStudents?.length || 0), 0);

      setLecturers(lecturersData);
      setClasses(classesData);
      setStats({
        totalLecturers: lecturersData.length,
        totalClasses: classesData.length,
        totalStudents: totalStudents
      });
    } catch (error) {
      message.error('Failed to fetch statistics');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats();
    setLoading(false);
  }, []);

  const lecturerColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId'
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    }
  ];

  const classColumns = [
    {
      title: 'Class Code',
      dataIndex: 'classCode',
      key: 'classCode',
      render: (text) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{text}</span>
    },
    {
      title: 'Lecturer',
      dataIndex: ['lecturer', 'fullName'],
      key: 'lecturer'
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester'
    },
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room'
    },
    {
      title: 'Students',
      key: 'students',
      render: (_, record) => `${record.enrolledStudents?.length || 0}/${record.maxStudents}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card 
        title={<h2>Admin Dashboard - Welcome {user?.fullName}!</h2>}
        style={{ marginBottom: '20px' }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#f0f5ff' }}>
              <Statistic 
                title="Total Lecturers" 
                value={stats.totalLecturers}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#f6ffed' }}>
              <Statistic 
                title="Total Classes" 
                value={stats.totalClasses}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#fff7e6' }}>
              <Statistic 
                title="Total Students Enrolled" 
                value={stats.totalStudents}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <Card>
                <Row gutter={16} style={{ marginBottom: '20px' }}>
                  <Col span={24}>
                    <h3>System Statistics</h3>
                    <p><strong>Total Lecturers:</strong> {stats.totalLecturers}</p>
                    <p><strong>Total Classes:</strong> {stats.totalClasses}</p>
                    <p><strong>Total Students Enrolled:</strong> {stats.totalStudents}</p>
                    <p><strong>System Status:</strong> <Tag color="green">Active</Tag></p>
                  </Col>
                </Row>
                <Button 
                  type="primary" 
                  onClick={fetchStats}
                  icon={<ReloadOutlined />}
                >
                  Refresh Statistics
                </Button>
              </Card>
            )
          },
          {
            key: 'lecturers',
            label: 'Lecturers',
            children: (
              <Card 
                title="Lecturer Management"
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/lecturers')}
                  >
                    Create Lecturer
                  </Button>
                }
              >
                <Table
                  columns={lecturerColumns}
                  dataSource={lecturers}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          },
          {
            key: 'classes',
            label: 'Classes',
            children: (
              <Card 
                title="Class Management"
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/courses')}
                  >
                    Create Class
                  </Button>
                }
              >
                <Table
                  columns={classColumns}
                  dataSource={classes}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};

export default Dashboard;
