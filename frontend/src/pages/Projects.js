import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  message,
  Modal,
  Form,
  Input,
  Tag,
  Tabs,
  Empty,
  Descriptions,
  Alert,
  Spin,
  Drawer,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { FolderKanban, Plus, Sparkles, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const { TextArea } = Input;

const Projects = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [myGroup, setMyGroup] = useState(null);
  const [myProject, setMyProject] = useState(null);
  const [classProjects, setClassProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        fetchMyGroup();
        fetchClassProjects();
        checkAIStatus();
      } else if (user.role === 'lecturer') {
        fetchPendingProjects();
        fetchAllMyClassProjects();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname]);

  const checkAIStatus = async () => {
    try {
      const response = await axios.get('/ai/status');
      setAiEnabled(response.data?.data?.enabled || false);
    } catch (error) {
      console.error('Failed to check AI status:', error);
      setAiEnabled(false);
    }
  };

  const fetchMyGroup = async () => {
    try {
      if (!user?.currentGroup) return;
      
      const response = await axios.get('/groups/my/status');
      setMyGroup(response.data.data.currentGroup);

      // Fetch project for my group
      if (response.data.data.currentGroup) {
        try {
          const projectRes = await axios.get(`/projects/group/${response.data.data.currentGroup._id}`);
          setMyProject(projectRes.data.data);
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error('Failed to fetch project:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch group:', error);
    }
  };

  const fetchClassProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/projects/my-class');
      setClassProjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch class projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/projects/pending-approval');
      setPendingProjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMyClassProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/projects/my-classes');
      setAllProjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (values) => {
    try {
      await axios.post('/projects', {
        groupId: myGroup._id,
        projectName: values.projectName,
        description: values.description,
        objectives: values.objectives,
        techStack: values.techStack ? values.techStack.split(',').map(t => t.trim()) : [],
        githubRepository: values.githubRepository
      });

      toast.success('Project created successfully');
      setIsCreateModalVisible(false);
      form.resetFields();
      fetchMyGroup();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleUpdateProject = async (values) => {
    try {
      await axios.put(`/projects/${myProject._id}`, {
        projectName: values.projectName,
        description: values.description,
        objectives: values.objectives,
        techStack: values.techStack ? values.techStack.split(',').map(t => t.trim()) : [],
        githubRepository: values.githubRepository
      });

      toast.success('Project updated successfully');
      setIsEditModalVisible(false);
      form.resetFields();
      fetchMyGroup();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleSubmitForApproval = () => {
    Modal.confirm({
      title: 'Submit Project for Approval',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to submit this project to the lecturer for approval? You cannot edit it after submission.',
      okText: 'Yes, Submit',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.post(`/projects/${myProject._id}/submit-for-approval`);
          toast.success('Project submitted to lecturer for approval');
          fetchMyGroup();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to submit project');
        }
      }
    });
  };

  const handleApproveProject = async (projectId) => {
    Modal.confirm({
      title: 'Approve Project',
      content: (
        <Form
          id="approval-form"
          layout="vertical"
          onFinish={async (values) => {
            try {
              await axios.post(`/projects/${projectId}/approve`, {
                comment: values.comment
              });
              toast.success('Project approved successfully');
              Modal.destroyAll();
              fetchPendingProjects();
              fetchAllMyClassProjects();
            } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to approve project');
            }
          }}
        >
          <Form.Item
            label="Approval Comment (Optional)"
            name="comment"
          >
            <TextArea rows={3} placeholder="Add any feedback or comments..." />
          </Form.Item>
        </Form>
      ),
      okText: 'Approve',
      cancelText: 'Cancel',
      okButtonProps: { htmlType: 'submit', form: 'approval-form' }
    });
  };

  const handleRejectProject = async (projectId) => {
    Modal.confirm({
      title: 'Reject Project',
      content: (
        <Form
          id="rejection-form"
          layout="vertical"
          onFinish={async (values) => {
            try {
              await axios.post(`/projects/${projectId}/reject`, {
                comment: values.comment
              });
              toast.success('Project rejected');
              Modal.destroyAll();
              fetchPendingProjects();
              fetchAllMyClassProjects();
            } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to reject project');
            }
          }}
        >
          <Form.Item
            label="Rejection Reason (Required)"
            name="comment"
            rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
          >
            <TextArea rows={3} placeholder="Explain why the project is rejected..." />
          </Form.Item>
        </Form>
      ),
      okText: 'Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { htmlType: 'submit', form: 'rejection-form' }
    });
  };

  const handleDeleteProject = () => {
    Modal.confirm({
      title: 'Delete Project',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this project? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`/projects/${myProject._id}`);
          toast.success('Project deleted successfully');
          fetchMyGroup();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete project');
        }
      }
    });
  };

  // AI Functions
  const handleGenerateWithAI = async () => {
    const projectName = form.getFieldValue('projectName');
    const techStack = form.getFieldValue('techStack');

    if (!projectName || projectName.trim() === '') {
      toast.error('Please enter a project name first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await axios.post('/ai/generate-description', {
        projectName: projectName,
        techStack: techStack || '',
        additionalInfo: ''
      });

      const { description, objectives, techStackSuggestions } = response.data.data;

      // Update form fields
      form.setFieldsValue({
        description: description,
        objectives: objectives
      });

      // Show tech stack suggestions if available
      if (techStackSuggestions && techStackSuggestions.length > 0) {
        Modal.info({
          title: 'AI Suggestions',
          content: (
            <div>
              <p><strong>Recommended Tech Stack:</strong></p>
              <ul>
                {techStackSuggestions.map((tech, idx) => (
                  <li key={idx}>{tech}</li>
                ))}
              </ul>
            </div>
          )
        });
      }

      toast.success('AI generated description successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate description');
    } finally {
      setAiLoading(false);
    }
  };

  const handleImproveDescription = async () => {
    const currentDescription = form.getFieldValue('description');

    if (!currentDescription || currentDescription.trim() === '') {
      toast.error('Please enter a description first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await axios.post('/ai/improve-description', {
        description: currentDescription
      });

      form.setFieldsValue({
        description: response.data.data.improvedDescription
      });

      toast.success('Description improved!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to improve description');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateObjectives = async () => {
    const description = form.getFieldValue('description');

    if (!description || description.trim() === '') {
      toast.error('Please enter a description first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await axios.post('/ai/generate-objectives', {
        description: description
      });

      form.setFieldsValue({
        objectives: response.data.data.objectives
      });

      toast.success('Objectives generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate objectives');
    } finally {
      setAiLoading(false);
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setDrawerVisible(true);
  };

  const getApprovalStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', icon: <ExclamationCircleOutlined />, text: 'Pending Approval' },
      approved: { color: 'green', icon: <CheckCircleOutlined />, text: 'Approved' },
      rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200
    },
    {
      title: 'Group',
      key: 'group',
      width: 150,
      render: (_, record) => record.group?.groupName || 'N/A'
    },
    {
      title: 'Created By',
      key: 'createdBy',
      width: 150,
      render: (_, record) => record.createdBy?.fullName || 'N/A'
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      width: 150,
      render: (_, record) => getApprovalStatusTag(record.approvalStatus)
    },
    {
      title: 'Approved/Rejected At',
      key: 'approvalTime',
      width: 180,
      render: (_, record) => {
        if (record.approvedAt) {
          return (
            <div>
              <div>{new Date(record.approvedAt).toLocaleDateString()}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(record.approvedAt).toLocaleTimeString()}
              </div>
            </div>
          );
        }
        return <Tag color="default">Pending</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View
        </Button>
      )
    }
  ];

  // Student View
  if (user?.role === 'student') {
    const isLeader = myGroup?.leader?._id === user.id;

    return (
      <div 
        className="min-vh-100" 
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="container py-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header Card */}
            <div className="card border-0 shadow-lg rounded-4 mb-4 p-4">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                  style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <FolderKanban size={36} color="white" />
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Projects</h1>
                  <p className="text-muted mb-0">Manage and submit your group projects</p>
                </div>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <Spin spinning={loading}>
                <Tabs
                  className="p-4"
                  items={[
              {
                key: 'my-project',
                label: 'My Group Project',
                children: (
                  <Card>
                    {!myGroup ? (
                      <Empty description="You must join a group first to create a project">
                        <Button type="primary" href="/groups">Go to Groups</Button>
                      </Empty>
                    ) : !myProject ? (
                      <Empty description={isLeader ? "Your group doesn't have a project yet" : "Your group leader hasn't created a project yet"}>
                        {isLeader && (
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateModalVisible(true)}
                          >
                            Create Project
                          </Button>
                        )}
                      </Empty>
                    ) : (
                      <div>
                        <Descriptions title="Project Information" bordered column={1}>
                          <Descriptions.Item label="Project Name">{myProject.projectName}</Descriptions.Item>
                          <Descriptions.Item label="Description">{myProject.description}</Descriptions.Item>
                          <Descriptions.Item label="Objectives">{myProject.objectives || 'N/A'}</Descriptions.Item>
                          <Descriptions.Item label="Tech Stack">
                            {myProject.techStack?.length > 0 ? (
                              myProject.techStack.map((tech, idx) => (
                                <Tag key={idx} color="blue">{tech}</Tag>
                              ))
                            ) : 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="GitHub">{myProject.githubRepository || 'N/A'}</Descriptions.Item>
                          <Descriptions.Item label="Approval Status">
                            {getApprovalStatusTag(myProject.approvalStatus)}
                          </Descriptions.Item>
                          {myProject.approvalComment && (
                            <Descriptions.Item label="Lecturer Comment">
                              <Alert
                                message={myProject.approvalComment}
                                type={myProject.approvalStatus === 'approved' ? 'success' : 'warning'}
                                showIcon
                              />
                            </Descriptions.Item>
                          )}
                          <Descriptions.Item label="Created At">
                            {new Date(myProject.createdAt).toLocaleString()}
                          </Descriptions.Item>
                        </Descriptions>

                        {isLeader && (
                          <Space style={{ marginTop: '20px' }}>
                            {myProject.approvalStatus !== 'approved' && (
                              <>
                                <Button
                                  icon={<EditOutlined />}
                                  onClick={() => {
                                    form.setFieldsValue({
                                      projectName: myProject.projectName,
                                      description: myProject.description,
                                      objectives: myProject.objectives,
                                      techStack: myProject.techStack?.join(', '),
                                      githubRepository: myProject.githubRepository
                                    });
                                    setIsEditModalVisible(true);
                                  }}
                                >
                                  Edit
                                </Button>
                                {myProject.approvalStatus !== 'pending' && (
                                  <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSubmitForApproval}
                                  >
                                    Submit for Approval
                                  </Button>
                                )}
                              </>
                            )}
                            {myProject.approvalStatus === 'rejected' && (
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDeleteProject}
                              >
                                Delete Project
                              </Button>
                            )}
                          </Space>
                        )}
                      </div>
                    )}
                  </Card>
                )
              },
              {
                key: 'class-projects',
                label: 'Class Projects',
                children: (
                  <Card>
                    <Table
                      columns={projectColumns}
                      dataSource={classProjects}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                )
              }
            ]}
          />
        </Spin>
            </div>

        {/* Create Project Modal */}
        <Modal
          title={
            <Space>
              <span>Create Project</span>
              {aiEnabled && (
                <Tag icon={<RobotOutlined />} color="purple">
                  AI Powered
                </Tag>
              )}
            </Space>
          }
          open={isCreateModalVisible}
          onCancel={() => {
            setIsCreateModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateProject}>
            <Form.Item
              label="Project Name"
              name="projectName"
              rules={[{ required: true, message: 'Please enter project name' }]}
            >
              <Input placeholder="e.g., EXE101 Group Management System" />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Description</span>
                  {aiEnabled && (
                    <Tooltip title="Generate description using AI">
                      <Button
                        type="link"
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={handleGenerateWithAI}
                        loading={aiLoading}
                        style={{ padding: 0 }}
                      >
                        Generate with AI
                      </Button>
                    </Tooltip>
                  )}
                  {aiEnabled && (
                    <Tooltip title="Improve current description">
                      <Button
                        type="link"
                        size="small"
                        icon={<BulbOutlined />}
                        onClick={handleImproveDescription}
                        loading={aiLoading}
                        style={{ padding: 0 }}
                      >
                        Improve
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              }
              name="description"
              rules={[{ required: true, message: 'Please enter project description' }]}
            >
              <TextArea rows={4} placeholder="Describe your project in detail..." />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Objectives</span>
                  {aiEnabled && (
                    <Tooltip title="Generate objectives from description">
                      <Button
                        type="link"
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={handleGenerateObjectives}
                        loading={aiLoading}
                        style={{ padding: 0 }}
                      >
                        Generate with AI
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              }
              name="objectives"
            >
              <TextArea rows={3} placeholder="What are the main objectives of this project?" />
            </Form.Item>

            <Form.Item
              label="Tech Stack"
              name="techStack"
            >
              <Input placeholder="e.g., React, Node.js, MongoDB (comma separated)" />
            </Form.Item>

            <Form.Item
              label="GitHub Repository"
              name="githubRepository"
            >
              <Input placeholder="https://github.com/username/repo" />
            </Form.Item>

            {aiEnabled && (
              <Alert
                message="AI Assistant Available"
                description="Click the AI buttons above to automatically generate professional descriptions and objectives for your project!"
                type="info"
                icon={<RobotOutlined />}
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            <Button type="primary" htmlType="submit" block>
              Create Project
            </Button>
          </Form>
        </Modal>

        {/* Edit Project Modal */}
        <Modal
          title={
            <Space>
              <span>Edit Project</span>
              {aiEnabled && (
                <Tag icon={<RobotOutlined />} color="purple">
                  AI Powered
                </Tag>
              )}
            </Space>
          }
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateProject}>
            <Form.Item
              label="Project Name"
              name="projectName"
              rules={[{ required: true, message: 'Please enter project name' }]}
            >
              <Input placeholder="e.g., EXE101 Group Management System" />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Description</span>
                  {aiEnabled && (
                    <Tooltip title="Generate description using AI">
                      <Button
                        type="link"
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={handleGenerateWithAI}
                        loading={aiLoading}
                        style={{ padding: 0 }}
                      >
                        Generate with AI
                      </Button>
                    </Tooltip>
                  )}
                  {aiEnabled && (
                    <Tooltip title="Improve current description">
                      <Button
                        type="link"
                        size="small"
                        icon={<BulbOutlined />}
                        onClick={handleImproveDescription}
                        loading={aiLoading}
                        style={{ padding: 0 }}
                      >
                        Improve
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              }
              name="description"
              rules={[{ required: true, message: 'Please enter project description' }]}
            >
              <TextArea rows={4} placeholder="Describe your project in detail..." />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Objectives</span>
                  {aiEnabled && (
                    <Tooltip title="Generate objectives from description">
                      <Button
                        type="link"
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={handleGenerateObjectives}
                        loading={aiLoading}
                        style={{ padding: 0 }}
                      >
                        Generate with AI
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              }
              name="objectives"
            >
              <TextArea rows={3} placeholder="What are the main objectives of this project?" />
            </Form.Item>

            <Form.Item
              label="Tech Stack"
              name="techStack"
            >
              <Input placeholder="e.g., React, Node.js, MongoDB (comma separated)" />
            </Form.Item>

            <Form.Item
              label="GitHub Repository"
              name="githubRepository"
            >
              <Input placeholder="https://github.com/username/repo" />
            </Form.Item>

            {aiEnabled && (
              <Alert
                message="AI Assistant Available"
                description="Use AI buttons to enhance your project description and objectives!"
                type="info"
                icon={<RobotOutlined />}
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            <Button type="primary" htmlType="submit" block>
              Update Project
            </Button>
          </Form>
        </Modal>

        {/* Project Details Drawer */}
        <Drawer
          title="Project Details"
          placement="right"
          width={700}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          {selectedProject && (
            <div>
              <Descriptions title="Project Information" bordered column={1}>
                <Descriptions.Item label="Project Name">{selectedProject.projectName}</Descriptions.Item>
                <Descriptions.Item label="Group">{selectedProject.group?.groupName}</Descriptions.Item>
                <Descriptions.Item label="Class Code">{selectedProject.classCode}</Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {selectedProject.createdBy?.fullName} ({selectedProject.createdBy?.studentId})
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedProject.description}</div>
                </Descriptions.Item>
                <Descriptions.Item label="Objectives">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedProject.objectives || 'N/A'}</div>
                </Descriptions.Item>
                <Descriptions.Item label="Tech Stack">
                  {selectedProject.techStack?.length > 0 ? (
                    <div>
                      {selectedProject.techStack.map((tech, idx) => (
                        <Tag key={idx} color="blue">{tech}</Tag>
                      ))}
                    </div>
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="GitHub Repository">
                  {selectedProject.githubRepository ? (
                    <a href={selectedProject.githubRepository} target="_blank" rel="noopener noreferrer">
                      {selectedProject.githubRepository}
                    </a>
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Approval Status">
                  {getApprovalStatusTag(selectedProject.approvalStatus)}
                </Descriptions.Item>
                {selectedProject.approvalComment && (
                  <Descriptions.Item label="Lecturer Comment">
                    <Alert
                      message={selectedProject.approvalComment}
                      type={selectedProject.approvalStatus === 'approved' ? 'success' : 'warning'}
                      showIcon
                    />
                  </Descriptions.Item>
                )}
                {selectedProject.approvedBy && (
                  <Descriptions.Item label="Reviewed By">
                    {selectedProject.approvedBy.fullName}
                  </Descriptions.Item>
                )}
                {selectedProject.approvedAt && (
                  <Descriptions.Item label={selectedProject.approvalStatus === 'approved' ? 'Approved At' : 'Rejected At'}>
                    {new Date(selectedProject.approvedAt).toLocaleString()}
                  </Descriptions.Item>
                )}
                {/* <Descriptions.Item label="Submitted At">
                  {selectedProject.submittedToLecturerAt
                    ? new Date(selectedProject.submittedToLecturerAt).toLocaleString()
                    : 'Not submitted'}
                </Descriptions.Item> */}
                <Descriptions.Item label="Created At">
                  {new Date(selectedProject.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Drawer>
          </motion.div>
        </div>
      </div>
    );
  }

  // Lecturer View
  if (user?.role === 'lecturer') {
    return (
      <div 
        className="min-vh-100" 
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="container py-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header Card */}
            <div className="card border-0 shadow-lg rounded-4 mb-4 p-4">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                  style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <FolderKanban size={36} color="white" />
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Project Review</h1>
                  <p className="text-muted mb-0">Review and approve student projects</p>
                </div>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <Spin spinning={loading}>
                <Tabs
                  className="p-4"
                  items={[
              {
                key: 'pending',
                label: `Pending Approval (${pendingProjects.length})`,
                children: (
                  <Card>
                    <Table
                      columns={[
                        ...projectColumns.slice(0, -1),
                        {
                          title: 'Actions',
                          key: 'actions',
                          width: 250,
                          render: (_, record) => (
                            <Space>
                              <Button
                                type="primary"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetails(record)}
                              >
                                View
                              </Button>
                              <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApproveProject(record._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                danger
                                size="small"
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleRejectProject(record._id)}
                              >
                                Reject
                              </Button>
                            </Space>
                          )
                        }
                      ]}
                      dataSource={pendingProjects}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                )
              },
              {
                key: 'all',
                label: `All Projects (${allProjects.length})`,
                children: (
                  <Card>
                    <Table
                      columns={projectColumns}
                      dataSource={allProjects}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                )
              }
            ]}
          />
        </Spin>
            </div>

        {/* Project Details Drawer */}
        <Drawer
          title="Project Details"
          placement="right"
          width={700}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          {selectedProject && (
            <div>
              <Descriptions title="Project Information" bordered column={1}>
                <Descriptions.Item label="Project Name">{selectedProject.projectName}</Descriptions.Item>
                <Descriptions.Item label="Group">{selectedProject.group?.groupName}</Descriptions.Item>
                <Descriptions.Item label="Class Code">{selectedProject.classCode}</Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {selectedProject.createdBy?.fullName} ({selectedProject.createdBy?.studentId})
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedProject.description}</div>
                </Descriptions.Item>
                <Descriptions.Item label="Objectives">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedProject.objectives || 'N/A'}</div>
                </Descriptions.Item>
                <Descriptions.Item label="Tech Stack">
                  {selectedProject.techStack?.length > 0 ? (
                    <div>
                      {selectedProject.techStack.map((tech, idx) => (
                        <Tag key={idx} color="blue">{tech}</Tag>
                      ))}
                    </div>
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="GitHub Repository">
                  {selectedProject.githubRepository ? (
                    <a href={selectedProject.githubRepository} target="_blank" rel="noopener noreferrer">
                      {selectedProject.githubRepository}
                    </a>
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Approval Status">
                  {getApprovalStatusTag(selectedProject.approvalStatus)}
                </Descriptions.Item>
                {selectedProject.approvalComment && (
                  <Descriptions.Item label="Lecturer Comment">
                    <Alert
                      message={selectedProject.approvalComment}
                      type={selectedProject.approvalStatus === 'approved' ? 'success' : 'warning'}
                      showIcon
                    />
                  </Descriptions.Item>
                )}
                {selectedProject.approvedBy && (
                  <Descriptions.Item label="Reviewed By">
                    {selectedProject.approvedBy.fullName}
                  </Descriptions.Item>
                )}
                {selectedProject.approvedAt && (
                  <Descriptions.Item label={selectedProject.approvalStatus === 'approved' ? 'Approved At' : 'Rejected At'}>
                    {new Date(selectedProject.approvedAt).toLocaleString()}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Submitted At">
                  {selectedProject.submittedToLecturerAt
                    ? new Date(selectedProject.submittedToLecturerAt).toLocaleString()
                    : 'Not submitted'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {new Date(selectedProject.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              {user?.role === 'lecturer' && selectedProject.approvalStatus === 'pending' && (
                <Space style={{ marginTop: '20px', width: '100%' }} direction="vertical">
                  <Button
                    type="primary"
                    block
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setDrawerVisible(false);
                      handleApproveProject(selectedProject._id);
                    }}
                  >
                    Approve Project
                  </Button>
                  <Button
                    danger
                    block
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      setDrawerVisible(false);
                      handleRejectProject(selectedProject._id);
                    }}
                  >
                    Reject Project
                  </Button>
                </Space>
              )}
            </div>
          )}
        </Drawer>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Empty description="Access denied" />
      </Card>
    </div>
  );
};

export default Projects;
