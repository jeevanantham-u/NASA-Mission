const mongoose = require('mongoose');

const MONGO_URL = "mongodb+srv://jeeva:2jRXMp5G0OXTUm3c@nasacluster.kgjz8.mongodb.net/nasa?retryWrites=true&w=majority&appName=NASACluster";

mongoose.connection.on('open', () =>
  console.log('MongoDB Atlas connected')
);

mongoose.connection.on('error', (err) =>
  console.error(err)
);

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function  mongoDisconnect() {
  await mongoose.disconnect();
  
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
}