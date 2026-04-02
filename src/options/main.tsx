import { createRoot } from "react-dom/client";
import App from "./App";

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error("Root node is missing");
}
createRoot(rootNode).render(<App />);
