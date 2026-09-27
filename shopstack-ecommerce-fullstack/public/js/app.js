const state = {
  products: [],
  category: "All",
  search: "",
  cart: null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token")
};

const productsEl = document.getElementById("products");
const categoriesEl = document.getElementById("categories");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

async function api(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

function money(value) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(value);
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2500);
}

function closeModal() {
  modal.classList.add("hidden");
}

function openModal(html) {
  modalContent.innerHTML = html;
  modal.classList.remove("hidden");
}

async function loadProducts() {
  try {
    const params = new URLSearchParams();

    if (state.search) params.set("search", state.search);
    if (state.category !== "All") params.set("category", state.category);

    state.products = await api(`/api/products?${params.toString()}`);
    renderProducts();
    renderCategories();
  } catch (error) {
    toast(error.message);
  }
}

function renderCategories() {
  const allCategories = [
    "All",
    ...new Set(state.products.map(product => product.category))
  ];

  categoriesEl.innerHTML = allCategories.map(category => `
    <button class="category-btn ${state.category === category ? "active" : ""}"
      onclick="selectCategory('${category}')">
      ${category}
    </button>
  `).join("");
}

function selectCategory(category) {
  state.category = category;
  loadProducts();
}

function renderProducts() {
  if (state.products.length === 0) {
    productsEl.innerHTML = "<p>No products found.</p>";
    return;
  }

  productsEl.innerHTML = state.products.map(product => `
    <article class="product">
      <img src="${product.image}" alt="${escapeHtml(product.name)}">
      <div class="product-body">
        <div class="product-category">${escapeHtml(product.category)}</div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="rating">⭐ ${product.rating.toFixed(1)} · ${product.stock} in stock</div>
        <div class="price">${money(product.price)}</div>
        <div class="product-actions">
          <button class="details" onclick="showProduct('${product._id}')">Details</button>
          <button class="add" onclick="addToCart('${product._id}')">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function showProduct(id) {
  try {
    const product = await api(`/api/products/${id}`);

    openModal(`
      <img src="${product.image}" style="width:100%;height:280px;object-fit:cover;border-radius:12px">
      <p class="product-category" style="margin-top:18px">${escapeHtml(product.category)}</p>
      <h2 style="margin:7px 0">${escapeHtml(product.name)}</h2>
      <p style="line-height:1.7;color:#6b7280">${escapeHtml(product.description)}</p>
      <h2 style="margin-top:15px">${money(product.price)}</h2>
      <button class="primary" style="width:100%" onclick="addToCart('${product._id}');closeModal()">
        Add to Cart
      </button>
    `);
  } catch (error) {
    toast(error.message);
  }
}

async function addToCart(productId) {
  if (!state.token) {
    showAuth("login");
    toast("Please login first");
    return;
  }

  try {
    state.cart = await api("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity: 1 })
    });

    updateCartCount();
    toast("Added to cart");
  } catch (error) {
    toast(error.message);
  }
}

async function loadCart() {
  if (!state.token) {
    state.cart = null;
    updateCartCount();
    return;
  }

  try {
    state.cart = await api("/api/cart");
    updateCartCount();
  } catch (error) {
    console.error(error);
  }
}

function updateCartCount() {
  const count = state.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  document.getElementById("cartCount").textContent = count;
}

function showCart() {
  if (!state.token) {
    showAuth("login");
    return;
  }

  const items = state.cart?.items || [];

  if (!items.length) {
    openModal(`
      <h2>Your Cart</h2>
      <p style="margin-top:20px;color:#6b7280">Your cart is empty.</p>
    `);
    return;
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  openModal(`
    <h2>Your Cart</h2>
    <div>
      ${items.map(item => `
        <div class="cart-item">
          <img src="${item.product.image}" alt="">
          <div>
            <strong>${escapeHtml(item.product.name)}</strong>
            <div>${money(item.product.price)}</div>
            <div class="qty">
              <button onclick="changeQty('${item.product._id}', ${item.quantity - 1})">−</button>
              <span>${item.quantity}</span>
              <button onclick="changeQty('${item.product._id}', ${item.quantity + 1})">+</button>
            </div>
          </div>
          <button class="remove" onclick="removeFromCart('${item.product._id}')">Remove</button>
        </div>
      `).join("")}
    </div>

    <div class="total">
      <span>Total</span>
      <span>${money(total)}</span>
    </div>

    <button class="primary" style="width:100%" onclick="showCheckout()">
      Proceed to Checkout
    </button>
  `);
}

async function changeQty(productId, quantity) {
  if (quantity < 1) return removeFromCart(productId);

  try {
    state.cart = await api(`/api/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity })
    });
    updateCartCount();
    showCart();
  } catch (error) {
    toast(error.message);
  }
}

async function removeFromCart(productId) {
  try {
    state.cart = await api(`/api/cart/${productId}`, { method: "DELETE" });
    updateCartCount();
    showCart();
  } catch (error) {
    toast(error.message);
  }
}

function showCheckout() {
  openModal(`
    <h2>Checkout</h2>
    <p style="color:#6b7280;margin-top:5px">Payment: Cash on Delivery</p>

    <form class="form" id="checkoutForm">
      <input name="fullName" placeholder="Full name" required>
      <input name="phone" placeholder="Phone number" required>
      <input name="address" placeholder="Complete address" required>
      <input name="city" placeholder="City" required>
      <input name="postalCode" placeholder="Postal code" required>
      <button type="submit">Place Order</button>
    </form>
  `);

  document.getElementById("checkoutForm").addEventListener("submit", placeOrder);
}

async function placeOrder(event) {
  event.preventDefault();

  const form = new FormData(event.target);
  const shippingAddress = Object.fromEntries(form.entries());

  try {
    const order = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        shippingAddress,
        paymentMethod: "COD"
      })
    });

    await loadCart();

    openModal(`
      <h2>Order Placed 🎉</h2>
      <p style="margin-top:15px">Order ID: <strong>${order._id}</strong></p>
      <p style="margin-top:8px">Total: <strong>${money(order.total)}</strong></p>
      <p style="margin-top:8px;color:#6b7280">Your order will be delivered using Cash on Delivery.</p>
      <button class="primary" style="width:100%" onclick="closeModal()">Continue Shopping</button>
    `);

    loadProducts();
  } catch (error) {
    toast(error.message);
  }
}

function showAuth(mode = "login") {
  const isLogin = mode === "login";

  openModal(`
    <form class="form" id="authForm">
      <h2>${isLogin ? "Welcome Back" : "Create Account"}</h2>
      ${!isLogin ? '<input name="name" placeholder="Full name" required>' : ""}
      <input name="email" type="email" placeholder="Email" required>
      <input name="password" type="password" placeholder="Password (min 6 characters)" required>
      <button type="submit">${isLogin ? "Login" : "Create Account"}</button>
      <button type="button" class="link-btn" id="switchAuth">
        ${isLogin ? "Create a new account" : "Already have an account? Login"}
      </button>
    </form>
  `);

  document.getElementById("authForm").addEventListener("submit", event => {
    event.preventDefault();
    submitAuth(event, isLogin);
  });

  document.getElementById("switchAuth").addEventListener("click", () => {
    showAuth(isLogin ? "register" : "login");
  });
}

async function submitAuth(event, isLogin) {
  const form = new FormData(event.target);
  const body = Object.fromEntries(form.entries());

  try {
    const data = await api(`/api/auth/${isLogin ? "login" : "register"}`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    state.token = data.token;
    state.user = data.user;

    localStorage.setItem("token", state.token);
    localStorage.setItem("user", JSON.stringify(state.user));

    closeModal();
    await loadCart();
    updateAuthButton();
    toast(`Welcome, ${state.user.name}`);
  } catch (error) {
    toast(error.message);
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  state.token = null;
  state.user = null;
  state.cart = null;
  updateCartCount();
  updateAuthButton();
  toast("Logged out");
}

function updateAuthButton() {
  const button = document.getElementById("authBtn");

  if (state.user) {
    button.textContent = "Logout";
    button.onclick = logout;
  } else {
    button.textContent = "Login";
    button.onclick = () => showAuth("login");
  }
}

async function showOrders() {
  if (!state.token) {
    showAuth("login");
    return;
  }

  try {
    const orders = await api("/api/orders/my-orders");

    openModal(`
      <h2>My Orders</h2>
      ${
        orders.length
          ? orders.map(order => `
            <div class="order">
              <strong>Order #${order._id.slice(-8)}</strong>
              <p style="margin-top:7px">Total: ${money(order.total)}</p>
              <p>Status: <strong>${order.status}</strong></p>
              <p style="color:#6b7280;margin-top:5px">
                ${new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          `).join("")
          : "<p style='margin-top:20px'>You have no orders yet.</p>"
      }
    `);
  } catch (error) {
    toast(error.message);
  }
}

document.getElementById("searchButton").addEventListener("click", () => {
  state.search = document.getElementById("searchInput").value.trim();
  state.category = "All";
  loadProducts();
});

document.getElementById("searchInput").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    document.getElementById("searchButton").click();
  }
});

document.getElementById("cartBtn").addEventListener("click", showCart);
document.getElementById("ordersBtn").addEventListener("click", showOrders);

updateAuthButton();
loadProducts();
loadCart();
