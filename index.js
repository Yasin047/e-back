const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");

const connectDB = require("./config/database");
const productRoutes = require("./routes/productRoutes");
const productReviewsRoutes = require("./routes/productReviewsRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", productRoutes);
app.use("/api", productReviewsRoutes);
app.use("/api", orderRoutes);
app.use("/api", userRoutes);
app.use("/api", paymentRoutes);

app.use("/", (req, res) => {
  res.send("server is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`server is running at port ${PORT}`);
});
