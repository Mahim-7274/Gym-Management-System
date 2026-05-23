const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");


let mongoServer;


beforeAll(async () => {
  // 1. Setup In-Memory Database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // 2. Prevent server.js from connecting to real DB
  process.env.MONGODB_URI = '';

  // 3. Initialize Default Users (admin/staff)
  const authRoutes = require("../routes/authRoutes");
  await authRoutes.initDefaultUsers();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Feature: Gym Plans Management (ID: 22299351)", () => {
  let authToken = "";
  let createdPlanId = "";


  //  Log in as admin to get a fresh auth token

  test("Login as admin to get auth token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "password123",
    });

    authToken = res.body.token;
    expect(authToken).toBeDefined();
    expect(res.status).toBe(200);
  });


  // CASE A — POSITIVE FLOW (Happy Path)


  // TEST 1: Create a new gym plan
  it("should create a new gym plan and return 201", async () => {
    const res = await request(app)
      .post("/api/gym-plans")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "6-Month Plan",
        duration: 6,
        price: 2999,
        description: "Best value mid-term gym membership plan",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toEqual("6-Month Plan");

    createdPlanId = res.body._id;
  });

  // TEST 2: Retrieve the gym plan that was just created
  it("should retrieve the created gym plan and return 200", async () => {
    const res = await request(app)
      .get(`/api/gym-plans/${createdPlanId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toEqual(createdPlanId);
    expect(res.body.name).toEqual("6-Month Plan");
  });

  // TEST 3: Retrieve all gym plans
  it("should return a list of all gym plans with status 200", async () => {
    const res = await request(app)
      .get("/api/gym-plans")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // TEST 4: Update an existing gym plan
  it("should update a gym plan price and return 200", async () => {
    const res = await request(app)
      .put(`/api/gym-plans/${createdPlanId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        price: 2499,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.price).toEqual(2499);
  });


  // CASE B — NEGATIVE FLOW (Error Handling)


  // TEST 5: Validation error — missing required field (name)
  it("should return 400 if plan name is missing", async () => {
    const res = await request(app)
      .post("/api/gym-plans")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        duration: 1,
        price: 999,
        description: "Short-term plan",
      });

    expect(res.statusCode).toEqual(400);
  });

  // TEST 6: Validation error — missing required field (price)
  it("should return 400 if price is missing", async () => {
    const res = await request(app)
      .post("/api/gym-plans")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Yearly Plan",
        duration: 12,
      });

    expect(res.statusCode).toEqual(400);
  });

  // TEST 7: Resource not found and  update non-existent plan
  it("should return 404 when updating a plan that does not exist", async () => {
    const fakePlanId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .put(`/api/gym-plans/${fakePlanId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ price: 1500 });

    expect(res.statusCode).toEqual(404);
  });

  // TEST 8: Resource not found -> delete non-existent plan
  it("should return 404 when deleting a plan that does not exist", async () => {
    const fakePlanId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/gym-plans/${fakePlanId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(404);
  });


  // CASE C — SECURITY & BOUNDARY


  // TEST 9: Unauthorized — no token provided
  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .get("/api/gym-plans");

    expect(res.statusCode).toEqual(401);
  });

  // TEST 10: Unauthorized — invalid/expired token
  it("should return 401 when an invalid token is provided", async () => {
    const res = await request(app)
      .post("/api/gym-plans")
      .set("Authorization", "Bearer this_is_a_fake_invalid_token")
      .send({
        name: "Fake Plan",
        duration: 3,
        price: 1500,
      });

    expect(res.statusCode).toEqual(401);
  });
});
