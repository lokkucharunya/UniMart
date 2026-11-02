
import { useEffect, useState, useCallback } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

const initialProducts = [
  { id: 1, name: "PET", category: "Books", price: 250, oldPrice: 450, condition: "Good", image: "https://assets.cambridge.org/97811085/25213/large_cover/9781108525213i.jpg", color: "#f3e8d8" },
  { id: 2, name: "Scientific Calculator", category: "Electronics", price: 450, oldPrice: 800, condition: "Like New", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTroS39Sop_kG8xbt4wcwwAC3TgrM6bAQXVPUectYrIu4xakDk9joGQ_AyUSIRjPzBiXFemSRROajguJPBQI_G02JqY4n5JxmaLH7fPwendFw_t_jYDG3TiQ45VdVHDYZ-79jTbND0&usqp=CAc", color: "#e0e9ff" },
  { id: 3, name: "Wireless Headphones", category: "Electronics", price: 699, oldPrice: 1200, condition: "Good", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", color: "#f4e2ee" },
  { id: 4, name: "College Backpack", category: "Accessories", price: 399, oldPrice: 750, condition: "Like New", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", color: "#dceee5" },
  { id: 5, name: "Java Programming", category: "Books", price: 180, oldPrice: 350, condition: "Good", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT2lyJ7AzbjwVsvN9uwExWne-rrTomDXdcbO0pKwF_UiBi03w-nQkiS01S2JX4j1qeao4COiDgJFZfsRH0L3SuGshOYwH7KpCohhn2bWj5vCyyFz06014SR&usqp=CAc", color: "#f6e8cf" },
  { id: 6, name: "Study Desk Lamp", category: "Essentials", price: 299, oldPrice: 500, condition: "Good", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600", color: "#e7e4fb" },
  { id: 7, name: "Laptop Stand", category: "Electronics", price: 349, oldPrice: 600, condition: "Like New", image: "https://m.media-amazon.com/images/I/61F20gXJS3L._AC_UF1000,1000_QL80_.jpg", color: "#dceaf0" },
  { id: 8, name: "Notebook Set", category: "Essentials", price: 120, oldPrice: 200, condition: "New", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600", color: "#f3e0df" },
  { id: 9, name: "Wireless Mouse", category: "Electronics", price: 299, oldPrice: 550, condition: "Good", image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600", color: "#e0e9ff" },
  { id: 10, name: "Mechanical Keyboard", category: "Electronics", price: 899, oldPrice: 1500, condition: "Like New", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", color: "#f4e2ee" },
  { id: 11, name: "Power Bank", category: "Electronics", price: 499, oldPrice: 850, condition: "Good", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600", color: "#dceee5" },
  { id: 12, name: "Smart Watch", category: "Electronics", price: 799, oldPrice: 1400, condition: "Like New", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", color: "#f6e8cf" },
  { id: 13, name: "Water Bottle", category: "Essentials", price: 199, oldPrice: 350, condition: "New", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600", color: "#e7e4fb" },
  { id: 14, name: "Wireless Earbuds", category: "Electronics", price: 599, oldPrice: 1000, condition: "Good", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600", color: "#f3e0df" },
  { id: 17, name: "Engineering Drafter", category: "Essentials", price: 180, oldPrice: 350, condition: "Good", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6HjVHeSUxHpfgeMg-_rsh9nwSJ30SJNCRQ-CzPCf8UA&s=10", color: "#e7e4fb" },
  { id: 18, name: "Lab Coat", category: "Accessories", price: 299, oldPrice: 500, condition: "Like New", image: "https://kewalson.com/cdn/shop/files/BlueCottonLabCoat_KS_COLABD.jpg?v=1758271247", color: "#dceee5" }
];

const categories = [
  "All Items",
  "Books",
  "Electronics",
  "Accessories",
  "Essentials"
];

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("unimartUser"));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("unimartToken") || ""
  );

  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);

  const [products, setProducts] = useState(initialProducts);
  const [myProducts, setMyProducts] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Items");
  const [showSell, setShowSell] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showListings, setShowListings] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRequest, setShowRequest] = useState(false);

  const [requestLoading, setRequestLoading] = useState(false);

  const isSeller = user?.role === "seller";
  const isPurchaser = user?.role === "purchaser";

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("unimartToken") || ""}`
  }), []);

  // Load marketplace products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API}/products`);

      if (!response.ok) {
        throw new Error("Unable to load products");
      }

      const data = await response.json();

      setProducts((previous) => {
        const databaseProducts = data.map((product) => ({
          ...product,
          id: product._id,
          color: "#e7e4fb"
        }));

        const databaseNames = new Set(
          databaseProducts.map((item) => item.name.toLowerCase())
        );

        const staticProducts = previous.filter(
          (item) =>
            !item._id &&
            !databaseNames.has(item.name.toLowerCase())
        );

        return [...databaseProducts, ...staticProducts];
      });
    } catch (error) {
      console.log("Product loading error:", error);
    }
  }, []);

  // Load seller's own products
  const fetchMyProducts = useCallback(async () => {
    if (!token || !isSeller) return;

    try {
      const response = await fetch(`${API}/products/mine`, {
        headers: authHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your listings");
      }

      setMyProducts(data);
    } catch (error) {
      console.log("My products error:", error);
    }
  }, [token, isSeller, authHeaders]);

  // Load requests belonging to the logged-in user
  const fetchRequests = useCallback(async () => {
    if (!token) return;

    setRequestLoading(true);

    try {
      const response = await fetch(`${API}/requests`, {
        headers: authHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load requests");
      }

      setPurchaseRequests(data);
    } catch (error) {
      console.log("Request loading error:", error);
    } finally {
      setRequestLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (token && user) {
      fetchRequests();

      if (isSeller) {
        fetchMyProducts();
      }
    }
  }, [token, user, isSeller, fetchRequests, fetchMyProducts]);

  // Login and registration
  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password")
    };

    if (authMode === "register") {
      payload.name = formData.get("name");
      payload.role = formData.get("role");
    }

    try {
      const endpoint =
        authMode === "login" ? "/auth/login" : "/auth/register";

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed");
      }

      localStorage.setItem("unimartToken", result.token);
      localStorage.setItem("unimartUser", JSON.stringify(result.user));

      setToken(result.token);
      setUser(result.user);

      setProducts(initialProducts);
      setMyProducts([]);
      setPurchaseRequests([]);
      setShowSaved(false);
      setShowListings(false);

    } catch (error) {
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("unimartToken");
    localStorage.removeItem("unimartUser");

    setToken("");
    setUser(null);
    setMyProducts([]);
    setPurchaseRequests([]);
    setSavedIds([]);
    setShowSell(false);
    setShowRequest(false);
    setSelectedProduct(null);
    setShowSaved(false);
    setShowListings(false);
  };

  // Search and category filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Items" || product.category === category;

    const matchesSaved =
      !showSaved || savedIds.includes(product.id);

    return matchesSearch && matchesCategory && matchesSaved;
  });

  const toggleSaved = (id) => {
    setSavedIds((previous) =>
      previous.includes(id)
        ? previous.filter((savedId) => savedId !== id)
        : [...previous, id]
    );
  };

  const openMarketplace = () => {
    setShowSaved(false);
    setShowListings(false);
    setCategory("All Items");
    setSearch("");

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const openSavedItems = () => {
    setShowSaved(true);
    setShowListings(false);
    setCategory("All Items");
    setSearch("");

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const openPurchaseRequests = () => {
    document.getElementById("purchase-requests")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const openMyListings = () => {
    setShowSaved(false);
    setShowListings(true);

    document.getElementById("my-listings")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const selectCategory = (item) => {
    setShowSaved(false);
    setShowListings(false);
    setCategory(item);
  };

  // Add product - seller only
  const handleSellSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const newProduct = {
      name: formData.get("name"),
      category: formData.get("category"),
      price: Number(formData.get("price")),
      oldPrice: formData.get("oldPrice")
        ? Number(formData.get("oldPrice"))
        : undefined,
      condition: formData.get("condition"),
      image: formData.get("image")
    };

    try {
      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(newProduct)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to add product");
      }

      setShowSell(false);
      await fetchProducts();
      await fetchMyProducts();

      alert("Your item has been listed successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  // Delete seller's own product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/products/${productId}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete product");
      }

      setMyProducts((previous) =>
        previous.filter((product) => product._id !== productId)
      );

      await fetchProducts();
      await fetchRequests();

      alert("Product deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  // Submit purchase request - purchaser only
  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProduct?._id) {
      alert("This item is not available for requests yet.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API}/requests`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          product: selectedProduct._id,
          message: formData.get("message")
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit request");
      }

      alert("Purchase request submitted successfully!");

      setShowRequest(false);
      setSelectedProduct(null);
      await fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  // Seller accepts, rejects, or completes a request
  const handleRequestStatus = async (requestId, status) => {
    try {
      const response = await fetch(`${API}/requests/${requestId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update request");
      }

      await fetchRequests();

      alert(`Request ${status.toLowerCase()} successfully!`);
    } catch (error) {
      alert(error.message);
    }
  };

  const pendingCount = purchaseRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const completedCount = purchaseRequests.filter(
    (request) => request.status === "Completed"
  ).length;

  const acceptedCount = purchaseRequests.filter(
    (request) => request.status === "Accepted"
  ).length;

  const rejectedCount = purchaseRequests.filter(
    (request) => request.status === "Rejected"
  ).length;

  // Login and registration screen
  if (!user || !token) {
    return (
      <div className="unimart-auth-page">
        <div className="unimart-auth-card">
          <div className="unimart-auth-brand">
            <span className="brand-icon">U</span>
            <span>uni<span className="brand-accent">mart</span></span>
          </div>

          <div className="unimart-auth-content">
            <span className="section-kicker">
              YOUR CAMPUS. YOUR MARKETPLACE.
            </span>

            <h1>
              {authMode === "login"
                ? "Welcome back!"
                : "Create your account"}
            </h1>

            <p>
              {authMode === "login"
                ? "Login to continue exploring UniMart."
                : "Join your campus marketplace today."}
            </p>

            <form onSubmit={handleAuthSubmit}>
              {authMode === "register" && (
                <>
                  <label>
                    Full name
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      required
                    />
                  </label>

                  <label>
                    I want to join as
                    <select name="role" defaultValue="purchaser" required>
                      <option value="purchaser">Purchaser</option>
                      <option value="seller">Seller</option>
                    </select>
                  </label>
                </>
              )}

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  minLength="6"
                  required
                />
              </label>

              <button
                className="primary-button modal-submit"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Login →"
                    : "Create account →"}
              </button>
            </form>

            <div className="unimart-auth-switch">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                {authMode === "login" ? " Register" : " Login"}
              </button>
            </div>
          </div>

          <div className="unimart-auth-footer">
            Made for students ♡
          </div>
        </div>

        <div className="unimart-auth-visual">
          <span className="welcome-label">BUY SMART. SELL EASY.</span>
          <h2>Your campus marketplace starts here.</h2>
          <p>
            Discover affordable products, connect with students
            and give your unused items a new home.
          </p>

          <div className="unimart-auth-visual-icon">🛍️</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a href="#home" className="brand">
          <span className="brand-icon">U</span>
          <span>uni<span className="brand-accent">mart</span></span>
        </a>

        <div className="sidebar-label">MENU</div>

        <nav className="sidebar-nav">
          <a
            href="#home"
            className="sidebar-link active"
            onClick={() => {
              setShowSaved(false);
              setShowListings(false);
            }}
          >
            <span>⌂</span> Dashboard
          </a>

          <a
            href="#products"
            className="sidebar-link"
            onClick={openMarketplace}
          >
            <span>▦</span> Marketplace
          </a>

          <a
            href="#categories"
            className="sidebar-link"
            onClick={() => {
              setShowSaved(false);
              setShowListings(false);
            }}
          >
            <span>◈</span> Categories
          </a>

          {isSeller && (
            <>
              <button className="sidebar-link" onClick={openPurchaseRequests}>
                <span>▤</span> Purchase Requests
                <span className="sidebar-count">{pendingCount}</span>
              </button>

              <button className="sidebar-link" onClick={openMyListings}>
                <span>▣</span> My Listed Products
              </button>
            </>
          )}

          {isPurchaser && (
            <button
              className="sidebar-link"
              onClick={openPurchaseRequests}
            >
              <span>▤</span> My Requests
              <span className="sidebar-count">{purchaseRequests.length}</span>
            </button>
          )}

          <button
            className={`sidebar-link ${showSaved ? "active" : ""}`}
            onClick={openSavedItems}
          >
            <span>♡</span> Saved Items
            <span className="sidebar-count">{savedIds.length}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-card">
            <div className="sidebar-card-icon">✦</div>
            <h3>
              {isSeller ? "Have something to sell?" : "Find your next favourite"}
            </h3>
            <p>
              {isSeller
                ? "Give your unused items a new home."
                : "Explore affordable finds from students."}
            </p>

            {isSeller && (
              <button onClick={() => setShowSell(true)}>
                + List an item
              </button>
            )}

            {isPurchaser && (
              <button onClick={openMarketplace}>
                Explore items
              </button>
            )}
          </div>

          <div className="sidebar-footer">
            Made for students ♡
          </div>
        </div>
      </aside>

      <main className="dashboard-main" id="home">
        <header className="dashboard-topbar">
          <div>
            <span className="topbar-date">
              UNIMART / {user.role.toUpperCase()} ACCOUNT
            </span>

            <h2>
              {showSaved
                ? "Saved Items"
                : showListings
                  ? "My Listed Products"
                  : "Dashboard"}
            </h2>
          </div>

          <div className="topbar-actions">
            <div className="dashboard-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search anything..."
                aria-label="Search products"
              />
            </div>

            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <button className="dashboard-sell-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div className="welcome-content">
            <span className="welcome-label">
              YOUR CAMPUS. YOUR MARKETPLACE.
            </span>

            <h1>Welcome, {user.name}!</h1>

            <p>
              {isSeller
                ? "Manage your listings and connect with students interested in your products."
                : "Discover affordable finds from fellow students. Buy smart, save more, and give items a second life."}
            </p>

            <button
              className="welcome-button"
              onClick={openMarketplace}
            >
              Explore marketplace <span>→</span>
            </button>
          </div>

          <div className="hero-illustration">
            <img
              src="https://png.pngtree.com/png-vector/20260928/ourmid/pngtree-cute-purple-shopping-cart-full-of-colorful-gift-boxes-and-presents-png-image_20229028.webp"
              alt="Shopping cart"
            />
          </div>
        </section>

        <section className="overview-grid">
          <div className="overview-card">
            <div className="overview-icon">▦</div>
            <div>
              <p>{isSeller ? "My Listings" : "Total Listings"}</p>
              <h2>{isSeller ? myProducts.length : products.length}</h2>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">♡</div>
            <div>
              <p>Saved Items</p>
              <h2>{savedIds.length}</h2>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">◈</div>
            <div>
              <p>{isSeller ? "Pending Requests" : "My Requests"}</p>
              <h2>{isSeller ? pendingCount : purchaseRequests.length}</h2>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">✓</div>
            <div>
              <p>Completed Requests</p>
              <h2>{completedCount}</h2>
            </div>
          </div>
        </section>

        {/* Seller's incoming requests OR purchaser's own requests */}
        <section className="purchase-requests-section" id="purchase-requests">
          <div className="product-heading">
            <div>
              <span className="section-kicker">
                {isSeller ? "SELLER DASHBOARD" : "PURCHASER DASHBOARD"}
              </span>

              <h2>
                {isSeller ? "Purchase Requests" : "My Purchase Requests"}
              </h2>

              <p>
                {isSeller
                  ? "Manage requests from students interested in your products."
                  : "Track the status of products you have requested."}
              </p>
            </div>

            <button
              className="dashboard-sell-button"
              onClick={fetchRequests}
              disabled={requestLoading}
            >
              {requestLoading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          <div className="request-summary">
            <div>
              <span>Total Requests</span>
              <strong>{purchaseRequests.length}</strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>

            <div>
              <span>Accepted</span>
              <strong>{acceptedCount}</strong>
            </div>

            <div>
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedCount}</strong>
            </div>
          </div>

          {requestLoading ? (
            <div className="dashboard-empty">
              <p>Loading requests...</p>
            </div>
          ) : purchaseRequests.length === 0 ? (
            <div className="dashboard-empty">
              <span>▤</span>
              <h3>No requests yet</h3>
              <p>
                {isSeller
                  ? "Requests for your listed products will appear here."
                  : "Your submitted purchase requests will appear here."}
              </p>
            </div>
          ) : (
            <div className="purchase-request-list">
              {purchaseRequests.map((request) => (
                <article className="purchase-request-card" key={request._id}>
                  <div className="purchase-request-top">
                    <div>
                      <span className="section-kicker">
                        {isSeller ? "BUYER REQUEST" : "YOUR REQUEST"}
                      </span>

                      <h3>
                        {request.product?.name || "Product unavailable"}
                      </h3>

                      <strong className="request-price">
                        ₹{request.product?.price ?? "—"}
                      </strong>
                    </div>

                    <span
                      className={`request-status ${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  {isPurchaser && request.status === "Completed" && (
                    <p>
                      ✓ The seller has marked this order as completed.
                    </p>
                  )}

                  {isSeller && (
                    <div className="request-buyer-details">
                      <p><strong>Buyer:</strong> {request.buyerName}</p>
                      <p><strong>Email:</strong> {request.buyerEmail}</p>
                    </div>
                  )}

                  {isPurchaser && (
                    <div className="request-buyer-details">
                      <p>
                        <strong>Seller:</strong>{" "}
                        {request.product?.seller || "Student"}
                      </p>
                    </div>
                  )}

                  <div className="request-buyer-details">
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {request.message && (
                    <div className="request-message">
                      <strong>Message</strong>
                      <p>{request.message}</p>
                    </div>
                  )}

                  {isSeller && request.status === "Pending" && (
                    <div className="request-actions">
                      <button
                        className="request-accept-button"
                        onClick={() =>
                          handleRequestStatus(request._id, "Accepted")
                        }
                      >
                        ✓ Accept
                      </button>

                      <button
                        className="request-reject-button"
                        onClick={() =>
                          handleRequestStatus(request._id, "Rejected")
                        }
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  {isSeller && request.status === "Accepted" && (
                    <div className="request-actions">
                      <button
                        className="request-accept-button"
                        onClick={() =>
                          handleRequestStatus(request._id, "Completed")
                        }
                      >
                        ✓ Mark as Completed
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Seller's own listings */}
        {isSeller && (
          <section className="my-listings-section" id="my-listings">
            <div className="product-heading">
              <div>
                <span className="section-kicker">SELLER DASHBOARD</span>
                <h2>My Listed Products</h2>
                <p>View and manage only the products listed by you.</p>
              </div>

              <button
                className="dashboard-sell-button"
                onClick={() => setShowSell(true)}
              >
                + List an item
              </button>
            </div>

            <div className="my-listings-summary">
              <span>Total listed products</span>
              <strong>{myProducts.length}</strong>
            </div>

            {myProducts.length === 0 ? (
              <div className="dashboard-empty">
                <span>▣</span>
                <h3>No listed products yet</h3>
                <p>Products you add will appear here.</p>
                <button onClick={() => setShowSell(true)}>
                  List your first item
                </button>
              </div>
            ) : (
              <div className="my-listings-list">
                {myProducts.map((product) => (
                  <article className="my-listing-card" key={product._id}>
                    <img
                      src={product.image || "https://placehold.co/120x120?text=No+Image"}
                      alt={product.name}
                    />

                    <div className="my-listing-info">
                      <span className="dashboard-product-category">
                        {product.category}
                      </span>
                      <h3>{product.name}</h3>
                      <strong>₹{product.price}</strong>
                      <p>Condition: {product.condition}</p>
                    </div>

                    <button
                      className="my-listing-delete"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="dashboard-categories" id="categories">
          <div className="dashboard-section-heading">
            <div>
              <span className="section-kicker">BROWSE BY CATEGORY</span>
              <h2>Explore categories</h2>
            </div>
          </div>

          <div className="dashboard-category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={`dashboard-category ${
                  category === item && !showSaved ? "selected" : ""
                }`}
                onClick={() => selectCategory(item)}
              >
                {item === "All Items" && "✦"}
                {item === "Books" && "📚"}
                {item === "Electronics" && "🎧"}
                {item === "Accessories" && "🎒"}
                {item === "Essentials" && "✏️"}
                <span>{item}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Marketplace */}
        <section className="dashboard-products" id="products">
          <div className="product-heading">
            <div>
              <span className="section-kicker">
                {showSaved ? "YOUR FAVOURITE PRODUCTS" : "HANDPICKED FOR STUDENTS"}
              </span>

              <h2>{showSaved ? "Saved Items" : "Marketplace"}</h2>

              <p>
                {showSaved
                  ? "Here are the products you have saved."
                  : "Find useful things at student-friendly prices."}
              </p>
            </div>

            {isSeller && (
              <button
                className="dashboard-sell-button"
                onClick={() => setShowSell(true)}
              >
                + Sell an item
              </button>
            )}
          </div>

          <div className="dashboard-product-grid">
            {filteredProducts.map((product) => (
              <article className="dashboard-product-card" key={product.id}>
                <div
                  className="dashboard-product-image"
                  style={{ backgroundColor: product.color || "#e7e4fb" }}
                >
                  <span className="dashboard-condition">
                    {product.condition}
                  </span>

                  <img
                    src={product.image || "https://placehold.co/300x300?text=No+Image"}
                    alt={product.name}
                    className="product-photo"
                  />

                  <button
                    className={`dashboard-heart ${
                      savedIds.includes(product.id) ? "hearted" : ""
                    }`}
                    aria-label={`Save ${product.name}`}
                    aria-pressed={savedIds.includes(product.id)}
                    onClick={() => toggleSaved(product.id)}
                  >
                    {savedIds.includes(product.id) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="dashboard-product-info">
                  <span className="dashboard-product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="dashboard-price">
                    <strong>₹{product.price}</strong>

                    {product.oldPrice && (
                      <>
                        <del>₹{product.oldPrice}</del>
                        <span>
                          {Math.round(
                            (1 - product.price / product.oldPrice) * 100
                          )}% off
                        </span>
                      </>
                    )}
                  </div>

                  {isPurchaser ? (
                    <button
                      className="dashboard-view-button"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowRequest(true);
                      }}
                    >
                      Request item <span>↗</span>
                    </button>
                  ) : (
                    <div className="dashboard-view-button">
                      Marketplace item
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="dashboard-empty">
              <span>{showSaved ? "♡" : "🔎"}</span>
              <h3>{showSaved ? "No saved items yet" : "No items found"}</h3>
              <p>
                {showSaved
                  ? "Click the heart icon on a product to save it here."
                  : "Try another search or category."}
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All Items");
                  setShowSaved(false);
                }}
              >
                {showSaved ? "Explore marketplace" : "Clear filters"}
              </button>
            </div>
          )}
        </section>

        <footer className="dashboard-footer">
          <span>© 2026 UniMart</span>
          <span>Made for students, by students ♡</span>
        </footer>
      </main>

      {/* Seller: List item modal */}
      {showSell && isSeller && (
        <div className="modal-backdrop" onClick={() => setShowSell(false)}>
          <form
            className="sell-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSellSubmit}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowSell(false)}
            >
              ×
            </button>

            <span className="section-kicker">SELL ON UNIMART</span>
            <h2>List your item</h2>
            <p>Tell fellow students what you're selling.</p>

            <label>
              Item name
              <input name="name" required placeholder="e.g. Java programming book" />
            </label>

            <label>
              Category
              <select name="category" defaultValue="Books">
                {categories.slice(1).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Price (₹)
              <input name="price" type="number" min="1" required placeholder="e.g. 250" />
            </label>

            <label>
              Original price (₹), optional
              <input name="oldPrice" type="number" min="1" placeholder="e.g. 500" />
            </label>

            <label>
              Condition
              <select name="condition" defaultValue="Good">
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </label>

            <label>
              Image URL
              <input name="image" type="url" placeholder="Paste your product image link" />
            </label>

            <button className="primary-button modal-submit" type="submit">
              List item →
            </button>
          </form>
        </div>
      )}

      {/* Purchaser: Purchase request modal */}
      {showRequest && selectedProduct && isPurchaser && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setShowRequest(false);
            setSelectedProduct(null);
          }}
        >
          <form
            className="sell-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleRequestSubmit}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => {
                setShowRequest(false);
                setSelectedProduct(null);
              }}
            >
              ×
            </button>

            <span className="section-kicker">UNIMART MARKETPLACE</span>
            <h2>Request this item</h2>

            <p>
              You're interested in <strong>{selectedProduct.name}</strong>.
            </p>

            <div className="request-product-summary">
              <strong>{selectedProduct.name}</strong>
              <p>Price: ₹{selectedProduct.price}</p>
              <p>Condition: {selectedProduct.condition}</p>
            </div>

            <label>
              Message to seller (optional)
              <textarea
                name="message"
                rows="3"
                placeholder="I'm interested in buying this item..."
              />
            </label>

            <button className="primary-button modal-submit" type="submit">
              Submit purchase request →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
