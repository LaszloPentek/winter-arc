import { StrictMode, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./app/Auth";
import { UpdateNotice } from "./app/UpdateNotice";
import { App } from "./app/App";
import "./styles/app.css";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="panel">
        <h1>A felület nem tölthető be.</h1>
        <p>Frissítsd az oldalt. A helyben elmentett adatok megmaradnak.</p>
        <button onClick={() => location.reload()}>Újratöltés</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15000, gcTime: 300000 } },
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UpdateNotice />
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
