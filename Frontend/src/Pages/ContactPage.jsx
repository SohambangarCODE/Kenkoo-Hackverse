import React, { useState } from "react";
import Swal from 'sweetalert2';
import FooterForAssistance from "../Components/FooterForAssistance";
import { motion } from "framer-motion";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
        const formDataObj = new FormData(event.target);
        const object = Object.fromEntries(formDataObj);
        
        // Remove access_key if it exists
        delete object.access_key;

        const res = await fetch("https://kenkoo-morpheus.onrender.com/api/contact/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(object)
        }).then((res) => res.json());

        if (res.success) {
          Swal.fire({
            title: "Message Sent!",
            text: "We've received your message and will get back to you shortly.",
            icon: "success",
            confirmButtonColor: "#3C53E8"
          });
          setFormData({ name: "", email: "", subject: "", message: "" });
        } else {
            throw new Error(res.message || "Submission failed");
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error.message || "Something went wrong. Please try again later.",
            icon: "error",
            confirmButtonColor: "#d33"
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="h-full bg-gray-50 text-gray-800 font-sans flex flex-col overflow-y-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#022c4a] to-[#2a41c2] text-white py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden shrink-0">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-white opacity-5 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#38b6ff] opacity-10 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <motion.div 
            className="container mx-auto px-4 sm:px-6 text-center relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight drop-shadow-lg">
                Contact Us
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed px-2">
                Have questions or need assistance? We're here to help you on your journey to better health.
            </p>
        </motion.div>
      </div>

      <motion.div 
        className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 -mt-12 sm:-mt-16 md:-mt-20 flex-grow relative z-20 pb-12 sm:pb-16 md:pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Contact Info Section */}
            <motion.div 
                className="md:w-5/12 bg-[#05395e] text-white p-6 sm:p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden"
                variants={itemVariants}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 sm:w-64 sm:h-64 bg-[#38b6ff] rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 sm:w-64 sm:h-64 bg-[#3C53E8] rounded-full opacity-20 blur-3xl"></div>

                <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Get in Touch</h2>
                    <p className="text-slate-300 mb-8 sm:mb-10 leading-relaxed text-base sm:text-lg">
                        Fill up the form and our team will get back to you within 24 hours. We'd love to hear from you!
                    </p>

                    <div className="space-y-6 sm:space-y-8">
                        <motion.div className="flex items-start group" whileHover={{ x: 5 }}>
                            <div className="bg-[#38b6ff]/20 p-3 sm:p-4 rounded-xl mr-4 sm:mr-5 shrink-0 transition-colors group-hover:bg-[#38b6ff]/30">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#38b6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base sm:text-lg mb-1">Email</h3>
                                <a href="mailto:kenkoohealth@gmail.com" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base break-all">kenkoohealth@gmail.com</a>
                            </div>
                        </motion.div>

                         <motion.div className="flex items-start group" whileHover={{ x: 5 }}>
                            <div className="bg-[#38b6ff]/20 p-3 sm:p-4 rounded-xl mr-4 sm:mr-5 shrink-0 transition-colors group-hover:bg-[#38b6ff]/30">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#38b6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base sm:text-lg mb-1">Phone</h3>
                                <a href="https://wa.me/919356382295" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">+91 9356382295</a>
                            </div>
                        </motion.div>

                        <motion.div className="flex items-start group" whileHover={{ x: 5 }}>
                            <div className="bg-[#38b6ff]/20 p-3 sm:p-4 rounded-xl mr-4 sm:mr-5 shrink-0 transition-colors group-hover:bg-[#38b6ff]/30">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#38b6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base sm:text-lg mb-1">Location</h3>
                                <p className="text-slate-300 text-sm sm:text-base">Pune, Maharashtra, India</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Form Section */}
            <motion.div 
                className="md:w-7/12 p-6 sm:p-8 lg:p-12 bg-white"
                variants={itemVariants}
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Send us a Message</h2>
                <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#3C53E8] transition-colors">Your Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3C53E8] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-base"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#3C53E8] transition-colors">Your Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3C53E8] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-base"
                                placeholder="Enter your email id"
                            />
                        </div>
                    </div>
                    
                    <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#3C53E8] transition-colors">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3C53E8] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-base"
                            placeholder="Enter your subject"
                        />
                    </div>

                    <div className="group">
                         <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#3C53E8] transition-colors">Message</label>
                         <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3C53E8] focus:border-transparent outline-none transition-all resize-none bg-gray-50 focus:bg-white text-base"
                            placeholder="Write your message here..."
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-white shadow-lg text-base sm:text-lg ${
                            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#3C53E8] to-[#38b6ff] hover:shadow-xl hover:opacity-95"
                        }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending Message...
                            </span>
                        ) : (
                            "Send Message"
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
      </motion.div>
    
      {/* <FooterForAssistance /> */}
      
    </div>
  );
}

export default ContactPage;
