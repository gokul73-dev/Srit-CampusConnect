const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');
const Project = require('../models/Project');
const ProjectProgress = require('../models/ProjectProgress');
const User = require('../models/User');

const router = express.Router();

/* =====================================================
   CREATE PROJECT (FACULTY ONLY)
===================================================== */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty can create projects' });
    }

    const { title, description, members } = req.body;

    if (!title || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Title and members required' });
    }

    // Prevent students from being in multiple projects
    const existing = await Project.find({ members: { $in: members } });
    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Some selected students already belong to a project',
      });
    }

    const project = await Project.create({
      title,
      description,
      faculty: req.user._id,
      members,
    });

    res.status(201).json(project);

  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


/* =====================================================
   GET PROJECTS (ROLE BASED)
===================================================== */
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query = { members: req.user._id };
    } 
    else if (req.user.role === 'faculty') {
      query = { faculty: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('faculty', 'name email role')
      .populate('members', 'name email role');

    res.json(projects);

  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


/* =====================================================
   GET ALL STUDENTS (FACULTY ONLY)
===================================================== */
router.get('/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const students = await User.find({ role: 'student' })
      .select('name email _id');

    res.json(students);

  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


/* =====================================================
   STUDENT SUBMIT PROGRESS (WITH MEDIA UPLOAD)
===================================================== */
router.post(
  '/:projectId/progress',
  auth,
  upload.array('media', 3),
  async (req, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Students only' });
      }

      const { progressPercent, updateText } = req.body;

      const media =
        req.files?.map(file => file.path) || [];

      const progress = await ProjectProgress.create({
        project: req.params.projectId,
        student: req.user._id,
        progressPercent,
        updateText,
        media,
        status: 'pending',
      });

      res.status(201).json(progress);

    } catch (err) {
      console.error('Submit progress error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


/* =====================================================
   GET PROJECT PROGRESS
===================================================== */
router.get('/:projectId/progress', auth, async (req, res) => {
  try {
    const progress = await ProjectProgress.find({
      project: req.params.projectId,
    })
      .populate('student', 'name email role')
      .sort({ createdAt: -1 });

    res.json(progress);

  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


/* =====================================================
   FACULTY APPROVE / REVISE / REJECT PROGRESS
===================================================== */
router.put('/progress/:progressId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Faculty only' });
    }

    const { status, feedback } = req.body;

    const progress = await ProjectProgress.findByIdAndUpdate(
      req.params.progressId,
      {
        status,
        facultyFeedback: feedback || '',
      },
      { new: true }
    ).populate('student', 'name email role');

    res.json(progress);

  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


/* =====================================================
   PROJECT DISCUSSION MEDIA UPLOAD (FIX 404 ERROR)
===================================================== */
router.post(
  '/discussion/upload',
  auth,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Cloudinary returns URL in file.path
      res.json({
        url: req.file.path,
      });

    } catch (err) {
      console.error('Discussion upload error:', err);
      res.status(500).json({ message: 'Upload failed' });
    }
  }
);


module.exports = router;
