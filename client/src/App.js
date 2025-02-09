import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://usermanagementdashboard-kyukxt8bd.vercel.app/api/users"; // Updated backend URL

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [editUserId, setEditUserId] = useState(null);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      setFeedback({ type: "error", message: "Failed to fetch users!" });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for adding/updating users
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

  // Handle user edit
  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email });
    setEditUserId(user._id);
  };

  // Handle user delete
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

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={`dashboard ${theme}`}>
      {/* Theme Toggle */}
      <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="holographic-btn">
          {theme === "light" ? "🌙 Night Mode" : "☀️ Day Mode"}
        </button>
      </div>

      <h1>User Dashboard</h1>

      {/* Feedback Messages */}
      {feedback.message && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.type === "success" ? "✅" : "❌"} {feedback.message}
        </div>
      )}

      {/* User Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? <div className="loading-spinner" /> : editUserId ? "🔄 Update" : "➕ Add"}
        </button>
      </form>

      {/* User Table */}
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
                <button onClick={() => handleEdit(user)} className="edit holographic-btn">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(user._id)} className="delete holographic-btn">
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
