import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Store, Star, ArrowLeft } from "lucide-react";

export default function CorridorPage({ params }) {
  const { region, category } = params;

  const { data: shops, isLoading } = useQuery({
    queryKey: ["shops", region, category],
    queryFn: async () => {
      const res = await fetch(
        `/api/shops?country=${region}&category=${category}`,
      );
      if (!res.ok) throw new Error("Failed to fetch shops");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <a
            href={`/mall/${region}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-[#FF5224] mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to {region} Mall
          </a>
          <h1 className="text-4xl font-extrabold dark:text-white capitalize">
            {category} Corridor
          </h1>
          <p className="text-gray-500 mt-2">
            Discover premium vendors in the {category} category.
          </p>
        </div>

        {/* Featured Billboard Slot */}
        <div className="mb-16 relative h-[300px] rounded-3xl overflow-hidden bg-gray-900 flex items-center justify-center group cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
            alt="Billboard"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="relative z-10 text-center text-white p-8">
            <span className="bg-[#FF5224] text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
              SPONSORED
            </span>
            <h2 className="text-4xl font-bold mb-4">Premium Showcase Space</h2>
            <p className="text-lg opacity-80">
              Promote your shop here to reach thousands of virtual visitors.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 dark:bg-white/5 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops?.length > 0 ? (
              shops.map((shop) => (
                <a
                  key={shop.id}
                  href={`/shop/${shop.id}`}
                  className="group bg-white dark:bg-dark-surface-elevated border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="h-40 bg-gray-100 dark:bg-white/5 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Store size={64} />
                    </div>
                    {shop.premium_level > 0 && (
                      <div className="absolute top-4 right-4 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center">
                        <Star size={10} className="mr-1 fill-black" /> PREMIUM
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold dark:text-white group-hover:text-[#FF5224] transition-colors mb-2">
                      {shop.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="capitalize">{shop.category}</span>
                      <span className="mx-2">·</span>
                      <span>{shop.analytics_visits} visits</span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-white/5 rounded-3xl">
                <Store size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-bold dark:text-white">
                  No shops here yet
                </h3>
                <p className="text-gray-500 mt-2">
                  Be the first to open a virtual shop in this corridor!
                </p>
                <a
                  href="/dashboard"
                  className="inline-block mt-6 text-[#FF5224] font-bold hover:underline"
                >
                  Start Renting Now
                </a>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
