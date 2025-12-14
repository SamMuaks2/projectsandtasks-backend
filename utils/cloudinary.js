const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test Cloudinary configuration
const testCloudinaryConfig = () => {
  const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!isConfigured) {
    console.warn('Cloudinary not configured. File uploads will fail.');
    console.log(' Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
    return false;
  }

  console.log('Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME);
  return true;
};

// Storage for company logos
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gic-projects/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomNum = Math.round(Math.random() * 1E9);
      return `logo-${timestamp}-${randomNum}`;
    }
  }
});

// Storage for client logos
const clientLogoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gic-projects/client-logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomNum = Math.round(Math.random() * 1E9);
      return `client-logo-${timestamp}-${randomNum}`;
    }
  }
});

// Storage for project files (documents, images, videos)
const projectFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resourceType = 'auto';
    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else {
      resourceType = 'raw'; // For documents, PDFs, etc.
    }

    return {
      folder: 'gic-projects/files',
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 
                       'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar', 
                       'mp4', 'avi', 'mov', 'mp3', 'wav'],
      public_id: (req, file) => {
        const timestamp = Date.now();
        const randomNum = Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        return `file-${timestamp}-${randomNum}.${extension}`;
      }
    };
  }
});

// Storage for task submission files
const taskFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto';
    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else {
      resourceType = 'raw';
    }

    return {
      folder: 'gic-projects/task-files',
      resource_type: resourceType,
      public_id: (req, file) => {
        const timestamp = Date.now();
        const randomNum = Math.round(Math.random() * 1E9);
        return `task-${timestamp}-${randomNum}`;
      }
    };
  }
});

// Create multer instances with Cloudinary storage
const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const clientLogoUpload = multer({
  storage: clientLogoStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const projectFileUpload = multer({
  storage: projectFileStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const taskFileUpload = multer({
  storage: taskFileStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️  Deleted from Cloudinary:', publicId, result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  logoUpload,
  clientLogoUpload,
  projectFileUpload,
  taskFileUpload,
  deleteFile,
  testCloudinaryConfig
};