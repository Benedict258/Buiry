import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../lib/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(email.trim(), password, name.trim() || undefined);
      toast.success("Account created", {
        description: "Welcome to Buiry.",
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass-card rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="Buiry" className="w-8 h-8" />
            <span className="font-semibold text-lg text-text-primary">
              Buiry
            </span>
          </div>
          <p className="text-sm text-text-secondary">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-text-secondary"
            >
              Name{" "}
              <span className="text-outline font-normal">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-card text-sm text-text-primary placeholder:text-outline focus:outline-none focus:border-primary transition-colors duration-150"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-card text-sm text-text-primary placeholder:text-outline focus:outline-none focus:border-primary transition-colors duration-150"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-card text-sm text-text-primary placeholder:text-outline focus:outline-none focus:border-primary transition-colors duration-150"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-status-error/20 bg-status-error/5 px-3 py-2">
              <p className="text-xs text-status-error">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-2.5 rounded-lg bg-primary text-background text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-text-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
