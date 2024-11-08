const dotenv = require('dotenv').config()
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary').CloudinaryStorage;

// Set up Cloudinary credentials (usually placed in your .env file)
cloudinary.config({
  cloud_name: 'ddcf9gktr',
  api_key: '127765667286757',
  api_secret: 'Gmx7f_tR3jTXkpjMXHjKXiIUE9Q'
});

// Configure multer-storage-cloudinary to handle file uploads
const storage = new multerStorageCloudinary({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Folder name here
    allowedFormats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
