const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

/* ─── Existing: Analyze a medical report ─────────────────────────── */
const analyzeMedicalReport = async (text, question = null) => {
  const prompt = `
You are a medical AI assistant.

Analyze the medical report.

Return ONLY JSON.
The "answer_to_user" field MUST be formatted as a text-based table for data, followed by insights in plain text.
Use strictly aligned columns for the table.

Format example for "answer_to_user":
"
| Test Name | Result | Reference Range | Status |
| :--- | :--- | :--- | :--- |
| Hemoglobin | 11.0 g/dL | 13.5-17.5 | LOW |
| WBC | 12000 | 4500-11000 | HIGH |

INSIGHTS:
The patient has anemia and leukocytosis...
"

JSON Structure:
{
  "patient_name": "",
  "diagnosis": "",
  "abnormal_values": [],
  "risk_level": "",
  "summary": "",
  "answer_to_user": "",
  "metrics": [
    { "name": "Hemoglobin", "value": 14.1, "unit": "g/dL", "status": "Normal" },
    { "name": "Cholesterol", "value": 190, "unit": "mg/dL", "status": "Normal" }
  ],
  "recommendations": [
    "Increase iron intake through leafy greens.",
    "Maintain regular exercise routine."
  ]
}

User Question: ${question || "No question asked"}

Report:
${text}
`;

  const response = await model.invoke(prompt);

  try {
    const cleaned = response.content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw: response.content };
  }
};

/* ─── Existing: Chat with AI ─────────────────────────────────────── */
const chatWithAI = async (message) => {
  const prompt = `
You are a helpful and knowledgeable medical AI assistant.
Answer the user's health-related questions clearly and concisely.
If the question is not related to health, politely steer the conversation back to health topics.

User: ${message}
`;

  const response = await model.invoke(prompt);
  return response.content;
};

/* ─── NEW: Full Health Condition Analyzer ─────────────────────────── */
const analyzeHealthCondition = async ({
  symptoms,
  vitals,
  medicalHistory,
  documentText,
  language,
}) => {
  const vitalsBlock = vitals
    ? `
VITALS:
- Temperature: ${vitals.temperature || "Not provided"}${vitals.temperatureUnit === "C" ? "°C" : "°F"}
- Blood Pressure: ${vitals.systolic || "?"}/${vitals.diastolic || "?"} mmHg
- Heart Rate: ${vitals.heartRate || "Not provided"} BPM
- SpO2: ${vitals.spo2 || "Not provided"}%
`
    : "VITALS: Not provided";

  const historyBlock = medicalHistory
    ? `
MEDICAL HISTORY:
- Age: ${medicalHistory.age || "Unknown"}
- Gender: ${medicalHistory.gender || "Unknown"}
- Weight: ${medicalHistory.weight || "Unknown"} kg
- Height: ${medicalHistory.height || "Unknown"} cm
- Pre-existing Conditions: ${
        medicalHistory.conditions?.length
          ? medicalHistory.conditions.join(", ")
          : "None reported"
      }
- Current Medications: ${medicalHistory.medications || "None reported"}
- Allergies: ${medicalHistory.allergies || "None reported"}
`
    : "MEDICAL HISTORY: Not provided";

  const docBlock = documentText
    ? `
UPLOADED MEDICAL DOCUMENT TEXT:
${documentText.substring(0, 5000)}
`
    : "";

  const prompt = `You are a highly experienced senior physician and diagnostician with 30+ years of clinical practice. A patient is presenting with the following information. Analyze EVERYTHING carefully and provide a comprehensive clinical assessment.

PATIENT SYMPTOMS:
${symptoms}

${vitalsBlock}

${historyBlock}

${docBlock}

IMPORTANT INSTRUCTIONS:
1. Analyze all provided data holistically as a senior doctor would.
2. Cross-reference symptoms with vitals and medical history.
3. Consider the patient's age, gender, and pre-existing conditions in your analysis.
4. If uploaded document text is present, incorporate those findings.
5. Be thorough but also practical — prioritize the most likely conditions.
6. The response language should match: ${language || "English"}. You MUST translate all generated text values (descriptions, recommendations, summaries) into this language.
7. CRITICAL: Use simple, everyday words that a common person can understand instead of complex medical jargon, especially for normal/common diseases (e.g., use "Common Cold" instead of "Acute Viral Rhinopharyngitis").

You MUST return ONLY valid JSON (no markdown, no backticks, no explanation outside JSON).
CRITICAL RULE: While the VALUES of the JSON should be in the requested language (${language || "English"}), the KEYS of the JSON MUST remain EXACTLY as shown in English below.

{
  "possible_diseases": [
    {
      "name": "Disease Name",
      "probability": 85,
      "description": "Brief clinical description of this condition",
      "matching_symptoms": ["symptom1", "symptom2"],
      "icd_code": "ICD-10 code if known"
    }
  ],
  "severity": {
    "level": "low | moderate | high | critical",
    "score": 1-10,
    "reasoning": "Detailed explanation of why this severity level was assigned"
  },
  "is_emergency": false,
  "emergency_message": "Only if is_emergency is true — what to do immediately",
  "recommended_specialties": [
    {
      "specialty": "Cardiology",
      "reason": "Why this specialist is recommended"
    }
  ],
  "first_aid_instructions": [
    {
      "step": 1,
      "title": "Instruction title",
      "description": "Detailed step description",
      "icon": "emoji representing this step"
    }
  ],
  "lifestyle_recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ],
  "when_to_seek_help": "Clear guidance on urgency and when to see a doctor",
  "vitals_assessment": {
    "temperature_status": "normal | elevated | fever | high_fever | hypothermia",
    "bp_status": "normal | elevated | hypertension_stage1 | hypertension_stage2 | hypertensive_crisis | hypotension",
    "heart_rate_status": "normal | bradycardia | tachycardia",
    "spo2_status": "normal | low | critical",
    "overall_vitals_concern": "Brief summary of vitals interpretation"
  },
  "summary": "A compassionate, clear, 2-3 sentence overall summary for the patient"
}`;

  const response = await model.invoke(prompt);

  try {
    const cleaned = response.content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI health analysis:", err.message);
    // Attempt to extract JSON from the response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // fallback
      }
    }
    return {
      possible_diseases: [],
      severity: { level: "moderate", score: 5, reasoning: "Unable to fully parse AI response" },
      is_emergency: false,
      recommended_specialties: [],
      first_aid_instructions: [],
      lifestyle_recommendations: [],
      when_to_seek_help: "Please consult a healthcare professional for proper evaluation.",
      summary: "Analysis completed but structured parsing failed. Please consult a doctor.",
      raw: response.content,
    };
  }
};

module.exports = { analyzeMedicalReport, chatWithAI, analyzeHealthCondition };
