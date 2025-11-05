import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "0.0.0.0", // listen on all interfaces (IPv4)
        port: 8080,

        // 👇 Add this line to allow your ngrok domain
        allowedHosts: [
            "interalveolar-marissa-determinatively.ngrok-free.dev",
            // optionally allow all for development
            // "*"
        ],

        // optional but recommended if you see connection issues
        strictPort: true,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
