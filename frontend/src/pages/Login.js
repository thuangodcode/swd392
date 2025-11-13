import { Form, Input, Button, Checkbox } from "antd";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Mail, Lock, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode as jwt_decode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const data = await login(values.email, values.password);
      const decoded = jwt_decode(data.token);
      const role = decoded.role || "Student";
      switch (role) {
        case "Admin":
          navigate("/admin");
          break;
        case "Leader":
          navigate("/leader");
          break;
        case "Student":
          navigate("/student");
          break;
        case "Lecturer":
          navigate("/lecturer");
          break;
        default:
          navigate("/");
      }
      toast.success("Login successfully", { duration: 2000, position: "top-center" });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid email or password", { duration: 2000 });
    }
  };

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
      <Toaster />

      <div className="w-100 px-3" style={{ maxWidth: '440px' }}>
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
              <h2 className="h4 fw-bold text-dark mb-2">Sign in</h2>
              <p className="text-muted">Please enter your information to continue</p>
            </div>

            <Form
              name="login_form"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                label={<span className="fw-medium text-dark">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "The email is not properly formatted!" },
                ]}
                validateTrigger="onBlur"
              >
                <Input
                  prefix={<Mail className="w-4 h-4 text-muted" style={{ width: '16px', height: '16px' }} />}
                  placeholder="user@example.com"
                  size="large"
                  className="rounded"
                />
              </Form.Item>

              <Form.Item
                label={<span className="fw-medium text-dark">Password</span>}
                name="password"
                rules={[{ required: true, message: "Please enter your password!" }]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-muted" style={{ width: '16px', height: '16px' }} />}
                  placeholder="password123"
                  size="large"
                  className="rounded"
                />
              </Form.Item>

              <div className="d-flex align-items-center justify-content-between mb-3">
                <Form.Item name="remember" valuePropName="checked" className="mb-0">
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link
                  to="/forget-password"
                  className="text-primary text-decoration-none fw-medium small"
                >
                  Forgot password?
                </Link>
              </div>

              <Form.Item className="mb-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="w-100 py-2 fw-semibold"
                  style={{ height: '48px' }}
                >
                  Sign In
                </Button>
              </Form.Item>

              <div className="text-center small text-muted">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary text-decoration-none fw-semibold"
                >
                  Sign up now
                </Link>
              </div>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
          
