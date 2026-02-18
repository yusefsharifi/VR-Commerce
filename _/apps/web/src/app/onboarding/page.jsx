import { useState, useEffect } from "react";
import Header from "@/components/Header";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [role, setRole] = useState("customer");
  const [country, setCountry] = useState("iran");
  const [currency, setCurrency] = useState("IRR");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ role, country, currency }),
      });
      if (res.ok) {
        window.location.href = role === "vendor" ? "/dashboard" : "/";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-extrabold mb-8 dark:text-white">
          Complete Your Profile
        </h1>
        <p className="text-gray-500 mb-12">
          Tell us more about yourself to personalize your Passage 414
          experience.
        </p>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold mb-4 dark:text-white uppercase tracking-wider">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRole("customer")}
                className={`p-6 rounded-2xl border-2 transition-all ${role === "customer" ? "border-[#FF5224] bg-[#FF5224]/5 shadow-lg" : "border-gray-100 dark:border-white/10 hover:border-gray-200"}`}
              >
                <span className="text-2xl mb-2 block">🛍️</span>
                <span className="font-bold dark:text-white">Customer</span>
              </button>
              <button
                onClick={() => setRole("vendor")}
                className={`p-6 rounded-2xl border-2 transition-all ${role === "vendor" ? "border-[#FF5224] bg-[#FF5224]/5 shadow-lg" : "border-gray-100 dark:border-white/10 hover:border-gray-200"}`}
              >
                <span className="text-2xl mb-2 block">🏬</span>
                <span className="font-bold dark:text-white">Vendor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-4 dark:text-white uppercase tracking-wider">
              Region
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:ring-2 focus:ring-[#FF5224]"
            >
              <option value="iran">Iran</option>
              <option value="arab">Arab Countries</option>
              <option value="europe">Europe</option>
              <option value="africa">Africa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-4 dark:text-white uppercase tracking-wider">
              Preferred Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:ring-2 focus:ring-[#FF5224]"
            >
              <option value="IRR">IRR (Toman/Rial)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (Dirham)</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#FF5224] text-white py-4 rounded-full font-bold text-lg shadow-xl shadow-[#FF5224]/20 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Finish Setup"}
          </button>
        </div>
      </main>
    </div>
  );
}
