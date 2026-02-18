import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight, ArrowLeft } from "lucide-react";

const categories = [
  {
    id: "jewelry",
    name: "Jewelry & Watches",
    icon: "💎",
    color: "bg-amber-500",
  },
  {
    id: "clothing",
    name: "Fashion & Clothing",
    icon: "👔",
    color: "bg-blue-500",
  },
  { id: "carpets", name: "Fine Carpets", icon: "🏺", color: "bg-red-800" },
  { id: "flowers", name: "Flowers & Gifts", icon: "🌸", color: "bg-pink-500" },
  { id: "electronics", name: "Electronics", icon: "📱", color: "bg-slate-700" },
  {
    id: "furniture",
    name: "Home Furniture",
    icon: "🪑",
    color: "bg-brown-600",
  },
  { id: "art", name: "Art Gallery", icon: "🎨", color: "bg-purple-500" },
  { id: "food", name: "Gourmet Food", icon: "🍷", color: "bg-orange-500" },
  { id: "toys", name: "Toys & Games", icon: "🧸", color: "bg-yellow-500" },
  { id: "books", name: "Books & Media", icon: "📚", color: "bg-green-600" },
  { id: "beauty", name: "Beauty & Health", icon: "💄", color: "bg-rose-400" },
  {
    id: "sports",
    name: "Sports & Outdoors",
    icon: "🏃",
    color: "bg-emerald-500",
  },
  {
    id: "music",
    name: "Music & Instruments",
    icon: "🎸",
    color: "bg-indigo-600",
  },
  { id: "luxury", name: "Luxury Goods", icon: "👑", color: "bg-black" },
];

export default function RegionMallPage({ params }) {
  const { region } = params;

  const regionNames = {
    iran: "Iran Commercial Hub",
    arab: "Arabian Peninsula Mall",
    europe: "European Plaza",
    africa: "African Trade Centre",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <a
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-[#FF5224] mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Lobby
            </a>
            <h1 className="text-4xl font-extrabold dark:text-white capitalize">
              {regionNames[region] || region}
            </h1>
            <p className="text-gray-500 mt-2">
              Choose a category corridor to explore virtual shops.
            </p>
          </div>

          <div className="hidden md:block">
            <button className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-[#FF5224] transition-colors">
              Enter 3D Mall View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/mall/${region}/${cat.id}`}
              className="group relative h-48 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 hover:shadow-2xl transition-all"
            >
              <div
                className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${cat.color}`}
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <span className="text-4xl">{cat.icon}</span>
                <div>
                  <h3 className="text-xl font-bold dark:text-white group-hover:text-[#FF5224] transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center mt-2 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-all">
                    Explore Corridor <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
