import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [editUserId, setEditUserId] = useState(null);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Load API URL from .env file
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/users";

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.body.className = theme;
  };

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      setFeedback({ type: "error", message: "Failed to fetch users!" });
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle form submission (add/update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editUserId) {
        await axios.put(`${API_URL}/${editUserId}`, formData);
        setFeedback({ type: "success", message: "User updated successfully!" });
      } else {
        await axios.post(API_URL, formData);
        setFeedback({ type: "success", message: "User added successfully!" });
      }
      setFormData({ name: "", email: "" });
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      setFeedback({ type: "error", message: "Operation failed!" });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email });
    setEditUserId(user._id);
  };

  // Handle delete action
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      setFeedback({ type: "success", message: "User deleted!" });
      fetchUsers();
    } catch (error) {
      setFeedback({ type: "error", message: "Deletion failed!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`dashboard ${theme}`}>
      <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="holographic-btn">
          {theme === "light" ? "🌙 Night Mode" : "☀️ Day Mode"}
        </button>
      </div>

      <h1>✨ User Management Dashboard</h1>

      {feedback.message && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.type === "success" ? "✅" : "❌"} {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            placeholder=" "
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <label>Name</label>
        </div>
        <div className="input-group">
          <input
            type="email"
            placeholder=" "
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <label>Email</label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? <div className="loading-spinner" /> : editUserId ? "🔄 Update" : "➕ Add"}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td className="actions">
                <button onClick={() => handleEdit(user)} className="edit">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(user._id)} className="delete">
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserDashboard;
