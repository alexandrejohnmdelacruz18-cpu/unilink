// PostListing.jsx

import React, { useState } from "react";
import {
  Globe,
  LogOut,
  Home,
  MessageCircle,
  SquarePlus,
  Heart,
  ShoppingBag,
  Upload,
  Image,
} from "lucide-react";

import "./PostListing.css";

const PostListing = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    condition: "",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  // HANDLE INPUTS
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE IMAGE
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Listing Posted Successfully!");

    console.log(formData);

    // RESET FORM
    setFormData({
      title: "",
      category: "",
      price: "",
      condition: "",
      description: "",
    });

    setImagePreview(null);
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        {/* LOGO */}
        <div className="logo-section">
          <div className="logo-left">
            <div className="logo-circle">
              <Globe size={18} />
            </div>

            <h1>UniLink</h1>
          </div>

          <button className="icon-btn">
            <LogOut size={18} />
          </button>
        </div>

        {/* MENU */}
        <div className="menu">
          <button className="menu-item">
            <Home size={20} />
            Home
          </button>

          <button className="menu-item">
            <MessageCircle size={20} />
            Messages
          </button>

          <button className="menu-item active">
            <SquarePlus size={20} />
            Post Listing
          </button>

          <button className="menu-item">
            <Heart size={20} />
            Favorites
          </button>

          <button className="menu-item">
            <ShoppingBag size={20} />
            Transactions
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="top-actions">
            <button>
              <Heart size={18} />
              Favorites
            </button>

            <button>
              <ShoppingBag size={18} />
              Cart
            </button>
          </div>
        </div>

        {/* FORM */}
        <div className="listing-container">
          <h1>Create New Listing</h1>

          <p className="subtitle">
            Post your product for students to buy or trade.
          </p>

          <form onSubmit={handleSubmit}>
            {/* PRODUCT TITLE */}
            <div className="input-group">
              <label>Product Title</label>

              <input
                type="text"
                name="title"
                placeholder="Enter product title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* CATEGORY */}
            <div className="input-group">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option>Electronics</option>
                <option>Books</option>
                <option>Uniforms</option>
                <option>School Supplies</option>
                <option>Others</option>
              </select>
            </div>

            {/* PRICE */}
            <div className="grid">
              <div className="input-group">
                <label>Price</label>

                <input
                  type="number"
                  name="price"
                  placeholder="₱ 0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* CONDITION */}
              <div className="input-group">
                <label>Condition</label>

                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Condition</option>
                  <option>Brand New</option>
                  <option>Like New</option>
                  <option>Used</option>
                </select>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="input-group">
              <label>Description</label>

              <textarea
                name="description"
                placeholder="Write product details..."
                rows="5"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* IMAGE UPLOAD */}
            <div className="input-group">
              <label>Upload Product Image</label>

              <label className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  hidden
                />

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="preview-image"
                  />
                ) : (
                  <>
                    <Upload size={40} />
                    <p>Click to Upload Image</p>
                  </>
                )}
              </label>
            </div>

            {/* BUTTONS */}
            <div className="buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => alert("Cancelled")}
              >
                Cancel
              </button>

              <button type="submit" className="submit-btn">
                <Image size={18} />
                Post Listing
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostListing;vv
