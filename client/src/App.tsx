import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FarmNew from "./pages/FarmNew";
import FarmDetail from "./pages/FarmDetail";
import Maps from "./pages/Maps";
import AIRecommendations from "./pages/AIRecommendations";
import IoTDevices from "./pages/IoTDevices";
import Reports from "./pages/Reports";
import Community from "./pages/Community";
import Support from "./pages/Support";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/farms/new"} component={FarmNew} />
      <Route path={"/farms/:id"} component={FarmDetail} />
      <Route path={"/maps"} component={Maps} />
      <Route path={"/ai-recommendations"} component={AIRecommendations} />
      <Route path={"/iot-devices"} component={IoTDevices} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/community"} component={Community} />
      <Route path={"/support"} component={Support} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
