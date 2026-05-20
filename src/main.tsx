import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// إخفاء شاشة التحميل
function hideSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 300);
  }
}

// عرض التطبيق
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App onReady={hideSplash} />
  </StrictMode>
);
