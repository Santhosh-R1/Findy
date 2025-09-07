const express = require('express');
const router = express.Router();

const ItemController = require('../controllers/ItemController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 
router.post('/add',  uploadMiddleware.uploadItemImage, ItemController.addItem);
router.get('/user/:userId',  ItemController.viewUserItems);
router.patch('/report-lost/:itemId' , ItemController.reportItemLost);
router.put('/edit/:itemId', uploadMiddleware.uploadItemImage, ItemController.editItem);
router.delete('/delete/:itemId', ItemController.deleteItem); 
router.post('/found/add', uploadMiddleware.uploadItemImage, ItemController.addFoundItemReport);
router.post('/found/add/Org', uploadMiddleware.uploadItemImage, ItemController.addFoundItemReportOrg);

router.get('/found/user/:userId', ItemController.getUserFoundItems);
router.patch('/mark-returned/:itemId', ItemController.markItemAsReturned);
router.get('/allItems', ItemController.viewAllItems);
router.get('/:itemId', ItemController.getItemById); 

module.exports = router;