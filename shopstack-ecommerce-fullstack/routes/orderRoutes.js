const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "COD" } = req.body;

    if (!shippingAddress?.fullName ||
        !shippingAddress?.address ||
        !shippingAddress?.city ||
        !shippingAddress?.postalCode ||
        !shippingAddress?.phone) {
      return res.status(400).json({ message: "Complete shipping address is required" });
    }

    if (paymentMethod !== "COD") {
      return res.status(400).json({ message: "Only Cash on Delivery is enabled in this demo" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of cart.items) {
      if (!item.product || item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product?.name || "an item"}`
        });
      }
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      total,
      paymentMethod
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Could not create order" });
  }
});

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Could not load orders" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: "Invalid order ID" });
  }
});

module.exports = router;
