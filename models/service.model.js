const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  description: { type: String },
  price: { type: Number, required: true },
});

module.exports = mongoose.model("Service", serviceSchema);
