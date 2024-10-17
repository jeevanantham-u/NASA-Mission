const axios = require('axios');

const launchesDb = require('./launches.mongo');
const planets = require('./planets.mongo');

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Expolration X',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customer: ['ZTM', 'NASA'],
  upcoming: true,
  success: true,
};

saveLaunch(launch);

launches.set(launches.flightNumber, launch);

async function loadLaunchData() {
  console.log('Downloading launch data...');
  const response = await axios.post(SPACEX_API_URL, {
    "query": {},
    "options": {
      pagination: false,
      "populate": [
        {
          "path": "rocket",
          "select": {
            "name": 1
          }
        }
      ]
    }
  });

  // console.log(response);

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    }

    console.log(`${launch.flightNumber} ${launch.mission}`);
  }

  
}

async function existsLaunchWithId(launchId) {
  return await launchesDb.findOne({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDb.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  console.log(latestLaunch.flightNumber);

  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  return await launchesDb.find({}, {
    _id: 0, __v: 0,
  });
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = await getLatestFlightNumber() + 1;

  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customer: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
  });

  await saveLaunch(newLaunch);
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  await launchesDb.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true,
  });
}

async function abortLaunch(launchId) {
  const aborted = await launchesDb.updateOne({
    flightNumber: launchId,
  }, {
    success: false,
    upcoming: false,
  });

  return aborted;
}


module.exports = {
  getAllLaunches,
  loadLaunchData,
  existsLaunchWithId,
  scheduleNewLaunch,
  abortLaunch,
};