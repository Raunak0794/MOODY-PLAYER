import React, { useState } from "react";
import { TextField, Button, Card, Typography, Link } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import server from "../environment"; // ✅ Using single API base URL

export default function Login({ setAuth }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ✅ API call to backend
      const res = await axios.post(`${server}/login`, {
        email,
        password,
      });

      // ✅ Save JWT token in localStorage
      localStorage.setItem("token", res.data.token);
      setAuth(true);

      // ✅ Navigate to home page after login
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Card
      style={{
        padding: 20,
        maxWidth: 400,
        margin: "50px auto",
        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>

      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <Typography color="error">{error}</Typography>}

        <Button type="submit" variant="contained" color="primary">
          Login
        </Button>
      </form>

      <Typography variant="body2" style={{ marginTop: 10 }}>
        Don’t have an account?{" "}
        <Link
          onClick={() => navigate("/signup")}
          style={{ cursor: "pointer", color: "#1976d2" }}
        >
          Signup here
        </Link>
      </Typography>
    </Card>
  );
}
