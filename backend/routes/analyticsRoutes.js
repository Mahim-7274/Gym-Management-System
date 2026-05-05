const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const Member = require('../models/Member');

// GET /api/analytics/revenue
// Get revenue grouped by day for the last 30 days
router.get('/revenue', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueData = await Receipt.aggregate([
            {
                $match: {
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalRevenue: { $sum: "$amountPaid" }
                }
            },
            {
                $sort: { _id: 1 } // Sort by date ascending
            }
        ]);

        // Format the output to be easily usable by recharts
        const formattedData = revenueData.map(item => ({
            date: item._id,
            revenue: item.totalRevenue
        }));

        res.json(formattedData);
    } catch (err) {
        console.error("Error fetching revenue analytics:", err);
        res.status(500).json({ error: 'Failed to fetch revenue data' });
    }
});

// GET /api/analytics/new-members
// Get new members count grouped by day for the last 30 days
router.get('/new-members', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const membersData = await Member.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    newMembers: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 } // Sort by date ascending
            }
        ]);

        const formattedData = membersData.map(item => ({
            date: item._id,
            newMembers: item.newMembers
        }));

        res.json(formattedData);
    } catch (err) {
        console.error("Error fetching new members analytics:", err);
        res.status(500).json({ error: 'Failed to fetch new members data' });
    }
});

module.exports = router;
