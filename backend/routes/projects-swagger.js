/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create project (Group leader only)
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - projectName
 *               - description
 *             properties:
 *               groupId:
 *                 type: string
 *               projectName:
 *                 type: string
 *               description:
 *                 type: string
 *               objectives:
 *                 type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *               githubRepository:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 *
 * /api/projects/group/{groupId}:
 *   get:
 *     summary: Get project by group ID
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project data
 *       404:
 *         description: Project not found
 *
 * /api/projects/{id}:
 *   get:
 *     summary: Get project details
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *   put:
 *     summary: Update project (Group leader only)
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *               description:
 *                 type: string
 *               objectives:
 *                 type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *               githubRepository:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *
 * /api/projects/{id}/submit-for-approval:
 *   post:
 *     summary: Submit project to lecturer for approval
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project submitted successfully
 *
 * /api/projects/my-class:
 *   get:
 *     summary: Get all projects for current class
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *
 * /api/projects/pending-approval:
 *   get:
 *     summary: Get pending projects for approval (Lecturer only)
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending projects
 *
 * /api/projects/{id}/approve:
 *   post:
 *     summary: Approve project (Lecturer only)
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project approved
 *
 * /api/projects/{id}/reject:
 *   post:
 *     summary: Reject project (Lecturer only)
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project rejected
 */
