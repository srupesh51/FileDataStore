const express = require('express');
const dataStoreController = require('../controllers/dataStore');
const router = express.Router();

router.post("/create", dataStoreController.createDataStore);
router.post("/read", dataStoreController.readDataStore);
router.delete("/delete", dataStoreController.deleteDataStore);

module.exports = router;
