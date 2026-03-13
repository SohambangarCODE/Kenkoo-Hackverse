const Record = require("../models/record.model");

const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all records with metrics
    const records = await Record.find({ user: userId, metrics: { $exists: true, $ne: [] } }).sort({ date: -1 });

    if (!records.length) {
        return res.json({
            summary: null,
            trends: []
        });
    }

    // 1. Get Latest Blood Test (or similar report)
    const latestReport = records[0];
    
    // Group metrics by name across all records for trends
    const metricHistory = {};

    records.forEach(record => {
        if (record.metrics && Array.isArray(record.metrics)) {
            record.metrics.forEach(metric => {
                if (!metricHistory[metric.name]) {
                    metricHistory[metric.name] = [];
                }
                metricHistory[metric.name].push({
                    date: record.date,
                    value: metric.value,
                    unit: metric.unit,
                    status: metric.status
                });
            });
        }
    });

    // Format trends for frontend (reverse to chronological order for charts)
    Object.keys(metricHistory).forEach(key => {
        metricHistory[key].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // 2. Get All Recommendations & Report History
    const allRecommendations = [];
    const reportHistory = records.map(record => {
        if (record.recommendations && Array.isArray(record.recommendations)) {
            allRecommendations.push(...record.recommendations);
        }
        return {
            id: record._id,
            title: record.title || "Medical Record",
            date: record.date,
            provider: record.provider,
            summary: record.summary || "No summary available.",
            recommendations: record.recommendations || []
        };
    });

    const response = {
        summary: {
            title: latestReport.title || "Latest Report",
            provider: latestReport.provider,
            date: latestReport.date,
            metrics: latestReport.metrics, 
            metricsCount: latestReport.metrics ? latestReport.metrics.length : 0
        },
        trends: metricHistory,
        reports: reportHistory,
        recommendations: [...new Set(allRecommendations)] // Unique recommendations
    };

    res.json(response);

  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).json({ message: "Server error fetching insights" });
  }
};

module.exports = { getInsights };
