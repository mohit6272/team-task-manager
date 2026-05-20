const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/tasks
// @desc    Get tasks (admin: all or by project, member: only assigned tasks)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    let query = {};

    if (projectId) query.project = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Members can only see tasks assigned to them
    if (req.user.role === 'member') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort('-createdAt');

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only view their own tasks
    if (
      req.user.role === 'member' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create task (Admin only)
// @access  Private/Admin
router.post(
  '/',
  auth,
  roleCheck('admin'),
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('project').notEmpty().withMessage('Project ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

      const task = await Task.create({
        title,
        description,
        project,
        assignedTo: assignedTo || null,
        createdBy: req.user._id,
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate || null,
      });

      await task.populate([
        { path: 'assignedTo', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
        { path: 'project', select: 'name' },
      ]);

      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/tasks/:id
// @desc    Update task (Admin: all fields, Member: only status of their tasks)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'member') {
      // Members can only update status of tasks assigned to them
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      const { status } = req.body;
      if (status) task.status = status;
    } else {
      // Admin can update everything
      const { title, description, assignedTo, status, priority, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'project', select: 'name' },
    ]);

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
