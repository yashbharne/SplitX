const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./db/dbconnection.js");
const cookieParser = require("cookie-parser");

dotenv.config({
  path: "./.env",
});
const Port = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:8100",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const UserRouter = require("./routes/user.route.js");
const GroupRouter = require("./routes/group.route.js");
const ExpenseRouter = require("./routes/groupExpense.route.js");
app.use("/api/user", UserRouter);
app.use("/api/group", GroupRouter);
app.use("/api/groupExpense", ExpenseRouter);

const startServer = async () => {
  try {
    if (!process.env.DB_URI || !process.env.DB_NAME) {
      throw new Error("DB URL and DB name should be defined");
    }
    await connectDB();
    app.listen(Port, () => {
      console.log("Server started", Port);
    });
  } catch (error) {
    console.log("Something went wrong: ", error);
  }
};
startServer();
