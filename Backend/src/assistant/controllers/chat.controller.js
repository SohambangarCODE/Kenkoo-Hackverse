const { chatWithAI } = require("../services/ai.service");

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const reply = await chatWithAI(message);

        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Chat failed" });
    }
};

module.exports = chat;
