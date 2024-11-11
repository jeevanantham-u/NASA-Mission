const axios = require('axios');

const launchesDb = require('./launches.mongo');
const planets = require('./planets.mongo');
const {
  getPagination,
} = require('../services/query');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  console.log('Downloading launch data...');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1
          }
        }, {
          path: "payloads",
          select: {
            customers: 1
          }
        }
      ]
    }
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }


  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customer'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customer,
    }

    console.log(`${launch.flightNumber} ${launch.mission} ${launch.customers}`);
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });
  if (firstLaunch) {
    console.log('Launch data already loaded!');
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDb.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
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

async function saveLaunch(launch) {
  await launchesDb.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true,
  });
}

async function getAllLaunches(query) {
  const {skip, limit} = getPagination(query); 
  return await launchesDb
  .find({}, {
    _id: 0, __v: 0,
  })
  .sort({ flightNumber: 1 })
  .skip(skip)
  .limit(limit);
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newFlightNumber = await getLatestFlightNumber() + 1;

  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customer: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
  });

  await saveLaunch(newLaunch);
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
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunch,
};