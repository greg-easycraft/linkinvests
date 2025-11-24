"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component specifically designed to handle DOM manipulation errors
 * that occur during authentication state changes and portal cleanup.
 *
 * This component catches and gracefully handles:
 * - Portal cleanup errors during component unmounting
 * - DOM removeChild errors during authentication transitions
 * - General React component errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Check if this is a portal/DOM manipulation error
    const isDOMError = error.message.includes('removeChild') ||
                      error.message.includes('node') ||
                      error.message.includes('child');

    if (isDOMError) {
      // Log portal cleanup error but don't crash the app
      console.warn('Portal cleanup error during auth state change:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    } else {
      // Log other errors more prominently
      console.error('Unexpected error caught by ErrorBoundary:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise show default message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center p-4 text-sm text-gray-600 bg-gray-50 rounded-md">
          <div className="text-center">
            <p>Something went wrong. Please try again.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-3 py-1 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}