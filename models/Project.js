// const mongoose = require('mongoose');

// const projectSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Project title is required'],
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   projectManager: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   client: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   teamMembers: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   status: {
//     type: String,
//     enum: ['not_started', 'in_progress', 'completed', 'on_hold'],
//     default: 'not_started'
//   },
//   startDate: {
//     type: Date
//   },
//   endDate: {
//     type: Date
//   },
//   progress: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 100
//   },
//   clientLogo: {
//     filename: String,
//     path: String,
//     originalName: String,
//     mimeType: String,
//     size: Number
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Calculate progress based on tasks
// projectSchema.methods.calculateProgress = async function() {
//   const Task = mongoose.model('Task');
//   const tasks = await Task.find({ project: this._id });
  
//   if (tasks.length === 0) {
//     this.progress = 0;
//     return;
//   }
  
//   const completedTasks = tasks.filter(t => t.status === 'completed').length;
//   this.progress = Math.round((completedTasks / tasks.length) * 100);
//   await this.save();
// };

// module.exports = mongoose.model('Project', projectSchema);


const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'on_hold'],
    default: 'not_started',
    index: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  clientLogo: {
    filename: String,
    path: String, // Cloudinary URL
    publicId: String, // Cloudinary public ID for deletion
    originalName: String,
    mimeType: String,
    size: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
projectSchema.index({ createdAt: -1 });
projectSchema.index({ teamMembers: 1 });
projectSchema.index({ status: 1, createdAt: -1 });

// Calculate progress based on tasks
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });
  
  if (tasks.length === 0) {
    this.progress = 0;
    return;
  }
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  this.progress = Math.round((completedTasks / tasks.length) * 100);
  await this.save();
};

// Get project statistics
projectSchema.methods.getStatistics = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });
  
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => ['submitted', 'pm_reviewed', 'client_reviewed'].includes(t.status)).length,
    pendingTasks: tasks.filter(t => t.status === 'initiated').length,
    rejectedTasks: tasks.filter(t => t.status === 'rejected').length,
    progress: this.progress,
    teamSize: this.teamMembers.length,
    hasClient: !!this.client,
    daysRemaining: this.endDate ? Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24)) : null
  };
};

// Check if project is overdue
projectSchema.methods.isOverdue = function() {
  if (!this.endDate || this.status === 'completed') {
    return false;
  }
  return new Date() > this.endDate;
};

// Get project duration in days
projectSchema.methods.getDuration = function() {
  if (!this.startDate || !this.endDate) {
    return null;
  }
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Virtual for client logo URL (backward compatibility)
projectSchema.virtual('clientLogoUrl').get(function() {
  return this.clientLogo?.path || null;
});

module.exports = mongoose.model('Project', projectSchema);