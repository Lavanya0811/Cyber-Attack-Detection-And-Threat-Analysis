import React, { useState } from "react";
import API from "../services/api";

import { Box, Card, CardContent, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    // 🔥 password match check
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/signup", {
        email,
        password,
      });

      alert("Signup successful 🎉");
      navigate("/"); // go to login
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #020617, #0f172a, #020617)",
      }}
    >
      <Card
        sx={{
          width: 420,
          borderRadius: 3,
          backdropFilter: "blur(14px)",
          background: "rgba(30,41,59,0.7)",
          border: "1px solid rgba(56,189,248,0.3)",
          boxShadow: "0 0 30px rgba(56,189,248,0.25)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ color: "#38bdf8", textAlign: "center", mb: 1 }}>
            📝 Create Account
          </Typography>

          <Typography
            sx={{
              color: "#94a3b8",
              textAlign: "center",
              mb: 3,
              fontSize: 14,
            }}
          >
            Join AI Fraud Intelligence Platform
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSignup}
            sx={{
              py: 1.2,
              fontWeight: "bold",
              background: "linear-gradient(90deg, #38bdf8, #6366f1)",
            }}
          >
            Sign Up
          </Button>

          {/* 🔥 Back to login */}
          <Typography
            sx={{ textAlign: "center", mt: 2, color: "#94a3b8", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Already have an account? Login
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Signup;
