import React, { useState } from "react";
import axios from "axios";

import { Box, Card, CardContent, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/auth/login", {
        email,
        password,
      });

      // store token
      localStorage.setItem("token", res.data.access_token);

      // go to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
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
          {/* TITLE */}
          <Typography variant="h5" sx={{ color: "#38bdf8", textAlign: "center", mb: 1 }}>
            🔐 AI Fraud Intelligence
          </Typography>

          <Typography
            sx={{
              color: "#94a3b8",
              textAlign: "center",
              mb: 3,
              fontSize: 14,
            }}
          >
            Protecting users with real-time AI fraud detection
          </Typography>

          {/* ERROR */}
          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}

          {/* EMAIL */}
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              input: { color: "white" },
              label: { color: "#94a3b8" },
            }}
          />

          {/* PASSWORD */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 3,
              input: { color: "white" },
              label: { color: "#94a3b8" },
            }}
          />

          {/* LOGIN BUTTON */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              py: 1.2,
              fontWeight: "bold",
              background: "linear-gradient(90deg, #38bdf8, #6366f1)",
              boxShadow: "0 0 20px rgba(56,189,248,0.5)",
            }}
          >
            Login Securely
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
