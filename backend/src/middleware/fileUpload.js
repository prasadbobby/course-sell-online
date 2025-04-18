const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const s3 = require('../config/aws');

// Configure storage for local uploads (temporary before S3 upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Define file filter
const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') || 
      file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

// Setup upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: fileFilter
});

// S3 upload function
const uploadToS3 = async (file, folder = 'general') => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${uuidv4()}-${file.originalname}`,
    Body: file.buffer || require('fs').readFileSync(file.path),
    ContentType: file.mimetype
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    throw new Error(`S3 upload error: ${error.message}`);
  }
};

module.exports = {
  upload,
  uploadToS3
};