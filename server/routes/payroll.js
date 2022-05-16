/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
const express = require("express");
const router = express.Router();
const payroll = require("../modules/payroll");
const users = require("../modules/users");
const userData = require("../modules/user-data");
const opdData = require("../modules/opd-data");
const allowanceData = require("../modules/allowance-data");
const bcrypt = require("bcryptjs");

router.get("/", async (req, res) => {
  try {
    const users = await payroll.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const userData = await users.find();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add_user", async (req, res) => {
  const addUser = new users({
    name: req.body.name,
    password: req.body.password,
  });
  try {
    const added = await addUser.save();
    if (added) {
      res.status(200).json({ message: "success" });
    } else {
      res.status(400).json({ message: "incorrect username or password" });
    }
    res.status(200).json(added);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user", async (req, res) => {
  try {
    const matchedUser = await users.findOne({
      name: req.body.name,
    });
    bcrypt
      .compare(req.body.password, matchedUser.password)
      .then(function (result) {
        if (result) {
          res.status(200).json({ message: "success" });
        } else {
          res.status(400).json({ message: "incorrect username or password" });
        }
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// router.post("/", async (req, res) => {
//   const addUser = new payroll({
//     name: req.body.name,
//     age: req.body.age,
//     title: req.body.title,
//   });
//   try {
//     const added = await addUser.save();
//     res.status(200).json(added);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

router.post("/:id/get-opd-data", opdDataCheck, async (req, res) => {
  try {
    res.json(res.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/get-filtered-opd", async (req, res) => {
  let statusCheck = {};
  if (
    req.body.filterValue === "1" ||
    req.body.filterValue === "2" ||
    req.body.filterValue === "3"
  ) {
    statusCheck = { statusApproved: req.body.filterValue };
  }
  if (req.body.filterValue === "4" || req.body.filterValue === "5") {
    statusCheck = { statusPayment: req.body.filterValue };
  }
  try {
    const data = await opdData.find({
      ...statusCheck,
      organization: req.body.organization,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/get-all-opd", async (req, res) => {
  try {
    const data = await opdData.find({ organization: req.body.organization });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add-opd-data", async (req, res) => {
  const addOpd = new opdData({
    empId: req.body.empId,
    requestDate: req.body.requestDate,
    requestAmount: req.body.requestAmount,
    approvedAmount: req.body.approvedAmount,
    statusApproved: req.body.statusApproved,
    statusPayment: req.body.statusPayment,
    approvedBy: req.body.approvedBy,
    tentativePaymentDate: req.body.tentativePaymentDate,
    actualPaymentDate: req.body.actualPaymentDate,
    remainingLimit: req.body.remainingLimit,
    organization: req.body.organization,
    createdDate: Date.now(),
  });
  try {
    const added = await addOpd.save();
    res.status(200).json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/update-opd-status", getMongoId, async (req, res) => {
  try {
    res.user.statusPayment = req.body.statusPayment;
    res.user.statusApproved = req.body.statusApproved;
    const opdStatus = await res.user.save();
    res.json(opdStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add-bulk-opd-data", async (req, res) => {
  const array = req.body.opdInfo;
  const payload = [];

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    const opdList = new opdData({
      empId: element.empId,
      requestDate: element.requestDate,
      requestAmount: element.requestAmount,
      approvedAmount: element.approvedAmount,
      statusApproved: element.statusApproved,
      statusPayment: element.statusPayment,
      approvedBy: element.approvedBy,
      tentativePaymentDate: element.tentativePaymentDate,
      actualPaymentDate: element.actualPaymentDate,
      remainingLimit: element.remainingLimit,
      createdDate: element.createdDate,
      organization: element.organization,
    });
    const obj = {
      insertOne: { document: opdList },
    };
    payload.push(obj);
  }

  try {
    const addBulkOpd = opdData.bulkWrite([...payload]);
    res.status(200).json(addBulkOpd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getMongoId(req, res, next) {
  let user;
  try {
    user = await opdData.findOne({ _id: req.params.id });
    if (user === null) {
      return res.status(400).json({ message: "cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

async function opdDataCheck(req, res, next) {
  let data;
  try {
    data = await opdData.find({
      empId: req.params.id,
      organization: req.body.organization,
    });
    if (data === null) {
      return res.status(400).json({ message: "cannot find data" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = data;
  next();
}

router.get("/:id/get-allowance-data", allowancesData, async (req, res) => {
  try {
    res.json(res.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/filtered-allowances", async (req, res) => {
  let statusCheck = {};
  if (req.body.filterValue === "1" || req.body.filterValue === "2") {
    statusCheck = { statusApproved: req.body.filterValue };
  }
  if (req.body.filterValue === "3" || req.body.filterValue === "4") {
    statusCheck = { statusPayment: req.body.filterValue };
  }
  try {
    const data = await allowanceData.find({
      ...statusCheck,
      organization: req.body.organization,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/get-all-allowances", async (req, res) => {
  try {
    const data = await allowanceData.find({
      organization: req.body.organization,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add-allowance-data", async (req, res) => {
  const addAllowance = new allowanceData({
    name: req.body.name,
    empId: req.body.empId,
    requestDate: req.body.requestDate,
    requestAmount: req.body.requestAmount,
    approvedAmount: req.body.approvedAmount,
    statusApproved: req.body.statusApproved,
    statusPayment: req.body.statusPayment,
    approvedBy: req.body.approvedBy,
    tentativePaymentDate: req.body.tentativePaymentDate,
    actualPaymentDate: req.body.actualPaymentDate,
    remainingLimit: req.body.remainingLimit,
    organization: req.body.organization,
    createdDate: Date.now(),
  });
  try {
    const added = await addAllowance.save();
    res.status(200).json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/update-allowance-status", findMongoId, async (req, res) => {
  try {
    res.user.statusPayment = req.body.statusPayment;
    const allowanceStatus = await res.user.save();
    res.json(allowanceStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function findMongoId(req, res, next) {
  let user;
  try {
    user = await allowanceData.findOne({ _id: req.params.id });
    if (user === null) {
      return res.status(400).json({ message: "cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

router.post("/bulk-allowance-data", async (req, res) => {
  const array = req.body.allowanceInfo;
  const payload = [];

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    const allowanceList = new allowanceData({
      name: element.name,
      empId: element.empId,
      requestDate: element.requestDate,
      requestAmount: element.requestAmount,
      approvedAmount: element.approvedAmount,
      statusApproved: element.statusApproved,
      statusPayment: element.statusPayment,
      approvedBy: element.approvedBy,
      tentativePaymentDate: element.tentativePaymentDate,
      actualPaymentDate: element.actualPaymentDate,
      remainingLimit: element.remainingLimit,
      createdDate: element.createdDate,
      organization: element.organization,
    });
    const obj = {
      insertOne: { document: allowanceList },
    };
    payload.push(obj);
  }

  try {
    const addBulkAllowance = allowanceData.bulkWrite([...payload]);
    res.status(200).json(addBulkAllowance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function allowancesData(req, res, next) {
  let data;
  try {
    data = await allowanceData.find({
      empId: req.params.id,
      status: req.body.status,
    });
    if (data === null) {
      return res.status(400).json({ message: "cannot find allowance data" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = data;
  next();
}

router.post("/get-all-emps", async (req, res) => {
  try {
    const data = await userData.find({ organization: req.body.organization });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/get-emp-data", userDataIdCheck, async (req, res) => {
  try {
    res.json(res.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/update-emp-data", payrollMiddleWare, async (req, res) => {
  try {
    res.user.name = req.body.name;
    res.user.empId = req.body.empId;
    res.user.timeOff = req.body.timeOff;
    res.user.cnic = req.body.cnic;
    res.user.opd = req.body.opd;
    res.user.eobi = req.body.eobi;
    res.user.joinDate = req.body.joinDate;
    res.user.endDate = req.body.endDate;
    res.user.accountNumber = req.body.accountNumber;
    res.user.bankName = req.body.bankName;
    res.user.mobileNumber = req.body.mobileNumber;
    res.user.isTaxable = req.body.isTaxable;
    res.user.organization = req.body.organization;

    if (
      res.user.empType[res.user.empType.length - 1].value !== req.body.empType
    ) {
      res.user.empType.push({
        date: Date.now(),
        value: req.body.empType,
      });
    }
    if (
      res.user.department[res.user.department.length - 1].value !==
      req.body.department
    ) {
      res.user.department.push({
        date: Date.now(),
        value: req.body.department,
      });
    }
    if (res.user.salary[res.user.salary.length - 1].value !== req.body.salary) {
      res.user.salary.push({
        date: Date.now(),
        value: req.body.salary,
      });
    }
    if (res.user.tax[res.user.tax.length - 1].value !== req.body.tax) {
      res.user.tax.push({
        date: Date.now(),
        value: req.body.tax,
      });
    }
    if (res.user.status[res.user.status.length - 1].value !== req.body.status) {
      res.user.status.push({
        date: Date.now(),
        value: req.body.status,
      });
    }
    if (
      res.user.designation[res.user.designation.length - 1].value !==
      req.body.designation
    ) {
      res.user.designation.push({
        date: Date.now(),
        value: req.body.designation,
      });
    }

    // const newUserInfo = {
    //   date: Date.now(),
    //   empType: req.body.empType,
    //   department: req.body.department,
    //   salary: req.body.salary,
    //   status: req.body.status,
    //   designation: req.body.designation,
    // };
    // res.user.dataHistory.push(newUserInfo);
    const empData = await res.user.save();
    res.json(empData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add-emp-data", async (req, res) => {
  let user;
  try {
    user = await userData.findOne({
      empId: req.body.empId,
    });
    if (user !== null) {
      return res.status(400).json({ message: "user already exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  const addUser = new userData({
    name: req.body.name,
    empId: req.body.empId,
    timeOff: req.body.timeOff,
    cnic: req.body.cnic,
    opd: req.body.opd,
    eobi: req.body.eobi,
    joinDate: req.body.joinDate,
    endDate: req.body.endDate,
    accountNumber: req.body.accountNumber,
    bankName: req.body.bankName,
    mobileNumber: req.body.mobileNumber,
    isTaxable: req.body.isTaxable,
    organization: req.body.organization,
    salary: [
      {
        date: Date.now(),
        value: req.body.salary,
      },
    ],
    tax: [
      {
        date: Date.now(),
        value: req.body.tax,
      },
    ],
    empType: [
      {
        date: Date.now(),
        value: req.body.empType,
      },
    ],
    department: [
      {
        date: Date.now(),
        value: req.body.department,
      },
    ],
    status: [
      {
        date: Date.now(),
        value: req.body.status,
      },
    ],
    designation: [
      {
        date: Date.now(),
        value: req.body.designation,
      },
    ],
  });
  try {
    const added = await addUser.save();
    res.status(200).json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add-bulk-emp-data", async (req, res) => {
  const array = req.body.userInfo;
  const payload = [];

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    let user;
    try {
      user = await userData.findOne({
        empId: element.empId,
      });
      if (user !== null) {
        continue;
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
    const newUser = new userData({
      name: element.name,
      empId: element.empId,
      timeOff: element.timeOff,
      cnic: element.cnic,
      opd: element.opd,
      eobi: element.eobi,
      joinDate: element.joinDate,
      endDate: element.endDate,
      accountNumber: element.accountNumber,
      bankName: element.bankName,
      mobileNumber: element.mobileNumber,
      isTaxable: element.isTaxable,
      organization: element.organization,
      salary: [...element.salary],
      tax: [...element.tax],
      empType: [
        {
          date: Date.now(),
          value: element.empType,
        },
      ],
      department: [
        {
          date: Date.now(),
          value: element.department,
        },
      ],
      status: [
        {
          date: Date.now(),
          value: element.status,
        },
      ],
      designation: [
        {
          date: Date.now(),
          value: element.designation,
        },
      ],
    });
    const obj = {
      insertOne: { document: newUser },
    };
    payload.push(obj);
  }

  try {
    const addBulkUser = userData.bulkWrite([...payload]);
    res.status(200).json(addBulkUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id/remove-emp-data", payrollMiddleWare, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ status: "true", message: "user deleted" });
  } catch (error) {
    res.status(500).json({ status: "false", message: error.message });
  }
});

router.patch("/:id/modify-emp-data", empMongoId, async (req, res) => {
  try {
    if (req.body.empType) {
      if (
        res.user.empType[res.user.empType.length - 1].value !== req.body.empType
      ) {
        res.user.empType.push({
          date: req.body.date,
          value: req.body.empType,
        });
      }
    }
    if (req.body.department) {
      if (
        res.user.department[res.user.department.length - 1].value !==
        req.body.department
      ) {
        res.user.department.push({
          date: req.body.date,
          value: req.body.department,
        });
      }
    }
    if (req.body.salary) {
      if (
        res.user.salary[res.user.salary.length - 1].value !== req.body.salary
      ) {
        res.user.salary.push({
          date: req.body.date,
          value: req.body.salary,
        });
      }
    }
    if (req.body.tax) {
      if (res.user.tax[res.user.tax.length - 1].value !== req.body.tax) {
        res.user.tax.push({
          date: req.body.date,
          value: req.body.tax,
        });
      }
    }
    if (req.body.status) {
      if (
        res.user.status[res.user.status.length - 1].value !== req.body.status
      ) {
        res.user.status.push({
          date: req.body.date,
          value: req.body.status,
        });
      }
    }
    if (req.body.designation) {
      if (
        res.user.designation[res.user.designation.length - 1].value !==
        req.body.designation
      ) {
        res.user.designation.push({
          date: req.body.date,
          value: req.body.designation,
        });
      }
    }

    const empData = await res.user.save();
    res.json(empData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function payrollMiddleWare(req, res, next) {
  let user;
  try {
    user = await userData.findOne({ empId: req.params.id });
    if (user === null) {
      return res.status(400).json({ message: "cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

async function empMongoId(req, res, next) {
  let user;
  try {
    user = await userData.findOne({ _id: req.params.id });
    if (user === null) {
      return res.status(400).json({ message: "cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

async function userDataIdCheck(req, res, next) {
  let user;
  try {
    console.log("USERDATA", req.params.id);
    user = await userData.findOne({
      empId: req.params.id,
      organization: req.body.organization,
    });
    if (user === null) {
      return res.status(400).json({ message: "cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

router.post("/add-payroll", async (req, res) => {
  let user;
  try {
    user = await payroll.findOne({
      empId: req.body.empId,
    });
    if (user !== null) {
      return res.status(400).json({ message: "user already exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  const addPayroll = new payroll({
    name: req.body.name,
    empId: req.body.empId,
    netPayable: req.body.netPayable,
    organization: req.body.organization,
    salaryDetails: {
      basic: [
        {
          date: Date.now(),
          value: req.body.basic,
        },
      ],

      medicalAllowance: [
        {
          date: Date.now(),
          value: req.body.medicalAllowance,
        },
      ],

      grossSalary: [
        {
          date: Date.now(),
          value: req.body.grossSalary,
        },
      ],
    },

    additions: {
      bonus: [
        {
          date: Date.now(),
          value: req.body.bonus,
        },
      ],
      arrears: [
        {
          date: Date.now(),
          value: req.body.arrears,
        },
      ],
      additionothers: [
        {
          date: Date.now(),
          value: req.body.additionothers,
        },
      ],
      additiontotal: [
        {
          date: Date.now(),
          value: req.body.additiontotal,
        },
      ],
    },

    deductions: {
      eobi: [
        {
          date: Date.now(),
          value: req.body.eobi,
        },
      ],
      loan: [
        {
          date: Date.now(),
          value: req.body.loan,
        },
      ],
      salaryAdvance: [
        {
          date: Date.now(),
          value: req.body.salaryAdvance,
        },
      ],
      incomeTax: [
        {
          date: Date.now(),
          value: req.body.incomeTax,
        },
      ],
      deductionothers: [
        {
          date: Date.now(),
          value: req.body.deductionothers,
        },
      ],
      deductiontotal: [
        {
          date: Date.now(),
          value: req.body.deductiontotal,
        },
      ],
    },
  });
  try {
    const added = await addPayroll.save();
    res.status(200).json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/get-all-payrolls", async (req, res) => {
  try {
    const data = await payroll.find({ organization: req.body.organization });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/get-payroll-data", payrollDataIdCheck, async (req, res) => {
  try {
    res.json(res.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/update-payroll", payrollMiddle, async (req, res) => {
  try {
    res.user.name = req.body.name;
    res.user.empId = req.body.empId;
    res.user.netPayable = req.body.netPayable;
    res.user.organization = req.body.organization;
    res.user.salaryDetails.basic[
      res.user.salaryDetails.basic.length - 1
    ].value = req.body.basic;
    res.user.salaryDetails.medicalAllowance[
      res.user.salaryDetails.medicalAllowance.length - 1
    ].value = req.body.medicalAllowance;
    res.user.salaryDetails.grossSalary[
      res.user.salaryDetails.grossSalary.length - 1
    ].value = req.body.grossSalary;
    res.user.additions.bonus[res.user.additions.bonus.length - 1].value =
      req.body.bonus;
    res.user.additions.arrears[res.user.additions.arrears.length - 1].value =
      req.body.arrears;
    res.user.additions.additionothers[
      res.user.additions.additionothers.length - 1
    ].value = req.body.additionothers;
    res.user.additions.additiontotal[
      res.user.additions.additiontotal.length - 1
    ].value = req.body.additiontotal;
    res.user.deductions.eobi[res.user.deductions.eobi.length - 1].value =
      req.body.eobi;
    res.user.deductions.loan[res.user.deductions.loan.length - 1].value =
      req.body.loan;
    res.user.deductions.salaryAdvance[
      res.user.deductions.salaryAdvance.length - 1
    ].value = req.body.salaryAdvance;
    res.user.deductions.incomeTax[
      res.user.deductions.incomeTax.length - 1
    ].value = req.body.incomeTax;
    res.user.deductions.deductionothers[
      res.user.deductions.deductionothers.length - 1
    ].value = req.body.deductionothers;
    res.user.deductions.deductiontotal[
      res.user.deductions.deductiontotal.length - 1
    ].value = req.body.deductiontotal;

    const payrollData = await res.user.save();
    res.json(payrollData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add-bulk-payrolls", async (req, res) => {
  const array = req.body.payrollInfo;
  const payload = [];

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    let user;
    try {
      user = await payroll.findOne({
        empId: element.empId,
      });
      if (user !== null) {
        continue;
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
    const newPayroll = new payroll({
      name: element.name,
      empId: element.empId,
      netPayable: element.netPayable,
      organization: element.organization,
      salaryDetails: {
        basic: [
          {
            date: Date.now(),
            value: element.basic,
          },
        ],

        medicalAllowance: [
          {
            date: Date.now(),
            value: element.medicalAllowance,
          },
        ],

        grossSalary: [
          {
            date: Date.now(),
            value: element.grossSalary,
          },
        ],
      },
      additions: {
        bonus: [
          {
            date: Date.now(),
            value: element.bonus,
          },
        ],
        arrears: [
          {
            date: Date.now(),
            value: element.arrears,
          },
        ],
        additionothers: [
          {
            date: Date.now(),
            value: element.additionothers,
          },
        ],
        additiontotal: [
          {
            date: Date.now(),
            value: element.additiontotal,
          },
        ],
      },

      deductions: {
        eobi: [
          {
            date: Date.now(),
            value: element.eobi,
          },
        ],
        loan: [
          {
            date: Date.now(),
            value: element.loan,
          },
        ],
        salaryAdvance: [
          {
            date: Date.now(),
            value: element.salaryAdvance,
          },
        ],
        incomeTax: [
          {
            date: Date.now(),
            value: element.incomeTax,
          },
        ],
        deductionothers: [
          {
            date: Date.now(),
            value: element.deductionothers,
          },
        ],
        deductiontotal: [
          {
            date: Date.now(),
            value: element.deductiontotal,
          },
        ],
      },
    });
    const obj = {
      insertOne: { document: newPayroll },
    };
    payload.push(obj);
  }

  try {
    const addBulkPayroll = payroll.bulkWrite([...payload]);
    res.status(200).json(addBulkPayroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id/remove-payroll", payrollMiddle, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ status: "true", message: "payroll deleted" });
  } catch (error) {
    res.status(500).json({ status: "false", message: error.message });
  }
});

async function payrollDataIdCheck(req, res, next) {
  let user;
  try {
    user = await payroll.findOne({
      empId: req.params.id,
      organization: req.body.organization,
    });
    if (user === null) {
      return res.status(400).json({ message: "cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

async function payrollMiddle(req, res, next) {
  let user;
  try {
    user = await payroll.findOne({ empId: req.params.id });
    if (user === null) {
      return res.status(400).json({ message: "cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

module.exports = router;
