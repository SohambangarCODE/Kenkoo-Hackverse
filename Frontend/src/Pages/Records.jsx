import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Ref for the hidden file input
  const fileInputRef = useRef(null);
  // State to track which category is being uploaded
  const [selectedType, setSelectedType] = useState(null);

  // const API_URL = "https://kenkoo-backend.onrender.com/api/records"; 
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const API_URL = isLocal 
    ? `http://${window.location.hostname}:3000/api/records`
    : "https://kenkoo-morpheus.onrender.com/api/records";

  const UPLOAD_URL = isLocal
    ? `http://${window.location.hostname}:3000/api/assistant/upload`
    : "https://kenkoo-morpheus.onrender.com/api/assistant/upload";

  const features = [
    {
      icon: "ri-folder-video-fill",
      title: "DICOM Integration",
      description: "View and share your CT/MRI scans.",
    },
    {
      icon: "ri-file-chart-fill",
      title: "Smart Structuring",
      description: "Organize reports into timelines.",
    },
    {
      icon: "ri-cloud-fill",
      title: "Secure Cloud Storage",
      description: "Lifelong, encrypted access.",
    },
    {
      icon: "ri-share-fill",
      title: "Instant Sharing",
      description: "Send secure links to doctors.",
    },
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      // Fallback for demo if backend not ready/reachable
      // setRecords(dummyRecords); 
    } finally {
      setLoading(false);
    }
  };

  // 1. Handle clicking the menu item -> triggers file input
  const handleUploadClick = (type) => {
    setSelectedType(type);
    setShowUploadMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 2. Handle file selection -> uploads file
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadRecord(file, selectedType);
    
    // Reset input so same file can be selected again if needed
    e.target.value = ""; 
    setSelectedType(null);
  };

  const uploadRecord = async (file, type) => {
    try {
        setUploading(true);
        const token = localStorage.getItem("token");
        if (!token) {
             alert("You are not logged in. Please login to upload.");
             setUploading(false);
             return;
        }

        const formData = new FormData();
        formData.append("file", file);
        if (type) {
            formData.append("type", type); // Send the manual type
        }

        // We use the assistant upload endpoint because it handles the file saving + AI logic
        // But the backend is now updated to respect req.body.type
        const res = await fetch(UPLOAD_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) throw new Error("Upload failed");
        
        // Refresh records to show the new one
        await fetchRecords();

    } catch (err) {
        console.error("Upload Error:", err);
        alert("Failed to upload record. Please try again.");
    } finally {
        setUploading(false);
    }
  };

  const handleViewFile = async (record) => {
    try {
      const token = localStorage.getItem("token");
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const baseUrl = isLocal 
        ? `http://${window.location.hostname}:3000/api/records`
        : "https://kenkoo-morpheus.onrender.com/api/records";
      
      const res = await fetch(`${baseUrl}/${record._id}/view`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        // Fallback for old files that don't have fileData in DB yet
        const fileLink = isLocal 
          ? `http://${window.location.hostname}:3000${record.fileUrl}`
          : `https://kenkoo-morpheus.onrender.com${record.fileUrl}`;
        window.open(fileLink, "_blank");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Optional: Cleanup URL after some time
      setTimeout(() => URL.revokeObjectURL(url), 60000);

    } catch (err) {
      console.error("View error:", err);
      Swal.fire('Error', 'Failed to open file', 'error');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent opening the file when clicking delete

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          setRecords(records.filter(record => record._id !== id));
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        } else {
          throw new Error("Failed to delete");
        }
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire(
          'Error!',
          'Failed to delete the record.',
          'error'
        );
      }
    }
  };


  // Filter & Search Logic
  const filteredRecords = records.filter(record => {
    const matchesFilter = filter === "All" || record.type === filter;
    const matchesSearch = (record.title && record.title.toLowerCase().includes(search.toLowerCase())) || 
                          (record.fileName && record.fileName.toLowerCase().includes(search.toLowerCase())) ||
                          (record.provider && record.provider.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Group by Year
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const year = new Date(record.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(record);
    return acc;
  }, {});

  // Sort years descending
  const sortedYears = Object.keys(groupedRecords).sort((a, b) => b - a);

  // Helper for date format: "Jan 15, 2026"
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "Lab Report": return "ri-flask-line";
      case "Prescription": return "ri-medicine-bottle-line";
      case "Scan": return "ri-body-scan-line";
      case "Bill": return "ri-bill-line";
      case "AI Report": return "ri-robot-line";
      default: return "ri-file-text-line";
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "Lab Report": return "text-blue-600 bg-blue-50";
      case "Prescription": return "text-red-600 bg-red-50";
      case "Scan": return "text-purple-600 bg-purple-50";
      case "Bill": return "text-green-600 bg-green-50";
      case "AI Report": return "text-indigo-600 bg-indigo-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };
  
  return (
    <div className="h-full bg-gray-50 overflow-y-auto w-full relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen flex flex-col">
        
        {/* Header */}
        <div className="mb-6 bg-blue-900 text-white p-5 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg">
           <div className="relative z-10">
              <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 text-balance leading-tight">My Records</h1>
              <p className="text-blue-100 text-sm sm:text-base opacity-90">All your medical records, organized for life.</p>
           </div>
           {/* Decorative circles */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl -ml-5 -mb-5"></div>
        </div>


        <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm pb-4 pt-2">
            
            {/* Search Bar */}
            <div className="relative mb-4 group">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"></i>
                <input 
                    type="text"
                    placeholder="Search reports, labs, scans..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 shadow-sm transition-all"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                {["All", "Lab Report", "Prescription", "Scan", "Bill", "AI Report"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`shrink-0 px-4 py-2 sm:px-6 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                            filter === tab 
                            ? "bg-blue-900 text-white shadow-md shadow-blue-900/10" 
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Records Lists */}
        <div className="flex-1 space-y-6">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-400 text-sm font-medium">Loading records...</p>
                </div>
            ) : sortedYears.length > 0 ? (
                sortedYears.map((year) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={year}
                    >
                        <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            {year}
                            <span className="h-px flex-1 bg-gray-200"></span>
                        </h3>
                        <div className="space-y-3">
                            {groupedRecords[year].map((record) => (
                                <div 
                                    key={record._id} 
                                    onClick={() => handleViewFile(record)}
                                    className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 sm:gap-4 group cursor-pointer"
                                >
                                    {/* Icon */}
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 ${getColor(record.type)}`}>
                                        <i className={getIcon(record.type)}></i>
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{record.fileName || record.title}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <span className="truncate max-w-[120px]">{record.provider}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>{formatDate(record.date)}</span>
                                        </p>
                                    </div>

                                    {/* Status / Badge */}
                                    {record.type === "Scan" && (
                                         <span className="hidden sm:inline-block px-2.5 py-1 bg-orange-50 text-orange-600 text-[10px] font-semibold rounded-md uppercase tracking-wide">
                                            Within range
                                         </span>
                                    )}

                                    {/* Type Badge (Mobile/Desktop) */}
                                    <div className="shrink-0 flex flex-col items-end gap-1">
                                         <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase">
                                            {record.fileType || "PDF"}
                                         </span>
                                         <button 
                                            onClick={(e) => handleDelete(record._id, e)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Record"
                                         >
                                            <i className="ri-delete-bin-line"></i>
                                         </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="text-center py-8">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <i className="ri-folder-open-line text-2xl text-gray-300"></i>
                    </div>
                    <h3 className="text-gray-800 font-semibold">No records found</h3>
                    <p className="text-gray-500 text-sm mt-1">Upload your first medical record to get started.</p>
                </div>
            )}
        </div>

        {/* Capabilities Grid */}
        <div className="mt-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Records Capabilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white p-4 sm:p-5 border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl shrink-0 shadow-sm">
                    <i className={feature.icon}></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-base leading-snug mb-1">{feature.title}</span>
                    <span className="text-gray-500 text-sm leading-snug tracking-tight">{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>
        </div>

      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: "none" }} 
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" // Add relevant extensions
      />

      {/* Uploading Overlay */}
        <AnimatePresence>
        {uploading && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center"
            >
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                <h3 className="text-gray-800 font-semibold">Uploading...</h3>
                <p className="text-xs text-gray-500">Analyzing document...</p>
            </div>
            </motion.div>
        )}
        </AnimatePresence>


      {/* Floating Upload Button */}
      <div className="fixed bottom-6 right-4 sm:bottom-10 sm:right-10 z-30">
        <AnimatePresence>
            {showUploadMenu && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full right-0 mb-3 flex flex-col gap-2 min-w-[180px]"
                >
                     {/* Menu Items */}
                     {[
                        { label: "Upload Lab Report", icon: "ri-flask-line", color: "bg-blue-500", type: "Lab Report" },
                        { label: "Upload Prescription", icon: "ri-medicine-bottle-line", color: "bg-teal-500", type: "Prescription" },
                        { label: "Upload DICOM Scan", icon: "ri-body-scan-line", color: "bg-indigo-500", type: "Scan" },
                        { label: "Upload Bill", icon: "ri-bill-line", color: "bg-orange-500", type: "Bill" }
                     ].map((item, idx) => (
                         <button 
                            key={idx}
                            onClick={() => handleUploadClick(item.type)}
                            className="bg-white text-gray-700 px-4 py-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap"
                         >
                            <div className={`w-8 h-8 rounded-lg ${item.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                                <i className={item.icon}></i>
                            </div>
                            {item.label}
                         </button>
                     ))}
                     
                </motion.div>
            )}
        </AnimatePresence>

        <button 
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            className={`shadow-xl transition-all duration-300 flex items-center justify-center ${showUploadMenu ? "bg-red-500 rotate-45" : "bg-[#0B1C4B] hover:bg-blue-900"} text-white w-14 h-14 rounded-full`}
        >
            <i className="ri-add-line text-2xl"></i>
        </button>
      </div>

    </div>
  );
};

export default Records;