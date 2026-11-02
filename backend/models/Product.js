
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  oldPrice: {
    type: Number
  },
  condition: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  seller: {
    type: String
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["Available", "Sold"],
    default: "Available"
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
