const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/auth');
const Plan = require('../models/Plan');

/**
 * Generate a valid JWT token for testing protected routes.
 * @param {'admin'|'staff'} role - The role to embed in the token.
 * @returns {string} A Bearer-ready JWT token string.
 */
const generateAuthToken = (role = 'admin') => {
    const payload = {
        id: `test-${role}-id`,
        username: role,
        role: role
    };
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '1h' });
};

/**
 * Seed a Plan document into the test database.
 * @param {Object} overrides - Fields to override the defaults.
 * @returns {Promise<Object>} The created Plan document.
 */
const seedPlan = async (overrides = {}) => {
    const defaults = {
        name: 'Test Plan',
        durationInDays: 30,
        price: 99
    };
    const plan = new Plan({ ...defaults, ...overrides });
    return await plan.save();
};

module.exports = {
    generateAuthToken,
    seedPlan
};
