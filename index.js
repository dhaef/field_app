const express = require('express');
const dotenv = require('dotenv');
const mongooseConnect = require('./db');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const app = express();

dotenv.config({ path: './config/config.env' });

mongooseConnect();

// const Field = require('./models/Field');
const fields = require('./routes/fields');

const port = process.env.PORT || 3000

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());
app.use(xss());

app.use('/field_api', fields);

app.listen(port, () => console.log(`listening at ${port}`));