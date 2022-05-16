const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  empId: {
    type: String,
    required: true,
  },
  timeOff: {
    type: Number,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
  },
  opd: {
    type: Number,
    required: true,
  },
  eobi: {
    type: Number,
    required: false,
  },
  joinDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: false,
  },
  organization: {
    type: Number,
    required: true,
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  isTaxable: {
    type: Number,
    required: false,
  },
  empType: [
    {
      date: {
        type: Date,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
  department: [
    {
      date: {
        type: Date,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
  salary: [
    {
      date: {
        type: Date,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
  ],
  tax: [
    {
      date: {
        type: Date,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
  ],
  status: [
    {
      date: {
        type: Date,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
  designation: [
    {
      date: {
        type: Date,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("userData", userDataSchema);
