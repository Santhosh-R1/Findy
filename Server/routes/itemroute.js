const express = require('express');
const router = express.Router();

const itemsController = require('../controllers/itemController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 

router.post('/add', uploadMiddleware.uploadItemImage, itemsController.addItem);
router.post('/found/add', uploadMiddleware.uploadItemImage, itemsController.addFoundItemReport);
router.post('/found/add/Org', uploadMiddleware.uploadItemImage, itemsController.addFoundItemReportOrg);
router.post('/notify/owner', itemsController.notifyOwnerOfMatch);


router.get('/', itemsController.getAllMatches);
router.get('/allItems', itemsController.viewAllItems);
router.get('/matches/all', itemsController.getAllMatches); // Optional alias
router.get('/match-details', itemsController.getMatchDetails);
router.get('/status/lost', itemsController.viewLostItems);
router.get('/status/found', itemsController.viewFoundItems);

router.get('/user/:userId', itemsController.viewUserItems);
router.get('/found/user/:userId', itemsController.getUserFoundItems);
router.get('/my-matches/:userId', itemsController.getUserMatches);
router.get('/match/:foundItemId', itemsController.findMatchesForFoundItem);

router.patch('/report-lost/:itemId', itemsController.reportItemLost);
router.patch('/mark-returned/:itemId', itemsController.markItemAsReturned);
router.put('/edit/:itemId', uploadMiddleware.uploadItemImage, itemsController.editItem);
router.put('/allow-finder/:matchId', itemsController.allowFinderToChat);
router.delete('/delete/:itemId', itemsController.deleteItem);
router.get('/:itemId', itemsController.getItemById);

router.post('/match/reject', itemsController.rejectMatch);
router.post('/match/confirm-claim', itemsController.confirmMatchClaim);
// router.get('/fix-migration', itemsController.fixFinderReferences);
router.get('/status/found/org', itemsController.viewOrgFoundItems);
router.post('/match/confirm-owner', itemsController.confirmMatchByOwner);
module.exports = router;