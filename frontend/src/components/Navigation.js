import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header } = Layout;

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Header style={{ background: '#001529', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
        EXE101 - Group Management System
      </div>
      {user && (
        <Menu theme="dark" mode="horizontal" style={{ flex: 1, marginLeft: 50 }}>
          <Menu.Item key="dashboard">
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="courses">
            <Link to="/courses">Classes</Link>
          </Menu.Item>
          <Menu.Item key="groups">
            <Link to="/groups">Groups</Link>
          </Menu.Item>
          <Menu.Item key="projects">
            <Link to="/projects">Projects</Link>
          </Menu.Item>
          {user.role === 'moderator' && (
            <>
              <Menu.Item key="lecturers">
                <Link to="/lecturers">Lecturers</Link>
              </Menu.Item>
              <Menu.Item key="students">
                <Link to="/students">Students</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      )}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: 'white' }}>
          <span>{user.fullName} ({user.role?.toUpperCase()})</span>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            Logout
          </Button>
        </div>
      ) : null}
    </Header>
  );
};

export default Navigation;
