const express = require('express');
const Datastore = require('nedb');
const { body, validationResult, sanitizeBody } = require('express-validator');
const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const database = new Datastore('database.db');
database.loadDatabase();

app.post('/field_api', [
    body('fieldName').not().isEmpty().trim().escape(),
    sanitizeBody('fieldName')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    // console.log('Sani', req.body);
    const data = req.body;
    database.insert(data);
    res.status(200).json({ success: true, data });
});

app.get('/field_api', (req, res) => {
    database.find({}, (err, data) => {
        if (err) {
            return res.status(422).json({ err });
        }
        res.json(data);
    })
} )