const moment = require("moment");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const createOrderController = async (req, res) => {
  try {
    const { order } = req.body;
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      shippingCharge,
      totalAmount,
      totalQuantity,
      totalPrice,
    } = order;
    const newOrder = new Order({
      shippingInfo,
      orderItems,
      paymentInfo,
      shippingCharge,
      totalAmount,
      totalQuantity,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
    await newOrder.save();
    res.status(200).json({
      success: true,
      newOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const getSingleOrderController = async (req, res) => {
  try {
    const { _id } = req.params;
    const order = await Order.findOne({ _id });
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};
const getAllOrderController = async (req, res) => {
  try {
    const { _id } = req.user;
    const orders = await Order.find({ user: _id });
    if (!orders) {
      return res.status(404).json({ message: "Order not found!" });
    }
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};
const getAdminAllOrderController = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = req.query.perPage || 10;
    const orders = await Order.find()
      .skip((page - 1) * parseInt(perPage))
      .limit(parseInt(perPage));

    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    const totalOrder = await Order.countDocuments();

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
      totalOrder,
    });
  } catch (error) {
    console.log(error);
  }
};
const updateOrderController = async (req, res) => {
  try {
    const { _id, status } = req.body;
    const order = await Order.findOne({ _id });
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }
    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "You have already delivered this order",
      });
    }
    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (item) => {
        const { _id, cartQuantity } = item;
        let product = await Product.findOne({ _id });
        product.productStock -= cartQuantity;
        await product.save();
      });
    }
    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
    await order.save();
    res.status(200).json({
      success: true,
      message: "Order Status is updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};
const deleteOrderController = async (req, res) => {
  try {
    const { _id } = req.body;
    const order = await Order.findOneAndDelete({ _id });
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found!",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order is deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const weeklyIncomeController = async (req, res) => {
  try {
    const last7days = moment()
      .day(moment().day() - 7)
      .format("MMMM Do YYYY, h:mm:ss a");
    const income = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(last7days) } },
      },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" },
          sales: "$totalPrice",
        },
      },
      {
        $group: {
          _id: "$day",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json({ success: true, incomeInfo: income });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  createOrderController,
  getSingleOrderController,
  getAllOrderController,
  getAdminAllOrderController,
  updateOrderController,
  deleteOrderController,
  weeklyIncomeController,
};
