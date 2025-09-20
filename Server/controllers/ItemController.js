const Item = require('../models/Items');
const fs = require('fs');
const User = require("../models/User");
const { sendBulkEmail } = require("../utils/email");
const path = require('path');
// --- HELPER LIBRARIES FOR AI MATCHING ---
const stringSimilarity = require('string-similarity');
const geolib = require('geolib');
const Match = require('../models/match')

// =================================================================
// --- AI MATCHING LOGIC (INTERNAL HELPERS) ---
// =================================================================

/**
 * Calculates a match score between a lost item and a found item based on multiple factors.
 * @param {object} lostItem - The item reported as lost.
 * @param {object} foundItem - The newly reported found item.
 * @returns {number} A score between 0 and 1, where 1 is a perfect match.
 */
const calculateMatchScore = (lostItem, foundItem) => {
    let score = 0;
    const weights = {
        category: 0.30,
        text: 0.35,
        attributes: 0.15,
        location: 0.20,
    };

    if (lostItem.mainCategory === foundItem.mainCategory) {
        score += weights.category * 0.7;
        if (lostItem.subCategory === foundItem.subCategory) {
            score += weights.category * 0.3;
        }
    } else {
        return 0; // If main categories differ, it's not a match.
    }

    const nameSimilarity = stringSimilarity.compareTwoStrings(lostItem.itemName || '', foundItem.itemName || '');
    const descSimilarity = stringSimilarity.compareTwoStrings(lostItem.description || '', foundItem.description || '');
    score += weights.text * ((nameSimilarity * 0.6) + (descSimilarity * 0.4));

    let attributeMatches = 0;
    let totalAttributes = 0;
    if (lostItem.brand && foundItem.brand) {
        totalAttributes++;
        if (lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) attributeMatches++;
    }
    if (lostItem.color && foundItem.color) {
        totalAttributes++;
        if (lostItem.color.toLowerCase() === foundItem.color.toLowerCase()) attributeMatches++;
    }
    if (totalAttributes > 0) {
        score += weights.attributes * (attributeMatches / totalAttributes);
    }

    const hasLostCoords = lostItem.lostLocation?.coordinates?.length === 2;
    const hasFoundCoords = foundItem.foundLocation?.coordinates?.length === 2;
    if (hasLostCoords && hasFoundCoords) {
        const distanceInMeters = geolib.getDistance(
            { latitude: lostItem.lostLocation.coordinates[1], longitude: lostItem.lostLocation.coordinates[0] },
            { latitude: foundItem.foundLocation.coordinates[1], longitude: foundItem.foundLocation.coordinates[0] }
        );
        const maxDistanceKm = 20;
        if (distanceInMeters <= maxDistanceKm * 1000) {
            score += weights.location * (1 - (distanceInMeters / (maxDistanceKm * 1000)));
        }
    }
    return score;
};



/**
 * Finds potential matches for a newly found item and notifies the owner of the lost item via email.
 * This runs asynchronously ("fire-and-forget") to avoid delaying the API response to the user.
 * @param {object} foundItem - The newly saved "found" item document from the database.
 */
const findAndNotifyPotentialMatches = async (foundItem) => {
    try {
        console.log(`[AI Matcher] Starting search for newly found item: ${foundItem.itemName}`);

        const lostItems = await Item.find({ status: 'lost' }).populate('owner');

        if (!lostItems.length) {
            console.log("[AI Matcher] No lost items in the database to compare against.");
            return;
        }

        const potentialMatches = [];
        const MATCH_THRESHOLD = 0.40; // Notify if score is 40% or higher

        for (const lostItem of lostItems) {
            if (!lostItem.owner || !lostItem.owner.email) continue;

            const score = calculateMatchScore(lostItem, foundItem);
            console.log(`[AI Matcher] Comparing with lost "${lostItem.itemName}". Score: ${score.toFixed(2)}`);

            if (score >= MATCH_THRESHOLD) {
                potentialMatches.push({ lostItem, foundItem, score });
            }
        }

        if (potentialMatches.length > 0) {
            potentialMatches.sort((a, b) => b.score - a.score);
            const bestMatch = potentialMatches[0];
            const ownerToNotify = bestMatch.lostItem.owner;

            // --- START: SAVE MATCH TO DATABASE ---

            // 1. Check if this match has already been recorded to avoid spamming the user
            const existingMatch = await Match.findOne({
                lostItem: bestMatch.lostItem._id,
                foundItem: bestMatch.foundItem._id,
            });

            if (existingMatch) {
                console.log(`[AI Matcher] Match between "${bestMatch.lostItem.itemName}" and "${bestMatch.foundItem.itemName}" already exists. Skipping notification.`);
                return; // Stop execution to prevent duplicate notifications
            }

            // 2. If no existing match, save the new one
            const newMatch = new Match({
                lostItem: bestMatch.lostItem._id,
                foundItem: bestMatch.foundItem._id,
                lostItemOwner: ownerToNotify._id,
                finder: bestMatch.foundItem.finder,
                matchType: 'ai',
                matchScore: bestMatch.score,
                status: 'pending_review',
            });
            await newMatch.save();

            console.log(`[AI Matcher] New AI match saved to database with ID: ${newMatch._id}`);

            // --- END: SAVE MATCH TO DATABASE ---

            console.log(`[AI Matcher] High-confidence match found! Notifying owner: ${ownerToNotify.email}`);

            // This function now sends a link to the review page instead of the full details
            const frontendAppUrl = 'http://localhost:5173';
            const reviewUrl = `${frontendAppUrl}/match-review?lostItemId=${bestMatch.lostItem._id}&foundItemId=${bestMatch.foundItem._id}`;

            const subject = `Potential Match Found for Your Lost Item: ${bestMatch.lostItem.itemName}`;
            const htmlMessage = `
            <!DOCTYPE html><html><head><title>Potential Match Found</title></head><body style="font-family: Arial, sans-serif; margin: 20px; color: #333; background-color: #f9f9f9;"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center"><table width="600" border="0" cellspacing="0" cellpadding="20" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"><tr style="background-color: #4CAF50; color: white;"><td align="center"><h1 style="margin: 0;">We Found a Potential Match!</h1></td></tr><tr><td><p>Hello ${ownerToNotify.firstName},</p><p>Our system has found an item that closely matches the description of your lost <strong>${bestMatch.lostItem.itemName}</strong>. Please click the button below to securely review the details.</p></td></tr><tr><td align="center" style="padding: 20px 0;"><a href="${reviewUrl}" target="_blank" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Your Match</a></td></tr><tr><td><p>If you believe this is your item, you can begin the claim process from the review page. Thank you for using Findy!</p></td></tr></table></td></tr></table></body></html>`;

            await sendBulkEmail({ recipients: [ownerToNotify.email], subject, html: htmlMessage });

        } else {
            console.log("[AI Matcher] No high-confidence matches found in this run.");
        }

    } catch (error) {
        if (error.code === 11000) {
            console.log("[AI Matcher] A duplicate match was detected and prevented during a race condition.");
        } else {
            console.error("[AI Matcher] An error occurred during the matching process:", error);
        }
    }
};


// =================================================================
// --- STANDARD CONTROLLER FUNCTIONS ---
// =================================================================

const addItem = async (req, res) => {
    try {
        const {
            ownerId, mainCategory, subCategory, itemName, description, purchaseDate,
            brand, serialNumber, petName, color
        } = req.body;

        if (!ownerId) return res.status(400).json({ message: 'Owner ID is missing. Cannot register item.' });
        if (!mainCategory || !subCategory) return res.status(400).json({ message: 'Category and sub-category are required.' });
        if (!req.file) return res.status(400).json({ message: 'Item image is required.' });

        if (mainCategory === 'electronics') {
            if (!brand || !serialNumber || !itemName || !color) return res.status(400).json({ message: 'For electronics, brand, model name, serial number, and color are required.' });
        } else if (mainCategory === 'pets') {
            if (!petName || !itemName || !color) return res.status(400).json({ message: 'For pets, name, breed, and color are required.' });
        } else if (mainCategory === 'accessories') {
            if (!brand || !itemName || !color) return res.status(400).json({ message: 'For accessories like wallets or handbags, brand, item name, and color are required.' });
        }

        const newItem = new Item({
            owner: ownerId, mainCategory, subCategory, itemName, description, purchaseDate,
            brand: ['electronics', 'accessories'].includes(mainCategory) ? brand : undefined,
            serialNumber: mainCategory === 'electronics' ? serialNumber : undefined,
            petName: mainCategory === 'pets' ? petName : undefined,
            color: color,
            itemImage: req.file.path.replace(/\\/g, "/"),
        });

        const savedItem = await newItem.save();
        res.status(201).json({ message: 'Item registered successfully!', item: savedItem });

    } catch (error) {
        console.error('Error registering item:', error);
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};


const addFoundItemReport = async (req, res) => {
    try {
        const { finderId, mainCategory, subCategory, itemName, description, brand, color, foundDate, foundLocationAddress, foundLocationLat, foundLocationLon } = req.body;
        if (!finderId || !req.file || !mainCategory || !subCategory || !description || !foundDate || !foundLocationAddress) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }
        const newFoundItem = new Item({
            finder: finderId, mainCategory, subCategory, itemName, description, brand, color, foundDate,
            itemImage: req.file.path.replace(/\\/g, "/"), status: 'found', foundLocationAddress,
            foundLocation: { type: 'Point', coordinates: [parseFloat(foundLocationLon), parseFloat(foundLocationLat)] }
        });
        const savedItem = await newFoundItem.save();

        // Trigger the automatic, internal matching system
        findAndNotifyPotentialMatches(savedItem);

        res.status(201).json({ message: 'Found item report submitted successfully! We are checking for potential matches.', item: savedItem });
    } catch (error) {
        console.error('Error submitting found item report:', error);
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};


const addFoundItemReportOrg = async (req, res) => {
    try {
        const {
            finderId, mainCategory, subCategory, itemName, description, brand, petName, color, foundDate,
            foundLocationAddress, foundLocationLat, foundLocationLon
        } = req.body;

        if (!finderId) return res.status(400).json({ message: 'Finder ID is missing. Cannot report item.' });
        if (!req.file) return res.status(400).json({ message: 'An image of the found item is required.' });
        if (!mainCategory || !subCategory || !description || !foundDate || !foundLocationAddress) return res.status(400).json({ message: 'Please fill all required fields.' });

        const newItemData = {
            finder: finderId, mainCategory, subCategory, itemName, description, brand, petName, color, foundDate,
            itemImage: req.file.path.replace(/\\/g, "/"), status: 'found', foundLocationAddress: foundLocationAddress,
        };

        if (foundLocationLat && foundLocationLon && !isNaN(foundLocationLat) && !isNaN(foundLocationLon)) {
            newItemData.foundLocation = {
                type: 'Point',
                coordinates: [parseFloat(foundLocationLon), parseFloat(foundLocationLat)]
            };
        }

        const newFoundItem = new Item(newItemData);
        const savedItem = await newFoundItem.save();

        // *** MODIFICATION: Trigger the AI matching process in the background ***
        findAndNotifyPotentialMatches(savedItem);

        res.status(201).json({
            message: 'Found item report submitted successfully! We are checking for potential matches.',
            item: savedItem,
        });

    } catch (error) {
        console.error('Error submitting found item report:', error);
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        if (error.name === 'MongoServerError' && error.code === 16755) return res.status(400).json({ message: 'Invalid location data provided. Coordinates must be valid numbers.' });
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const viewUserItems = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ message: "User ID parameter is required." });
        const items = await Item.find({ owner: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: items.length, data: items });
    } catch (error) {
        console.error('Error fetching user items:', error);
        if (error.name === 'CastError') return res.status(400).json({ message: `Invalid User ID: ${req.params.userId}` });
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const reportItemLost = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { lostLocationAddress, lostLocationLat, lostLocationLon, lostDate } = req.body;
        const updatePayload = {
            status: 'lost', lostDate: lostDate || Date.now(), lostLocationAddress: lostLocationAddress,
            lostLocation: { type: 'Point', coordinates: [parseFloat(lostLocationLon), parseFloat(lostLocationLat)] }
        };
        const updatedItem = await Item.findByIdAndUpdate(itemId, { $set: updatePayload }, { new: true, runValidators: true });
        if (!updatedItem) return res.status(404).json({ message: 'Item not found.' });

        // Community Notification Logic
        try {
            const allUsers = await User.find({}, 'email');
            const recipientEmails = allUsers.map(user => user.email);
            if (recipientEmails.length > 0) {
                const [lon, lat] = updatedItem.lostLocation.coordinates;
                const interactiveMapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
                const subject = `❗ Lost Item Alert: A ${updatedItem.itemName} was reported missing`;
                const htmlMessage = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Lost Item Alert</title></head><body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-collapse: collapse;"><tr><td align="center" style="background-color: #dc3545; padding: 20px 0;"><h1 style="color: #ffffff; margin: 0; font-size: 24px;">Lost Item Alert</h1></td></tr><tr><td style="padding: 30px; line-height: 1.6; color: #333333;"><p>Hello Community Member,</p><p>An item has been reported as lost. Please keep an eye out for the item described below.</p><h2 style="color: #dc3545; margin-top: 25px;">${updatedItem.itemName}</h2><p><strong>Category:</strong> ${updatedItem.mainCategory} / ${updatedItem.subCategory}</p><p><strong>Description:</strong> ${updatedItem.description || 'No description provided.'}</p><p><strong>Last Known Location:</strong> ${updatedItem.lostLocationAddress}</p></td></tr><tr><td style="padding: 0 30px 20px 30px; text-align: center;"><h3 style="color: #333; margin-top:0;">Last Seen Here:</h3><a href="${interactiveMapUrl}" target="_blank"><strong>Map showing the last known location of the lost item</strong></a><p style="font-size: 12px; color: #6c757d; margin-top: 5px;">(Click map to view in Google Maps)</p></td></tr><tr><td align="center" style="background-color: #f8f9fa; padding: 20px; font-size: 12px; color: #6c757d;"><p style="margin: 0;">You are receiving this because you are a registered user of Findy.</p><p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Findy App. All rights reserved.</p></td></tr></table></body></html>`;
                await sendBulkEmail({ recipients: recipientEmails, subject: subject, html: htmlMessage });
            }
        } catch (emailError) {
            console.error('Error sending notification email:', emailError);
        }
        res.status(200).json({ message: 'Item reported as lost. A notification has been sent to our users.', data: updatedItem });
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
        if (!itemToUpdate) return res.status(404).json({ message: 'Item not found.' });
        if (itemToUpdate.owner.toString() !== ownerId) return res.status(403).json({ message: 'User not authorized to edit this item.' });

        if (req.file) {
            if (itemToUpdate.itemImage) {
                fs.unlink(itemToUpdate.itemImage, (err) => { if (err) console.error("Error deleting old image:", err); });
            }
            updateData.itemImage = req.file.path.replace(/\\/g, "/");
        }
        const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, { new: true, runValidators: true });
        res.status(200).json({ message: 'Item updated successfully!', data: updatedItem });
    } catch (error) {
        console.error('Error updating item:', error);
        if (error.name === 'CastError') return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` });
        res.status(500).json({ message: 'Server error.' });
    }
};

const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error('Error fetching single item:', error);
        if (error.name === 'CastError') return res.status(400).json({ message: `Invalid Item ID format: ${req.params.itemId}` });
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const itemToDelete = await Item.findById(req.params.itemId);
        if (!itemToDelete) return res.status(404).json({ message: 'Item not found.' });
        if (itemToDelete.itemImage) {
            fs.unlink(itemToDelete.itemImage, (err) => { if (err) console.error("Could not delete item image file:", err); });
        }
        await Item.findByIdAndDelete(req.params.itemId);
        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error('Error deleting item:', error);
        if (error.name === 'CastError') return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` });
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
        if (error.name === 'CastError') return res.status(400).json({ message: `Invalid User ID: ${req.params.userId}` });
        res.status(500).json({ message: 'Server error, please try again.' });
    }
};

const markItemAsReturned = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item report not found.' });
        item.status = 'claimed';
        const updatedItem = await item.save();
        res.status(200).json({ message: 'Item status updated to returned.', data: updatedItem });
    } catch (error) {
        console.error('Error marking item as returned:', error);
        if (error.name === 'CastError') return res.status(400).json({ message: `Invalid Item ID: ${req.params.itemId}` });
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

const viewLostItems = async (req, res) => {
    try {
        const lostItems = await Item.find({ status: 'lost' }).populate("owner").sort({ lostDate: -1 });
        res.status(200).json({ success: true, count: lostItems.length, data: lostItems });
    } catch (error) {
        console.error("Error fetching lost items:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const viewFoundItems = async (req, res) => {
    try {
        const foundItems = await Item.find({ status: 'found' }).populate("finder").sort({ foundDate: -1 });
        res.status(200).json({ success: true, count: foundItems.length, data: foundItems });
    } catch (error) {
        console.error("Error fetching found items:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
const findMatchesForFoundItem = async (req, res) => {
    try {
        const { foundItemId } = req.params;
        const foundItem = await Item.findById(foundItemId);
        if (!foundItem || foundItem.status !== 'found') {
            return res.status(404).json({ message: 'Found item report not found.' });
        }

        const lostItems = await Item.find({ status: 'lost' }).populate('owner', 'firstName lastName email');
        if (lostItems.length === 0) {
            return res.status(200).json({ success: true, message: "No lost items to compare against.", data: [] });
        }

        const potentialMatches = lostItems
            .map(lostItem => ({ score: calculateMatchScore(lostItem, foundItem), lostItemDetails: lostItem }))
            .filter(match => match.score >= 0.50) // Manual review can have a slightly lower threshold
            .sort((a, b) => b.score - a.score);

        res.status(200).json({ success: true, count: potentialMatches.length, data: potentialMatches });
    } catch (error) {
        console.error("Error finding matches for found item:", error);
        res.status(500).json({ message: 'Server error while finding matches.' });
    }
};
const notifyOwnerOfMatch = async (req, res) => {
    try {
        const { lostItemId, foundItemId } = req.body;
        if (!lostItemId || !foundItemId) {
            return res.status(400).json({ message: 'Both lost and found item IDs are required.' });
        }

        const lostItem = await Item.findById(lostItemId).populate('owner');
        const foundItem = await Item.findById(foundItemId);

        if (!lostItem || !lostItem.owner || !foundItem) {
            return res.status(404).json({ message: 'Lost item, its owner, or the found item could not be found.' });
        }
        if (!lostItem.owner.email) {
            return res.status(400).json({ message: 'The owner does not have a registered email.' });
        }

        // --- START: SAVE MATCH TO DATABASE ---

        // 1. Check if a moderator or the AI has already created this match
        const existingMatch = await Match.findOne({ lostItem: lostItemId, foundItem: foundItemId });
        if (existingMatch) {
            console.log(`[Moderator Notifier] Attempted to create a duplicate match. Match ID: ${existingMatch._id}`);
            return res.status(409).json({ message: 'A notification for this specific match has already been sent.' });
        }

        // 2. If no match exists, save the new manual match
        const newMatch = new Match({
            lostItem: lostItemId,
            foundItem: foundItemId,
            lostItemOwner: lostItem.owner._id,
            finder: foundItem.finder,
            matchType: 'manual',
            status: 'pending_review',
        });
        await newMatch.save();
        console.log(`[Moderator Notifier] Manual match saved to database with ID: ${newMatch._id}`);

        // --- END: SAVE MATCH TO DATABASE ---

        const ownerToNotify = lostItem.owner;
        const frontendAppUrl = 'http://localhost:5173';
        const reviewUrl = `${frontendAppUrl}/match-review?lostItemId=${lostItemId}&foundItemId=${foundItemId}`;

        const subject = `Good News! A Potential Match for Your Lost ${lostItem.itemName}`;

        // Your professional email template
        const htmlMessage = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body {margin: 0; padding: 0; background-color: #f2f5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;}.content-table {max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); overflow: hidden;}.button:hover {background-color: #0056b3 !important; transform: scale(1.02);}@media screen and (max-width: 600px) {.content-cell {padding: 0 20px 30px 20px !important;}}</style></head><body><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f2f5f8;"><tr><td align="center"><table class="content-table" role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding: 40px 20px 20px 20px;"><h1 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 36px; font-weight: bold; color: #0056b3; margin: 0; letter-spacing: 1px;">Findy</h1></td></tr><tr><td class="content-cell" style="padding: 0 40px 30px 40px;"><h2 style="font-size: 24px; color: #333333; margin: 0 0 20px 0; font-weight: 600;">A Potential Match Has Been Found!</h2><p style="font-size: 16px; color: #555555; line-height: 1.7;">Hello ${ownerToNotify.firstName},</p><p style="font-size: 16px; color: #555555; line-height: 1.7;">Good news! A moderator from our team has found a potential match for your lost <strong>${lostItem.itemName}</strong>.</p><p style="font-size: 16px; color: #555555; line-height: 1.7;">To protect your privacy, we've created a secure page for you to review the details. Please click the button below to compare the items.</p></td></tr><tr><td align="center" style="padding: 0 40px 40px 40px;"><a href="${reviewUrl}" target="_blank" class="button" style="background-color: #007bff; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: all 0.2s ease;">Review Your Match Securely</a></td></tr><tr><td align="center" style="padding: 0 40px 30px 40px;"><p style="font-size: 12px; color: #999999;">If the button doesn't work, copy and paste this link into your browser:</p><a href="${reviewUrl}" style="font-size: 12px; color: #007bff; word-break: break-all;">${reviewUrl}</a></td></tr><tr><td align="center" style="padding: 20px 30px; background-color: #f8f9fa;"><p style="margin: 0; font-size: 12px; color: #999999;">&copy; ${new Date().getFullYear()} Findy Inc. All rights reserved.</p><p style="margin: 5px 0 0 0; font-size: 12px; color: #999999;">123 Finder Lane, Location City, 12345</p></td></tr></table></td></tr></table></body></html>`;

        await sendBulkEmail({
            recipients: [ownerToNotify.email],
            subject,
            html: htmlMessage,
        });

        res.status(200).json({ success: true, message: 'Notification with review link sent successfully.' });

    } catch (error) {
        console.error("Error sending moderator notification:", error);
        res.status(500).json({ message: 'Server error while sending notification.' });
    }
};

const getMatchDetails = async (req, res) => {
    try {
        const { lostItemId, foundItemId } = req.query; // Get IDs from query string

        if (!lostItemId || !foundItemId) {
            return res.status(400).json({ message: 'Both item IDs are required.' });
        }

        const lostItem = await Item.findById(lostItemId);
        const foundItem = await Item.findById(foundItemId);

        if (!lostItem || !foundItem) {
            return res.status(404).json({ message: 'One or both items could not be found.' });
        }

        // Return both items as a JSON object
        res.status(200).json({
            success: true,
            data: {
                lostItem,
                foundItem,
            },
        });

    } catch (error) {
        console.error("Error fetching match details:", error);
        res.status(500).json({ message: 'Server error while fetching item details.' });
    }
};
const getAllMatches = async (req, res) => {
    try {
        // Find all documents in the Match collection
        const matches = await Match.find({})
            // Populate the 'lostItem' field with specific details from the Item collection
            .populate({
                path: 'lostItem',
                select: 'itemName itemImage mainCategory subCategory' // Select only the fields you need
            })
            // Populate the 'foundItem' field
            .populate('foundItem')
            // Populate the 'lostItemOwner' with their name and email
            .populate('lostItemOwner', 'firstName lastName email')
            // Populate the 'finder' with their name and email
            .populate('finder', 'firstName lastName email')
            // Populate the 'moderator' (for manual matches) with their name
            .populate('moderator', 'firstName lastName')
            // Sort by the newest matches first
            .sort({ createdAt: -1 });

        // Send a successful response
        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches,
        });

    } catch (error) {
        console.error("Error fetching all matches:", error);
        res.status(500).json({ success: false, message: 'Server Error: Could not retrieve matches.' });
    }
};

const getUserMatches = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ success: false, message: 'User ID is required and was not provided in the URL.' });
        }

        const matches = await Match.find({ 
            $or: [
                { lostItemOwner: userId },
                { finder: userId }
            ]
        })
            .populate({
                path: 'lostItem',
                select: 'itemName petName itemImage mainCategory subCategory lostDate' 
            })
            .populate({
                path: 'foundItem',
                select: 'itemName petName itemImage mainCategory subCategory foundDate foundLocationAddress'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches,
        });

    } catch (error) {
        console.error("Error fetching user matches:", error);
        if (error.name === 'CastError') {
             return res.status(400).json({ success: false, message: 'Invalid User ID format.' });
        }
        res.status(500).json({ success: false, message: 'Server Error: Could not retrieve your matches.' });
    }
};
const allowFinderToChat = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await Match.findByIdAndUpdate(
            matchId,
            { isFinderAllowedInChat: true },
            { new: true }
        ).populate('finder', 'email firstName');

        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found.' });
        }

        // Optional: Notify the finder they've been added to the chat
        if (match.finder && match.finder.email) {
            const subject = "You've been invited to chat about a found item";
            const chatUrl = `http://localhost:5173/user-help-desk`; // Link to their help desk
            const htmlMessage = `<p>Hello ${match.finder.firstName},</p><p>You have been granted access to chat with the owner of a lost item that may match the one you found. Please visit your Help Desk to participate.</p><a href="${chatUrl}">Go to Help Desk</a>`;
            await sendBulkEmail({ recipients: [match.finder.email], subject, html: htmlMessage });
        }

        res.status(200).json({ success: true, message: 'Finder has been allowed to join the chat.', data: match });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
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
    addFoundItemReportOrg,
    viewLostItems,
    viewFoundItems,
    findMatchesForFoundItem,
    notifyOwnerOfMatch,
    getMatchDetails,
    getAllMatches,
    getUserMatches,
    allowFinderToChat
};