import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Clinic Data — 8 realistic Indian clinics
   ───────────────────────────────────────────── */
const clinicsData = [
  {
    id: 1,
    name: "Sahyadri Super Speciality Hospital",
    category: "Hospital",
    address: "Plot No. 30-C, Erandvane, Karve Rd, Deccan Gymkhana, Pune 411004",
    phone: "+91 20 6721 3000",
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Oncology", "Nephrology"],
    rating: 4.7,
    reviews: 4250,
    hours: "Open 24 Hours",
    lat: 18.5074,
    lng: 73.8367,
    gradient: "from-blue-600 to-blue-800",
    icon: "ri-hospital-fill",
  },
  {
    id: 2,
    name: "Ruby Hall Clinic",
    category: "Hospital",
    address: "40, Sasoon Road, Near Pune Railway Station, Pune 411001",
    phone: "+91 20 6645 5100",
    specialties: ["Cardiac Surgery", "Neurosurgery", "Transplant", "Emergency", "Gastroenterology"],
    rating: 4.6,
    reviews: 5120,
    hours: "Open 24 Hours",
    lat: 18.5308,
    lng: 73.8774,
    gradient: "from-rose-500 to-rose-700",
    icon: "ri-hospital-fill",
  },
  {
    id: 3,
    name: "Jehangir Hospital",
    category: "Hospital",
    address: "32, Sasoon Road, Sangamvadi, Pune 411001",
    phone: "+91 20 6681 1800",
    specialties: ["General Medicine", "Orthopedics", "Urology", "Pediatrics", "ENT"],
    rating: 4.5,
    reviews: 3870,
    hours: "Open 24 Hours",
    lat: 18.5340,
    lng: 73.8780,
    gradient: "from-teal-500 to-teal-700",
    icon: "ri-hospital-fill",
  },
  {
    id: 4,
    name: "KEM Hospital",
    category: "Hospital",
    address: "Rasta Peth, Sardar Moodliar Rd, Pune 411011",
    phone: "+91 20 2612 6200",
    specialties: ["General Surgery", "Dermatology", "Ophthalmology", "Gynecology", "Internal Medicine"],
    rating: 4.4,
    reviews: 2980,
    hours: "Open 24 Hours",
    lat: 18.5120,
    lng: 73.8710,
    gradient: "from-indigo-500 to-indigo-700",
    icon: "ri-hospital-fill",
  },
  {
    id: 5,
    name: "Healing Hands Clinic",
    category: "Clinic",
    address: "Ground Floor, Millenium Star Extension, Dhole Patil Road, Pune 411001",
    phone: "+91 88882 88884",
    specialties: ["Proctology", "Piles Treatment", "Fistula", "Hernia", "General Surgery"],
    rating: 4.5,
    reviews: 1680,
    hours: "Mon–Sat: 9 AM – 8 PM",
    lat: 18.5280,
    lng: 73.8850,
    gradient: "from-emerald-500 to-emerald-700",
    icon: "ri-stethoscope-fill",
  },
  {
    id: 6,
    name: "Aakash Eye Clinic & Laser Centre",
    category: "Clinic",
    address: "Kolte Patil Cityspace, 1st Floor, Near Phoenix Mall, Viman Nagar, Pune 411014",
    phone: "+91 98225 56120",
    specialties: ["Ophthalmology", "LASIK Surgery", "Cataract", "Retina Treatment"],
    rating: 4.4,
    reviews: 920,
    hours: "Mon–Sat: 10 AM – 7 PM",
    lat: 18.5679,
    lng: 73.9143,
    gradient: "from-purple-500 to-purple-700",
    icon: "ri-stethoscope-fill",
  },
  {
    id: 7,
    name: "Greenline Pharmacy Supermarket",
    category: "Pharmacy",
    address: "Shop No.5, Banali Apt, Karve Road, Erandwane, Near Nal Stop, Pune 411004",
    phone: "+91 97638 88222",
    specialties: ["Prescription Medicines", "OTC", "Health Supplements", "Medical Devices"],
    rating: 4.3,
    reviews: 1540,
    hours: "Open 24 Hours",
    lat: 18.5060,
    lng: 73.8310,
    gradient: "from-orange-500 to-orange-700",
    icon: "ri-medicine-bottle-fill",
  },
  {
    id: 8,
    name: "Apollo Pharmacy",
    category: "Pharmacy",
    address: "MG Road, Camp, Pune 411001",
    phone: "+91 20 2612 3456",
    specialties: ["Prescription Medicines", "Personal Care", "Health Devices", "Wellness"],
    rating: 4.2,
    reviews: 980,
    hours: "Daily: 8 AM – 10 PM",
    lat: 18.5196,
    lng: 73.8553,
    gradient: "from-cyan-500 to-cyan-700",
    icon: "ri-medicine-bottle-fill",
  },
];

const CATEGORIES = ["All", "Hospital", "Clinic", "Pharmacy"];

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
const toRad = (deg) => (deg * Math.PI) / 180;
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getCategoryIcon = (cat) => {
  switch (cat) {
    case "Hospital": return "ri-hospital-line";
    case "Clinic": return "ri-stethoscope-line";
    case "Pharmacy": return "ri-medicine-bottle-line";
    default: return "ri-map-pin-line";
  }
};

const getCategoryColor = (cat) => {
  switch (cat) {
    case "Hospital": return "bg-blue-100 text-blue-700";
    case "Clinic": return "bg-emerald-100 text-emerald-700";
    case "Pharmacy": return "bg-orange-100 text-orange-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

/* ─────────────────────────────────────────────
   Clinic Card Component
   ───────────────────────────────────────────── */
const ClinicCard = ({ clinic, userLocation, index }) => {
  const [showMap, setShowMap] = useState(false);

  const distance = userLocation
    ? haversine(userLocation.lat, userLocation.lng, clinic.lat, clinic.lng).toFixed(1)
    : null;

  const mapQuery = encodeURIComponent(clinic.name + ", " + clinic.address);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = userLocation
    ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${mapQuery}`
    : `https://www.google.com/maps/dir//${mapQuery}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {/* ── Map Embed ── */}
      <div className="relative">
        {showMap ? (
          <div className="w-full h-48 bg-gray-100">
            <iframe
              title={`Map of ${clinic.name}`}
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div
            onClick={() => setShowMap(true)}
            className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer hover:from-blue-50 hover:to-blue-100 transition-colors"
          >
            <div className="text-center">
              <i className="ri-map-2-line text-3xl text-gray-400 group-hover:text-blue-500 transition-colors" />
              <p className="text-xs text-gray-500 mt-1 font-medium">Tap to load map</p>
            </div>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide backdrop-blur-md bg-white/90 shadow-sm ${getCategoryColor(clinic.category)}`}>
            <i className={getCategoryIcon(clinic.category)} />
            {clinic.category}
          </span>
        </div>

        {/* Distance badge */}
        {distance && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-md shadow-sm text-gray-700">
              <i className="ri-route-line text-blue-500" />
              {distance} km
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 sm:p-5">
        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${clinic.gradient} flex items-center justify-center shrink-0 shadow-md`}>
              <i className={`${clinic.icon} text-white text-lg`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">{clinic.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <i className="ri-star-fill text-yellow-400 text-sm" />
                <span className="text-sm font-bold text-gray-800">{clinic.rating}</span>
                <span className="text-xs text-gray-400">({clinic.reviews.toLocaleString()})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-xs text-gray-500 mb-2">
          <i className="ri-map-pin-2-fill text-red-400 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{clinic.address}</span>
        </div>

        {/* Hours */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <i className="ri-time-line text-green-500 shrink-0" />
          <span className="font-medium">{clinic.hours}</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {clinic.specialties.slice(0, 4).map((spec, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-md">
              {spec}
            </span>
          ))}
          {clinic.specialties.length > 4 && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-md">
              +{clinic.specialties.length - 4} more
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col xs:flex-row sm:flex-row gap-2 mt-4">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-blue-600/20"
          >
            <i className="ri-direction-line" />
            Get Directions
          </a>
          <a
            href={`tel:${clinic.phone.replace(/\s/g, "")}`}
            className="flex-1 xs:flex-none flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold rounded-xl transition-colors border border-emerald-200"
          >
            <i className="ri-phone-fill" />
            Call
          </a>
        </div>
      </div>
    </motion.div>
  );
};


/* ─────────────────────────────────────────────
   Main CarePlan (ClinicConnect) Component
   ───────────────────────────────────────────── */
const CarePlan = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | granted | denied

  // ── Get user geolocation ──
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 8000 }
    );
  }, []);

  // ── Filter clinics by search + category ──
  const filteredClinics = useMemo(() => {
    const q = search.toLowerCase();
    return clinicsData
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.toLowerCase().includes(q));
        const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .map((c) => ({
        ...c,
        distance: userLocation ? haversine(userLocation.lat, userLocation.lng, c.lat, c.lng) : Infinity,
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [search, selectedCategory, userLocation]);

  const categoryCount = (cat) => {
    if (cat === "All") return clinicsData.length;
    return clinicsData.filter((c) => c.category === cat).length;
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen flex flex-col">

        {/* ── Header Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 bg-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-2xl opacity-15 -ml-5 -mb-5" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <img className="w-8 h-8 sm:w-10 sm:h-10" src="logo.png-removebg-preview.png" alt="" />
              <span className="font-bold text-base sm:text-lg tracking-wide">Kenkoo</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 text-balance">Doctor Connect</h1>
            <p className="text-blue-100 text-sm sm:text-base opacity-90 max-w-lg">
              Find nearby hospitals, clinics & pharmacies — get directions, call, and navigate in one tap.
            </p>

            {/* Location status */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              {locationStatus === "loading" && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Detecting your location…
                </span>
              )}
              {locationStatus === "granted" && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full">
                  <i className="ri-map-pin-user-fill text-green-400" />
                  Location detected — showing distances
                </span>
              )}
              {locationStatus === "denied" && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full">
                  <i className="ri-map-pin-line text-gray-300" />
                  Location unavailable
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Search Bar ── */}
        <div className="relative mb-4 group">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors text-lg" />
          <input
            type="text"
            placeholder="Search clinics, hospitals, specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 shadow-sm transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <i className="ri-close-line text-gray-500 text-sm" />
            </button>
          )}
        </div>

        {/* ── Category Filters ── */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-2 sm:px-6 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-900 text-white shadow-md shadow-blue-900/10"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <i className={getCategoryIcon(cat)} />
              {cat}
              <span className={`ml-0.5 text-[10px] font-bold ${selectedCategory === cat ? "text-blue-200" : "text-gray-400"}`}>
                {categoryCount(cat)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Results Count ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {filteredClinics.length} {filteredClinics.length === 1 ? "Result" : "Results"}
          </h2>
          {userLocation && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <i className="ri-sort-asc text-gray-400" />
              Sorted by distance
            </span>
          )}
        </div>

        {/* ── Clinic Cards Grid ── */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {filteredClinics.length > 0 ? (
              <motion.div
                key={selectedCategory + search}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
              >
                {filteredClinics.map((clinic, index) => (
                  <ClinicCard
                    key={clinic.id}
                    clinic={clinic}
                    userLocation={userLocation}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                  <i className="ri-map-pin-line text-2xl text-gray-300" />
                </div>
                <h3 className="text-gray-800 font-semibold">No clinics found</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Try a different search term or category.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Info Cards ── */}
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Why Doctor Connect?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: "ri-map-pin-2-fill", title: "Real-Time Navigation", desc: "Get turn-by-turn directions to any clinic instantly.", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: "ri-phone-fill", title: "One-Tap Calling", desc: "Call any clinic directly from the app — no copy-pasting.", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: "ri-hospital-fill", title: "Verified Clinics", desc: "All listed clinics are verified with accurate information.", color: "text-purple-600", bg: "bg-purple-50" },
              { icon: "ri-map-2-fill", title: "Embedded Maps", desc: "Preview clinic location on the map before you visit.", color: "text-orange-600", bg: "bg-orange-50" },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-4 sm:p-5 border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color} text-2xl shrink-0 shadow-sm`}>
                  <i className={feature.icon} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-base leading-snug mb-1">{feature.title}</span>
                  <span className="text-gray-500 text-sm leading-snug tracking-tight">{feature.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CarePlan;
