import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import removeBranding from "./utils/removeBranding";
import store from "./store";

// Initialize the app
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

// Remove any branded elements from the page
removeBranding();

// Create the React application
createRoot(root).render(
  <Provider store={store}>
    <App />
  </Provider>
);
