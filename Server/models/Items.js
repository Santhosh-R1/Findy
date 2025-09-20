const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      index: true, 
    },
    finder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    mainCategory: {
      type: String,
      enum: ['electronics', 'pets', 'accessories'], 
      required: [true, "Main category is required."],
    },
    subCategory: {
      type: String,
      enum: ['phone', 'laptop', 'dog', 'cat', 'wallet', 'hand bag'],
      required: [true, "Sub-category is required."],
    },
    status: {
        type: String,
        enum: ['registered', 'lost', 'found', 'claimed'],
        default: 'registered',
    },
    itemName: {
      type: String,
      trim: true,
    },
    itemImage: {
      type: String,
      required: [true, "An item image is required."],
    },
    description: {
      type: String,
      required: [true, "A description is required."],
      trim: true,
    },
    purchaseDate: { type: Date },
    brand: { type: String, trim: true },
    serialNumber: { type: String, trim: true },
    petName: { type: String, trim: true },
    color: { type: String, trim: true },

    lostLocationAddress: { type: String, trim: true },
    lostLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], 
      }
    },
    lostDate: { type: Date },
    
    foundLocationAddress: {
      type: String,
      trim: true,
    },
    foundLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], 
      }
    },
    foundDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ foundLocation: '2dsphere' });
itemSchema.index({ lostLocation: '2dsphere' }); 

module.exports = mongoose.model("Item", itemSchema);