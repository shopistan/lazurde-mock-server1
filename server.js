console.log("Error Message");

// Import MongoDB module
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const router = require("./server/routes/payroll")
const bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost/payroll");
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.error("db connected"));

const app = express();
const PORT = 8080;

// Apply CORS policy
app.use(cors());

app.use(bodyParser.json());
app.use("/payroll", router);

// Assign the PORT to the app
app.listen(PORT, () =>
  console.log(`Server Running on port: http://localhost:${PORT}`)
);
