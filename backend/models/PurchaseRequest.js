
const mongoose = require("mongoose");

const purchaseRequestSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    buyerName: {
      type: String,
      required: true
    },
    buyerEmail: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const PurchaseRequest = mongoose.model(
  "PurchaseRequest",
  purchaseRequestSchema
);

module.exports = PurchaseRequest;
