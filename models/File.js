// const mongoose = require('mongoose');

// const fileSchema = new mongoose.Schema({
//   filename: {
//     type: String,
//     required: true
//   },
//   originalName: {
//     type: String,
//     required: true
//   },
//   path: {
//     type: String,
//     required: true
//   },
//   size: {
//     type: Number,
//     required: true
//   },
//   mimeType: {
//     type: String,
//     required: true
//   },
//   project: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   category: {
//     type: String,
//     enum: ['image', 'document', 'video', 'audio', 'archive', 'other'],
//     default: 'other'
//   },
//   description: {
//     type: String,
//     trim: true
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('File', fileSchema);


const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true,
    index: true // Add index for faster deletion queries
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true // Add index for faster project queries
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['image', 'document', 'video', 'audio', 'archive', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
fileSchema.index({ project: 1, createdAt: -1 });
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ category: 1 });

// Virtual for file URL (for backward compatibility)
fileSchema.virtual('url').get(function() {
  return this.path;
});

// Method to check if file is an image
fileSchema.methods.isImage = function() {
  return this.category === 'image' || this.mimeType.startsWith('image/');
};

// Method to check if file is a video
fileSchema.methods.isVideo = function() {
  return this.category === 'video' || this.mimeType.startsWith('video/');
};

// Method to check if file is a document
fileSchema.methods.isDocument = function() {
  return this.category === 'document';
};

// Method to get human-readable file size
fileSchema.methods.getReadableSize = function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

module.exports = mongoose.model('File', fileSchema);