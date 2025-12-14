// const mongoose = require('mongoose');

// const settingsSchema = new mongoose.Schema({
//   companyName: {
//     type: String,
//     default: 'GIC Projects',
//     trim: true
//   },
//   companyLogo: {
//     filename: String,
//     path: String,
//     originalName: String,
//     mimeType: String,
//     size: Number
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // Ensure only one settings document exists
// settingsSchema.statics.getSettings = async function() {
//   let settings = await this.findOne();
//   if (!settings) {
//     settings = new this({});
//     await settings.save();
//   }
//   return settings;
// };

// module.exports = mongoose.model('Settings', settingsSchema);



const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'GIC Projects',
    trim: true
  },
  companyLogo: {
    filename: String,
    path: String, // Cloudinary URL
    publicId: String, // Cloudinary public ID for deletion
    originalName: String,
    mimeType: String,
    size: Number
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this({});
    await settings.save();
  }
  return settings;
};

// Virtual for logo URL (backward compatibility)
settingsSchema.virtual('logoUrl').get(function() {
  return this.companyLogo?.path || null;
});

// Method to update company name
settingsSchema.methods.updateCompanyName = async function(newName, userId) {
  this.companyName = newName;
  this.updatedBy = userId;
  await this.save();
  return this;
};

// Method to check if logo exists
settingsSchema.methods.hasLogo = function() {
  return !!(this.companyLogo && this.companyLogo.path);
};

module.exports = mongoose.model('Settings', settingsSchema);