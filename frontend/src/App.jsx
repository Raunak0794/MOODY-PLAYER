import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import FacialExpression from "./components/FacialExpression.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";

export default function App() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuth(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={auth ? <FacialExpression /> : <Navigate to="/signup" />}
        />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/signup" element={<Signup setAuth={setAuth} />} />
      </Routes>
    </Router>
  );
}
