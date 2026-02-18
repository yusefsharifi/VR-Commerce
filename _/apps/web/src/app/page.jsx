import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ChevronRight,
  Globe,
  ShoppingBag,
  ShieldCheck,
  Zap,
} from "lucide-react";

const countries = [
  {
    id: "iran",
    name: "Iran",
    color: "#008C45",
    image:
      "https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=800&q=80",
  },
  {
    id: "arab",
    name: "Arab Countries",
    color: "#C1272D",
    image:
      "https://images.unsplash.com/photo-1512453979798-5eaad0ff3b03?w=800&q=80",
  },
  {
    id: "europe",
    name: "Europe",
    color: "#003399",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
  },
  {
    id: "africa",
    name: "Africa",
    color: "#FCD116",
    image:
      "https://images.unsplash.com/photo-1523805081730-814400274052?w=800&q=80",
  },
];

export default function LobbyPage() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-6 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-[#1a1a1a] dark:to-[#121212]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-extrabold text-5xl lg:text-7xl text-[#111111] dark:text-white leading-tight tracking-tight mb-6">
            Welcome to <span className="text-[#FF5224]">Passage 414</span>
          </h1>
          <p className="text-xl text-[#667085] dark:text-white/60 max-w-2xl mx-auto mb-12">
            The world's first scalable VR Mall platform. Experience shopping
            like never before across borders and cultures.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {countries.map((country) => (
              <div
                key={country.id}
                onClick={() => setSelectedCountry(country.id)}
                className={`relative group cursor-pointer overflow-hidden rounded-2xl aspect-[4/5] transition-all duration-300 ${selectedCountry === country.id ? "ring-4 ring-[#FF5224] scale-105" : "hover:scale-[1.02]"}`}
              >
                <img
                  src={country.image}
                  alt={country.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white text-left">
                  <h3 className="text-2xl font-bold mb-2">{country.name}</h3>
                  <p className="text-sm opacity-80 mb-4">
                    Explore the commercial corridors of {country.name}
                  </p>
                  <a
                    href={`/mall/${country.id}`}
                    className="inline-flex items-center text-sm font-semibold bg-white text-black px-4 py-2 rounded-full hover:bg-[#FF5224] hover:text-white transition-colors"
                  >
                    Enter Mall
                    <ChevronRight size={16} className="ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-dark-surface px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF5224]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="text-[#FF5224]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 dark:text-white">
                Global Reach
              </h3>
              <p className="text-gray-600 dark:text-white/60">
                Connect with vendors from Iran, Arab countries, Europe, and
                Africa in one seamless experience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="text-blue-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 dark:text-white">
                VR Immersive
              </h3>
              <p className="text-gray-600 dark:text-white/60">
                Fully immersive WebVR experience using A-Frame. Shop in 3D from
                your browser or VR headset.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 dark:text-white">
                Secure Payments
              </h3>
              <p className="text-gray-600 dark:text-white/60">
                Integrated Stripe checkout with automatic IRR currency
                conversion for global accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
