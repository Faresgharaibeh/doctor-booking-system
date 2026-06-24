import AuthLayout from "../components/AuthLayout";
import ButtonLink from "../components/ui/ButtonLink";

function NotFound() {
  return (
    <AuthLayout title="404 - Page Not Found">
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        The page you’re looking for doesn’t exist or was moved.
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

export default NotFound;
