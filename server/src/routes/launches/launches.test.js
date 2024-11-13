const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const {
  loadPlanetsData,
} = require('../../models/planets.model');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('should respond 200', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
      // expect(response).toBe(200);
    });
  });

  describe("Test POST /launches", () => {
    const compliteLaunchData = {
      mission: 'nasa 4567',
      rocket: 'NCC 3567',
      target: 'Kepler-62 f',
      launchDate: 'January 4, 2030'
    };

    const launchDataWithoutDate = {
      mission: 'nasa 4567',
      rocket: 'NCC 3567',
      target: 'Kepler-62 f',
    };

    const launchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'zoot',
    };

    test('It should respond 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(compliteLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(compliteLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
