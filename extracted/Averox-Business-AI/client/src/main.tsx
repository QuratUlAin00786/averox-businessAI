import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import removeBranding from "./utils/removeBranding";

// Initialize the app
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

// Remove any branded elements from the page
removeBranding();

// Create the React application
createRoot(root).render(<App />);
