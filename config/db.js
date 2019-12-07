const mongoose = require('mongoose');

const mongooseConnect = async () => {
    const connect = await mongoose.connect(process.env.MONGOOSE_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    console.log({ connection: connect.connection.host }, { user: connect.connection.user });
}

module.exports = mongooseConnect;