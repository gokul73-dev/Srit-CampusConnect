const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');
const LostFound = require('../models/LostFound');

const router = express.Router();

// =====================
// MULTER CONFIG
// =====================
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({ storage });

// =====================
// REPORT LOST / FOUND
// =====================
router.post('/', auth, upload.array('attachments', 6), async (req, res) => {
  try {
    const { title, description, location, found } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const attachments = (req.files || []).map(
      (f) => `/uploads/${f.filename}`
    );

    const item = await LostFound.create({
      title,
      description,
      location,
      found: found === 'true' || found === true,
      reportedBy: req.user._id,
      attachments,
      approved: false,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to report item' });
  }
});

// =====================
// GET LOST & FOUND ITEMS (🔥 FIXED)
// =====================
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'admin') {
      // admin sees EVERYTHING
      filter = {};
    } else {
      // students & others see:
      // - approved items
      // - OR items they reported
      filter = {
        $or: [
          { approved: true },
          { reportedBy: req.user._id },
        ],
      };
    }

    const items = await LostFound.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name role');

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

// =====================
// ADMIN APPROVE ITEM
// =====================
router.post(
  '/:id/approve',
  auth,
  permit('admin'),
  async (req, res) => {
    try {
      const item = await LostFound.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });

      item.approved = true;
      await item.save();

      res.json(item);
    } catch (err) {
      res.status(500).json({ message: 'Approval failed' });
    }
  }
);

module.exports = router;
