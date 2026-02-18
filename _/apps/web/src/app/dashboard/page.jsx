import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import {
  Store,
  Package,
  BarChart,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function VendorDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ["my-shops"],
    queryFn: async () => {
      const res = await fetch(`/api/shops?ownerId=${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch shops");
      return res.json();
    },
    enabled: !!user?.id,
  });

  const selectedShop = shops?.[0]; // For simplicity, manage first shop

  const { data: products } = useQuery({
    queryKey: ["my-products", selectedShop?.id],
    queryFn: async () => {
      const res = await fetch(`/api/products?shopId=${selectedShop.id}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!selectedShop?.id,
  });

  if (userLoading || shopsLoading)
    return <div className="p-20 text-center">Loading dashboard...</div>;
  if (!user)
    return (
      <div className="p-20 text-center">
        Please log in to access the dashboard
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-[250px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "overview" ? "bg-[#FF5224] text-white" : "hover:bg-gray-100 dark:hover:bg-white/5 dark:text-white"}`}
            >
              <BarChart size={18} className="mr-3" /> Overview
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "products" ? "bg-[#FF5224] text-white" : "hover:bg-gray-100 dark:hover:bg-white/5 dark:text-white"}`}
            >
              <Package size={18} className="mr-3" /> Products
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "shop" ? "bg-[#FF5224] text-white" : "hover:bg-gray-100 dark:hover:bg-white/5 dark:text-white"}`}
            >
              <Store size={18} className="mr-3" /> Shop Settings
            </button>
          </aside>

          {/* Main Content */}
          <main className="bg-white dark:bg-dark-surface-elevated rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/10">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold mb-8 dark:text-white">
                  Performance Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mb-2 uppercase">
                      Total Visits
                    </p>
                    <p className="text-3xl font-extrabold dark:text-white">
                      {selectedShop?.analytics_visits || 0}
                    </p>
                  </div>
                  <div className="p-6 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-500/20">
                    <p className="text-sm text-green-600 dark:text-green-400 font-bold mb-2 uppercase">
                      Active Products
                    </p>
                    <p className="text-3xl font-extrabold dark:text-white">
                      {products?.length || 0}
                    </p>
                  </div>
                  <div className="p-6 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-bold mb-2 uppercase">
                      Commission Rate
                    </p>
                    <p className="text-3xl font-extrabold dark:text-white">
                      {selectedShop?.commission_rate || 10}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold dark:text-white">
                    Product Management
                  </h2>
                  <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold flex items-center hover:bg-[#FF5224] transition-colors">
                    <Plus size={16} className="mr-2" /> Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/10">
                        <th className="pb-4 font-bold text-sm text-gray-500">
                          Product
                        </th>
                        <th className="pb-4 font-bold text-sm text-gray-500">
                          Price (IRR)
                        </th>
                        <th className="pb-4 font-bold text-sm text-gray-500">
                          Stock
                        </th>
                        <th className="pb-4 font-bold text-sm text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      {products?.map((p) => (
                        <tr key={p.id}>
                          <td className="py-4 font-medium dark:text-white">
                            {p.name}
                          </td>
                          <td className="py-4 dark:text-white">
                            {p.base_price_irr.toLocaleString()}
                          </td>
                          <td className="py-4 dark:text-white">{p.stock}</td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                <Edit2 size={16} />
                              </button>
                              <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "shop" && (
              <div>
                <h2 className="text-2xl font-bold mb-8 dark:text-white">
                  Shop Settings
                </h2>
                {!selectedShop ? (
                  <div className="text-center py-12">
                    <Store size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="dark:text-white font-bold">
                      You don't have a shop yet.
                    </p>
                    <button className="mt-4 bg-[#FF5224] text-white px-8 py-2 rounded-full font-bold">
                      Create My First Shop
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6 max-w-xl">
                    <div>
                      <label className="block text-sm font-bold mb-2 dark:text-white">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedShop.name}
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:ring-2 focus:ring-[#FF5224]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 dark:text-white">
                        VR Wall Color
                      </label>
                      <input
                        type="color"
                        defaultValue={
                          selectedShop.decoration?.color || "#ffffff"
                        }
                        className="w-full h-12 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5 cursor-pointer"
                      />
                    </div>
                    <button className="bg-[#FF5224] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[#FF5224]/20">
                      Save Changes
                    </button>
                  </form>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
