const Item = require('../models/Items'); 
const fs = require('fs');
const User = require("../models/User");
const { sendBulkEmail } = require("../utils/email");

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

    // --- UPDATED: Added validation for the new 'accessories' category ---
    if (mainCategory === 'electronics') {
      if (!brand || !serialNumber || !itemName || !color) { 
        return res.status(400).json({ message: 'For electronics, brand, model name, serial number, and color are required.' }); 
      }
    } else if (mainCategory === 'pets') {
      if (!petName || !itemName || !color) {
        return res.status(400).json({ message: 'For pets, name, breed, and color are required.' });
      }
    } else if (mainCategory === 'accessories') {
      if (!brand || !itemName || !color) {
        return res.status(400).json({ message: 'For accessories like wallets or handbags, brand, item name, and color are required.' });
      }
    }
    // ---------------------------------------------------------------------

    const newItem = new Item({
      owner: ownerId, 
      mainCategory,
      subCategory,
      itemName,
      description,
      purchaseDate,
      brand: ['electronics', 'accessories'].includes(mainCategory) ? brand : undefined,
      serialNumber: mainCategory === 'electronics' ? serialNumber : undefined,
      petName: mainCategory === 'pets' ? petName : undefined,
      color: color, 
      itemImage: req.file.path.replace(/\\/g, "/"), // Standardize path separators
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


const addFoundItemReport = async (req, res) => {
  try {
    const { 
      finderId, mainCategory, subCategory, itemName, description, brand, petName, color, foundDate,
      foundLocationAddress, foundLocationLat, foundLocationLon 
    } = req.body;

    if (!finderId) {
      return res.status(400).json({ message: 'Finder ID is missing. Cannot report item.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'An image of the found item is required.' });
    }
    if (!mainCategory || !subCategory || !description || !foundDate || !foundLocationAddress) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const newFoundItem = new Item({
      finder: finderId,
      mainCategory,
      subCategory,
      itemName,
      description,
      brand,
      petName,
      color,
      foundDate,
      itemImage:  req.file.path.replace(/\\/g, "/"),
      status: 'found',
      foundLocationAddress: foundLocationAddress,
      foundLocation: {
        type: 'Point',
        coordinates: [parseFloat(foundLocationLon), parseFloat(foundLocationLat)]
      }
    });

    const savedItem = await newFoundItem.save();

    res.status(201).json({
      message: 'Found item report submitted successfully! Thank you for helping.',
      item: savedItem,
    });

  } catch (error) {
    console.error('Error submitting found item report:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'MongoServerError' && error.code === 16755) {
        return res.status(400).json({ message: 'Invalid location data provided.' });
    }
    res.status(500).json({ message: 'Server error, please try again.' });
  }
};

const addFoundItemReportOrg = async (req, res) => {
  try {
    const { 
      finderId, mainCategory, subCategory, itemName, description, brand, petName, color, foundDate,
      foundLocationAddress, foundLocationLat, foundLocationLon 
    } = req.body;

    if (!finderId) {
      return res.status(400).json({ message: 'Finder ID is missing. Cannot report item.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'An image of the found item is required.' });
    }
    if (!mainCategory || !subCategory || !description || !foundDate || !foundLocationAddress) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const newItemData = {
      finder: finderId,
      mainCategory,
      subCategory,
      itemName,
      description,
      brand,
      petName,
      color,
      foundDate,
      itemImage: req.file.path.replace(/\\/g, "/"),
      status: 'found',
      foundLocationAddress: foundLocationAddress,
    };

    if (foundLocationLat && foundLocationLon && !isNaN(foundLocationLat) && !isNaN(foundLocationLon)) {
      newItemData.foundLocation = {
        type: 'Point',
        coordinates: [parseFloat(foundLocationLon), parseFloat(foundLocationLat)]
      };
    }

    const newFoundItem = new Item(newItemData);
    const savedItem = await newFoundItem.save();

    res.status(201).json({
      message: 'Found item report submitted successfully! Thank you for helping.',
      item: savedItem,
    });

  } catch (error) {
    console.error('Error submitting found item report:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'MongoServerError' && error.code === 16755) {
        return res.status(400).json({ message: 'Invalid location data provided. Coordinates must be valid numbers.' });
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
        const { lostLocationAddress, lostLocationLat, lostLocationLon, lostDate } = req.body;
        const updatePayload = {
            status: 'lost',
            lostDate: lostDate || Date.now(),
            lostLocationAddress: lostLocationAddress,
            lostLocation: {
                type: 'Point',
                coordinates: [parseFloat(lostLocationLon), parseFloat(lostLocationLat)]
            }
        };
        const updatedItem = await Item.findByIdAndUpdate(itemId, { $set: updatePayload }, { new: true, runValidators: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        try {
            const allUsers = await User.find({}, 'email');
            const recipientEmails = allUsers.map(user => user.email);
            if (recipientEmails.length > 0) {
                const [lon, lat] = updatedItem.lostLocation.coordinates;
                const interactiveMapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
                const subject = `❗ Lost Item Alert: A ${updatedItem.itemName} was reported missing`;
                const htmlMessage = `
                <!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Lost Item Alert</title></head><body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-collapse: collapse;"><tr><td align="center" style="background-color: #dc3545; padding: 20px 0;"><h1 style="color: #ffffff; margin: 0; font-size: 24px;">Lost Item Alert</h1></td></tr><tr><td style="padding: 30px; line-height: 1.6; color: #333333;"><p>Hello Community Member,</p><p>An item has been reported as lost. Please keep an eye out for the item described below.</p><h2 style="color: #dc3545; margin-top: 25px;">${updatedItem.itemName}</h2><p><strong>Category:</strong> ${updatedItem.mainCategory} / ${updatedItem.subCategory}</p><p><strong>Description:</strong> ${updatedItem.description || 'No description provided.'}</p><p><strong>Last Known Location:</strong> ${updatedItem.lostLocationAddress}</p></td></tr><tr><td style="padding: 0 30px 20px 30px; text-align: center;"><h3 style="color: #333; margin-top:0;">Last Seen Here:</h3><a href="${interactiveMapUrl}" target="_blank"><strong>Map showing the last known location of the lost item</strong></a><p style="font-size: 12px; color: #6c757d; margin-top: 5px;">(Click map to view in Google Maps)</p></td></tr><tr><td align="center" style="background-color: #f8f9fa; padding: 20px; font-size: 12px; color: #6c757d;"><p style="margin: 0;">You are receiving this because you are a registered user of Findy.</p><p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Findy App. All rights reserved.</p></td></tr></table></body></html>`;
                await sendBulkEmail({ recipients: recipientEmails, subject: subject, html: htmlMessage });
                console.log('Robust notification email with map sent successfully.');
            }
        } catch (emailError) {
            console.error('Error sending styled notification email:', emailError);
        }
        res.status(200).json({
            message: 'Item reported as lost. A notification has been sent to our users.',
            data: updatedItem
        });
    } catch (error) {
        console.error('Error reporting item as lost:', error);
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
                fs.unlink(itemToUpdate.itemImage, (err) => { if (err) console.error("Error deleting old image:", err); });
            }
            updateData.itemImage = '/' + req.file.path.replace(/\\/g, "/");
        }
        const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, { new: true, runValidators: true });
        res.status(200).json({ message: 'Item updated successfully!', data: updatedItem });
    } catch (error) {
        console.error('Error updating item:', error);
        if (error.name === 'CastError') { return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` }); }
        res.status(500).json({ message: 'Server error.' });
    }
};

const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error('Error fetching single item:', error);
        if (error.name === 'CastError') { return res.status(400).json({ message: `Invalid Item ID format: ${req.params.itemId}` }); }
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const itemToDelete = await Item.findById(req.params.itemId);
        if (!itemToDelete) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (itemToDelete.itemImage) {
            fs.unlink(itemToDelete.itemImage, (err) => { if (err) { console.error("Could not delete item image file:", err); } });
        }
        await Item.findByIdAndDelete(req.params.itemId);
        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error('Error deleting item:', error);
        if (error.name === 'CastError') { return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` }); }
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const getUserFoundItems = async (req, res) => {
    try {
        const userId = req.params.userId;
        const items = await Item.find({ finder: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: items.length, data: items });
    } catch (error) {
        console.error('Error fetching user found items:', error);
        if (error.name === 'CastError') { return res.status(400).json({ message: `Invalid User ID: ${req.params.userId}` }); }
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const markItemAsReturned = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item report not found.' });
        }
        item.status = 'claimed';
        const updatedItem = await item.save();
        res.status(200).json({ message: 'Item status updated to returned.', data: updatedItem });
    } catch (error) {
        console.error('Error marking item as returned:', error);
        if (error.name === 'CastError') { return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` }); }
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const viewAllItems = async (req, res) => {
  try {
    const items = await Item.find({}).populate("owner");
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  addItem,
  addFoundItemReport, 
  viewUserItems,
  reportItemLost,
  editItem,
  getItemById,
  deleteItem,
  getUserFoundItems,
  markItemAsReturned,
  viewAllItems,
  addFoundItemReportOrg
};