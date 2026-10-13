import { createRoot } from "react-dom/client";
import { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

OverlayScrollbars(document.body, {
  scrollbars: {
    theme: "os-theme-tandem",
    autoHide: "move",
    autoHideSuspend: false,
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
    <App />
  </BrowserRouter>,
);