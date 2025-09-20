const express = require('express');
const router = express.Router();

const itemsController = require('../controllers/ItemController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 

// --- CREATE routes ---
// Register a new item for a user
router.post('/add', uploadMiddleware.uploadItemImage, itemsController.addItem);
// Report a found item (by a regular user) - This triggers the automatic AI match
router.post('/found/add', uploadMiddleware.uploadItemImage, itemsController.addFoundItemReport);
// Report a found item (by an organization) - This also triggers the automatic AI match
router.post('/found/add/Org', uploadMiddleware.uploadItemImage, itemsController.addFoundItemReportOrg);

// --- ACTION/NOTIFICATION routes ---
// Called by the moderator's "Notify Owner" button in the dialog
router.post('/notify/owner', itemsController.notifyOwnerOfMatch); // <-- CORRECTED: Points to the manual notifier


// --- READ routes (Specific routes MUST come first) ---
// Get all items in the system
router.get('/allItems', itemsController.viewAllItems);
// Get all items with 'lost' status
router.get('/status/lost', itemsController.viewLostItems);
// Get all items with 'found' status
router.get('/status/found', itemsController.viewFoundItems);
// Get all items registered by a specific user
router.get('/user/:userId', itemsController.viewUserItems);
// Get all items found by a specific user
router.get('/found/user/:userId', itemsController.getUserFoundItems);
// Find potential matches for a specific found item (for moderator dialog)
router.get('/match/:foundItemId', itemsController.findMatchesForFoundItem);
router.get('/match-details', itemsController.getMatchDetails);

// --- UPDATE routes ---
router.patch('/report-lost/:itemId', itemsController.reportItemLost);
router.patch('/mark-returned/:itemId', itemsController.markItemAsReturned);
router.put('/edit/:itemId', uploadMiddleware.uploadItemImage, itemsController.editItem);


// --- DELETE routes ---
router.delete('/delete/:itemId', itemsController.deleteItem); 


// --- PARAMETERIZED 'GET' ROUTE (MUST BE LAST) ---
// This generic route will only be matched if none of the specific routes above are.
router.get('/:itemId', itemsController.getItemById); 
router.get('/', itemsController.getAllMatches); 
router.get('/my-matches/:userId', itemsController.getUserMatches); 
router.put('/allow-finder/:matchId', itemsController.allowFinderToChat);

module.exports = router;