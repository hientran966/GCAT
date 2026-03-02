const express = require("express");
const cors = require("cors");
const path = require("path");
const ApiError = require("./app/api-error");
const { verifyToken } = require("./app/middlewares/auth.middleware");

const accountRouter = require("./app/routes/Account.route");
const productRouter = require("./app/routes/Product.route");
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

//handle 404
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

//error handling
app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Internal server error",
  });
});


module.exports = app;