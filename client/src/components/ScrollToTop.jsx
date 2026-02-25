// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantly scrolls to the top-left of the window
    window.scrollTo(0, 0);
  }, [pathname]); // Triggers every time the URL path changes

  return null; // This component renders nothing visually
}