const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: [true, "Every item must have an owner."],
      index: true, 
    },

    mainCategory: {
      type: String,
      enum: ['electronics', 'pets'], 
      required: [true, "Main category is required."],
    },
    subCategory: {
      type: String,
      enum: ['phone', 'laptop', 'dog', 'cat'],
      required: [true, "Sub-category is required."],
    },

    status: {
        type: String,
        enum: ['registered', 'lost', 'found', 'claimed'],
        default: 'registered',
    },

    itemName: {
      type: String,
      required: [true, "Item name or breed is required."],
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
    purchaseDate: {
      type: Date,
    },

    brand: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },

    petName: {
      type: String,
      trim: true,
    },
    color: {
        type: String,
        trim: true,
    },

    lostLocation: {
        address: String,
        city: String,
        zipCode: String,
    },
    lostDate: {
        type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);