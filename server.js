const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const router = require("./server/routes/payroll")
const bodyParser = require("body-parser");
const dotenv = require('dotenv');

// mongoose.connect("mongodb://localhost/payroll");
// const db = mongoose.connection;
// db.on("error", (error) => console.error(error));
// db.once("open", () => console.error("db connected"));

const app = express();
const PORT = 8080;

app.use(cors());

app.use(bodyParser.json());
app.use(router);

// Set up Global configuration access
dotenv.config();

app.listen(PORT, () =>
  console.log(`Server Running on port: http://localhost:${PORT}`)
);

// app.get("/testing", (req, res) => {
//   try {
//     // const users = await payroll.find();
//     res.send({
//       test: "test",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
