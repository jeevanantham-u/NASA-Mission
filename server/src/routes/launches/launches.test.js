const request = require('supertest');
const app = require('../../app');

describe('Test GET /launches', () => {
  test('should respond 200', async () => {
    const response = await request(app)
      .get('/launches')
      .expect('Content-Type', /json/)
      .expect(200);
    // expect(response).toBe(200);
  });
});

describe("Test POST /launches", () => {
  const compliteLaunchData = {
    mission: 'nasa 4567',
    rocket: 'NCC 3567',
    target: 'kepler-186 f',
    launchDate: 'January 4, 2030'
  };
  const launchDataWithoutDate = {
    mission: 'nasa 4567',
    rocket: 'NCC 3567',
    target: 'kepler-186 f',
  };

  test('should respond 201 created', async () => {
    const response = await request(app)
      .post('/launches')
      .send(compliteLaunchData)
      .expect('Content-Type', /json/)
      .expect(201);

    const requestDate = new Date(compliteLaunchData.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();
    expect(responseDate).toBe(requestDate);

    expect(response.body).toMatchObject(launchDataWithoutDate);
  });

});