const mongoose = require("mongoose");

const serviceDetailsSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    }, // Reference to Service model
    image: { type: String, required: true }, // Main image URL/path
    description: { type: String, required: true }, // Simple description
    features: [{ type: String, required: true, maxlength: 100 }], // Array of up to 5 features
    price: { type: Number, required: true, min: 0 }, // Service price
  },
  { timestamps: true }
);

// Limit features to 5
serviceDetailsSchema.pre("save", function (next) {
  if (this.features.length > 5) {
    return next(new Error("You can only add up to 5 features."));
  }
  next();
});

const ServiceDetails = mongoose.model("ServiceDetails", serviceDetailsSchema);
module.exports = ServiceDetails;
