const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
