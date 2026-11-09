import { useEffect, useState } from "react";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { auth, db } from "../firebase/config";
import "./Admin.css";

const ADMIN_UID = "ngDugWaSHhhyBfqd4zo1nNb1bwu2";

function Admin() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "smartphones",
    description: "",
    cashPrice: "",
    loanDeposit: "",
    stock: "",
    available: true,
    imageUrl: ""
  });

  const [saving, setSaving] = useState(false);

  // Check administrator authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.uid === ADMIN_UID) {
        setUser(currentUser);
        setError("");
      } else {
        setUser(null);

        if (currentUser) {
          await signOut(auth);
          setError("You are not authorised to access this dashboard.");
        }
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Load products
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const productList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));

        setProducts(productList);
      },
      (err) => {
        console.error("Product loading error:", err);
        setError("Unable to load products. Check Firebase permissions.");
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Check your email and password.");
    }
  };

  // Form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);

    setForm({
      name: "",
      brand: "",
      category: "smartphones",
      description: "",
      cashPrice: "",
      loanDeposit: "",
      stock: "",
      available: true,
      imageUrl: ""
    });
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const productData = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        description: form.description.trim(),
        cashPrice: Number(form.cashPrice),
        loanDeposit: Number(form.loanDeposit),
        stock: Number(form.stock),
        available: form.available,
        imageUrl: form.imageUrl.trim(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(
          doc(db, "products", editingId),
          productData
        );

        alert("Product updated successfully!");
      } else {
        await addDoc(
          collection(db, "products"),
          {
            ...productData,
            createdAt: new Date().toISOString()
          }
        );

        alert("Product added successfully!");
      }

      resetForm();

    } catch (err) {
      console.error("Saving product error:", err);

      setError(
        "Unable to save product: " + err.message
      );

    } finally {
      setSaving(false);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "smartphones",
      description: product.description || "",
      cashPrice: product.cashPrice ?? product.cashprice ?? "",
      loanDeposit: product.loanDeposit ?? product["loan deposit"] ?? "",
      stock: product.stock ?? "",
      available: product.available ?? true,
      imageUrl: product.imageUrl || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete product
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", id));
      alert("Product deleted successfully!");

    } catch (err) {
      console.error("Delete error:", err);
      setError("Unable to delete product: " + err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      setError("Unable to log out.");
    }
  };

  // Checking access
  if (checking) {
    return (
      <div className="admin-page">
        Checking administrator access...
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="admin-login">
        <form onSubmit={handleLogin} className="login-box">

          <h1>ZION</h1>
          <h2>Administrator Login</h2>

          <p>Sign in to manage your shop.</p>

          {error && (
            <p className="admin-error">{error}</p>
          )}

          <input
            type="email"
            placeholder="Administrator email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login to Dashboard
          </button>

          <a href="/">
            Return to Customer Website
          </a>

        </form>
      </div>
    );
  }

  // Administrator dashboard
  return (
    <div className="admin-page">

      <header className="admin-header">
        <h2>ZION MOBILE PHONES</h2>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="admin-content">

        <h1>Admin Dashboard</h1>

        <p>Welcome to your shop management centre.</p>

        {/* Dashboard statistics */}
        <div className="admin-stats">

          <div>
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>

          <div>
            <h3>
              {products.filter((p) => p.available).length}
            </h3>
            <p>Available Products</p>
          </div>

          <div>
            <h3>
              {products.reduce(
                (sum, p) => sum + Number(p.stock || 0),
                0
              )}
            </h3>
            <p>Total Stock</p>
          </div>

        </div>

        {/* Add and edit products */}
        <section className="admin-form-section">

          <h2>
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          {error && (
            <p className="admin-error">{error}</p>
          )}

          <form
            onSubmit={handleSubmit}
            className="product-form"
          >

            <input
              name="name"
              placeholder="Product name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="brand"
              placeholder="Brand"
              value={form.brand}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="smartphones">Smartphones</option>
              <option value="smartwatches">Smartwatches</option>
              <option value="earphones">Earphones</option>
              <option value="phone covers">Phone Covers</option>
              <option value="accessories">Accessories</option>
            </select>

            <textarea
              name="description"
              placeholder="Product description"
              value={form.description}
              onChange={handleChange}
            />

            <input
              type="number"
              name="cashPrice"
              placeholder="Cash price (UGX)"
              value={form.cashPrice}
              onChange={handleChange}
              min="0"
              required
            />

            <input
              type="number"
              name="loanDeposit"
              placeholder="Loan deposit (UGX)"
              value={form.loanDeposit}
              onChange={handleChange}
              min="0"
              required
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock quantity"
              value={form.stock}
              onChange={handleChange}
              min="0"
              required
            />

            {/* Product image URL instead of file upload */}
            <label className="image-label">
              Product Image URL

              <input
                type="url"
                name="imageUrl"
                placeholder="Paste product image URL here"
                value={form.imageUrl}
                onChange={handleChange}
              />
            </label>

            {form.imageUrl && (
              <div>
                <p>Image Preview:</p>

                <img
                  src={form.imageUrl}
                  alt="Product preview"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "contain"
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                  }}
                />
              </div>
            )}

            <label>
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
              />

              Product is available
            </label>

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
              >
                Cancel Editing
              </button>
            )}

          </form>
        </section>

        {/* Product management */}
        <section className="admin-products">

          <h2>Manage Products</h2>

          {products.length === 0 && (
            <p>No products have been added yet.</p>
          )}

          {products.map((product) => (

            <div
              className="manage-product"
              key={product.id}
            >

              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                />
              )}

              <div>

                <h3>{product.name}</h3>

                <p>Brand: {product.brand}</p>

                <p>
                  Cash: UGX{" "}
                  {Number(
                    product.cashPrice ?? product.cashprice ?? 0
                  ).toLocaleString("en-UG")}
                </p>

                <p>
                  Loan deposit: UGX{" "}
                  {Number(
                    product.loanDeposit ?? product["loan deposit"] ?? 0
                  ).toLocaleString("en-UG")}
                </p>

                <p>Stock: {product.stock ?? 0}</p>

                <p>
                  Status: {product.available ? "Available" : "Unavailable"}
                </p>

              </div>

              <button onClick={() => handleEdit(product)}>
                Edit
              </button>

              <button onClick={() => handleDelete(product.id)}>
                Delete
              </button>

            </div>

          ))}

        </section>

      </main>
    </div>
  );
}

export default Admin;