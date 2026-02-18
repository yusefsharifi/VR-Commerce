import { useState } from "react";
import useAuth from "@/utils/useAuth";
import Header from "@/components/Header";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      setError("Sign up failed. This email may already be in use.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />
      <div className="flex items-center justify-center py-20 px-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md bg-white dark:bg-dark-surface-elevated p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10"
        >
          <h1 className="text-3xl font-extrabold text-center mb-8 dark:text-white">
            Join Passage 414
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:ring-2 focus:ring-[#FF5224]"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:ring-2 focus:ring-[#FF5224]"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:ring-2 focus:ring-[#FF5224]"
                placeholder="Create a password"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5224] text-white py-4 rounded-full font-bold shadow-lg shadow-[#FF5224]/20 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <a
                href="/account/signin"
                className="text-[#FF5224] font-bold hover:underline"
              >
                Log in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
