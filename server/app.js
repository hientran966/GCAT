const express = require("express");
const cors = require("cors");
const path = require("path");
const ApiError = require("./app/api-error");
const { verifyToken } = require("./app/middlewares/auth.middleware");

const accountRouter = require("./app/routes/Account.route");
const productRouter = require("./app/routes/Product.route");
const stageRouter = require("./app/routes/Stage.route");
const assignRouter = require("./app/routes/Assign.route");
const reportRouter = require("./app/routes/Report.route");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.json({ message: "Ứng dụng quản lý gia công."});
});
// Import routes
app.use("/api/accounts", accountRouter);

//app.use(verifyToken);
app.use("/api/products", productRouter);
app.use("/api/stages", stageRouter);
app.use("/api/assigns", assignRouter);
app.use("/api/reports", reportRouter);

//handle 404
app.use((req, res, next) => {
    return next(new ApiError(404, "Không tồn tại"));
});

//error handling
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message || "Có lỗi xảy ra",
  });
});


module.exports = app;