import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { SplashScreen } from "./components/SplashScreen";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SplashScreen />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
