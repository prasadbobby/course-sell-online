const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { s3, isAwsConfigured } = require('../config/aws');
const { supabase, isSupabaseConfigured } = require('../config/supabase');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for local uploads (temporary before S3/Supabase upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
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

// AWS S3 upload function
const uploadToS3 = async (file, folder = 'general') => {
  if (!file) {
    throw new Error('No file provided');
  }

  let fileContent;
  if (file.buffer) {
    fileContent = file.buffer;
  } else if (file.path) {
    fileContent = fs.readFileSync(file.path);
  } else {
    throw new Error('Invalid file: no buffer or path');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${uuidv4()}-${file.originalname}`,
    Body: fileContent,
    ContentType: file.mimetype
  };

  try {
    console.log('Uploading to S3:', params.Key);
    const data = await s3.upload(params).promise();
    console.log('S3 upload success:', data.Location);
    
    // Clean up local file if it exists
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return data.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`S3 upload error: ${error.message}`);
  }
};

// Supabase storage upload function
const uploadToSupabase = async (file, folder = 'general') => {
  if (!file) {
    throw new Error('No file provided');
  }

  let fileContent;
  if (file.buffer) {
    fileContent = file.buffer;
  } else if (file.path) {
    fileContent = fs.readFileSync(file.path);
  } else {
    throw new Error('Invalid file: no buffer or path');
  }

  const fileName = `${uuidv4()}-${file.originalname}`;
  const filePath = `${folder}/${fileName}`;
  const bucketName = process.env.SUPABASE_BUCKET || 'course-platform';
  
  try {
    console.log('Uploading to Supabase Storage:', filePath);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileContent, {
        contentType: file.mimetype,
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // Clean up local file if it exists
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Get the public URL - this needs to be constructed correctly
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    const publicURL = publicUrlData?.publicUrl;
    
    console.log('Supabase upload success:', publicURL);
    
    if (!publicURL) {
      throw new Error('Failed to get public URL from Supabase');
    }
    
    return publicURL;
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Supabase upload error: ${error.message}`);
  }
};
// Local fallback upload function
const uploadLocally = async (file, folder = 'general') => {
  if (!file) {
    throw new Error('No file provided');
  }

  const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
  const relativePath = `uploads/${folder}/${uniqueFilename}`;
  const fullPath = path.join(__dirname, '../../public', relativePath);
  
  // Create directory if it doesn't exist
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Copy file to destination
  if (file.buffer) {
    fs.writeFileSync(fullPath, file.buffer);
  } else if (file.path) {
    fs.copyFileSync(file.path, fullPath);
  }
  
  console.log('Local upload success:', relativePath);
  
  // Return a URL that points to your local server
  return `${process.env.BACKEND_URL || 'http://localhost:5000'}/${relativePath}`;
};

// Smart upload function that tries services in order
const uploadFile = async (file, folder = 'general') => {
  console.log('Starting file upload process...');
  console.log('File info:', {
    name: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    folder: folder
  });
  
  try {
    // Try AWS S3 first if available
    if (isAwsConfigured && s3) {
      console.log('Attempting AWS S3 upload...');
      try {
        const url = await uploadToS3(file, folder);
        return url;
      } catch (error) {
        console.error('AWS S3 upload failed, falling back to Supabase:', error.message);
      }
    } else {
      console.log('AWS S3 not configured, skipping...');
    }
    
    // Try Supabase next if available
    if (isSupabaseConfigured && supabase) {
      console.log('Attempting Supabase upload...');
      try {
        const url = await uploadToSupabase(file, folder);
        return url;
      } catch (error) {
        console.error('Supabase upload failed, falling back to local storage:', error.message);
      }
    } else {
      console.log('Supabase not configured, skipping...');
    }
    
    // Fall back to local storage as last resort
    console.log('Using local file storage as last resort...');
    return await uploadLocally(file, folder);
  } catch (error) {
    console.error('All upload methods failed:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

module.exports = {
  upload,
  uploadFile
};