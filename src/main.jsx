import { ConfigProvider } from "antd";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorLink: "#007fff",
          colorPrimary: "#007fff",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
