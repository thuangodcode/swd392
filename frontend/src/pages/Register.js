import React from 'react';
import { Form, Input, Button, Select, Card, message, Spin } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form] = Form.useForm();
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await register(
        values.studentId,
        values.email,
        values.password,
        values.fullName,
        values.role,
        values.course,
        values.major
      );
      message.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.message || error.errors?.[0]?.msg || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '30px auto' }}>
      <Card title="Register - EXE101 Group Management System">
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="Student ID"
              name="studentId"
              rules={[{ required: true, message: 'Please enter your student ID' }]}
            >
              <Input placeholder="e.g., SE123456" />
            </Form.Item>

            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              label="Major"
              name="major"
              rules={[{ required: true, message: 'Please select your major' }]}
            >
              <Select placeholder="Select your major">
                <Select.Option value="Software Engineering">Software Engineering</Select.Option>
                <Select.Option value="Information Technology">Information Technology</Select.Option>
                <Select.Option value="Computer Science">Computer Science</Select.Option>
                <Select.Option value="Information Systems">Information Systems</Select.Option>
                <Select.Option value="Network Administration">Network Administration</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Course"
              name="course"
              rules={[{ required: true, message: 'Please select your course' }]}
            >
              <Select placeholder="Select your course">
                <Select.Option value="K15">K15</Select.Option>
                <Select.Option value="K16">K16</Select.Option>
                <Select.Option value="K17">K17</Select.Option>
                <Select.Option value="K18">K18</Select.Option>
                <Select.Option value="K19">K19</Select.Option>
                <Select.Option value="K20">K20</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password (min 6 characters)" />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm password" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              initialValue="student"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select disabled>
                <Select.Option value="student">Student</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Register
              </Button>
            </Form.Item>

            <Form.Item>
              <p>
                Already have an account? <a href="/login">Login here</a>
              </p>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Register;
