import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Bot, Sparkles, Mic, Send, Brain, Activity,
  Heart, Thermometer, Stethoscope, Clock, Star,
  ChevronRight, Zap, Shield, MessageSquare
} from "lucide-react";

/* ── Animation variants ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" }
  }),
};

const pulse = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.15, 0.25, 0.15],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
  },
};

/* ── Sample quick-prompt chips ──────────────────────────────────── */
const QUICK_PROMPTS = [
  { icon: <Thermometer className="w-4 h-4" />, label: "Check my fever symptoms" },
  { icon: <Heart className="w-4 h-4" />, label: "Analyse my heart health" },
  { icon: <Activity className="w-4 h-4" />, label: "Summarise my recent records" },
  { icon: <Stethoscope className="w-4 h-4" />, label: "Suggest a specialist" },
];

/* ── Roadmap feature cards ──────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Symptom Analysis",
    desc: "Describe what you feel — the AI maps it to possible conditions with severity scores.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Record Intelligence",
    desc: "Your uploaded health reports are parsed and queried in plain language.",
    color: "from-[#1447E6] to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Triage",
    desc: "Emergency flag raised automatically for high-risk patterns detected in conversation.",
    color: "from-orange-400 to-red-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy-First",
    desc: "All conversations are end-to-end encrypted and never used for model training.",
    color: "from-green-400 to-teal-500",
    bg: "bg-green-50",
    border: "border-green-100",
  },
];

/* ── Component ─────────────────────────────────────────────────── */
const PersonalAssistant = () => {
  const { user } = useAuth();
  const [inputVal, setInputVal] = useState("");

  const greeting =
    user?.name
      ? `Hello, ${user.name.split(" ")[0]} 👋`
      : "Hello there 👋";

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white py-10 sm:py-14 px-4 sm:px-6 overflow-hidden">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="relative px-6 pt-14 pb-12 overflow-hidden">
        {/* Background blobs */}
        <motion.div
          variants={pulse}
          animate="animate"
          className="absolute -top-20 -left-20 w-72 h-72 bg-[#1447E6] rounded-full blur-[100px]"
        />
        <motion.div
          variants={pulse}
          animate="animate"
          className="absolute -bottom-10 -right-10 w-60 h-60 bg-violet-500 rounded-full blur-[120px]"
        />

        <div className="relative w-full max-w-sm sm:max-w-md mx-auto text-center">
          {/* Badge */}
          <motion.div
            custom={0} initial="hidden" animate="visible" variants={fadeUp}
            className="inline-flex items-center gap-2 bg-[#1447E6]/10 border border-[#1447E6]/20 text-[#1447E6] px-5 py-2 rounded-full text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Coming Soon — Personal Health AI
          </motion.div>

          {/* Greeting */}
          <motion.h1
            custom={1} initial="hidden" animate="visible" variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4"
          >
            {greeting}
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Meet Your AI Doctor Companion
            </span>
          </motion.h1>

          <motion.p
            custom={2} initial="hidden" animate="visible" variants={fadeUp}
            className="text-sm sm:text-base lg:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10"
          >
            Your 24/7 personal health assistant that understands your records,
            analyses symptoms, and guides you with evidence-based insights.
          </motion.p>

          {/* Fake chat input (preview) */}
          <motion.div
            custom={3} initial="hidden" animate="visible" variants={fadeUp}
            className="relative max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 sm:gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-xl backdrop-blur-md">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
              <input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask anything about your health…"
                className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400 font-medium text-sm md:text-base"
                disabled
              />
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-slate-300">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-white">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* "Coming Soon" overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs lg:text-sm font-black uppercase tracking-widest px-4 sm:px-6 py-2 rounded-full shadow-lg pointer-events-none">
                🔒 Launching Soon
              </div>
            </div>
          </motion.div>

          {/* Quick prompt chips */}
          <motion.div
            custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            {QUICK_PROMPTS.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold shadow-sm cursor-not-allowed opacity-70 select-none"
              >
                <span className="text-[#1447E6]">{p.icon}</span>
                {p.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">What You'll Be Able to Do</h2>
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">What's Coming</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature Cards ────────────────────────────────────────── */}
      <section className="px-6 py-8">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              custom={i} initial="hidden" whileInView="visible" variants={fadeUp}
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`rounded-2xl border p-6 ${f.bg} ${f.border} flex flex-col gap-4 cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-md`}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Conversation Preview mockup ─────────────────────────── */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1447E6] to-violet-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Kenkoo AI Assistant</p>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  Online soon
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1 bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                Coming Soon
              </div>
            </div>

            {/* Mock messages */}
            <div className="p-6 space-y-4 bg-slate-50/50 min-h-[220px]">
              {/* AI message */}
              <div className="flex gap-3 items-end">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1447E6] to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 shadow">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100 max-w-xs">
                  <p className="text-sm text-slate-700 font-medium">
                    Hi {user?.name?.split(" ")[0] || "there"}! I'm your Kenkoo AI. I can analyse symptoms, read your records and guide you. What's on your mind today?
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Just now
                  </p>
                </div>
              </div>

              {/* User placeholder */}
              <div className="flex gap-3 items-end justify-end">
                <div className="bg-[#1447E6] rounded-2xl rounded-br-sm px-4 py-3 shadow-sm max-w-xs">
                  <p className="text-sm text-white font-medium">
                    I've been having chest discomfort and mild fever…
                  </p>
                  <p className="text-[10px] text-[#1447E6]/40 mt-1 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> Just now
                  </p>
                </div>
                <div
                  className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden flex-shrink-0"
                >
                  <img
                    src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1447E6&color=fff`}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* AI typing indicator */}
              <div className="flex gap-3 items-end">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1447E6] to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 shadow">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#1447E6] rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-[#1447E6] rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-[#1447E6] rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Locked bar */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-slate-400 text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Your AI assistant is being prepared…
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#1447E6]/20 flex items-center justify-center text-[#1447E6]/40">
                  <Send className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Timeline / Roadmap ──────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
            className="text-2xl font-extrabold text-center text-slate-900 mb-8"
          >
            🗺 Rollout Roadmap
          </motion.h2>
          <div className="relative pl-8 space-y-0">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />
            {[
              { phase: "Phase 1", label: "Symptom Checker AI", status: "In Development", color: "bg-orange-400" },
              { phase: "Phase 2", label: "Record Reading (Lab Reports, PDFs)", status: "Planned", color: "bg-blue-300" },
              { phase: "Phase 3", label: "Voice-to-Health Conversation", status: "Planned", color: "bg-blue-200" },
              { phase: "Phase 4", label: "Doctor Referral Integration", status: "Planned", color: "bg-blue-100" },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
                className="relative flex items-start gap-4 pb-8"
              >
                <div className={`absolute -left-5 w-3.5 h-3.5 rounded-full ${item.color} border-2 border-white shadow mt-1`} />
                <div className="bg-white border border-slate-200 rounded-2xl p-4 w-full shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1447E6]">{item.phase}</span>
                    <p className="font-bold text-slate-800 mt-0.5">{item.label}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                    item.status === "In Development"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default PersonalAssistant;