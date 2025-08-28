import React, { useState } from "react";
import { TextField, Button, Card, Typography, Link } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import server from "../environment"; // ✅ Import the API base URL

export default function Signup({ setAuth }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${server}/signup`, {
        name,
        email,
        password,
      });

      // Save JWT token
      localStorage.setItem("token", res.data.token);
      setAuth(true);

      // Redirect to home after signup
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
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
        Signup
      </Typography>
      <form
        onSubmit={handleSignup}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          Signup
        </Button>
      </form>

      <Typography variant="body2" style={{ marginTop: 10 }}>
        Already have an account?{" "}
        <Link
          onClick={() => navigate("/auth/login")}
          style={{ cursor: "pointer", color: "#1976d2" }}
        >
          Login here
        </Link>
      </Typography>
    </Card>
  );
}
