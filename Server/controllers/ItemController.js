const Item = require('../models/Items');
const User = require("../models/User");
const Match = require('../models/match');
const Organisation = require('../models/Organaization'); 
const fs = require('fs');
const path = require('path');
const { sendBulkEmail } = require("../utils/email");

const stringSimilarity = require('string-similarity');
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const sharp = require('sharp');

let imageModel;
const loadAIModel = async () => {
    if (!imageModel) {
        console.log("🧠 Python Ai Model...");
        try {
            imageModel = await mobilenet.load();
            console.log("✅ Python Ai Model Loaded Successfully.");
        } catch (err) {
            console.error("❌ Ai to load TensorFlow Model:", err);
        }
    }
    return imageModel;
};
loadAIModel();


const imageToTensor = async (imagePath) => {
    try {
        const buffer = await sharp(imagePath).resize(224, 224, { fit: 'fill' }).removeAlpha().raw().toBuffer();
        const tensor = tf.tensor3d(new Uint8Array(buffer), [224, 224, 3]);
        return tensor; 
    } catch (err) {
        console.error(`Error converting image (${imagePath}) to tensor:`, err.message);
        return null;
    }
};

const calculateImageSimilarity = async (pathA, pathB) => {
    try {
        if (!pathA || !pathB) return 0;
        const fullPathA = path.resolve(pathA);
        const fullPathB = path.resolve(pathB);
        if (!fs.existsSync(fullPathA) || !fs.existsSync(fullPathB)) return 0;

        const model = await loadAIModel();
        if (!model) return 0;

        const tensorA = await imageToTensor(fullPathA);
        const tensorB = await imageToTensor(fullPathB);

        if (!tensorA || !tensorB) {
            if (tensorA) tensorA.dispose();
            if (tensorB) tensorB.dispose();
            return 0;
        }

        const embeddingA = model.infer(tensorA, true);
        const embeddingB = model.infer(tensorB, true);
        const dotProduct = embeddingA.matMul(embeddingB.transpose());
        const normA = embeddingA.norm();
        const normB = embeddingB.norm();
        const similarityTensor = dotProduct.div(normA.mul(normB));
        const similarityScore = similarityTensor.dataSync()[0];

        tf.dispose([tensorA, tensorB, embeddingA, embeddingB, dotProduct, normA, normB, similarityTensor]);
        return similarityScore || 0;
    } catch (error) {
        console.error("AI Match Error:", error.message);
        return 0;
    }
};

const calculateMatchScore = async (lostItem, foundItem) => {
    if (!lostItem.itemImage || !foundItem.itemImage) return 0; 
    let imageScore = await calculateImageSimilarity(lostItem.itemImage, foundItem.itemImage);
    const IMAGE_THRESHOLD = 0.60;
    if (imageScore < IMAGE_THRESHOLD) return 0;

    const nameSim = stringSimilarity.compareTwoStrings(lostItem.itemName || '', foundItem.itemName || '');
    const descSim = stringSimilarity.compareTwoStrings(lostItem.description || '', foundItem.description || '');
    const textScore = (nameSim * 0.6) + (descSim * 0.4);
    
    return (imageScore * 0.8) + (textScore * 0.2);
};

const findAndNotifyPotentialMatches = async (foundItem) => {
    try {
        const lostItems = await Item.find({ status: 'lost' }).populate('owner');
        if (!lostItems.length) return;

        const matchPromises = lostItems.map(async (lostItem) => {
            if (!lostItem.owner || !lostItem.owner.email) return null;
            const score = await calculateMatchScore(lostItem, foundItem);
            return score > 0 ? { lostItem, foundItem, score } : null;
        });

        const results = await Promise.all(matchPromises);
        const validMatches = results.filter(r => r !== null).sort((a, b) => b.score - a.score);

        if (validMatches.length > 0) {
            const bestMatch = validMatches[0];
            const owner = bestMatch.lostItem.owner;
            const exists = await Match.findOne({ lostItem: bestMatch.lostItem._id, foundItem: bestMatch.foundItem._id });
            if (exists) return;

            const newMatch = new Match({
                lostItem: bestMatch.lostItem._id,
                foundItem: bestMatch.foundItem._id,
                lostItemOwner: owner._id,
                finder: bestMatch.foundItem.finder,
                matchType: 'ai',
                matchScore: bestMatch.score,
                status: 'pending_review'
            });
            await newMatch.save();

            const reviewUrl = `http://localhost:5173/match-review?lostItemId=${bestMatch.lostItem._id}&foundItemId=${bestMatch.foundItem._id}`;
            const subject = `Potential Match Found: ${bestMatch.lostItem.itemName}`;
            const html = `<h3>Good News!</h3><p>Potential match found (${(bestMatch.score * 100).toFixed(0)}%).</p><a href="${reviewUrl}">Review Match</a>`;
            await sendBulkEmail({ recipients: [owner.email], subject, html });
        }
    } catch (error) {
        console.error("AI Matcher Error:", error);
    }
};

const viewFoundItems = async (req, res) => {
    try {
        const items = await Item.find({ status: 'found' })
            .sort({ foundDate: -1 })
            .lean();

        const populatedItems = await Promise.all(items.map(async (item) => {
            if (!item.finder) return item; 

            const userFinder = await User.findById(item.finder)
                .select('firstName lastName email phone profileImage');

            if (userFinder) {
                item.finder = userFinder;
                item.finder.type = 'User'; 
                return item;
            }

            const orgFinder = await Organisation.findById(item.finder)
                .select('organisationName email phone address organisationLogo');

            if (orgFinder) {
                item.finder = orgFinder;
                item.finder.firstName = orgFinder.organisationName; 
                item.finder.profileImage = orgFinder.organisationLogo;
                item.finder.type = 'Organisation';
                return item;
            }

            return item;
        }));

        res.status(200).json({ 
            success: true, 
            count: populatedItems.length, 
            data: populatedItems 
        });

    } catch (error) {
        console.error("Error in viewFoundItems:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const addItem = async (req, res) => {
    try {
        const { ownerId, mainCategory, subCategory, itemName, description, purchaseDate, brand, serialNumber, petName, color } = req.body;
        const newItem = new Item({
            owner: ownerId, mainCategory, subCategory, itemName, description, purchaseDate,
            brand, serialNumber, petName, color,
            itemImage: req.file.path.replace(/\\/g, "/"),
            status: 'registered'
        });
        console.log(newItem);
        
        const savedItem = await newItem.save();
        res.status(201).json({ message: 'Item registered successfully!', item: savedItem });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Server error.' });
    }
};

const addFoundItemReport = async (req, res) => {
    try {
        const { finderId, mainCategory, subCategory, itemName, description, brand, color, foundDate, foundLocationAddress, foundLocationLat, foundLocationLon } = req.body;
        const newFoundItem = new Item({
            finder: finderId,
            finderModel: 'User', 
            mainCategory, subCategory, itemName, description, brand, color, foundDate,
            itemImage: req.file ? req.file.path.replace(/\\/g, "/") : "",
            status: 'found', foundLocationAddress,
            foundLocation: { type: 'Point', coordinates: [parseFloat(foundLocationLon), parseFloat(foundLocationLat)] }
        });
        const savedItem = await newFoundItem.save();
        findAndNotifyPotentialMatches(savedItem);
        res.status(201).json({ message: 'Report submitted.', item: savedItem });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};
const confirmMatchByOwner = async (req, res) => {
    try {
        const { lostItemId, foundItemId } = req.body;

        if (!lostItemId || !foundItemId) {
            return res.status(400).json({ message: 'Missing item IDs.' });
        }

        await Match.findOneAndUpdate(
            { lostItem: lostItemId, foundItem: foundItemId },
            { status: 'confirmed_by_owner' }
        );

        res.status(200).json({ success: true, message: 'Match confirmed. Please go to Help Desk to finalize claim.' });
    } catch (error) {
        console.error("Error confirming match:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const confirmMatchClaim = async (req, res) => {
    try {
        const { lostItemId, foundItemId } = req.body;

        if (!lostItemId || !foundItemId) {
            return res.status(400).json({ message: 'Missing item IDs.' });
        }

        await Item.findByIdAndUpdate(foundItemId, { status: 'claimed' });
        await Item.findByIdAndUpdate(lostItemId, { status: 'claimed' });
        await Match.findOneAndUpdate(
            { lostItem: lostItemId, foundItem: foundItemId },
            { status: 'resolved' }
        );

        await Match.deleteMany({
            lostItem: lostItemId,
            foundItem: { $ne: foundItemId } 
        });

        res.status(200).json({ success: true, message: 'Item claimed. Other matches for this item have been removed.' });
    } catch (error) {
        console.error("Error finalizing claim:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};
const addFoundItemReportOrg = async (req, res) => {
    try {
        const { finderId, mainCategory, subCategory, itemName, description, brand, petName, color, foundDate, foundLocationAddress, foundLocationLat, foundLocationLon } = req.body;
        
        const newItemData = {
            finder: finderId,
            finderModel: 'Organisation', 
            mainCategory, subCategory, itemName, description, brand, petName, color, foundDate,
            itemImage: req.file ? req.file.path.replace(/\\/g, "/") : "",
            status: 'found', foundLocationAddress,
        };
        if (foundLocationLat && foundLocationLon) {
            newItemData.foundLocation = { type: 'Point', coordinates: [parseFloat(foundLocationLon), parseFloat(foundLocationLat)] };
        }
        const newFoundItem = new Item(newItemData);
        const savedItem = await newFoundItem.save();
        findAndNotifyPotentialMatches(savedItem);
        res.status(201).json({ message: 'Report submitted successfully.', item: savedItem });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

const viewUserItems = async (req, res) => {
    try {
        const items = await Item.find({ owner: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

const reportItemLost = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { lostLocationAddress, lostLocationLat, lostLocationLon, lostDate } = req.body;
        const updatePayload = {
            status: 'lost', lostDate: lostDate || Date.now(), lostLocationAddress,
            lostLocation: { type: 'Point', coordinates: [parseFloat(lostLocationLon), parseFloat(lostLocationLat)] }
        };
        const updatedItem = await Item.findByIdAndUpdate(itemId, { $set: updatePayload }, { new: true });
        res.status(200).json({ message: 'Item reported as lost.', data: updatedItem });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

const findMatchesForFoundItem = async (req, res) => {
    try {
        const { foundItemId } = req.params;
        const foundItem = await Item.findById(foundItemId);
        if (!foundItem) return res.status(404).json({ message: 'Found item not found.' });
        const lostItems = await Item.find({ status: 'lost' }).populate('owner', 'firstName lastName email');
        const promises = lostItems.map(async (lostItem) => {
            const score = await calculateMatchScore(lostItem, foundItem);
            return { score, lostItemDetails: lostItem };
        });
        const results = await Promise.all(promises);
        const matches = results.filter(m => m.score > 0).sort((a, b) => b.score - a.score);
        res.status(200).json({ success: true, count: matches.length, data: matches });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

const notifyOwnerOfMatch = async (req, res) => {
    try {
        const { lostItemId, foundItemId, moderatorId } = req.body;
        const lostItem = await Item.findById(lostItemId).populate('owner');
        const foundItem = await Item.findById(foundItemId);
        if (!lostItem || !foundItem) return res.status(404).json({ message: 'Items not found.' });
        const existing = await Match.findOne({ lostItem: lostItemId, foundItem: foundItemId });
        if (existing) return res.status(409).json({ message: 'Notification already sent.' });
        const newMatch = new Match({
            lostItem: lostItemId, foundItem: foundItemId, lostItemOwner: lostItem.owner._id,
            finder: foundItem.finder, moderator: moderatorId, matchType: 'manual', status: 'pending_review'
        });
        await newMatch.save();
        const reviewUrl = `http://localhost:5173/match-review?lostItemId=${lostItemId}&foundItemId=${foundItemId}`;
        const subject = `Potential Match for ${lostItem.itemName}`;
        const html = `<p>A moderator identified a potential match.</p><a href="${reviewUrl}">Review Match</a>`;
        await sendBulkEmail({ recipients: [lostItem.owner.email], subject, html });
        res.status(200).json({ success: true, message: 'Owner notified.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

const editItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const updateData = req.body;
        if (req.file) updateData.itemImage = req.file.path.replace(/\\/g, "/");
        const updated = await Item.findByIdAndUpdate(itemId, updateData, { new: true });
        res.status(200).json({ message: 'Item updated.', data: updated });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const deleteItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.itemId);
        if (item && item.itemImage) fs.unlink(item.itemImage, (err) => { if (err) console.error("Error deleting image:", err); });
        res.status(200).json({ message: 'Item deleted.' });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Not found.' });
        res.status(200).json({ success: true, data: item });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const getUserFoundItems = async (req, res) => {
    try {
        const items = await Item.find({ finder: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: items });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const viewAllItems = async (req, res) => {
    try {
        const items = await Item.find({}).populate("owner");
        res.status(200).json({ success: true, data: items });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const viewLostItems = async (req, res) => {
    try {
        const items = await Item.find({ status: 'lost' }).populate("owner").sort({ lostDate: -1 });
        res.status(200).json({ success: true, data: items });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const markItemAsReturned = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.itemId, { status: 'claimed' }, { new: true });
        res.status(200).json({ message: 'Item returned.', data: item });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const getMatchDetails = async (req, res) => {
    try {
        const { lostItemId, foundItemId } = req.query;
        const lostItem = await Item.findById(lostItemId);
        const foundItem = await Item.findById(foundItemId);
        res.status(200).json({ success: true, data: { lostItem, foundItem } });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const getAllMatches = async (req, res) => {
    try {
        const matches = await Match.find({})
            .populate('lostItem foundItem lostItemOwner moderator')
            .sort({ createdAt: -1 })
            .lean(); 
        const populatedMatches = await Promise.all(matches.map(async (match) => {
            if (!match.finder) return match;
            let finderData = await User.findById(match.finder).select('firstName lastName email phone profileImage');
            
            if (finderData) {
                match.finder = finderData;
                match.finder.type = 'User';
                return match;
            }
            let orgData = await Organisation.findById(match.finder).select('organisationName email phone organisationLogo');
            
            if (orgData) {
                match.finder = {
                    _id: orgData._id,
                    firstName: orgData.organisationName, 
                    lastName: '', 
                    email: orgData.email,
                    phone: orgData.phone,
                    profileImage: orgData.organisationLogo,
                    type: 'Organisation'
                };
                return match;
            }

            return match; 
        }));

        res.status(200).json({ success: true, data: populatedMatches });
    } catch (error) {
        console.error("Error fetching all matches:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};


const getUserMatches = async (req, res) => {
    try {
        const { userId } = req.params;
        const matches = await Match.find({ 
            $or: [{ lostItemOwner: userId }, { finder: userId }]
        }).populate('lostItem foundItem').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: matches });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const allowFinderToChat = async (req, res) => {
    try {
        await Match.findByIdAndUpdate(req.params.matchId, { isFinderAllowedInChat: true }, { new: true });
        res.status(200).json({ success: true, message: 'Chat enabled.' });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};

const rejectMatch = async (req, res) => {
    try {
        const { lostItemId, foundItemId } = req.body;
        await Match.findOneAndDelete({ lostItem: lostItemId, foundItem: foundItemId });
        res.status(200).json({ success: true, message: 'Match rejected and removed.' });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
};


const viewOrgFoundItems = async (req, res) => {
    try {
        const items = await Item.find({ status: 'found' }).lean();
        
        const orgItems = [];

        for (const item of items) {
            if(item.finder) {
                const org = await Organisation.findById(item.finder)
                    .select('organisationName email phone address organisationLogo');
                
                if (org) {
                    item.finder = org;
                    item.finder.firstName = org.organisationName;
                    item.finder.profileImage = org.organisationLogo;
                    orgItems.push(item);
                }
            }
        }

        res.status(200).json({ success: true, count: orgItems.length, data: orgItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addItem, viewUserItems, editItem, getItemById, deleteItem, reportItemLost,
    addFoundItemReport, addFoundItemReportOrg, getUserFoundItems, viewFoundItems, viewLostItems, viewAllItems, markItemAsReturned,
    findMatchesForFoundItem, notifyOwnerOfMatch, getMatchDetails, getAllMatches, getUserMatches, allowFinderToChat, rejectMatch,
    confirmMatchClaim,viewOrgFoundItems, confirmMatchByOwner
};