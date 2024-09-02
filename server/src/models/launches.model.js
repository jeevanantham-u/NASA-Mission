const launches = new Map();
let latestFlightNumber = 100;

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

launches.set(launches.flightNumber, launch);

function getAllLaunches() {
  return Array.from(launches.values());
}

function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}

function addNewLaunches(launch) {
  latestFlightNumber++;
  launches.set(latestFlightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      customer: ['ZTM', 'NASA'],
      upcoming: true,
      success: true,
    })
  );
}

function abortLaunch(launchId){
  const aborted = launches.get(launchId);
  aborted.success = false;
  aborted.upcoming = false;
  return aborted;
}

module.exports = {
  getAllLaunches,
  addNewLaunches,
  existsLaunchWithId,
  abortLaunch,
};