const http = require('http');
const mongoose = require('mongoose');

const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;
const MONGO_URL = "mongodb+srv://jeeva:2jRXMp5G0OXTUm3c@nasacluster.kgjz8.mongodb.net/nasa?retryWrites=true&w=majority&appName=NASACluster";

const server = http.createServer(app);

mongoose.connection.on('open', () => console.log('MongoDB Atlas connected'));
mongoose.connection.on('error', (err) => console.error(err));

async function startServer() {
  await mongoose.connect(MONGO_URL);
  await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`server is running on ${PORT}....`);
  });
}

startServer();
