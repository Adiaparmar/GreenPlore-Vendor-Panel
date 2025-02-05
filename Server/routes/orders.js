const { Order } = require("../models/orders");
const { Product } = require("../models/products");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 100;
    const totalPosts = await Order.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page < 1 || page > totalPages) {
      return res.status(404).json({ message: "Page not found" });
    }

    const orderList = await Order.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!orderList) {
      res.status(500).json({ success: false });
    }

    return res.status(200).json({
      orderList: orderList,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

// New route for seller-specific orders
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const page = parseInt(req.query.page) || 1;
    const perPage = 100;

    // Use new with ObjectId constructor
    const query = {
      "products.sellerId": sellerId, // Remove ObjectId conversion
    };

    const totalPosts = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page < 1 || page > totalPages) {
      return res.status(404).json({ message: "Page not found" });
    }

    const orderList = await Order.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      orderList: orderList,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res
      .status(500)
      .json({ message: "The order with the given id was not found." });
  }
  return res.status(200).send(order);
});

router.delete("/:id", async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404).json({
      message: "Order not found",
      success: false,
    });
  }
  res.status(200).json({
    success: true,
    message: "Order is deleted",
  });
});

router.post("/create", async (req, res) => {
  try {
    // Ensure each product in the order has its sellerId
    const productsWithSellerIds = await Promise.all(
      req.body.products.map(async (product) => {
        const fullProduct = await Product.findById(product.productId);
        return {
          ...product,
          sellerId: fullProduct.sellerId,
        };
      })
    );

    let order = new Order({
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      pinCode: req.body.pinCode,
      amount: req.body.amount,
      paymentId: req.body.paymentId,
      email: req.body.email,
      userId: req.body.userId,
      products: productsWithSellerIds,
    });

    if (!order) {
      res.status(500).json({ success: false });
    }
    order = await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      pinCode: req.body.pinCode,
      amount: req.body.amount,
      paymentId: req.body.paymentId,
      email: req.body.email,
      userId: req.body.userId,
      products: req.body.products,
      status: req.body.status,
    },
    { new: true }
  );
  if (!order) {
    return res.status(500).json({ message: "Order cannot be updated!" });
  }
  res.send(order);
});

module.exports = router;
