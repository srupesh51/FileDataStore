const express = require('express');
const bookController = require('../controllers/book');
const router = express.Router();

router.post("/", bookController.getRequest);
router.post("/create", bookController.createRequest);

module.exports = router;