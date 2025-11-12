import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Tag,
  Drawer,
  Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Lecturers = () => {
  const { user } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingLecturer, setViewingLecturer] = useState(null);
  const [form] = Form.useForm();

  // Fetch all lecturers
  const fetchLecturers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users/lecturer/all');
      if (response.data.success) {
        setLecturers(response.data.data);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to fetch lecturers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  // Handle create/update lecturer
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        // Update
        const { password, ...updateData } = values;
        const response = await axios.put(`/api/users/lecturer/${editingId}`, updateData);
        if (response.data.success) {
          message.success('Lecturer updated successfully');
          setEditingId(null);
        }
      } else {
        // Create
        const response = await axios.post('/users/lecturer/create', values);
        if (response.data.success) {
          message.success('Lecturer created successfully');
        }
      }
      form.resetFields();
      setIsModalVisible(false);
      fetchLecturers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save lecturer');
    }
  };

  // Handle delete lecturer
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/users/lecturer/${id}`);
      if (response.data.success) {
        message.success('Lecturer deleted successfully');
        fetchLecturers();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete lecturer');
    }
  };

  // Handle view lecturer
  const handleView = (lecturer) => {
    setViewingLecturer(lecturer);
    setIsViewDrawerVisible(true);
  };

  // Handle edit lecturer
  const handleEdit = (lecturer) => {
    form.setFieldsValue({
      fullName: lecturer.fullName,
      email: lecturer.email,
      phone: lecturer.phone,
      major: lecturer.major || ''
    });
    setEditingId(lecturer._id);
    setIsModalVisible(true);
  };

  // Handle open create modal
  const handleOpenCreateModal = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Lecturer ID',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: 'Major',
      dataIndex: 'major',
      key: 'major',
      width: 100
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete Lecturer"
            description="Are you sure you want to delete this lecturer?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger" size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Check if user is moderator
  if (user && user.role !== 'moderator') {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only moderators can manage lecturers.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Lecturer Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
        >
          Create Lecturer
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={lecturers}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? 'Edit Lecturer' : 'Create New Lecturer'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {!editingId && (
            <>
              <Form.Item
                label="Lecturer ID"
                name="studentId"
                rules={[{ required: true, message: 'Please enter lecturer ID' }]}
              >
                <Input placeholder="e.g., LEC20201234" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Invalid email format' }
                ]}
              >
                <Input placeholder="lecturer@example.com" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password placeholder="Temporary password" />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="e.g., Dr. John Smith" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
          >
            <Input placeholder="e.g., +84912345678" />
          </Form.Item>

          <Form.Item
            label="Major"
            name="major"
          >
            <Select placeholder="Select major">
              <Select.Option value="Software Engineering">Software Engineering</Select.Option>
              <Select.Option value="Information Technology">Information Technology</Select.Option>
              <Select.Option value="Computer Science">Computer Science</Select.Option>
              <Select.Option value="Information Systems">Information Systems</Select.Option>
              <Select.Option value="Network Administration">Network Administration</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Drawer */}
      <Drawer
        title="Lecturer Details"
        placement="right"
        width={400}
        onClose={() => setIsViewDrawerVisible(false)}
        open={isViewDrawerVisible}
      >
        {viewingLecturer && (
          <div>
            <p>
              <strong>Lecturer ID:</strong> {viewingLecturer.studentId}
            </p>
            <p>
              <strong>Full Name:</strong> {viewingLecturer.fullName}
            </p>
            <p>
              <strong>Email:</strong> {viewingLecturer.email}
            </p>
            <p>
              <strong>Phone:</strong> {viewingLecturer.phone || 'N/A'}
            </p>
            <p>
              <strong>Major:</strong> {viewingLecturer.major || 'N/A'}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <Tag color={viewingLecturer.isActive ? 'green' : 'red'}>
                {viewingLecturer.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </p>
            <p>
              <strong>Created At:</strong> {new Date(viewingLecturer.createdAt).toLocaleDateString()}
            </p>

            <div style={{ marginTop: '20px' }}>
              <Button
                type="primary"
                onClick={() => {
                  setIsViewDrawerVisible(false);
                  handleEdit(viewingLecturer);
                }}
                style={{ width: '100%' }}
              >
                Edit Lecturer
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Lecturers;
