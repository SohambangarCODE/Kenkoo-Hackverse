import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const getApiUrl = () => {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isLocal
    ? `http://${window.location.hostname}:3000/api`
    : "https://kenkoo-morpheus.onrender.com/api";
};

const Profile = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // Theme Colors - Updated to match ContactPage
  const PRIMARY_COLOR = "#022c4a";
  const SECONDARY_COLOR = "#2a41c2";

  useEffect(() => {
    if (!authLoading && !user) {
        navigate("/login");
    }
    if (user) {
        setFormData(user);
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("profileImage", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiUrl()}/user/upload-photo`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`
        },
        body: uploadData,
      });

      if (!res.ok) throw new Error("Failed to upload image");
      const updatedUser = await res.json();
      
      updateUser(updatedUser);
      setFormData(prev => ({ ...prev, profileImage: updatedUser.profileImage }));
    } catch (error) {
      console.error(error);
      alert("Failed to upload image.");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiUrl()}/user`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const updatedUser = await res.json();
      
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.25,
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a41c2]"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white py-4 px-3 sm:py-6 sm:px-4 md:py-8 md:px-8 custom-scrollbar"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-4 sm:mb-6 md:mb-8"
          style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)` }}
          variants={itemVariants}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>
          <div className="relative px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-14 text-white flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6">
            
            {/* Avatar */}
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                <img 
                  src={user?.profileImage || "https://ui-avatars.com/api/?name=User&background=random"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?name=User&background=random";
                  }}
                />
              </div>
              {isEditing && (
                 <>
                   <label 
                     htmlFor="profile-image-upload"
                     className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                   >
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <i className="ri-camera-line"></i> Change
                      </span>
                   </label>
                   <input 
                      type="file" 
                      id="profile-image-upload" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                   />
                 </>
              )}
            </motion.div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{user?.name || "User Name"}</h1>
              <p className="text-blue-100 text-base sm:text-lg mt-1 flex items-center justify-center md:justify-start gap-2">
                <i className="ri-mail-line"></i> {user?.email || "email@example.com"}
              </p>
            </div>

            {/* Edit Button */}
            <div className="mb-2 md:mb-2 w-full md:w-auto flex justify-center md:justify-start">
              {!isEditing ? (
                <motion.button 
                  onClick={() => setIsEditing(true)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 sm:px-6 sm:py-2.5 bg-white text-[#2a41c2] font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex items-center gap-2 text-sm sm:text-base"
                >
                  <i className="ri-edit-line"></i> Edit Profile
                </motion.button>
              ) : (
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                  <motion.button 
                    onClick={handleCancel}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl backdrop-blur-sm transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    onClick={handleSave}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-white text-[#2a41c2] font-bold rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
                  >
                    Save Changes
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          
          {/* Left Column: Personal Stats / Quick Info */}
          <motion.div className="lg:col-span-1 space-y-4 sm:space-y-6" variants={itemVariants}>
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
              whileHover={{ y: -4 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="ri-heart-pulse-line text-[#1447E6]"></i> Health Stats
              </h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                   <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Age</div>
                   {isEditing ? (
                      <input 
                        type="number"
                        name="age"
                        value={formData.age || ""}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all"
                      />
                   ) : (
                      <div className="text-xl font-bold text-gray-800">{user?.age ? `${user.age} yrs` : "N/A"}</div>
                   )}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Height</div>
                    {isEditing ? (
                      <input 
                        type="text"
                        name="height"
                        value={formData.height || ""}
                        onChange={handleChange}
                        placeholder="e.g 180cm"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#1447E6] outline-none"
                      />
                    ) : (
                       <div className="text-lg font-bold text-gray-800">{user?.height || "-"}</div>
                    )}
                  </div>
                  <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Weight</div>
                    {isEditing ? (
                      <input 
                        type="text"
                        name="weight"
                        value={formData.weight || ""}
                        onChange={handleChange}
                        placeholder="e.g 75kg"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#1447E6] outline-none"
                      />
                    ) : (
                       <div className="text-lg font-bold text-gray-800">{user?.weight || "-"}</div>
                    )}
                  </div>
                </div>

                 <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                   <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Blood Type</div>
                   {isEditing ? (
                      <select 
                        name="bloodType"
                        value={formData.bloodType || ""}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#1447E6] outline-none"
                      >
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                   ) : (
                      <div className="text-xl font-bold text-gray-800">{user?.bloodType || "N/A"}</div>
                   )}
                </div>
              </div>
            </motion.div>

            {/* About Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
              whileHover={{ y: -4 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                 <i className="ri-user-smile-line text-[#1447E6]"></i> Bio
              </h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all resize-none text-sm"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600 leading-relaxed text-sm">
                  {user?.bio || "No bio added yet."}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Right Column: Contact & Detailed Info */}
          <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
             <motion.div 
               className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 hover:shadow-xl transition-shadow"
               whileHover={{ y: -4 }}
             >
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                  <i className="ri-file-user-line text-[#1447E6]"></i> Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                   {/* Full Name */}
                   <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="name"
                          value={formData.name || ""}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all font-medium text-gray-800"
                        />
                      ) : (
                        <div className="text-base font-medium text-gray-900 border-b border-dashed border-gray-200 pb-1">{user?.name}</div>
                      )}
                   </div>

                   {/* Email */}
                   <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                      {isEditing ? (
                        <input 
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          placeholder="Enter email id"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all font-medium text-gray-800"
                        />
                      ) : (
                        <div className="text-base font-medium text-gray-900 border-b border-dashed border-gray-200 pb-1">{user?.email}</div>
                      )}
                   </div>

                   {/* Phone */}
                   <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
                      {isEditing ? (
                        <input 
                          type="tel"
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleChange}
                          placeholder="+91 1234567890"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all font-medium text-gray-800"
                        />
                      ) : (
                        <div className="text-base font-medium text-gray-900 border-b border-dashed border-gray-200 pb-1">{user?.phone || "Not provided"}</div>
                      )}
                   </div>

                   {/* Address */}
                   <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mailing Address</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="address"
                          value={formData.address || ""}
                          onChange={handleChange}
                          placeholder="Street, City, pin Code"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all font-medium text-gray-800"
                        />
                      ) : (
                        <div className="text-base font-medium text-gray-900 border-b border-dashed border-gray-200 pb-1">{user?.address || "Not provided"}</div>
                      )}
                   </div>

                   {/* Profile Image URL (Optional field) */}
                   {isEditing && (
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profile Image URL</label>
                        <input 
                          type="text"
                          name="profileImage"
                          value={formData.profileImage || ""}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all font-medium text-gray-800 text-sm"
                          placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-[10px] text-gray-400">Paste a direct link to an image.</p>
                      </div>
                   )}

                </div>
             </motion.div>

             {/* Account Verification Mockup */}
             <motion.div 
               className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 text-white relative overflow-hidden hover:shadow-blue-500/20 transition-shadow"
               whileHover={{ y: -4, scale: 1.01 }}
             >
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Premium Member</h3>
                    <p className="text-gray-300 text-sm">Valid until Dec 2026</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                     <i className="ri-vip-crown-fill text-yellow-400 text-2xl"></i>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                   <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded-md border border-green-500/30">
                      Active
                   </div>
                   <div className="text-xs text-gray-400 font-mono">ID: {user?._id?.substring(0, 8) || "UNKNOWN"}...</div>
                </div>
                
                {/* Decorative circles */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#2a41c2] rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute top-0 right-20 w-20 h-20 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
             </motion.div>

          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default Profile;