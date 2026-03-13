import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Assistant from "../Pages/Assistant";

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button at Bottom Left */}
      <div className="fixed bottom-6 left-4 sm:left-6 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:bg-blue-700 transition-colors"
          title="Open Assistant"
        >
          <i className="ri-robot-2-fill text-xl sm:text-2xl"></i>
        </motion.button>
      </div>

      {/* Full Page Overlay for Assistant */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Header / Close button area */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm z-50 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <i className="ri-robot-2-line text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Kenkoo AI Assistant</h3>
                  <p className="text-xs text-gray-500">Your personal health companion</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                title="Close Assistant"
              >
                <i className="ri-close-line text-xl font-bold"></i>
              </button>
            </div>

            {/* Assistant Content */}
            <div className="flex-1 overflow-hidden relative">
              <Assistant />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAssistant;
