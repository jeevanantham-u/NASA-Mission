const launchesDb = require('./launches.mongo');
const planets = require('./planets.mongo');

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;

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

async function getAllLaunches() {
  return await launchesDb.find({}, {
    _id: 0, __v: 0,
  });
}

async function existsLaunchWithId(launchId) {
  return await launchesDb.findOne({
    flightNumber: launchId,
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

async function abortLaunch(launchId) {
  const aborted = await launchesDb.updateOne({
    flightNumber: launchId,
  }, {
    success: false,
    upcoming: false,
  });

  return aborted;
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  // console.log(planet);

  if (!planet) {
    throw new Error('No matching planet found');
  }

  await launchesDb.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true,
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


module.exports = {
  getAllLaunches,
  existsLaunchWithId,
  scheduleNewLaunch,
  abortLaunch,
};