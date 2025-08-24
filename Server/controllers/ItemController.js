const Item = require('../models/Items'); 
const fs = require('fs');
const addItem = async (req, res) => {
  try {
    const { 
      ownerId, 
      mainCategory, subCategory, itemName, description, purchaseDate, 
      brand, serialNumber, petName, color 
    } = req.body;
    
    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is missing. Cannot register item.' });
    }

    if (!mainCategory || !subCategory) {
      return res.status(400).json({ message: 'Category and sub-category are required.' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Item image is required.' });
    }

    if (mainCategory === 'electronics') {
      if (!brand || !serialNumber || !itemName) {
        return res.status(400).json({ message: 'For electronics, brand, model name, and serial number are required.' });
      }
    } else if (mainCategory === 'pets') {
      if (!petName || !itemName || !color) {
        return res.status(400).json({ message: 'For pets, name, breed, and color are required.' });
      }
    }

    const newItem = new Item({
      owner: ownerId, 
      mainCategory,
      subCategory,
      itemName,
      description,
      purchaseDate,
      brand: mainCategory === 'electronics' ? brand : undefined,
      serialNumber: mainCategory === 'electronics' ? serialNumber : undefined,
      petName: mainCategory === 'pets' ? petName : undefined,
      color: mainCategory === 'pets' ? color : undefined,
      itemImage: req.file.path,
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      message: 'Item registered successfully!',
      item: savedItem,
    });

  } catch (error) {
    console.error('Error registering item:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error, please try again.' });
  }
};
const viewUserItems = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID parameter is required." });
        }
        const items = await Item.find({ owner: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });

    } catch (error) {
        console.error('Error fetching user items:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: `Invalid User ID: ${req.params.userId}` });
        }
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const reportItemLost = async (req, res) => {
    try {
        const { itemId } = req.params;
        const updatedItem = await Item.findByIdAndUpdate(
            itemId,
            { 
                status: 'lost',
                lostDate: Date.now() 
            },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        res.status(200).json({
            message: 'Item has been successfully reported as lost.',
            data: updatedItem
        });

    } catch (error) {
        console.error('Error reporting item as lost:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` });
        }
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};
const editItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { ownerId, ...updateData } = req.body;
        const itemToUpdate = await Item.findById(itemId);

        if (!itemToUpdate) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (itemToUpdate.owner.toString() !== ownerId) {
            return res.status(403).json({ message: 'User not authorized to edit this item.' });
        }

        if (req.file) {
            if (itemToUpdate.itemImage) {
                fs.unlink(itemToUpdate.itemImage, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
            updateData.itemImage = req.file.path;
        }

        const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            message: 'Item updated successfully!',
            data: updatedItem,
        });

    } catch (error) {
        console.error('Error updating item:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` });
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.status(200).json({ success: true, data: item });

    } catch (error) {
        console.error('Error fetching single item:', error);
                if (error.name === 'CastError') {
            return res.status(400).json({ message: `Invalid Item ID format: ${req.params.itemId}` });
        }

        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const itemToDelete = await Item.findById(itemId);

        if (!itemToDelete) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        if (itemToDelete.itemImage) {
            fs.unlink(itemToDelete.itemImage, (err) => {
                if (err) {
                    console.error("Could not delete item image file:", err);
                }
            });
        }

        await Item.findByIdAndDelete(itemId);

        res.status(200).json({ message: 'Item deleted successfully.' });

    } catch (error) {
        console.error('Error deleting item:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` });
        }
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};
module.exports = {
  addItem,
  viewUserItems,
  reportItemLost,
  editItem,
  getItemById,
  deleteItem
};