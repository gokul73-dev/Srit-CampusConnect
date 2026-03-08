const express = require("express");
const router = express.Router();
const upload = require("../middleware/cloudinaryUpload");

// multiple upload support
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const urls = req.files.map(file => file.path);

    res.json({
      success: true,
      urls,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
    });
  }
});

module.exports = router;
