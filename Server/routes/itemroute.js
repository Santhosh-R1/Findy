const express = require('express');
const router = express.Router();

const ItemController = require('../controllers/ItemController'); 
const uploadMiddleware = require('../middleware/uploadMiddleware'); 
router.post('/add', uploadMiddleware.uploadItemImage, ItemController.addItem);

router.get('/user/:userId', ItemController.viewUserItems);
router.patch('/report-lost/:itemId', ItemController.reportItemLost);
router.put('/edit/:itemId', uploadMiddleware.uploadItemImage, ItemController.editItem);
router.get('/:itemId', ItemController.getItemById);
router.delete('/delete/:itemId', ItemController.deleteItem);

module.exports = router;