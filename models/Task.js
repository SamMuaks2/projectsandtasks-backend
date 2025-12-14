// const mongoose = require('mongoose');

// const taskSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Task title is required'],
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   project: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   assignedTo: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   assignedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['initiated', 'submitted', 'pm_reviewed', 'client_reviewed', 'rejected', 'completed'],
//     default: 'initiated'
//   },
//   priority: {
//     type: String,
//     enum: ['low', 'medium', 'high'],
//     default: 'medium'
//   },
//   dueDate: {
//     type: Date
//   },
//   submittedAt: {
//     type: Date
//   },
//   submission: {
//     work: String,
//     files: [{
//       filename: String,
//       originalName: String,
//       path: String,
//       size: Number,
//       mimeType: String
//     }],
//     submittedAt: Date
//   },
//   progressPercentage: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 100
//   },
//   pmRating: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending'
//   },
//   clientRating: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending'
//   },
//   pmFeedback: {
//     type: String
//   },
//   clientFeedback: {
//     type: String
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Get task color based on status
// taskSchema.methods.getStatusColor = function() {
//   const colorMap = {
//     'initiated': '#8B4513', // brown
//     'submitted': '#9370DB', // purple
//     'rejected': '#DC143C', // red
//     'pm_reviewed': this.pmRating === 'approved' ? '#4169E1' : '#DC143C', // blue or red
//     'client_reviewed': this.clientRating === 'approved' ? '#228B22' : '#DC143C', // green or red
//     'completed': '#228B22' // green
//   };
//   return colorMap[this.status] || '#999';
// };

// // Calculate progress percentage based on status
// taskSchema.methods.calculateProgress = function() {
//   if (this.status === 'initiated') {
//     this.progressPercentage = 10;
//   } else if (this.status === 'submitted') {
//     this.progressPercentage = 30;
//   } else if (this.status === 'pm_reviewed' && this.pmRating === 'approved') {
//     this.progressPercentage = 60;
//   } else if (this.status === 'client_reviewed' && this.clientRating === 'approved') {
//     this.progressPercentage = 100;
//   } else if (this.status === 'completed') {
//     this.progressPercentage = 100;
//   } else if (this.status === 'rejected') {
//     // Keep previous percentage or set to 0
//     if (!this.progressPercentage) this.progressPercentage = 0;
//   }
//   return this.progressPercentage;
// };

// module.exports = mongoose.model('Task', taskSchema);


const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'submitted', 'pm_reviewed', 'client_reviewed', 'rejected', 'completed'],
    default: 'initiated',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    index: true
  },
  dueDate: {
    type: Date,
    index: true
  },
  submittedAt: {
    type: Date
  },
  submission: {
    work: String,
    files: [{
      filename: String,
      originalName: String,
      path: String, // Cloudinary URL
      publicId: String, // Cloudinary public ID for deletion
      size: Number,
      mimeType: String
    }],
    submittedAt: Date
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  pmRating: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  clientRating: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  pmFeedback: {
    type: String
  },
  clientFeedback: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
taskSchema.index({ createdAt: -1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

// Get task color based on status
taskSchema.methods.getStatusColor = function() {
  const colorMap = {
    'initiated': '#8B4513', // brown
    'submitted': '#9370DB', // purple
    'rejected': '#DC143C', // red
    'pm_reviewed': this.pmRating === 'approved' ? '#4169E1' : '#DC143C', // blue or red
    'client_reviewed': this.clientRating === 'approved' ? '#228B22' : '#DC143C', // green or red
    'completed': '#228B22' // green
  };
  return colorMap[this.status] || '#999';
};

// Calculate progress percentage based on status
taskSchema.methods.calculateProgress = function() {
  if (this.status === 'initiated') {
    this.progressPercentage = 10;
  } else if (this.status === 'submitted') {
    this.progressPercentage = 30;
  } else if (this.status === 'pm_reviewed' && this.pmRating === 'approved') {
    this.progressPercentage = 60;
  } else if (this.status === 'client_reviewed' && this.clientRating === 'approved') {
    this.progressPercentage = 100;
  } else if (this.status === 'completed') {
    this.progressPercentage = 100;
  } else if (this.status === 'rejected') {
    // Keep previous percentage or set to 0
    if (!this.progressPercentage) this.progressPercentage = 0;
  }
  return this.progressPercentage;
};

// Check if task is overdue
taskSchema.methods.isOverdue = function() {
  if (!this.dueDate || this.status === 'completed') {
    return false;
  }
  return new Date() > this.dueDate;
};

// Get days until due date
taskSchema.methods.getDaysUntilDue = function() {
  if (!this.dueDate) {
    return null;
  }
  const now = new Date();
  const diffTime = this.dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if task has submission
taskSchema.methods.hasSubmission = function() {
  return !!(this.submission && this.submission.work);
};

// Check if task has submission files
taskSchema.methods.hasSubmissionFiles = function() {
  return !!(this.submission && this.submission.files && this.submission.files.length > 0);
};

// Get submission file count
taskSchema.methods.getSubmissionFileCount = function() {
  if (!this.submission || !this.submission.files) {
    return 0;
  }
  return this.submission.files.length;
};

// Get total submission file size
taskSchema.methods.getTotalSubmissionSize = function() {
  if (!this.submission || !this.submission.files) {
    return 0;
  }
  return this.submission.files.reduce((total, file) => total + (file.size || 0), 0);
};

// Get human-readable total submission size
taskSchema.methods.getReadableSubmissionSize = function() {
  const bytes = this.getTotalSubmissionSize();
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Check if task can be reviewed by PM
taskSchema.methods.canBeReviewedByPM = function() {
  return this.status === 'submitted' || this.status === 'pm_reviewed';
};

// Check if task can be reviewed by client
taskSchema.methods.canBeReviewedByClient = function() {
  return this.status === 'pm_reviewed' && this.pmRating === 'approved';
};

// Virtual for status label
taskSchema.virtual('statusLabel').get(function() {
  const labels = {
    'initiated': 'Initiated',
    'submitted': 'Submitted',
    'pm_reviewed': 'PM Reviewed',
    'client_reviewed': 'Client Reviewed',
    'rejected': 'Rejected',
    'completed': 'Completed'
  };
  return labels[this.status] || this.status;
});

// Virtual for priority label
taskSchema.virtual('priorityLabel').get(function() {
  const labels = {
    'low': 'Low Priority',
    'medium': 'Medium Priority',
    'high': 'High Priority'
  };
  return labels[this.priority] || this.priority;
});

module.exports = mongoose.model('Task', taskSchema);