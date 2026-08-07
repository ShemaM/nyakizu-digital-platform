"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-dark-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl border border-error/20 shadow-lg p-8">
              {/* Error icon */}
              <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-error" />
              </div>

              {/* Error message */}
              <div className="mb-6">
                <h2 className="mb-2 text-center text-lg font-bold text-text-primary sm:text-xl">
                  Something went wrong
                </h2>
                <p className="text-sm text-text-secondary">
                  We encountered an unexpected error. This has been logged and our team will look into it.
                </p>
              </div>

              {/* Error details (development only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mb-6">
                  <summary className="text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-48 text-xs font-mono text-slate-300">
                    <p className="font-bold text-error mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 gap-2"
                >
                  <RefreshCw size={16} />
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  onClick={this.handleGoHome}
                  className="flex-1 gap-2"
                >
                  <Home size={16} />
                  Go to Home
                </Button>
              </div>
            </div>

            {/* Support link */}
            <p className="text-center text-xs text-slate-500 mt-4">
              Need help?{" "}
              <a
                href="mailto:support@nyakizu.co.ke"
                className="text-info hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simpler functional wrapper for common use cases
interface SimpleErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function SimpleErrorFallback({ error, resetError }: SimpleErrorFallbackProps) {
  return (
    <div className="bg-error/10 border border-error/30 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-error shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-error mb-1">
            Something went wrong
          </h3>
          <p className="text-xs text-text-secondary mb-3">
            {error.message || "An unexpected error occurred"}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={resetError}
            className="gap-1.5 text-xs"
          >
            <RefreshCw size={12} />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}