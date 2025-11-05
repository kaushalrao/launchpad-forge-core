import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import WarehouseRequest from "./pages/WarehouseRequest";
import TransportationRequest from "./pages/TransportationRequest";
import InventoryRequest from "./pages/InventoryRequest";
import LogisticsRequest from "./pages/LogisticsRequest";
import TrackRequests from "./pages/TrackRequests";
import RequestDetail from "./pages/RequestDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <ProtectedRoute requireRole="customer">
                <Services />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services/warehouse" 
            element={
              <ProtectedRoute requireRole="customer">
                <WarehouseRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services/transportation" 
            element={
              <ProtectedRoute requireRole="customer">
                <TransportationRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services/inventory" 
            element={
              <ProtectedRoute requireRole="customer">
                <InventoryRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services/logistics" 
            element={
              <ProtectedRoute requireRole="customer">
                <LogisticsRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/track-requests" 
            element={
              <ProtectedRoute>
                <TrackRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/request/:type/:id" 
            element={
              <ProtectedRoute>
                <RequestDetail />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
