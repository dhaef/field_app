const express = require('express');
const dotenv = require('dotenv');
const mongooseConnect = require('./db');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const bodyParser = require('body-parser');
const app = express();

dotenv.config({ path: './config/config.env' });

mongooseConnect();

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`listening at ${port}`));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());

const Field = require('./models/Field');

app.post('/field_api', async (req, res, next) => {
    try {
        // const data = { ...req.body };
        // mongoSanitize.sanitize(data);
        const field = await Field.create(req.body);
    
        res.status(200).json({ success: true, data: field });
    } catch (error) {
        console.log(error)
    }
});

app.get('/field_api', async (req, res, next) => {
    try {
        const field = await Field.find({});

        res.status(200).json({ success: true, data: field })
    } catch (error) {
        console.log(error)
    }
});

app.post('/test', (req, res) => {
    console.log(req.body)
})