const express = require('express');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');
const Notice = require('../models/Notice');

const router = express.Router();


// =======================================
// CREATE NOTICE
// faculty, clubhead, admin
// =======================================
router.post('/', auth, permit('faculty','clubhead','admin'), async (req, res) => {

  try {

    const { title, body, visibleTo, club, image, images } = req.body;

    const notice = new Notice({

      title,
      body,
      visibleTo,
      club,

      // support single image
      image: image || null,

      // support multiple images
      images: images || [],

      author: req.user._id,
      createdByRole: req.user.role,

      pinned: false

    });

    await notice.save();


    const populatedNotice = await Notice.findById(notice._id)
      .populate('author', 'name role');


    const io = req.app.get('io');

    if (io) {

      io.emit('notice:new', populatedNotice);

      if (notice.visibleTo === 'students')
        io.to('role:student').emit('notice:new', populatedNotice);

      if (notice.visibleTo === 'faculty')
        io.to('role:faculty').emit('notice:new', populatedNotice);

      if (notice.visibleTo === 'clubhead')
        io.to('role:clubhead').emit('notice:new', populatedNotice);

    }


    res.status(201).json(populatedNotice);

  }
  catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Failed to create notice'
    });

  }

});


// =======================================
// GET ALL NOTICES (ROLE FILTERED)
// =======================================
router.get('/', auth, async (req, res) => {

  try {

    let filter = {};

    const role = req.user.role;

    if (role === 'student') {

      filter = {

        $or: [

          { createdByRole: { $in: ['faculty','clubhead'] } },

          { visibleTo: { $in: ['all','students'] } }

        ]

      };

    }

    else if (role === 'clubhead') {

      filter = {

        $or: [

          { createdByRole: { $in: ['faculty','clubhead'] } },

          { author: req.user._id },

          { visibleTo: 'all' }

        ]

      };

    }

    else if (role === 'faculty') {

      filter = {

        $or: [

          { createdByRole: { $in: ['faculty','clubhead'] } },

          { author: req.user._id },

          { visibleTo: 'all' }

        ]

      };

    }

    else if (role === 'admin') {

      filter = {};

    }


    const notices = await Notice.find(filter)
      .populate('author', 'name role')
      .sort({ pinned: -1, createdAt: -1 })
      .limit(500);


    res.json(notices);

  }
  catch (err) {

    console.error(err);

    res.status(500).json({

      message: 'Failed to fetch notices'

    });

  }

});


// =======================================
// GET SINGLE NOTICE
// =======================================
router.get('/:id', auth, async (req, res) => {

  try {

    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name role');

    if (!notice)
      return res.status(404).json({ message: 'Notice not found' });


    res.json(notice);

  }
  catch (err) {

    res.status(500).json({

      message: 'Failed to fetch notice'

    });

  }

});


// =======================================
// UPDATE NOTICE
// =======================================
router.put('/:id', auth, async (req, res) => {

  try {

    const notice = await Notice.findById(req.params.id);

    if (!notice)
      return res.status(404).json({ message: 'Notice not found' });


    if (
      req.user.role !== 'admin' &&
      notice.author.toString() !== req.user._id.toString()
    ) {

      return res.status(403).json({
        message: 'Not allowed'
      });

    }


    notice.title = req.body.title ?? notice.title;

    notice.body = req.body.body ?? notice.body;

    notice.image = req.body.image ?? notice.image;

    notice.images = req.body.images ?? notice.images;


    await notice.save();


    const populated = await Notice.findById(notice._id)
      .populate('author', 'name role');


    req.app.get('io').emit('notice:update', populated);


    res.json(populated);

  }
  catch (err) {

    res.status(500).json({

      message: 'Update failed'

    });

  }

});


// =======================================
// PIN NOTICE
// admin / faculty / clubhead
// =======================================
router.put('/:id/pin', auth, permit('admin','faculty','clubhead'), async (req, res) => {

  try {

    const notice = await Notice.findById(req.params.id);

    if (!notice)
      return res.status(404).json({
        message: 'Notice not found'
      });


    notice.pinned = !notice.pinned;

    await notice.save();


    const populated = await Notice.findById(notice._id)
      .populate('author', 'name role');


    req.app.get('io').emit('notice:update', populated);


    res.json(populated);

  }
  catch (err) {

    res.status(500).json({

      message: 'Pin failed'

    });

  }

});


// =======================================
// DELETE NOTICE
// =======================================
router.delete('/:id', auth, async (req, res) => {

  try {

    const notice = await Notice.findById(req.params.id);

    if (!notice)
      return res.status(404).json({
        message: 'Not found'
      });


    if (
      req.user.role !== 'admin' &&
      notice.author.toString() !== req.user._id.toString()
    ) {

      return res.status(403).json({
        message: 'Not allowed'
      });

    }


    await notice.deleteOne();


    req.app.get('io').emit('notice:delete', notice._id);


    res.json({

      ok: true

    });

  }
  catch (err) {

    res.status(500).json({

      message: 'Delete failed'

    });

  }

});


module.exports = router;
