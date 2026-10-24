import { login } from '../../../shared/api';

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const inputStyle = {
  width: "100%",
  marginTop: "8px",
  padding: "12px 14px",
  boxSizing: "border-box",
  border: "1px solid #DCE3DD",
  borderRadius: "8px",
  outline: "none",
  fontSize: "16px",
  color: "#394F49",
  background: "#FFFFFF",
};

const labelStyle = {
  display: "block",
  marginBottom: "18px",
  color: "#394F49",
  fontSize: "16px",
  fontWeight: "700",
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignIn(event) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {setError("Please enter your email/username and password.");return;}
    setError("");
    try {await login(email.trim(),password);navigate("/dashboard",{replace:true});}
    catch(error){setError(error.message);}
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(245, 247, 246, 0.35), rgba(245, 247, 246, 0.35)), url('/pcmc.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          border: "1px solid #DCE3DD",
          borderRadius: "18px",
          padding: "36px",
          boxSizing: "border-box",
          boxShadow: "0 8px 28px rgba(57, 79, 73, 0.08)",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "7px 12px",
              borderRadius: "20px",
              background: "#E8F3E9",
              color: "#2F7D4A",
              fontSize: "14px",
              fontWeight: "800",
              letterSpacing: "0.5px",
              marginBottom: "14px",
            }}
          >
            PCMC CLIMATE ACTION
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              color: "#394F49",
              fontSize: "34px",
              lineHeight: "1.2",
              fontWeight: "750",
            }}
          >
            Admin Sign In
          </h1>

          <p
            style={{
              margin: 0,
              color: "#65743A",
              fontSize: "17px",
              lineHeight: "1.6",
            }}
          >
            Sign in to access the Climate Action Admin Panel.
          </p>
        </div>

        <form onSubmit={handleSignIn}>
          <label style={labelStyle}>
            Email
            <input
              type="text"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              style={inputStyle}
            />
          </label>

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: "18px",
                padding: "11px 12px",
                background: "#F5EAEA",
                border: "1px solid #E4CCCC",
                borderRadius: "8px",
                color: "#8A4A4A",
                fontSize: "15px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "none",
              borderRadius: "8px",
              background: "#394F49",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "750",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>

        <p
          style={{
            margin: "20px 0 0",
            textAlign: "center",
            color: "#65743A",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          Authorized administrator access only.
        </p>
      </div>
    </div>
  );
}
