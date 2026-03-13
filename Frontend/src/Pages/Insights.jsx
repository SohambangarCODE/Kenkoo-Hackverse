import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useAuth } from "../context/AuthContext";
import Swal from 'sweetalert2';

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_INSIGHTS_URL = isLocal
  ? `http://${window.location.hostname}:3000/api/health/insights`
  : "https://kenkoo-morpheus.onrender.com/api/health/insights";

const Insights = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
             setLoading(false);
             return;
        }

        const res = await fetch(API_INSIGHTS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result = await res.json();
          setData(result);
          // Set specific trend default if available
          if (result.trends && Object.keys(result.trends).length > 0) {
              const keys = Object.keys(result.trends);
              const defaultKey = keys.find(k => k.toLowerCase().includes("pressure") || k.toLowerCase().includes("biomarker")) || keys[0];
              setSelectedTrend(defaultKey);
          }
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const handleViewAllRecommendations = () => {
    if (!data?.recommendations || data.recommendations.length === 0) {
        Swal.fire({
            title: 'No Recommendations',
            text: 'Upload more medical reports to get personalized advice.',
            icon: 'info',
            confirmButtonColor: '#1447E6'
        });
        return;
    }

    const recsHtml = `
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        ${data.recommendations.map(req => `
          <div class="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
            <span class="text-blue-500 mt-1">📌</span>
            <span class="text-gray-700 text-sm">${req}</span>
          </div>
        `).join('')}
      </div>
    `;

    Swal.fire({
        title: 'All Recommendations',
        html: recsHtml,
        confirmButtonText: 'Close',
        confirmButtonColor: '#1447E6',
        width: '600px'
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const trends = data?.trends || {};
  const reports = data?.reports || [];
  const hasTrends = Object.keys(trends).length > 0;
  
  const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50 py-4 px-3 sm:py-6 sm:px-4 md:py-8 md:px-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8 bg-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
           <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Insights</h1>
              <p className="text-blue-100 max-w-xl">Personalized health data to guide your care journey.</p>
           </div>
        </div>

        {/* 1. Blood Test Summary Card (Latest Snapshot) */}
        {summary.metrics && summary.metrics.length > 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{summary.title || "Latest Report"}</h2>
                            <p className="text-xs text-gray-400">{summary.provider || "Unknown Lab"}</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">
                        {summary.date ? new Date(summary.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Date Unknown"} &gt;
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {summary.metrics.slice(0, 6).map((metric, idx) => (
                        <div key={idx} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100/50 hover:bg-white hover:shadow-md transition-all duration-300">
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-sm font-medium text-gray-600 truncate mr-2" title={metric.name}>{metric.name}</span>
                                 <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                                     String(metric.status).toLowerCase().includes("high") ? "bg-red-100 text-red-600" :
                                     String(metric.status).toLowerCase().includes("low") ? "bg-blue-100 text-blue-600" :
                                     "bg-green-100 text-green-600"
                                 }`}>
                                     {metric.status || " Normal"}
                                 </span>
                             </div>
                             <div className="flex items-baseline gap-1">
                                 <span className="text-2xl font-bold text-gray-800">{metric.value}</span>
                                 <span className="text-xs text-gray-400">{metric.unit}</span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300 mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 text-2xl">
                    <i className="ri-file-text-line"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Reports Analyzed Yet</h3>
                <p className="text-gray-500 mb-4 max-w-sm mx-auto">Upload a medical report in the Assistant to see auto-generated insights here.</p>
            </div>
        )}

        {/* 2. Vital Trends (Using Recharts) */}
        {hasTrends && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Vital Trends</h2>
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap scroll-smooth">
                        {Object.keys(trends).map(metricName => (
                            <button
                                key={metricName}
                                onClick={() => setSelectedTrend(metricName)}
                                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    selectedTrend === metricName 
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" 
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                }`}
                            >
                                {metricName}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedTrend && trends[selectedTrend] && (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends[selectedTrend].slice(-10)}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1447E6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#1447E6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={formatDate}
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#9CA3AF'}} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#9CA3AF'}} 
                                />
                                <Tooltip 
                                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#1447E6" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        )}

        {/* 3. Recommendations & Insights Grid */}
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recommendations & Insights</h2>
            <button 
                onClick={handleViewAllRecommendations}
                className="text-sm text-blue-600 font-semibold hover:underline"
            >
                View All &gt;
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl shrink-0">
                    <i className="ri-notification-3-line"></i>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 mb-1">Proactive Alerts</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Get notified of abnormal results immediately.</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-2xl shrink-0">
                     <i className="ri-bar-chart-grouped-line"></i>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 mb-1">Trends & Analysis</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Understand health patterns over time.</p>
                </div>
            </div>

             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl shrink-0">
                    <i className="ri-stethoscope-line"></i>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 mb-1">Doctor Advice</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Receive personalized recommendations.</p>
                </div>
            </div>

             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl shrink-0">
                    <i className="ri-medicine-bottle-line"></i>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 mb-1">Medication Insights</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Track prescriptions and adherence.</p>
                </div>
            </div>
        </div>

        {/* 4. Report-wise Analysis Section */}
        {reports.length > 0 && (
             <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Report History</h2>
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-900">{report.title}</h3>
                                <span className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{report.summary}</p>
                            {report.recommendations && report.recommendations.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {report.recommendations.slice(0, 2).map((rec, i) => (
                                        <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">{rec}</span>
                                    ))}
                                    {report.recommendations.length > 2 && (
                                        <span className="text-xs text-gray-400 py-1">+{report.recommendations.length - 2} more</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             </div>
        )}

      </div>
    </div>
  )
}

export default Insights