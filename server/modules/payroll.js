const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  empId: {
    type: String,
    required: false,
  },
  salaryDetails: {
    basic: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],

    medicalAllowance: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],

    grossSalary: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
  },

  additions: {
    bonus: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
    arrears: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
    additionothers: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
    additiontotal: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
  },

  deductions: {
    eobi: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
    loan: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
    salaryAdvance: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
    incomeTax: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
    deductionothers: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
    deductiontotal: [
      {
        date: { type: Date, required: true },
        value: { type: Number, required: true },
      },
    ],
  },

  netPayable: {
    type: Number,
    required: true,
  },

  organization: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("payroll", payrollSchema);
