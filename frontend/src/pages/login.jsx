import React, { useState } from "react";
import { TextField, Button, Card, Typography } from "@mui/material";
import axios from "axios";

export default function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Card style={{ padding: 20, maxWidth: 400, margin: "50px auto" }}>
      <Typography variant="h5">Login</Typography>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="primary">Login</Button>
      </form>
    </Card>
  );
}
