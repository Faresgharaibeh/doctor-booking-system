import React from "react";
import AuthLayout from "./AuthLayout";
import ButtonLink from "./ui/ButtonLink";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AuthLayout title="Something went wrong">
          <p style={{ marginTop: 0, opacity: 0.8 }}>
            An unexpected error happened in the UI. Try refreshing or go back.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <ButtonLink to="/" variant="secondary">
              Go to Login
            </ButtonLink>
            <ButtonLink to="/dashboard" variant="primary">
              Go to Dashboard
            </ButtonLink>
          </div>
        </AuthLayout>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
