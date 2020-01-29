const express = require('express');
const { getFields, createField } = require('../controllers/fields');

const router = express.Router();

router
    .route('/')
    .get(getFields)
    .post(createField);

module.exports = router;