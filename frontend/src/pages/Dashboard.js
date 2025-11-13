import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Button, Tabs, Table, message, Tag, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, Award, Users, GraduationCap, Shield, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Header */}
          <div className="card border-0 shadow-lg rounded-4 mb-4 p-4">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-4"
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
                }}>
                <User size={40} color="white" />
              </div>
              <div>
                <h1 className="h2 fw-bold mb-1">Welcome back, {user?.fullName}! 👋</h1>
                <p className="text-muted mb-0">Here's what's happening with your account</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-100">
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}></div>
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: '60px', height: '60px', background: 'rgba(102, 126, 234, 0.1)' }}>
                      <Shield size={28} color="#667eea" />
                    </div>
                    <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Role</p>
                    <h3 className="h2 fw-bold mb-0">{getRoleLabel(user?.role)}</h3>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-md-6 col-lg-3">
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-100">
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)' }}></div>
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: '60px', height: '60px', background: 'rgba(17, 153, 142, 0.1)' }}>
                      <GraduationCap size={28} color="#11998e" />
                    </div>
                    <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      {user?.role === 'lecturer' ? 'Lecturer ID' : 'Student ID'}
                    </p>
                    <h3 className="h2 fw-bold mb-0">{user?.studentId}</h3>
                  </div>
                </div>
              </motion.div>
            </div>

            {user?.role === 'student' && (
              <div className="col-md-6 col-lg-3">
                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-100">
                  <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #f2994a 0%, #f2c94c 100%)' }}></div>
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                        style={{ width: '60px', height: '60px', background: 'rgba(242, 153, 74, 0.1)' }}>
                        <Calendar size={28} color="#f2994a" />
                      </div>
                      <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Course</p>
                      <h3 className="h2 fw-bold mb-0">{user?.course || 'N/A'}</h3>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            <div className="col-md-6 col-lg-3">
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-100">
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' }}></div>
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: '60px', height: '60px', background: 'rgba(79, 172, 254, 0.1)' }}>
                      <BookOpen size={28} color="#4facfe" />
                    </div>
                    <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Major</p>
                    <h3 className="h2 fw-bold mb-0">{user?.major || 'N/A'}</h3>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="row g-4">
            <div className="col-lg-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3"
                        style={{ width: '50px', height: '50px', background: 'rgba(102, 126, 234, 0.1)' }}>
                        <Mail size={24} color="#667eea" />
                      </div>
                      <div>
                        <p className="text-muted mb-1 small">Email Address</p>
                        <h5 className="mb-0">{user?.email}</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3"
                        style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <Activity size={24} color="#10b981" />
                      </div>
                      <div>
                        <p className="text-muted mb-1 small">Account Status</p>
                        <h5 className="mb-0">
                          <span className="badge bg-success">Active</span>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
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
    setLoading(true);
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
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const lecturerColumns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Major',
      dataIndex: 'major',
      key: 'major',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Classes',
      key: 'classes',
      render: (_, record) => {
        const lecturerClasses = classes.filter(c => c.lecturer?._id === record._id);
        return <Tag color="blue">{lecturerClasses.length} classes</Tag>;
      }
    }
  ];

  const classColumns = [
    {
      title: 'Class Code',
      dataIndex: 'classCode',
      key: 'classCode',
      render: (text) => <strong className="text-primary">{text}</strong>
    },
    {
      title: 'Lecturer',
      dataIndex: ['lecturer', 'fullName'],
      key: 'lecturer'
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      render: (text) => <Tag color="purple">{text}</Tag>
    },
    {
      title: 'Students',
      key: 'students',
      render: (_, record) => (
        <span>{record.enrolledStudents?.length || 0} / {record.maxStudents || 40}</span>
      )
    }
  ];

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container py-5">
        <Spin spinning={loading}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Moderator Header */}
            <div className="card border-0 shadow-lg rounded-4 mb-4 p-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-4"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      boxShadow: '0 5px 15px rgba(240, 147, 251, 0.4)'
                    }}>
                    <Shield size={40} color="white" />
                  </div>
                  <div>
                    <h1 className="h2 fw-bold mb-1">Moderator Dashboard</h1>
                    <p className="text-muted mb-0">Manage lecturers and classes</p>
                  </div>
                </div>
                <Button type="primary" size="large" onClick={() => navigate('/lecturers')}>
                  Manage System
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <motion.div whileHover={{ y: -5 }}>
                  <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}></div>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                        style={{ width: '60px', height: '60px', background: 'rgba(102, 126, 234, 0.1)' }}>
                        <Users size={32} color="#667eea" />
                      </div>
                      <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Lecturers</p>
                      <h2 className="fw-bold mb-2">{stats.totalLecturers}</h2>
                      <p className="small text-success mb-0">
                        <Activity size={14} /> Active in system
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="col-md-4">
                <motion.div whileHover={{ y: -5 }}>
                  <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)' }}></div>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                        style={{ width: '60px', height: '60px', background: 'rgba(17, 153, 142, 0.1)' }}>
                        <BookOpen size={32} color="#11998e" />
                      </div>
                      <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Classes</p>
                      <h2 className="fw-bold mb-2">{stats.totalClasses}</h2>
                      <p className="small text-success mb-0">
                        <Calendar size={14} /> This semester
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="col-md-4">
                <motion.div whileHover={{ y: -5 }}>
                  <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' }}></div>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                        style={{ width: '60px', height: '60px', background: 'rgba(79, 172, 254, 0.1)' }}>
                        <GraduationCap size={32} color="#4facfe" />
                      </div>
                      <p className="text-muted small fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Students</p>
                      <h2 className="fw-bold mb-2">{stats.totalStudents}</h2>
                      <p className="small text-success mb-0">
                        <Award size={14} /> Enrolled
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Tables */}
            <div className="row g-4">
              <div className="col-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 rounded-top-4 py-3">
                      <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <Users size={20} />
                        Lecturers Overview
                      </h5>
                    </div>
                    <div className="card-body">
                      <Table
                        columns={lecturerColumns}
                        dataSource={lecturers}
                        rowKey="_id"
                        pagination={{ pageSize: 5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="col-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 rounded-top-4 py-3">
                      <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <BookOpen size={20} />
                        Classes Overview
                      </h5>
                    </div>
                    <div className="card-body">
                      <Table
                        columns={classColumns}
                        dataSource={classes}
                        rowKey="_id"
                        pagination={{ pageSize: 5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Spin>
      </div>
    </div>
  );
};

export default Dashboard;
