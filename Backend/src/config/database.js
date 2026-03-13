const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require('mongoose')

function connectTODB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connect to DB");
    })
    .catch((err) => {
        console.error("DB Connection Error:", err);
    });
}

module.exports = connectTODB