import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Brain, Wind, Droplets, Flame, Zap, AlertTriangle,
  Thermometer, Bone, Waves, ChevronDown, ChevronUp, Phone,
  Shield, CheckCircle, XCircle, Clock, Play, BookOpen,
  Star, ArrowRight, Activity, Siren
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   FIRST AID DATA
   ═══════════════════════════════════════════════════════════════════ */
const CONDITIONS = [
  {
    id: "heart-attack",
    title: "Heart Attack",
    icon: <Heart className="w-6 h-6" />,
    color: "from-red-500 to-rose-600",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-600",
    tagline: "Every second counts — act fast!",
    symptoms: [
      "Chest pain or pressure (feels like squeezing, fullness, or tightness)",
      "Pain spreading to shoulders, neck, jaw, or arms",
      "Shortness of breath, cold sweat, nausea",
      "Light-headedness or sudden dizziness",
      "Unusual fatigue (especially in women)",
    ],
    steps: [
      { step: 1, title: "Call Emergency Services (911)", description: "Immediately call emergency services. Do not drive yourself to the hospital." },
      { step: 2, title: "Chew an Aspirin (325 mg)", description: "If not allergic, chew (don't swallow whole) one regular aspirin to thin the blood." },
      { step: 3, title: "Sit Upright & Stay Calm", description: "Sit in a comfortable position, slightly reclined. Loosen tight clothing." },
      { step: 4, title: "Take Nitroglycerin if Prescribed", description: "If prescribed, take nitroglycerin as directed. Do not take someone else's medication." },
      { step: 5, title: "Begin CPR if Unconscious", description: "If the person becomes unresponsive, begin hands-only CPR — push hard and fast in the center of the chest." },
    ],
    dos: ["Call 911 immediately", "Keep the patient calm and still", "Loosen tight clothing", "Give aspirin if not allergic", "Be ready to perform CPR"],
    donts: ["Don't leave the person alone", "Don't let them walk or exert", "Don't give water immediately", "Don't ignore mild symptoms", "Don't wait to see if symptoms pass"],
    seekHelp: "Always call emergency services immediately. Heart attacks are time-critical — every minute without treatment increases heart muscle damage.",
    hasVideo: true,
  },
  {
    id: "stroke",
    title: "Stroke (FAST Method)",
    icon: <Brain className="w-6 h-6" />,
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    borderColor: "border-violet-200",
    textColor: "text-violet-600",
    tagline: "Remember FAST: Face, Arms, Speech, Time",
    symptoms: [
      "Sudden numbness or weakness on one side of body",
      "Confusion, trouble speaking or understanding speech",
      "Sudden trouble seeing in one or both eyes",
      "Severe headache with no known cause",
      "Loss of balance or coordination",
    ],
    steps: [
      { step: 1, title: "F — Face Drooping", description: "Ask the person to smile. Does one side of the face droop or feel numb?" },
      { step: 2, title: "A — Arm Weakness", description: "Ask them to raise both arms. Does one arm drift downward?" },
      { step: 3, title: "S — Speech Difficulty", description: "Ask them to repeat a simple sentence. Is their speech slurred or strange?" },
      { step: 4, title: "T — Time to Call 911", description: "If any of these signs are present, call 911 immediately. Note the time symptoms started." },
      { step: 5, title: "Keep Them Comfortable", description: "Lay them on their side, elevate the head slightly. Do NOT give food, drink, or medication." },
    ],
    dos: ["Call emergency services immediately", "Note the time symptoms began", "Keep them lying on their side", "Stay with them and monitor", "Clear airway if vomiting"],
    donts: ["Don't give any medication", "Don't give food or water", "Don't let them go to sleep", "Don't move them unnecessarily", "Don't ignore even brief symptoms (mini-stroke)"],
    seekHelp: "A stroke is a medical emergency. The sooner treatment begins, the less brain damage occurs. Treatment within 3 hours dramatically improves outcomes.",
  },
  {
    id: "choking",
    title: "Choking",
    icon: <Wind className="w-6 h-6" />,
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-600",
    tagline: "Clear the airway — the Heimlich can save a life",
    symptoms: [
      "Inability to speak, cry, or breath",
      "Clutching at the throat (universal choking sign)",
      "Wheezing or gagging sounds",
      "Skin turning blue or dusky",
      "Loss of consciousness (severe cases)",
    ],
    steps: [
      { step: 1, title: "Encourage Coughing", description: "If the person can cough forcefully, encourage them to keep coughing to dislodge the object." },
      { step: 2, title: "Give 5 Back Blows", description: "Stand behind them, lean them forward and deliver 5 firm blows between the shoulder blades with the heel of your hand." },
      { step: 3, title: "Perform 5 Abdominal Thrusts", description: "Stand behind them, wrap arms around waist, make a fist above the navel, and thrust inward and upward." },
      { step: 4, title: "Alternate Back Blows & Thrusts", description: "Alternate between 5 back blows and 5 abdominal thrusts until the object is expelled." },
      { step: 5, title: "Call 911 if Unconscious", description: "If they become unconscious, lower them to the floor, call 911, and begin CPR." },
    ],
    dos: ["Act quickly — seconds matter", "Encourage forceful coughing if partial blockage", "Call 911 if you can't clear the airway", "Learn proper Heimlich technique", "Check mouth after each thrust attempt"],
    donts: ["Don't slap the back if they're upright (use heel-of-hand blows)", "Don't attempt blind finger sweeps", "Don't give water to 'wash it down'", "Don't panic — stay focused", "Don't perform abdominal thrusts on pregnant women (use chest thrusts)"],
    seekHelp: "Call emergency services if the object isn't expelled within 1-2 minutes, or if the person loses consciousness.",
  },
  {
    id: "severe-bleeding",
    title: "Severe Bleeding",
    icon: <Droplets className="w-6 h-6" />,
    color: "from-red-600 to-red-700",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    tagline: "Apply pressure and don't let go!",
    symptoms: [
      "Blood soaking through bandages quickly",
      "Blood spurting or pulsing from wound",
      "Deep cut exposing fat, muscle, or bone",
      "Dizziness, weakness, or confusion (blood loss)",
      "Pale, cool, clammy skin",
    ],
    steps: [
      { step: 1, title: "Call 911", description: "For any severe or life-threatening bleeding, call emergency services immediately." },
      { step: 2, title: "Apply Direct Pressure", description: "Use a clean cloth or gauze. Press firmly and continuously on the wound. Do NOT remove the cloth." },
      { step: 3, title: "Elevate the Injury", description: "If possible, raise the injured limb above heart level to reduce blood flow." },
      { step: 4, title: "Apply a Tourniquet if Needed", description: "For limb injuries: if bleeding won't stop, apply a tourniquet 2-3 inches above the wound. Note the time." },
      { step: 5, title: "Keep the Person Warm", description: "Cover them with a blanket to prevent shock. Keep them lying down with legs elevated." },
    ],
    dos: ["Apply firm, continuous pressure", "Use the cleanest material available", "Add more layers if blood soaks through", "Keep the person calm and still", "Wear gloves if available"],
    donts: ["Don't remove the first cloth", "Don't use a tourniquet unless absolutely necessary", "Don't try to clean a severe wound", "Don't remove embedded objects", "Don't give the person anything to drink"],
    seekHelp: "Seek immediate medical help for any bleeding that doesn't stop with 10 minutes of direct pressure, or for deep wounds.",
  },
  {
    id: "burns",
    title: "Burns (Thermal)",
    icon: <Flame className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    bgLight: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-600",
    tagline: "Cool, cover, comfort — in that order",
    symptoms: [
      "Red, painful skin (1st degree)",
      "Blisters and swelling (2nd degree)",
      "White or charred skin, may be painless (3rd degree)",
      "Skin peeling or weeping",
      "Shock symptoms in severe cases",
    ],
    steps: [
      { step: 1, title: "Remove from Heat Source", description: "Move the person away from the source. Remove clothing near the burn unless stuck to skin." },
      { step: 2, title: "Cool with Running Water", description: "Hold the burned area under cool (not ice-cold) running water for at least 10-20 minutes." },
      { step: 3, title: "Cover with Clean Dressing", description: "Apply a sterile, non-adhesive bandage or clean cloth loosely over the burn." },
      { step: 4, title: "Take OTC Pain Relief", description: "Ibuprofen or acetaminophen can help with pain and swelling." },
      { step: 5, title: "Seek Medical Help for Severe Burns", description: "Call 911 for 3rd-degree burns, burns on face/hands/genitals, or burns larger than 3 inches." },
    ],
    dos: ["Cool with running water immediately", "Use sterile non-stick dressings", "Remove jewelry near the burn", "Give pain medication", "Keep the person hydrated"],
    donts: ["Don't apply ice directly", "Don't use butter, toothpaste, or home remedies", "Don't pop blisters", "Don't remove stuck clothing", "Don't use fluffy cotton on the burn"],
    seekHelp: "Seek emergency care for burns larger than 3 inches, 3rd-degree burns, burns on the face/hands/feet/groin, or if the person is a child or elderly.",
  },
  {
    id: "seizures",
    title: "Seizures / Epilepsy",
    icon: <Zap className="w-6 h-6" />,
    color: "from-yellow-500 to-amber-600",
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    tagline: "Protect, don't restrain — time the seizure",
    symptoms: [
      "Uncontrollable jerking or shaking movements",
      "Staring blankly or appearing confused",
      "Temporary loss of consciousness",
      "Stiffening of the body",
      "Loss of bladder or bowel control",
    ],
    steps: [
      { step: 1, title: "Ease Them to the Floor", description: "Gently guide them to the ground to prevent falling injuries." },
      { step: 2, title: "Clear the Area", description: "Move furniture, sharp objects, and anything dangerous away from them." },
      { step: 3, title: "Turn Them on Their Side", description: "Roll them onto their side to prevent choking on saliva or vomit." },
      { step: 4, title: "Time the Seizure", description: "Use your phone to time the seizure. If it lasts more than 5 minutes, call 911." },
      { step: 5, title: "Stay Until They Recover", description: "Stay with them until they're fully alert. Speak calmly and reassuringly." },
    ],
    dos: ["Clear the surrounding area", "Cushion their head", "Time the seizure duration", "Turn them on their side", "Stay calm and reassuring"],
    donts: ["Don't hold them down or restrain", "Don't put anything in their mouth", "Don't attempt CPR during the seizure", "Don't offer food/water until fully alert", "Don't try to move them unless in danger"],
    seekHelp: "Call 911 if: the seizure lasts more than 5 minutes, they don't regain consciousness, they have difficulty breathing, it's their first seizure, or they're pregnant or have diabetes.",
  },
  {
    id: "anaphylaxis",
    title: "Allergic Reaction (Anaphylaxis)",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "from-pink-500 to-rose-600",
    bgLight: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-600",
    tagline: "EpiPen first, ambulance second — speed saves lives",
    symptoms: [
      "Swelling of face, lips, tongue, or throat",
      "Difficulty breathing or wheezing",
      "Rapid or weak pulse",
      "Skin rash, hives, or flushing",
      "Nausea, vomiting, or dizziness",
    ],
    steps: [
      { step: 1, title: "Use EpiPen Immediately", description: "If the person has an epinephrine auto-injector, use it immediately in the outer thigh (even through clothing)." },
      { step: 2, title: "Call 911", description: "Call emergency services even if the EpiPen seems to help — a second reaction can occur." },
      { step: 3, title: "Lay Them Down", description: "Have them lie flat with legs elevated unless they're having trouble breathing (then let them sit up)." },
      { step: 4, title: "Remove the Trigger", description: "If caused by a bee sting, carefully remove the stinger. Move away from the allergen source." },
      { step: 5, title: "Monitor & Give Second Dose", description: "If symptoms don't improve in 5-15 minutes, give a second EpiPen dose if available." },
    ],
    dos: ["Use epinephrine immediately", "Call 911 after EpiPen", "Keep them lying flat with legs raised", "Loosen tight clothing", "Be ready to perform CPR"],
    donts: ["Don't wait to see if symptoms improve", "Don't make them sit up if feeling faint", "Don't give oral allergy medicine instead of EpiPen", "Don't leave them alone", "Don't hesitate to give a second dose"],
    seekHelp: "Anaphylaxis is always a medical emergency. Even after epinephrine, go to the ER for monitoring as reactions can recur.",
  },
  {
    id: "heatstroke",
    title: "Heatstroke",
    icon: <Thermometer className="w-6 h-6" />,
    color: "from-orange-600 to-red-600",
    bgLight: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    tagline: "Cool down aggressively — heatstroke can be fatal",
    symptoms: [
      "Body temperature above 104°F (40°C)",
      "Hot, red, dry skin (no sweating)",
      "Rapid, strong pulse",
      "Confusion, agitation, or slurred speech",
      "Loss of consciousness",
    ],
    steps: [
      { step: 1, title: "Call 911 Immediately", description: "Heatstroke is life-threatening. Call emergency services right away." },
      { step: 2, title: "Move to a Cool Place", description: "Get the person indoors or into the shade immediately." },
      { step: 3, title: "Cool Aggressively", description: "Apply ice packs to the neck, armpits, and groin. Spray with cool water. Fan them vigorously." },
      { step: 4, title: "Immerse in Cold Water", description: "If available, immerse the person in a cold bath or shower. This is the fastest cooling method." },
      { step: 5, title: "Monitor Temperature", description: "Continue cooling until body temperature drops to 101-102°F. Do NOT give fluids if unconscious." },
    ],
    dos: ["Call 911 immediately", "Move to shade or AC", "Remove excess clothing", "Apply cold packs aggressively", "Fan while misting with water"],
    donts: ["Don't give aspirin or acetaminophen", "Don't give fluids if unconscious", "Don't use alcohol rubs", "Don't delay cooling while waiting for EMS", "Don't stop cooling even if they shiver"],
    seekHelp: "Heatstroke is always a medical emergency. Without rapid treatment, it can cause organ damage, brain damage, or death.",
  },
  {
    id: "fractures",
    title: "Fractures & Broken Bones",
    icon: <Bone className="w-6 h-6" />,
    color: "from-slate-500 to-gray-600",
    bgLight: "bg-slate-50",
    borderColor: "border-slate-200",
    textColor: "text-slate-600",
    tagline: "Immobilize, ice, and get to the ER",
    symptoms: [
      "Intense pain that worsens with movement",
      "Swelling, bruising, or tenderness",
      "Visible deformity or limb at odd angle",
      "Inability to bear weight or use the limb",
      "Grinding or snapping sound at injury",
    ],
    steps: [
      { step: 1, title: "Stop Any Bleeding", description: "If there's an open wound, apply pressure with a clean cloth. Do not try to push bone back in." },
      { step: 2, title: "Immobilize the Area", description: "Do not try to realign the bone. Splint the injury using a rigid object (board, rolled newspaper) and bandages." },
      { step: 3, title: "Apply Ice", description: "Apply an ice pack wrapped in cloth for 15-20 minutes to reduce swelling. Never apply ice directly to skin." },
      { step: 4, title: "Treat for Shock", description: "If the person is faint or breathing in short breaths, lay them down with legs elevated and keep them warm." },
      { step: 5, title: "Get Medical Help", description: "Go to the ER. Call 911 for suspected hip, pelvis, or spine fractures — do not move the person." },
    ],
    dos: ["Immobilize above and below the fracture", "Apply ice wrapped in cloth", "Keep the person still", "Support the injury during transport", "Elevate the injured area if possible"],
    donts: ["Don't try to straighten the bone", "Don't move the person if spine injury is suspected", "Don't apply ice directly to skin", "Don't give food or drink (surgery may be needed)", "Don't remove shoes from suspected foot/ankle fracture"],
    seekHelp: "Go to the ER for all suspected fractures. Call 911 immediately for head, neck, back, hip, or pelvis injuries.",
  },
  {
    id: "drowning",
    title: "Drowning / Near-Drowning",
    icon: <Waves className="w-6 h-6" />,
    color: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-600",
    tagline: "Rescue safely, then rescue breathe",
    symptoms: [
      "Difficulty breathing or gasping",
      "Coughing up water or foam",
      "Blue lips or fingertips",
      "Confusion or unresponsiveness",
      "Not breathing or no pulse",
    ],
    steps: [
      { step: 1, title: "Get Them Out Safely", description: "Reach with a pole, throw a floatation device, or row to them. Only swim to them as a last resort." },
      { step: 2, title: "Call 911", description: "Even if the person seems okay after rescue, call 911. Delayed drowning can occur hours later." },
      { step: 3, title: "Check for Breathing", description: "Tilt the head back, lift the chin, and check for breathing for no more than 10 seconds." },
      { step: 4, title: "Begin CPR if Not Breathing", description: "Give 2 rescue breaths, then 30 chest compressions. Continue the cycle until help arrives or they breathe." },
      { step: 5, title: "Keep Them Warm", description: "Remove wet clothing, cover with blankets, and keep them lying on their side to drain water." },
    ],
    dos: ["Call for help before entering the water", "Use a flotation device if possible", "Begin CPR immediately if not breathing", "Keep them warm after rescue", "Monitor for secondary drowning symptoms"],
    donts: ["Don't attempt a swimming rescue unless trained", "Don't try to drain water from lungs", "Don't assume they're fine if they 'seem okay'", "Don't leave them alone for 24 hours", "Don't perform abdominal thrusts to remove water"],
    seekHelp: "Always go to the ER after a near-drowning incident. 'Secondary drowning' can cause life-threatening complications hours later.",
  },
];

const EMERGENCY_TIPS = [
  { icon: "📞", title: "Save Emergency Numbers", desc: "Store local emergency numbers (911, poison control 1-800-222-1222) in your phone's speed dial." },
  { icon: "🩹", title: "Keep a First Aid Kit", desc: "Stock bandages, gauze, antiseptic, gloves, scissors, tweezers, and an emergency blanket." },
  { icon: "📋", title: "Learn CPR / AED", desc: "Take a certified CPR and AED course. Hands-only CPR can double survival chances." },
  { icon: "💊", title: "Know Your Medications", desc: "Keep a list of medications, allergies, and conditions for everyone in your household." },
  { icon: "🔋", title: "Charge Your Phone", desc: "In an emergency, a charged phone is your lifeline. Keep a portable charger ready." },
  { icon: "🗺️", title: "Know Your Location", desc: "In an emergency, be ready to tell dispatchers your exact address or GPS coordinates." },
];

/* ═══════════════════════════════════════════════════════════════════
   CONDITION CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const ConditionCard = ({ condition, isExpanded, onToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border ${condition.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${condition.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
          {condition.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">{condition.title}</h3>
          <p className="text-xs sm:text-sm text-slate-500 truncate">{condition.tagline}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`w-8 h-8 rounded-full ${condition.bgLight} flex items-center justify-center flex-shrink-0`}
        >
          <ChevronDown className={`w-5 h-5 ${condition.textColor}`} />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 space-y-5">
              {/* Symptoms */}
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-blue-500" /> Recognize the Symptoms
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {condition.symptoms.map((s, i) => (
                    <div key={i} className={`flex items-start gap-2 ${condition.bgLight} rounded-xl px-3 py-2.5`}>
                      <AlertTriangle className={`w-3.5 h-3.5 ${condition.textColor} mt-0.5 flex-shrink-0`} />
                      <span className="text-xs sm:text-sm text-slate-700">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step */}
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-green-500" /> Step-by-Step First Aid
                </h4>
                <div className="space-y-3">
                  {condition.steps.map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${condition.color} flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0`}>
                        {s.step}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-900 text-sm">{s.title}</h5>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <h5 className="font-bold text-green-700 flex items-center gap-2 mb-3 text-sm">
                    <CheckCircle className="w-4 h-4" /> ✅ DO's
                  </h5>
                  <ul className="space-y-2">
                    {condition.dos.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-green-800">
                        <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-green-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <h5 className="font-bold text-red-700 flex items-center gap-2 mb-3 text-sm">
                    <XCircle className="w-4 h-4" /> ❌ DON'Ts
                  </h5>
                  <ul className="space-y-2">
                    {condition.donts.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-red-800">
                        <XCircle className="w-3 h-3 mt-1 flex-shrink-0 text-red-400" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* When to Seek Help */}
              <div className="bg-gradient-to-r from-[#1447E6] to-violet-600 rounded-2xl p-4 text-white">
                <h5 className="font-extrabold flex items-center gap-2 mb-1 text-sm">
                  <Siren className="w-4 h-4" /> When to Seek Professional Help
                </h5>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{condition.seekHelp}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN FIRST AID PAGE
   ═══════════════════════════════════════════════════════════════════ */
const FirstAid = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCard = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredConditions = CONDITIONS.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symptoms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 py-4 px-3 sm:py-6 sm:px-4 md:py-8 md:px-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto">

        {/* ── Hero Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 bg-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-15 -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full blur-2xl opacity-15 -ml-10 -mb-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">First Aid Guide</h1>
                <p className="text-blue-200 text-sm sm:text-base">Emergency cheat codes that can save lives</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm max-w-2xl mt-2 leading-relaxed">
              Quick-reference first aid instructions for common emergencies. Learn what to do — and what NOT to do — in the critical first minutes before help arrives.
            </p>
          </div>
        </motion.div>

        {/* ── Emergency Quick Actions ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
        >
          <a
            href="tel:911"
            className="flex items-center gap-3 bg-red-600 text-white rounded-2xl px-5 py-4 hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Call Emergency</p>
              <p className="text-red-200 text-xs">Dial +16183607978</p>
            </div>
          </a>
          <a
            href="tel:18002221222"
            className="flex items-center gap-3 bg-violet-600 text-white rounded-2xl px-5 py-4 hover:bg-violet-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Poison Control</p>
              <p className="text-violet-200 text-xs">1800-425-1213</p>
            </div>
          </a>
          <div
            className="flex items-center gap-3 bg-[#1447E6] text-white rounded-2xl px-5 py-4 shadow-lg cursor-default"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm">CPR: 30:2</p>
              <p className="text-blue-200 text-xs">30 compressions, 2 breaths</p>
            </div>
          </div>
        </motion.div>

        {/* ── Search Bar ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search conditions, symptoms... (e.g. 'chest pain', 'choking', 'burn')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 transition-all pl-12 shadow-sm"
            />
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </motion.div>

        {/* ── Heart Attack Spotlight (Video Section) ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-red-200 rounded-2xl shadow-lg overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 sm:px-6 py-4">
            <h3 className="font-extrabold text-white flex items-center gap-2">
              <Play className="w-5 h-5" />
              🎥 Heart Attack First Aid — Video Guide
            </h3>
            <p className="text-red-100 text-xs sm:text-sm mt-1">
              Watch this essential guide to learn what to do when someone is having a heart attack.
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
              <video
                controls
                className="w-full h-full object-cover"
                poster=""
                preload="metadata"
              >
                <source src="/first-aid.mp4" type="video/mp4" />
                <div className="flex items-center justify-center h-full text-white text-sm">
                  Your browser does not support the video tag.
                </div>
              </video>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-red-700">Act Within 5 Min</p>
                <p className="text-[10px] text-red-500">Critical window for survival</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <Heart className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-blue-700">Chew Aspirin</p>
                <p className="text-[10px] text-blue-500">325mg — thins the blood</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <Phone className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-green-700">Call 911 First</p>
                <p className="text-[10px] text-green-500">Don't drive yourself</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Condition Cards ─────────────────────────────────────── */}
        <div className="space-y-3 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-between mb-2"
          >
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1447E6]" />
              Emergency First Aid Guides
            </h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {filteredConditions.length} guides
            </span>
          </motion.div>

          {filteredConditions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">No matching guides found</h3>
              <p className="text-sm text-slate-500">Try a different search term like "chest pain" or "burn".</p>
            </div>
          ) : (
            filteredConditions.map((cond, idx) => (
              <motion.div
                key={cond.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <ConditionCard
                  condition={cond}
                  isExpanded={expandedId === cond.id}
                  onToggle={() => toggleCard(cond.id)}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* ── General Emergency Tips ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6 mb-6"
        >
          <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            💡 General Emergency Preparedness Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EMERGENCY_TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:bg-white hover:shadow-md transition-all duration-300 group"
              >
                <div className="text-2xl mb-2">{tip.icon}</div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">{tip.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default FirstAid;
