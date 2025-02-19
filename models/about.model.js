const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    length: 100,
  },
  description: {
    type: String,
    retquired: true,
  },
});

module.exports = mongoose.model("About", aboutSchema);
