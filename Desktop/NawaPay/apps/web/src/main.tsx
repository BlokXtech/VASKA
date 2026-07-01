import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Layout } from "./components/Layout";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import "./styles.css";

function App() {
  const path = window.location.pathname;

  let page = <HomePage />;
  if (path === "/about") page = <AboutPage />;
  if (path === "/privacy") page = <PrivacyPage />;
  if (path === "/contact") page = <ContactPage />;

  return <Layout>{page}</Layout>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
