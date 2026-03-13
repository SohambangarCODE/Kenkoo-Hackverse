import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../context/ChatContext"; // Import useChat

// const API_CHAT_URL = "/api/assistant/chat";
// const API_UPLOAD_URL = "/api/upload";

// const API_CHAT_URL = "/api/assistant/chat";
// const API_UPLOAD_URL = "/api/upload";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_CHAT_URL = isLocal
  ? `http://${window.location.hostname}:3000/api/assistant/chat`
  : "https://kenkoo-morpheus.onrender.com/api/assistant/chat";

const API_UPLOAD_URL = isLocal
  ? `http://${window.location.hostname}:3000/api/assistant/upload`
  : "https://kenkoo-morpheus.onrender.com/api/assistant/upload";


const Assistant = () => {
  const { messages, setMessages } = useChat(); // Use persistent context
  // const [messages, setMessages] = useState([]); // Removed local state
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch(API_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const reply = data?.reply || "No response received.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      // Dummy fallback for demonstration
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm currently in offline mode. I received: " + trimmed,
          },
        ]);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyzeFile = async () => {
    if (!file || isLoading) return;

    setIsLoading(true);

    const userPrompt = input.trim();

    // show file message in chat
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        type: "file",
        content: userPrompt || `Uploaded: ${file.name}`,
        fileName: file.name,
      },
    ]);

    setInput("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", userPrompt); // <-- send prompt too

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to upload files.");
        setMessages((prev) => [...prev, { role: "assistant", content: "You must be logged in to upload files." }]);
        setIsLoading(false);
        return;
      }

      const res = await fetch(API_UPLOAD_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.result },
      ]);

      clearFile();
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "File analysis failed." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (file) {
        analyzeFile();
      } else {
        sendMessage();
      }
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const messageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    // Main Container: Flex column layout that fills the viewport height minus header
    <motion.div 
      className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white relative"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      
      {/* Chat Scroll Area - This grows to fill available space */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-2 sm:pb-4">
          
          {/* Empty State */}
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div 
                className="flex flex-col items-center justify-center min-h-[40vh] py-8 text-center text-gray-500 px-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 flex items-center justify-center mb-4 sm:mb-6 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <motion.img 
                    src="/logo.png-removebg-preview.png" 
                    alt="Logo" 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight mb-2 sm:mb-3">
                  Kenkoo Assistant
                </h2>
                <p className="text-sm sm:text-base text-gray-500 max-w-md leading-relaxed px-2">
                  Your personal health companion. Ask about your health records, Expert Connect, or upload documents for instant analysis.
                </p>
                
                {/* Simulated capabilities tags */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
                  {["Analyze Reports", "Diet Plan", "Symptom Check", "Visual Analysis"].map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-gray-100/50 border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages List */}
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                layout
                variants={messageVariants}
                initial="initial"
                animate="animate"
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[75%] gap-2 sm:gap-3 md:gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 shadow-md transform transition-transform hover:scale-105 ${
                      msg.role === "user"
                        ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white"
                        : "bg-white border border-gray-100 text-blue-600"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <i className="ri-user-smile-line text-base sm:text-lg"></i>
                    ) : (
                      <i className="ri-robot-2-line text-base sm:text-lg"></i>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-[15px] leading-relaxed shadow-sm transform transition-all hover:shadow-md ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm"
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    {msg.type === "file" && (
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-white/20">
                        <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <i className="ri-file-text-line text-lg sm:text-xl"></i>
                        </div>
                        <div className="flex flex-col overflow-hidden min-w-0">
                          <span className="font-semibold text-xs sm:text-sm truncate w-full">
                            {msg.fileName}
                          </span>
                          <span className="text-[10px] sm:text-xs opacity-80">Document Attached</span>
                        </div>
                      </div>
                    )}
                    <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : ""}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-3 sm:my-4 border border-gray-200 rounded-lg bg-gray-50/50">
                              <table
                                className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm"
                                {...props}
                              />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-gray-100" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th
                              className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                              {...props}
                            />
                          ),
                          td: ({ node, ...props }) => (
                            <td
                              className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700 border-t border-gray-100"
                              {...props}
                            />
                          ),
                          code: ({node, inline, className, children, ...props}) => {
                              return !inline ? (
                                <div className="bg-gray-900 rounded-lg p-2 sm:p-3 my-2 overflow-x-auto text-gray-100 text-xs font-mono">
                                  {children}
                                </div>
                              ) : (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-red-500 font-mono text-xs" {...props}>
                                  {children}
                                </code>
                              )
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full justify-start pl-10 sm:pl-12 md:pl-[3.25rem]"
            >
              <div className="bg-white border border-gray-100 px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 mr-1">Thinking</span>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Static layout at bottom */}
      <div className="bg-white/80 backdrop-blur-md border-t border-gray-100 p-3 sm:p-4 md:px-6 relative z-10 shrink-0">
        <div className="max-w-4xl mx-auto">
          
          <div className="relative group bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 focus-within:bg-white shadow-sm hover:shadow-md">
            
            {/* File Preview inside input box */}
            <AnimatePresence>
              {file && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: "auto", opacity: 1, marginBottom: 6 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 sm:gap-3 bg-blue-50 text-blue-700 px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-blue-100 w-fit mx-1 mt-1">
                    <div className="p-1 sm:p-1.5 bg-white rounded-lg shadow-sm">
                      <i className="ri-attachment-line text-sm sm:text-base"></i>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-[250px] font-semibold text-xs sm:text-sm text-gray-800">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-blue-500 font-medium uppercase">Ready to upload</span>
                    </div>
                    <button
                      onClick={clearFile}
                      className="ml-1 sm:ml-2 text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                    >
                      <i className="ri-close-line text-base sm:text-lg"></i>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-1.5 sm:gap-2">
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
              />

              {/* Attachment Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 sm:p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-colors shrink-0"
                title="Attach file"
              >
                <i className="ri-add-circle-line text-xl sm:text-2xl"></i>
              </motion.button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  file
                    ? "Add a message about this file..."
                    : "Message Assistant..."
                }
                className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 sm:py-3.5 text-gray-700 placeholder-gray-400 max-h-[120px] sm:max-h-[150px] overflow-y-auto leading-relaxed focus:outline-none text-sm sm:text-[15px]"
                rows={1}
                style={{ minHeight: "44px" }}
              />

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={file ? analyzeFile : sendMessage}
                disabled={(!input.trim() && !file) || isLoading}
                className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl shrink-0 transition-all duration-300 flex items-center justify-center shadow-sm ${
                  (!input.trim() && !file) || isLoading
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-tr from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/30"
                }`}
              >
                {isLoading ? (
                  <i className="ri-loader-4-line animate-spin text-lg sm:text-xl"></i>
                ) : (
                  <i className="ri-arrow-up-line text-lg sm:text-xl font-bold"></i>
                )}
              </motion.button>
            </div>
          </div>
          
          <div className="text-center mt-2 sm:mt-3 flex justify-center items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium tracking-wide">
              Kenkoo AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Assistant;

// import React, { useState, useRef, useEffect } from "react";

// const API_CHAT_URL = "/api/assistant/chat";
// const API_UPLOAD_URL = "/api/assistant/upload";

// const Assistant = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [file, setFile] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const textareaRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isLoading]);

//   const sendMessage = async () => {
//     const trimmed = input.trim();
//     if (!trimmed || isLoading) return;

//     const userMessage = { role: "user", content: trimmed };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setIsLoading(true);

//     try {
//       const res = await fetch(API_CHAT_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: trimmed }),
//       });

//       if (!res.ok) throw new Error("Network error");

//       const data = await res.json();
//       const reply = data?.reply || "No response received.";

//       setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: "Sorry, something went wrong. Try again?" },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleFileSelect = (e) => {
//     const selectedFile = e.target.files?.[0];
//     if (!selectedFile) return;

//     setFile(selectedFile);

//     // Add file upload message to chat immediately (like user message)
//     const fileMessage = {
//       role: "user",
//       type: "file",
//       content: `📎 ${selectedFile.name}`,
//       fileName: selectedFile.name,
//       // You can add fileUrl: URL.createObjectURL(selectedFile) if you want preview
//     };

//     setMessages((prev) => [...prev, fileMessage]);
//   };

//   const clearFile = () => {
//     setFile(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const analyzeFile = async () => {
//     if (!file || isLoading) return;

//     setIsLoading(true);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch(API_UPLOAD_URL, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       const result = data?.result || "File processed successfully.";

//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: result },
//       ]);

//       clearFile();
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: "Failed to analyze file." },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       if (file) {
//         analyzeFile();
//       } else {
//         sendMessage();
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50/70">
//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
//         <div className="max-w-3xl mx-auto space-y-6 pb-6">
//           {messages.length === 0 && (
//             <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
//               <div className="w-16 h-16 rounded-2xl bg-white shadow border border-gray-200 flex items-center justify-center text-3xl mb-4">
//                 ✨
//               </div>
//               <h2 className="text-xl font-semibold text-gray-700">
//                 How can I assist you today?
//               </h2>
//               <p className="mt-2 text-sm text-gray-500">
//                 Ask anything or upload a file (PDF, image) to analyze
//               </p>
//             </div>
//           )}

//           {messages.map((msg, idx) => (
//             <div
//               key={idx}
//               className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
//             >
//               <div
//                 className={`max-w-[86%] md:max-w-[78%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
//                   msg.role === "user"
//                     ? "bg-[#0f62fe] text-white rounded-br-xl"
//                     : "bg-white border border-gray-200 rounded-bl-xl prose prose-slate"
//                 }`}
//               >
//                 {msg.type === "file" ? (
//                   <div className="flex items-center gap-2">
//                     <i className="ri-file-line text-lg opacity-90"></i>
//                     <span className="font-medium">{msg.content}</span>
//                   </div>
//                 ) : (
//                   <div className="whitespace-pre-wrap break-words">
//                     {msg.content}

//                     {msg.role === "assistant" &&
//                       idx === messages.length - 1 &&
//                       !isLoading && (
//                         <button
//                           className="mt-2 text-xs text-blue-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
//                           onClick={() => alert("Regenerate not implemented yet")}
//                         >
//                           Regenerate
//                         </button>
//                       )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm">
//                 <div className="flex gap-1.5">
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
//                 </div>
//                 <span className="text-sm text-gray-500 font-medium">Thinking...</span>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input area */}
//       <div className="border-t bg-white px-4 py-4 md:px-6 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
//         <div className="max-w-3xl mx-auto">
//           <div className="relative flex items-end gap-2 rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:border-[#0f62fe] focus-within:ring-2 focus-within:ring-[#0f62fe]/15 transition-all duration-150">

//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileSelect}
//               accept="application/pdf,image/*,.docx,.txt"
//               className="hidden"
//             />

//             {/* Paperclip + file preview */}
//             <div className="flex items-center min-w-0">
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 className="p-3 text-gray-500 hover:text-[#0f62fe] hover:bg-gray-50 rounded-lg transition-colors"
//                 title="Attach file"
//               >
//                 <i className="ri-attachment-2 text-xl"></i>
//               </button>

//               {file && (
//                 <div className="flex items-center gap-2 max-w-[180px] md:max-w-[260px] truncate">
//                   <span className="text-sm text-gray-600 truncate">
//                     {file.name}
//                   </span>
//                   <button
//                     onClick={clearFile}
//                     className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
//                     title="Remove file"
//                   >
//                     <i className="ri-close-line text-lg"></i>
//                   </button>
//                 </div>
//               )}
//             </div>

//             <textarea
//               ref={textareaRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Ask anything... (Shift + Enter for new line)"
//               rows={1}
//               disabled={isLoading}
//               className="flex-1 resize-none py-3.5 px-2 bg-transparent text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-50 min-h-[52px] max-h-[180px]"
//             />

//             <div className="flex items-center gap-1.5 pr-2">
//               {file ? (
//                 <button
//                   onClick={analyzeFile}
//                   disabled={isLoading}
//                   className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-xl disabled:opacity-60 transition-colors shadow-sm"
//                 >
//                   Analyze
//                 </button>
//               ) : (
//                 <button
//                   onClick={sendMessage}
//                   disabled={!input.trim() || isLoading}
//                   className="p-3 bg-[#0f62fe] hover:bg-[#0b55e6] text-white rounded-xl disabled:opacity-50 disabled:hover:bg-[#0f62fe] transition-all shadow-sm"
//                   aria-label="Send"
//                 >
//                   <i className="ri-send-plane-2-fill text-lg"></i>
//                 </button>
//               )}
//             </div>
//           </div>

//           <p className="text-xs text-gray-400 mt-2.5 text-center md:text-left">
//             Enter to {file ? "analyze file" : "send"} • Shift+Enter for new line
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Assistant;
