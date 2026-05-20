const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/projects
// @desc    Get all projects (admin: all, member: only their projects)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const query =
      req.user.role === 'admin' ? {} : { members: req.user._id };

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort('-createdAt');

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access for members
    if (
      req.user.role === 'member' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create new project (Admin only)
// @access  Private/Admin
router.post(
  '/',
  auth,
  roleCheck('admin'),
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, members, status } = req.body;

      const project = await Project.create({
        name,
        description,
        createdBy: req.user._id,
        members: members || [],
        status: status || 'active',
      });

      await project.populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'members', select: 'name email' },
      ]);

      res.status(201).json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/projects/:id
// @desc    Update project (Admin only)
// @access  Private/Admin
router.put('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { name, description, members, status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, members, status },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project + all its tasks (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: req.params.id });

    res.json({ message: 'Project and all its tasks deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
