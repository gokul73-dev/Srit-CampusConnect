const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async(req,file)=>({
    folder: 'campusconnect',
    resource_type: 'auto', // allows images + videos
    transformation: [
      {
        quality: "auto",
        fetch_format: "auto",
        width: 1280,
        crop: "limit",
      },
    ],
  }),
});

const upload = multer({ storage });

module.exports = upload;
