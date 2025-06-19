import { PublicRoute } from "@/components/ProjectedRouter";
import LoginForm from "@/components/SignIn";
import React from "react";

const LoginPage = () => {
  return (
    <PublicRoute>
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Đăng Nhập</h2>
        <LoginForm />
      </div>
    </div>
    </PublicRoute>
  );
};

export default LoginPage;
