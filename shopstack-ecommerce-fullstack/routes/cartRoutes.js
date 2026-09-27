const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate("items.product");
  }
  return cart;
}

router.get("/", protect, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Could not load cart" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });
    if (quantity > product.stock) return res.status(400).json({ message: "Not enough stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const item = cart.items.find(i => i.product.toString() === productId);

    if (item) {
      if (item.quantity + quantity > product.stock) {
        return res.status(400).json({ message: "Not enough stock" });
      }
      item.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate("items.product");
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: "Could not add item to cart" });
  }
});

router.put("/:productId", protect, async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    const product = await Product.findById(req.params.productId);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart?.items.find(i => i.product.toString() === req.params.productId);

    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    await cart.save();

    res.json(await Cart.findById(cart._id).populate("items.product"));
  } catch (error) {
    res.status(500).json({ message: "Could not update cart" });
  }
});

router.delete("/:productId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(await Cart.findById(cart._id).populate("items.product"));
  } catch (error) {
    res.status(500).json({ message: "Could not remove item" });
  }
});

module.exports = router;
