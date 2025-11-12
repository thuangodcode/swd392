import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  Button,
  Table,
  Space,
  message,
  Modal,
  Form,
  Input,
  Tabs,
  Tag,
  Spin,
  Empty,
  Drawer,
  List,
  Alert,
  Select
} from 'antd';
import { PlusOutlined, LogoutOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Groups = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [myStatus, setMyStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [allStudentsInClass, setAllStudentsInClass] = useState([]);
  const [studentDetailsDrawerVisible, setStudentDetailsDrawerVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lecturerClasses, setLecturerClasses] = useState([]);
  const [groupsByClass, setGroupsByClass] = useState({});
  const [selectedGroupProject, setSelectedGroupProject] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.role === 'student' && user?.currentClass) {
      fetchGroupsAndStatus();
      fetchAllStudentsInClass();
    } else if (user?.role === 'lecturer') {
      fetchLecturerClassesAndGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, user?.currentClass, user?.currentGroup, location.pathname]); // Add location to trigger on route change

  const fetchGroupsAndStatus = async () => {
    setLoading(true);
    try {
      if (!user?.currentClass) {
        setLoading(false);
        return;
      }

      // Get groups
      const groupsRes = await axios.get(`/api/groups/class/${user.currentClass}`);
      setGroups(groupsRes.data.data || []);

      // Get my status
      const statusRes = await axios.get('/groups/my/status');
      setMyStatus(statusRes.data.data || {});
    } catch (error) {
      message.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await axios.get('/groups/available/students');
      setAvailableStudents(response.data.data || []);
    } catch (error) {
      message.error('Failed to fetch available students');
    }
  };

  const fetchAllStudentsInClass = async () => {
    try {
      if (!user?.currentClass) return;
      
      const response = await axios.get(`/api/users/class/${user.currentClass}`);
      setAllStudentsInClass(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchLecturerClassesAndGroups = async () => {
    setLoading(true);
    try {
      // Get all courses taught by this lecturer
      const coursesRes = await axios.get('/courses/available');
      const myClasses = coursesRes.data.data?.filter(c => c.lecturer?._id === user.id) || [];
      setLecturerClasses(myClasses);

      // Fetch groups for each class
      const groupsData = {};
      for (const classItem of myClasses) {
        try {
          const groupsRes = await axios.get(`/api/groups/class/${classItem.classCode}/public`);
          groupsData[classItem.classCode] = groupsRes.data.data || [];
        } catch (error) {
          console.error(`Failed to fetch groups for ${classItem.classCode}:`, error);
          groupsData[classItem.classCode] = [];
        }
      }
      setGroupsByClass(groupsData);
    } catch (error) {
      message.error('Failed to fetch classes and groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupProject = async (groupId) => {
    try {
      const response = await axios.get(`/api/projects/group/${groupId}`);
      setSelectedGroupProject(response.data.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch project:', error);
      }
      setSelectedGroupProject(null);
    }
  };

  const handleViewGroupDetails = async (group) => {
    setSelectedGroup(group);
    setDetailsDrawerVisible(true);
    await fetchGroupProject(group._id);
  };

  const handleCreateGroup = async (values) => {
    try {
      // Find the course ID for current class
      const coursesRes = await axios.get('/courses/available');
      const currentCourse = coursesRes.data.data?.find(c => c.classCode === user.currentClass);

      if (!currentCourse) {
        message.error('Course not found');
        return;
      }

      await axios.post('/groups', {
        groupName: values.groupName,
        courseId: currentCourse._id
      });

      message.success('Group created successfully');
      setIsCreateModalVisible(false);
      form.resetFields();
      await refreshUser(); // Refresh user to update currentGroup
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  const handleInviteStudent = async (values) => {
    try {
      await axios.post(`/api/groups/${selectedGroup._id}/invite`, {
        studentId: values.studentId
      });

      message.success('Invitation sent');
      setIsInviteModalVisible(false);
      form.resetFields();
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleOpenInviteModal = async (group) => {
    setSelectedGroup(group);
    await fetchAvailableStudents();
    setIsInviteModalVisible(true);
  };

  const handleAcceptInvite = async (groupId) => {
    try {
      await axios.post(`/api/groups/${groupId}/accept-invite`);
      message.success('Joined group successfully');
      await refreshUser(); // Refresh user to update currentGroup
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleRejectInvite = async (groupId) => {
    try {
      await axios.post(`/api/groups/${groupId}/reject-invite`);
      message.success('Invitation rejected');
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to reject invitation');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.post(`/api/groups/${myStatus.currentGroup?._id}/leave`);
      message.success('Left group successfully');
      await refreshUser(); // Refresh user to update currentGroup
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleRequestJoin = async (groupId) => {
    try {
      await axios.post(`/api/groups/${groupId}/request`);
      message.success('Join request sent successfully');
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleCancelRequest = async (groupId) => {
    try {
      await axios.post(`/api/groups/${groupId}/cancel-request`);
      message.success('Request cancelled successfully');
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleAcceptRequest = async (groupId, userId) => {
    try {
      await axios.post(`/api/groups/${groupId}/accept-request/${userId}`);
      message.success('Request accepted successfully');
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (groupId, userId) => {
    try {
      await axios.post(`/api/groups/${groupId}/reject-request/${userId}`);
      message.success('Request rejected successfully');
      fetchGroupsAndStatus();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleInviteStudentDirect = async (studentId) => {
    try {
      if (!myStatus.currentGroup) {
        message.error('You must be in a group to invite students');
        return;
      }

      if (myStatus.currentGroup.leader?._id !== user.id) {
        message.error('Only group leader can invite students');
        return;
      }

      await axios.post(`/api/groups/${myStatus.currentGroup._id}/invite`, {
        studentId: studentId
      });

      message.success('Invitation sent successfully');
      fetchGroupsAndStatus();
      fetchAllStudentsInClass();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  // Lecturer View
  if (user?.role === 'lecturer') {
    const lecturerGroupColumns = [
      {
        title: 'Group Name',
        dataIndex: 'groupName',
        key: 'groupName',
        width: 200
      },
      {
        title: 'Leader',
        key: 'leader',
        width: 180,
        render: (_, record) => record.leader?.fullName || 'N/A'
      },
      {
        title: 'Members',
        key: 'members',
        width: 100,
        render: (_, record) => `${record.members?.length || 0}/5`
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => (
          <Tag color={status === 'open' ? 'blue' : 'red'}>
            {status?.toUpperCase()}
          </Tag>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (_, record) => (
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewGroupDetails(record)}
          >
            Details
          </Button>
        )
      }
    ];

    return (
      <div style={{ padding: '20px' }}>
        <Card title={<h2>Groups by Class - {user?.fullName}</h2>}>
          <Spin spinning={loading}>
            {lecturerClasses.length === 0 ? (
              <Empty description="You are not teaching any classes yet" />
            ) : (
              <Tabs
                items={lecturerClasses.map(classItem => ({
                  key: classItem.classCode,
                  label: `${classItem.classCode} (${groupsByClass[classItem.classCode]?.length || 0} groups)`,
                  children: (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <p><strong>Course:</strong> {classItem.courseCode}</p>
                        <p><strong>Semester:</strong> {classItem.semester} {classItem.year}</p>
                        <p><strong>Room:</strong> {classItem.room}</p>
                        <p><strong>Students:</strong> {classItem.currentStudents || classItem.enrolledStudents?.length || 0}/{classItem.maxStudents}</p>
                      </div>
                      <Table
                        columns={lecturerGroupColumns}
                        dataSource={groupsByClass[classItem.classCode] || []}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: 'No groups in this class yet' }}
                      />
                    </div>
                  )
                }))}
              />
            )}
          </Spin>
        </Card>

        {/* Group Details Drawer for Lecturer */}
        <Drawer
          title="Group Details"
          placement="right"
          width={700}
          onClose={() => {
            setDetailsDrawerVisible(false);
            setSelectedGroup(null);
            setSelectedGroupProject(null);
          }}
          open={detailsDrawerVisible}
        >
          {selectedGroup && (
            <div>
              <h3>{selectedGroup.groupName}</h3>
              
              <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <p><strong>Class Code:</strong> {selectedGroup.classCode}</p>
                <p><strong>Leader:</strong> {selectedGroup.leader?.fullName}</p>
                <p><strong>Status:</strong> <Tag color={selectedGroup.status === 'open' ? 'blue' : 'red'}>{selectedGroup.status?.toUpperCase()}</Tag></p>
                <p><strong>Members:</strong> {selectedGroup.members?.length}/5</p>
                <p><strong>Created At:</strong> {new Date(selectedGroup.createdAt).toLocaleDateString()}</p>
              </div>

              <h4>Members List:</h4>
              <List
                dataSource={selectedGroup.members}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.user?.fullName}
                      description={
                        <div>
                          <div>{item.user?.studentId} - {item.user?.email}</div>
                          <div style={{ marginTop: '4px' }}>
                            {selectedGroup.leader?._id === item.user?._id && (
                              <Tag color="gold">Leader</Tag>
                            )}
                            <Tag color="blue">Joined: {new Date(item.joinedAt).toLocaleDateString()}</Tag>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                style={{ marginBottom: '24px' }}
              />

              {selectedGroupProject ? (
                <>
                  <h4>Project Information:</h4>
                  <Card style={{ marginTop: '16px' }}>
                    <p><strong>Project Name:</strong> {selectedGroupProject.projectName}</p>
                    <p><strong>Description:</strong></p>
                    <div style={{ whiteSpace: 'pre-wrap', marginLeft: '16px', marginBottom: '12px' }}>
                      {selectedGroupProject.description}
                    </div>
                    
                    {selectedGroupProject.objectives && (
                      <>
                        <p><strong>Objectives:</strong></p>
                        <div style={{ whiteSpace: 'pre-wrap', marginLeft: '16px', marginBottom: '12px' }}>
                          {selectedGroupProject.objectives}
                        </div>
                      </>
                    )}

                    {selectedGroupProject.techStack?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Tech Stack:</strong>
                        <div style={{ marginTop: '8px' }}>
                          {selectedGroupProject.techStack.map((tech, idx) => (
                            <Tag key={idx} color="blue" style={{ marginBottom: '4px' }}>
                              {tech}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedGroupProject.githubRepository && (
                      <p>
                        <strong>GitHub:</strong>{' '}
                        <a href={selectedGroupProject.githubRepository} target="_blank" rel="noopener noreferrer">
                          {selectedGroupProject.githubRepository}
                        </a>
                      </p>
                    )}

                    <p>
                      <strong>Approval Status:</strong>{' '}
                      <Tag color={
                        selectedGroupProject.approvalStatus === 'approved' ? 'green' :
                        selectedGroupProject.approvalStatus === 'pending' ? 'orange' : 'red'
                      }>
                        {selectedGroupProject.approvalStatus?.toUpperCase() || 'NOT SUBMITTED'}
                      </Tag>
                    </p>

                    {selectedGroupProject.approvalComment && (
                      <Alert
                        message="Lecturer Comment"
                        description={selectedGroupProject.approvalComment}
                        type={selectedGroupProject.approvalStatus === 'approved' ? 'success' : 'warning'}
                        showIcon
                        style={{ marginTop: '12px' }}
                      />
                    )}

                    {selectedGroupProject.submittedToLecturerAt && (
                      <p style={{ marginTop: '12px' }}>
                        <strong>Submitted:</strong> {new Date(selectedGroupProject.submittedToLecturerAt).toLocaleString()}
                      </p>
                    )}

                    <p><strong>Created:</strong> {new Date(selectedGroupProject.createdAt).toLocaleString()}</p>
                  </Card>
                </>
              ) : (
                <Alert
                  message="No Project Yet"
                  description="This group hasn't created a project yet."
                  type="info"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              )}
            </div>
          )}
        </Drawer>
      </div>
    );
  }

  // Student View
  if (user?.role !== 'student') {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message="Access restricted" type="info" />
      </div>
    );
  }

  if (!user?.currentClass) {
    return (
      <div style={{ padding: '20px' }}>
        <Empty
          description="You must enroll in a class first"
          style={{ marginTop: '50px' }}
        >
          <Button type="primary" href="/courses">
            Go to Classes
          </Button>
        </Empty>
      </div>
    );
  }

  const groupColumns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName'
    },
    {
      title: 'Leader',
      key: 'leader',
      render: (_, record) => record.leader?.fullName || 'N/A'
    },
    {
      title: 'Members',
      key: 'members',
      render: (_, record) => `${record.members?.length || 0}/5`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'open' ? 'blue' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isInvited = myStatus.groupInvites?.some(inv => inv._id === record._id);
        const hasRequested = record.pendingRequests?.some(req => req.user?._id === user.id);
        const isMember = record.members?.some(m => m.user?._id === user.id);
        const isLeader = record.leader?._id === user.id;
        
        return (
          <Space size="small" wrap>
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewGroupDetails(record)}
            >
              Details
            </Button>
            
            {/* Leader actions */}
            {myStatus.currentGroup?._id === record._id && isLeader && record.members.length < 5 && (
              <Button
                type="default"
                size="small"
                onClick={() => handleOpenInviteModal(record)}
              >
                Invite
              </Button>
            )}
            
            {/* Student without group actions */}
            {!myStatus.currentGroup && !isMember && (
              <>
                {isInvited ? (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleAcceptInvite(record._id)}
                  >
                    Accept Invite
                  </Button>
                ) : hasRequested ? (
                  <Button
                    size="small"
                    onClick={() => handleCancelRequest(record._id)}
                  >
                    Cancel Request
                  </Button>
                ) : record.members.length < 5 ? (
                  <Button
                    type="default"
                    size="small"
                    onClick={() => handleRequestJoin(record._id)}
                  >
                    Request to Join
                  </Button>
                ) : null}
              </>
            )}
            
            {/* Leave button for members */}
            {myStatus.currentGroup?._id === record._id && (
              <Button
                danger
                size="small"
                icon={<LogoutOutlined />}
                onClick={handleLeaveGroup}
              >
                Leave
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  const studentColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250
    },
    {
      title: 'Group Status',
      key: 'groupStatus',
      width: 150,
      render: (_, record) => {
        if (record.currentGroup) {
          const group = groups.find(g => g._id === record.currentGroup);
          return (
            <Tag color="blue">
              {group ? group.groupName : 'In Group'}
            </Tag>
          );
        }
        return <Tag color="default">No Group</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const isMe = record._id === user.id;
        const studentHasGroup = record.currentGroup !== null;
        const isLeader = myStatus.currentGroup?.leader?._id === user.id;
        const canInvite = isLeader && !studentHasGroup && myStatus.currentGroup?.members?.length < 5;
        
        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedStudent(record);
                setStudentDetailsDrawerVisible(true);
              }}
            >
              Details
            </Button>
            
            {!isMe && canInvite && (
              <Button
                type="default"
                size="small"
                onClick={() => handleInviteStudentDirect(record.studentId)}
              >
                Invite
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Spin spinning={loading}>
        <Tabs
          items={[
            {
              key: 'my-group',
              label: 'My Group',
              children: (
                <Card>
                  {myStatus.currentGroup ? (
                    <div>
                      <h3>{myStatus.currentGroup.groupName}</h3>
                      <p><strong>Leader:</strong> {myStatus.currentGroup.leader?.fullName}</p>
                      <p><strong>Members:</strong> {myStatus.currentGroup.members?.length}/5</p>
                      <p><strong>Status:</strong> <Tag color={myStatus.currentGroup.status === 'open' ? 'blue' : 'red'}>{myStatus.currentGroup.status?.toUpperCase()}</Tag></p>
                      
                      <h4 style={{ marginTop: '20px' }}>Members:</h4>
                      <List
                        dataSource={myStatus.currentGroup.members}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={item.user?.fullName}
                              description={`${item.user?.studentId} - ${item.user?.email}`}
                            />
                            {myStatus.currentGroup.leader?._id === item.user?._id && (
                              <Tag color="gold">Leader</Tag>
                            )}
                          </List.Item>
                        )}
                      />

                      {/* Show pending requests for leader */}
                      {myStatus.currentGroup.leader?._id === user.id && myStatus.currentGroup.pendingRequests?.length > 0 && (
                        <>
                          <h4 style={{ marginTop: '20px' }}>Pending Join Requests ({myStatus.currentGroup.pendingRequests.length}):</h4>
                          <List
                            dataSource={myStatus.currentGroup.pendingRequests}
                            renderItem={(request) => (
                              <List.Item
                                actions={[
                                  <Button
                                    key="accept"
                                    type="primary"
                                    size="small"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleAcceptRequest(myStatus.currentGroup._id, request.user._id)}
                                  >
                                    Accept
                                  </Button>,
                                  <Button
                                    key="reject"
                                    danger
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => handleRejectRequest(myStatus.currentGroup._id, request.user._id)}
                                  >
                                    Reject
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  title={request.user?.fullName}
                                  description={`${request.user?.studentId} - ${request.user?.email}`}
                                />
                              </List.Item>
                            )}
                          />
                        </>
                      )}

                      {myStatus.currentGroup.leader?._id === user.id && (
                        <Button
                          type="primary"
                          style={{ marginTop: '20px' }}
                          onClick={() => handleOpenInviteModal(myStatus.currentGroup)}
                        >
                          Invite Student
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Empty description="You are not in any group">
                      <Button
                        type="primary"
                        onClick={() => setIsCreateModalVisible(true)}
                        icon={<PlusOutlined />}
                      >
                        Create Group
                      </Button>
                    </Empty>
                  )}
                </Card>
              )
            },
            {
              key: 'group-invites',
              label: `Group Invites (${myStatus.groupInvites?.length || 0})`,
              children: (
                <Card>
                  {myStatus.groupInvites && myStatus.groupInvites.length > 0 ? (
                    <List
                      dataSource={myStatus.groupInvites}
                      renderItem={(invite) => (
                        <List.Item
                          actions={[
                            <Button
                              type="primary"
                              size="small"
                              icon={<CheckOutlined />}
                              onClick={() => handleAcceptInvite(invite._id)}
                            >
                              Accept
                            </Button>,
                            <Button
                              danger
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={() => handleRejectInvite(invite._id)}
                            >
                              Reject
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={invite.groupName}
                            description={`Led by ${invite.leader?.fullName}`}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No group invitations" />
                  )}
                </Card>
              )
            },
            {
              key: 'all-groups',
              label: 'All Groups in Class',
              children: (
                <Card
                  title="Available Groups"
                  extra={
                    !myStatus.currentGroup && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalVisible(true)}
                      >
                        Create Group
                      </Button>
                    )
                  }
                >
                  <Table
                    columns={groupColumns}
                    dataSource={groups}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              )
            },
            {
              key: 'all-students',
              label: 'All Students in Class',
              children: (
                <Card title={`Students in ${user.currentClass}`}>
                  <Table
                    columns={studentColumns}
                    dataSource={allStudentsInClass}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                  />
                </Card>
              )
            }
          ]}
        />
      </Spin>

      {/* Create Group Modal */}
      <Modal
        title="Create New Group"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateGroup}>
          <Form.Item
            label="Group Name"
            name="groupName"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input placeholder="e.g., Team Alpha" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Create Group
          </Button>
        </Form>
      </Modal>

      {/* Invite Student Modal */}
      <Modal
        title="Invite Student"
        open={isInviteModalVisible}
        onCancel={() => {
          setIsInviteModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleInviteStudent}>
          <Form.Item
            label="Select Student"
            name="studentId"
            rules={[{ required: true, message: 'Please select a student' }]}
          >
            <Select placeholder="Choose a student to invite">
              {availableStudents.map(student => (
                <Select.Option key={student._id} value={student.studentId}>
                  {student.fullName} ({student.studentId})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {availableStudents.length === 0 && (
            <Alert 
              message="No available students to invite" 
              type="info" 
              style={{ marginBottom: '16px' }}
            />
          )}

          <Button type="primary" htmlType="submit" block disabled={availableStudents.length === 0}>
            Send Invitation
          </Button>
        </Form>
      </Modal>

      {/* Group Details Drawer */}
      <Drawer
        title="Group Details"
        placement="right"
        width={500}
        onClose={() => {
          setDetailsDrawerVisible(false);
          setSelectedGroup(null);
          setSelectedGroupProject(null);
        }}
        open={detailsDrawerVisible}
      >
        {selectedGroup && (
          <div>
            <p><strong>Group Name:</strong> {selectedGroup.groupName}</p>
            <p><strong>Leader:</strong> {selectedGroup.leader?.fullName}</p>
            <p><strong>Status:</strong> <Tag color={selectedGroup.status === 'open' ? 'blue' : 'red'}>{selectedGroup.status?.toUpperCase()}</Tag></p>
            <p><strong>Members:</strong> {selectedGroup.members?.length}/5</p>

            <h4>Members List:</h4>
            <List
              dataSource={selectedGroup.members}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.user?.fullName}
                    description={`${item.user?.studentId} - ${item.user?.email}`}
                  />
                </List.Item>
              )}
              style={{ marginBottom: '16px' }}
            />

            {selectedGroupProject ? (
              <>
                <h4>Project Information:</h4>
                <Card size="small" style={{ marginTop: '8px' }}>
                  <p><strong>Project Name:</strong> {selectedGroupProject.projectName}</p>
                  <p><strong>Description:</strong></p>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', marginBottom: '8px' }}>
                    {selectedGroupProject.description}
                  </div>
                  
                  {selectedGroupProject.techStack?.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Tech Stack:</strong>
                      <div style={{ marginTop: '4px' }}>
                        {selectedGroupProject.techStack.map((tech, idx) => (
                          <Tag key={idx} color="blue" size="small">
                            {tech}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  <p>
                    <strong>Status:</strong>{' '}
                    <Tag color={
                      selectedGroupProject.approvalStatus === 'approved' ? 'green' :
                      selectedGroupProject.approvalStatus === 'pending' ? 'orange' : 'red'
                    }>
                      {selectedGroupProject.approvalStatus?.toUpperCase() || 'DRAFT'}
                    </Tag>
                  </p>
                </Card>
              </>
            ) : (
              <Alert
                message="No project yet"
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </div>
        )}
      </Drawer>

      {/* Student Details Drawer */}
      <Drawer
        title="Student Details"
        placement="right"
        width={500}
        onClose={() => setStudentDetailsDrawerVisible(false)}
        open={studentDetailsDrawerVisible}
      >
        {selectedStudent && (
          <div>
            <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
            <p><strong>Full Name:</strong> {selectedStudent.fullName}</p>
            <p><strong>Email:</strong> {selectedStudent.email}</p>
            <p><strong>Course:</strong> {selectedStudent.course || 'N/A'}</p>
            <p><strong>Major:</strong> {selectedStudent.major || 'N/A'}</p>
            <p><strong>Current Class:</strong> {selectedStudent.currentClass || 'N/A'}</p>
            <p><strong>Group Status:</strong> {
              selectedStudent.currentGroup ? (
                <Tag color="blue">
                  {groups.find(g => g._id === selectedStudent.currentGroup)?.groupName || 'In Group'}
                </Tag>
              ) : (
                <Tag color="default">No Group</Tag>
              )
            }</p>

            {myStatus.currentGroup?.leader?._id === user.id && 
             !selectedStudent.currentGroup && 
             selectedStudent._id !== user.id &&
             myStatus.currentGroup?.members?.length < 5 && (
              <Button
                type="primary"
                style={{ marginTop: '20px', width: '100%' }}
                onClick={() => {
                  handleInviteStudentDirect(selectedStudent.studentId);
                  setStudentDetailsDrawerVisible(false);
                }}
              >
                Invite to My Group
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Groups;
