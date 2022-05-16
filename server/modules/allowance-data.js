const mongoose = require("mongoose");

const allowanceDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  empId: {
    type: String,
    required: true,
  },
  requestDate: {
    type: Date,
    required: true,
  },
  requestAmount: {
    type: Number,
    required: true,
  },
  approvedAmount: {
    type: Number,
    required: true,
  },
  statusApproved: {
    type: String,
    required: true,
  },
  statusPayment: {
    type: String,
    required: true,
  },
  approvedBy: {
    type: String,
    required: true,
  },
  actualPaymentDate: {
    type: Date,
    required: true,
  },
  tentativePaymentDate: {
    type: Date,
    required: true,
  },
  remainingLimit: {
    type: Number,
    required: false,
  },
  createdDate: {
    type: Date,
    required: true,
  },
  organization: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("allowanceData", allowanceDataSchema);
