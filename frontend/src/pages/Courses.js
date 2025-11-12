import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Space, message, Modal, Form, Input, Select, Spin, Tag, Drawer, List, Tabs } from 'antd';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      fetchCourses();
      if (user.role === 'moderator') {
        fetchLecturers();
      }
    }
  }, [user, user?.currentClass, location.pathname]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/courses/available');
      setCourses(response.data.data || []);
    } catch (error) {
      message.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await axios.get('/api/courses/lecturers/list');
      setLecturers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch lecturers:', error);
    }
  };

  const showCreateModal = () => {
    if (user?.role !== 'moderator') {
      message.error('Only moderators can create classes');
      return;
    }
    setIsModalVisible(true);
  };

  const handleCreateCourse = async (values) => {
    try {
      // Map slot to start and end times
      const slotMap = {
        slot1: { startTime: '07:00', endTime: '09:15' },
        slot2: { startTime: '09:30', endTime: '11:45' },
        slot3: { startTime: '12:30', endTime: '14:45' },
        slot4: { startTime: '15:00', endTime: '17:15' }
      };

      const slotTimes = slotMap[values.slot] || slotMap.slot1;

      await axios.post('/api/courses', {
        classCode: values.classCode.toUpperCase(),
        lecturerId: values.lecturerId,
        semester: values.semester.toUpperCase(),
        year: parseInt(values.year),
        room: values.room.toUpperCase(),
        dayOfWeek: parseInt(values.dayOfWeek),
        startTime: slotTimes.startTime,
        endTime: slotTimes.endTime,
        maxStudents: parseInt(values.maxStudents) || 40
      });
      message.success('Class created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchCourses();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create class';
      
      // Display specific error messages based on backend response
      if (errorMessage.includes('conflict')) {
        message.error(`Schedule Conflict: ${errorMessage}`);
      } else if (errorMessage.includes('already exists')) {
        message.error(`Duplicate: ${errorMessage}`);
      } else if (errorMessage.includes('Invalid')) {
        message.error(`Invalid Input: ${errorMessage}`);
      } else if (errorMessage.includes('required')) {
        message.error(`Missing Data: ${errorMessage}`);
      } else {
        message.error(errorMessage);
      }
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`/api/courses/${courseId}/enroll`);
      message.success('Enrolled successfully');
      await refreshUser(); // Refresh user data to update currentClass
      fetchCourses();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const handleSwitchClass = async (courseId) => {
    Modal.confirm({
      title: 'Switch Class Confirmation',
      content: (
        <div>
          <p>You are about to switch from <strong>{user?.currentClass}</strong> to a new class.</p>
          <p><strong>Warning:</strong></p>
          <ul style={{ marginLeft: '20px' }}>
            <li>You will be unenrolled from your current class</li>
            <li>You will be removed from your current group (if any)</li>
            <li>You will be enrolled in the new class</li>
          </ul>
          <p>Do you want to continue?</p>
        </div>
      ),
      okText: 'Yes, Switch Class',
      okType: 'primary',
      cancelText: 'Cancel',
      width: 500,
      onOk: async () => {
        try {
          await axios.post(`/api/courses/${courseId}/switch`);
          message.success('Switched class successfully');
          await refreshUser(); // Refresh user data to update currentClass
          fetchCourses();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to switch class');
        }
      },
    });
  };

  const handleViewDetails = async (course) => {
    setSelectedCourse(course);
    setIsDetailsDrawerVisible(true);
    
    // Fetch students and groups for this class
    await fetchClassDetails(course.classCode);
  };

  const fetchClassDetails = async (classCode) => {
    setLoadingDetails(true);
    try {
      // Fetch students in this class
      const studentsRes = await axios.get(`/api/users/class/${classCode}`);
      setClassStudents(studentsRes.data.data || []);

      // Fetch groups in this class
      const groupsRes = await axios.get(`/api/groups/class/${classCode}/public`);
      setClassGroups(groupsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch class details:', error);
      message.error('Failed to load class details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    form.setFieldsValue({
      classCode: course.classCode,
      lecturerId: course.lecturer._id,
      semester: course.semester,
      year: course.year,
      room: course.room,
      dayOfWeek: course.schedule.dayOfWeek.toString(),
      slot: getSlotFromTime(course.schedule.startTime),
      maxStudents: course.maxStudents
    });
    setIsEditModalVisible(true);
  };

  const getSlotFromTime = (startTime) => {
    const slotMap = {
      '07:00': 'slot1',
      '09:30': 'slot2',
      '12:30': 'slot3',
      '15:00': 'slot4'
    };
    return slotMap[startTime] || 'slot1';
  };

  const handleEditCourse = async (values) => {
    try {
      const slotMap = {
        slot1: { startTime: '07:00', endTime: '09:15' },
        slot2: { startTime: '09:30', endTime: '11:45' },
        slot3: { startTime: '12:30', endTime: '14:45' },
        slot4: { startTime: '15:00', endTime: '17:15' }
      };

      const slotTimes = slotMap[values.slot] || slotMap.slot1;

      await axios.put(`/api/courses/${selectedCourse._id}`, {
        classCode: values.classCode.toUpperCase(),
        lecturerId: values.lecturerId,
        semester: values.semester.toUpperCase(),
        year: parseInt(values.year),
        room: values.room.toUpperCase(),
        schedule: {
          dayOfWeek: parseInt(values.dayOfWeek),
          startTime: slotTimes.startTime,
          endTime: slotTimes.endTime
        },
        maxStudents: parseInt(values.maxStudents) || 40
      });
      message.success('Class updated successfully');
      setIsEditModalVisible(false);
      form.resetFields();
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update class';
      
      if (errorMessage.includes('conflict')) {
        message.error(`Schedule Conflict: ${errorMessage}`);
      } else if (errorMessage.includes('already exists')) {
        message.error(`Duplicate: ${errorMessage}`);
      } else if (errorMessage.includes('Invalid')) {
        message.error(`Invalid Input: ${errorMessage}`);
      } else if (errorMessage.includes('required')) {
        message.error(`Missing Data: ${errorMessage}`);
      } else {
        message.error(errorMessage);
      }
    }
  };

  const getDayName = (dayNum) => {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNum] || '';
  };

  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode',
      render: (text) => <strong>{text}</strong>,
      width: 120
    },
    {
      title: 'Class Code',
      dataIndex: 'classCode',
      key: 'classCode',
      render: (text, record) => (
        <Space>
          <Tag color="blue">{text}</Tag>
          {user?.role === 'lecturer' && record.lecturer?._id === user?.id && (
            <Tag color="green">My Class</Tag>
          )}
        </Space>
      ),
      width: 120
    },
    {
      title: 'Lecturer',
      dataIndex: ['lecturer', 'fullName'],
      key: 'lecturer',
      width: 150
    },
    {
      title: 'Semester',
      key: 'semester',
      render: (_, record) => `${record.semester}${record.year}`,
      width: 120
    },
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
      width: 100
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, record) => (
        <span>
          {getDayName(record.schedule?.dayOfWeek)} {record.schedule?.startTime}-{record.schedule?.endTime}
        </span>
      ),
      width: 180
    },
    {
      title: 'Students',
      key: 'students',
      render: (_, record) => `${record.currentStudents}/${record.maxStudents}`,
      width: 100
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'open' ? 'green' : 'red'}>
          {status === 'open' ? 'Open' : 'Closed'}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const hasCurrentClass = user?.currentClass !== null && user?.currentClass !== undefined;
        const isThisClass = record.classCode === user?.currentClass;
        
        if (user?.role === 'student') {
          return (
            <Space size="small" wrap>
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleViewDetails(record)}
              >
                Details
              </Button>
              {!hasCurrentClass ? (
                // Student has no class - show Enroll
                <Button 
                  type="primary"
                  size="small"
                  onClick={() => handleEnroll(record._id)}
                  disabled={record.status === 'closed'}
                >
                  Enroll
                </Button>
              ) : (
                // Student has a class - show Switch Class for ALL classes
                <Button 
                  type="default"
                  size="small"
                  onClick={() => handleSwitchClass(record._id)}
                  disabled={record.status === 'closed' || isThisClass}
                >
                  {isThisClass ? 'Current Class' : 'Switch Class'}
                </Button>
              )}
            </Space>
          );
        } else if (user?.role === 'lecturer') {
          return (
            <Space size="small">
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleViewDetails(record)}
              >
                Details
              </Button>
            </Space>
          );
        } else if (user?.role === 'moderator') {
          return (
            <Space size="small">
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleViewDetails(record)}
              >
                Details
              </Button>
              <Button 
                size="small"
                onClick={() => handleEditClick(record)}
              >
                Edit
              </Button>
            </Space>
          );
        }
      },
      width: 200
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={<h2>EXE101 - Class List</h2>}
        extra={
          user?.role === 'moderator' && (
            <Button type="primary" onClick={showCreateModal}>
              Create New Class
            </Button>
          )
        }
      >
        <Spin spinning={loading}>
          <Table 
            columns={columns} 
            dataSource={courses} 
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1500 }}
          />
        </Spin>
      </Card>

      <Modal
        title="Create New Class"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCourse}>
          <Form.Item 
            label="Class Code (6 characters)" 
            name="classCode" 
            rules={[
              { required: true, message: 'Class code is required' },
              { len: 6, message: 'Class code must be exactly 6 characters' }
            ]}
          >
            <Input placeholder="e.g., EXE001" maxLength={6} />
          </Form.Item>

          <Form.Item 
            label="Lecturer" 
            name="lecturerId" 
            rules={[{ required: true, message: 'Please select a lecturer' }]}
          >
            <Select placeholder="Select lecturer">
              {lecturers.map(lecturer => (
                <Select.Option key={lecturer._id} value={lecturer._id}>
                  {lecturer.fullName} ({lecturer.studentId})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Semester" 
            name="semester" 
            rules={[{ required: true, message: 'Please select a semester' }]}
          >
            <Select placeholder="Select semester">
              <Select.Option value="SPRING">Spring</Select.Option>
              <Select.Option value="SUMMER">Summer</Select.Option>
              <Select.Option value="FALL">Fall</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Year" 
            name="year" 
            rules={[{ required: true, message: 'Please enter year' }]}
          >
            <Input type="number" placeholder="e.g., 2024" />
          </Form.Item>

          <Form.Item 
            label="Room" 
            name="room" 
            rules={[{ required: true, message: 'Room is required' }]}
          >
            <Input placeholder="e.g., NVH001" />
          </Form.Item>

          <Form.Item 
            label="Day of Week" 
            name="dayOfWeek" 
            rules={[{ required: true, message: 'Please select day' }]}
          >
            <Select placeholder="Select day">
              <Select.Option value="1">Monday</Select.Option>
              <Select.Option value="2">Tuesday</Select.Option>
              <Select.Option value="3">Wednesday</Select.Option>
              <Select.Option value="4">Thursday</Select.Option>
              <Select.Option value="5">Friday</Select.Option>
              <Select.Option value="6">Saturday</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Time Slot" 
            name="slot" 
            rules={[{ required: true, message: 'Please select a time slot' }]}
          >
            <Select placeholder="Select time slot">
              <Select.Option value="slot1">Slot 1 (7:00 - 9:15)</Select.Option>
              <Select.Option value="slot2">Slot 2 (9:30 - 11:45)</Select.Option>
              <Select.Option value="slot3">Slot 3 (12:30 - 14:45)</Select.Option>
              <Select.Option value="slot4">Slot 4 (15:00 - 17:15)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Max Students" 
            name="maxStudents" 
            rules={[{ required: true, message: 'Max students is required' }]}
          >
            <Input type="number" placeholder="e.g., 40" defaultValue={40} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Create Class
          </Button>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="Class Details"
        placement="right"
        width={700}
        onClose={() => {
          setIsDetailsDrawerVisible(false);
          setClassStudents([]);
          setClassGroups([]);
        }}
        open={isDetailsDrawerVisible}
      >
        {selectedCourse && (
          <Spin spinning={loadingDetails}>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Course Code:</strong> {selectedCourse.courseCode}</p>
              <p><strong>Class Code:</strong> <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{selectedCourse.classCode}</span></p>
              <p><strong>Lecturer:</strong> {selectedCourse.lecturer?.fullName}</p>
              <p><strong>Lecturer Email:</strong> {selectedCourse.lecturer?.email}</p>
              <p><strong>Semester:</strong> {selectedCourse.semester}</p>
              <p><strong>Year:</strong> {selectedCourse.year}</p>
              <p><strong>Room:</strong> {selectedCourse.room}</p>
              <p><strong>Day:</strong> {getDayName(selectedCourse.schedule?.dayOfWeek)}</p>
              <p><strong>Time:</strong> {selectedCourse.schedule?.startTime} - {selectedCourse.schedule?.endTime}</p>
              <p><strong>Max Students:</strong> {selectedCourse.maxStudents}</p>
              <p><strong>Enrolled Students:</strong> {selectedCourse.currentStudents || selectedCourse.enrolledStudents?.length || 0}</p>
              <p><strong>Status:</strong> <Tag color={selectedCourse.status === 'open' ? 'green' : 'red'}>{selectedCourse.status === 'open' ? 'Open' : 'Closed'}</Tag></p>
              <p><strong>Created At:</strong> {new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
            </div>

            <Tabs
              items={[
                {
                  key: 'students',
                  label: `Students (${classStudents.length})`,
                  children: (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <List
                        dataSource={classStudents}
                        renderItem={(student) => (
                          <List.Item>
                            <List.Item.Meta
                              title={student.fullName}
                              description={
                                <div>
                                  <div>{student.studentId} - {student.email}</div>
                                  <div>
                                    {student.currentGroup ? (
                                      <Tag color="green" style={{ marginTop: '4px' }}>
                                        {classGroups.find(g => g._id === student.currentGroup)?.groupName || 'In Group'}
                                      </Tag>
                                    ) : (
                                      <Tag color="orange" style={{ marginTop: '4px' }}>No Group</Tag>
                                    )}
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )
                },
                {
                  key: 'groups',
                  label: `Groups (${classGroups.length})`,
                  children: (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <List
                        dataSource={classGroups}
                        renderItem={(group) => (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <Space>
                                  {group.groupName}
                                  <Tag color={group.status === 'open' ? 'blue' : 'red'}>
                                    {group.status?.toUpperCase()}
                                  </Tag>
                                </Space>
                              }
                              description={
                                <div>
                                  <div><strong>Leader:</strong> {group.leader?.fullName}</div>
                                  <div><strong>Members:</strong> {group.members?.length}/5</div>
                                  <div style={{ marginTop: '8px' }}>
                                    {group.members?.map((member, idx) => (
                                      <Tag key={idx} style={{ marginBottom: '4px' }}>
                                        {member.user?.fullName}
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )
                }
              ]}
            />

            {user?.role === 'moderator' && (
              <div style={{ marginTop: '20px' }}>
                <Button 
                  type="primary" 
                  onClick={() => {
                    setIsDetailsDrawerVisible(false);
                    handleEditClick(selectedCourse);
                  }}
                  style={{ width: '100%' }}
                >
                  Edit Class
                </Button>
              </div>
            )}
          </Spin>
        )}
      </Drawer>

      {/* Edit Modal */}
      <Modal
        title="Edit Class"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
          setSelectedCourse(null);
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleEditCourse}>
          <Form.Item 
            label="Class Code (6 characters)" 
            name="classCode" 
            rules={[
              { required: true, message: 'Class code is required' },
              { len: 6, message: 'Class code must be exactly 6 characters' }
            ]}
          >
            <Input placeholder="e.g., EXE001" maxLength={6} />
          </Form.Item>

          <Form.Item 
            label="Lecturer" 
            name="lecturerId" 
            rules={[{ required: true, message: 'Please select a lecturer' }]}
          >
            <Select placeholder="Select lecturer">
              {lecturers.map(lecturer => (
                <Select.Option key={lecturer._id} value={lecturer._id}>
                  {lecturer.fullName} ({lecturer.studentId})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Semester" 
            name="semester" 
            rules={[{ required: true, message: 'Please select a semester' }]}
          >
            <Select placeholder="Select semester">
              <Select.Option value="SPRING">Spring</Select.Option>
              <Select.Option value="SUMMER">Summer</Select.Option>
              <Select.Option value="FALL">Fall</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Year" 
            name="year" 
            rules={[{ required: true, message: 'Please enter year' }]}
          >
            <Input type="number" placeholder="e.g., 2024" />
          </Form.Item>

          <Form.Item 
            label="Room" 
            name="room" 
            rules={[{ required: true, message: 'Room is required' }]}
          >
            <Input placeholder="e.g., NVH001" />
          </Form.Item>

          <Form.Item 
            label="Day of Week" 
            name="dayOfWeek" 
            rules={[{ required: true, message: 'Please select day' }]}
          >
            <Select placeholder="Select day">
              <Select.Option value="1">Monday</Select.Option>
              <Select.Option value="2">Tuesday</Select.Option>
              <Select.Option value="3">Wednesday</Select.Option>
              <Select.Option value="4">Thursday</Select.Option>
              <Select.Option value="5">Friday</Select.Option>
              <Select.Option value="6">Saturday</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Time Slot" 
            name="slot" 
            rules={[{ required: true, message: 'Please select a time slot' }]}
          >
            <Select placeholder="Select time slot">
              <Select.Option value="slot1">Slot 1 (7:00 - 9:15)</Select.Option>
              <Select.Option value="slot2">Slot 2 (9:30 - 11:45)</Select.Option>
              <Select.Option value="slot3">Slot 3 (12:30 - 14:45)</Select.Option>
              <Select.Option value="slot4">Slot 4 (15:00 - 17:15)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Max Students" 
            name="maxStudents" 
            rules={[{ required: true, message: 'Max students is required' }]}
          >
            <Input type="number" placeholder="e.g., 40" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Update Class
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Courses;
