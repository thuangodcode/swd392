import { Form, Input, Button, Select } from "antd";
import { motion } from "framer-motion";
import { Mail, Lock, User, IdCard, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from '../context/AuthContext';

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
      toast.success('Registration successful! Please login.', { duration: 2000, position: "top-center" });
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.message || error.errors?.[0]?.msg || 'Registration failed';
      toast.error(errorMsg, { duration: 3000 });
    }
  };

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="w-100 px-3" style={{ maxWidth: '520px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card shadow-lg border-0 rounded-4 p-4">
            <div className="mb-4">
              <h1 className="h3 fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                <Shield className="w-10 h-8" style={{ width: '40px', height: '32px' }} />
                EXE101 Squad Welcomes
              </h1>
              <h2 className="h4 fw-bold text-dark mb-2">Create account</h2>
              <p className="text-muted">Please fill in your information to sign up</p>
            </div>

            <Form
              form={form}
              name="register_form"
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                label={<span className="fw-medium text-dark">Student ID</span>}
                name="studentId"
                rules={[{ required: true, message: 'Please enter your student ID' }]}
              >
                <Input 
                  prefix={<IdCard className="w-4 h-4 text-muted" style={{ width: '16px', height: '16px' }} />}
                  placeholder="e.g., SE123456" 
                  size="large"
                  className="rounded"
                />
              </Form.Item>

              <Form.Item
                label={<span className="fw-medium text-dark">Full Name</span>}
                name="fullName"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input 
                  prefix={<User className="w-4 h-4 text-muted" style={{ width: '16px', height: '16px' }} />}
                  placeholder="Enter your full name" 
                  size="large"
                  className="rounded"
                />
              </Form.Item>

              <Form.Item
                label={<span className="fw-medium text-dark">Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Invalid email format' }
                ]}
                validateTrigger="onBlur"
              >
                <Input 
                  prefix={<Mail className="w-4 h-4 text-muted" style={{ width: '16px', height: '16px' }} />}
                  placeholder="Enter your email" 
                  size="large"
                  className="rounded"
                />
              </Form.Item>

              <Form.Item
                label={<span className="fw-medium text-dark">Major</span>}
                name="major"
                rules={[{ required: true, message: 'Please select your major' }]}
              >
                <Select placeholder="Select your major" size="large" className="rounded">
                  <Select.Option value="Software Engineering">Software Engineering</Select.Option>
                  <Select.Option value="Information Technology">Information Technology</Select.Option>
                  <Select.Option value="Computer Science">Computer Science</Select.Option>
                  <Select.Option value="Information Systems">Information Systems</Select.Option>
                  <Select.Option value="Network Administration">Network Administration</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className="fw-medium text-dark">Course</span>}
                name="course"
                rules={[{ required: true, message: 'Please select your course' }]}
              >
                <Select placeholder="Select your course" size="large" className="rounded">
                  <Select.Option value="K15">K15</Select.Option>
                  <Select.Option value="K16">K16</Select.Option>
                  <Select.Option value="K17">K17</Select.Option>
                  <Select.Option value="K18">K18</Select.Option>
                  <Select.Option value="K19">K19</Select.Option>
                  <Select.Option value="K20">K20</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className="fw-medium text-dark">Password</span>}
                name="password"
                rules={[
                  { required: true, message: 'Please enter a password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password 
                  prefix={<Lock className="w-4 h-4 text-muted" style={{ width: '16px', height: '16px' }} />}
                  placeholder="Enter password (min 6 characters)" 
                  size="large"
                  className="rounded"
                />
              </Form.Item>

              <Form.Item
                label={<span className="fw-medium text-dark">Confirm Password</span>}
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
                <Input.Password 
                  prefix={<Lock className="w-4 h-4 text-muted" style={{ width: '16px', height: '16px' }} />}
                  placeholder="Confirm password" 
                  size="large"
                  className="rounded"
                />
              </Form.Item>

              <Form.Item
                label={<span className="fw-medium text-dark">Role</span>}
                name="role"
                initialValue="student"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select disabled size="large" className="rounded">
                  <Select.Option value="student">Student</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item className="mb-3">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={loading}
                  className="w-100 py-2 fw-semibold"
                  style={{ height: '48px' }}
                >
                  Register
                </Button>
              </Form.Item>

              <div className="text-center small text-muted">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary text-decoration-none fw-semibold"
                >
                  Login here
                </Link>
              </div>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
