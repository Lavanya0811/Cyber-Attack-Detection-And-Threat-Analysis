import React, { useState } from "react";
import API from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const reset = async () => {
    await API.post("/auth/reset-password", { email, password });
    alert("Password updated");
  };

  return (
    <div>
      <h2>Reset Password</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default ForgotPassword;
