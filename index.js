import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Thai font via Google Fonts
const link = document.createElement("link");
link.rel  = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap";
document.head.appendChild(link);

document.body.style.margin  = "0";
document.body.style.padding = "0";
document.body.style.boxSizing = "border-box";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<React.StrictMode><App /></React.StrictMode>);
