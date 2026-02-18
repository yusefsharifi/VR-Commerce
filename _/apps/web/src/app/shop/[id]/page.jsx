import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Eye, Package, Store } from "lucide-react";

export default function ShopPage({ params }) {
  const { id } = params;
  const [isVR, setIsVR] = useState(false);
  const { addToCart } = useCart();

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", id],
    queryFn: async () => {
      const res = await fetch(`/api/shops?id=${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data[0];
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const res = await fetch(`/api/products?shopId=${id}`);
      return res.json();
    },
  });

  useEffect(() => {
    // Record visit
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({ event_type: "shop_visit", shop_id: id }),
    });
  }, [id]);

  if (shopLoading || productsLoading)
    return (
      <div className="p-20 text-center">Loading immersive experience...</div>
    );
  if (!shop) return <div className="p-20 text-center">Shop not found</div>;

  const handleProductClick = (product) => {
    addToCart(product, id);
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({
        event_type: "product_click",
        shop_id: id,
        product_id: product.id,
      }),
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      {!isVR && <Header />}

      <main
        className={isVR ? "h-screen w-screen" : "max-w-7xl mx-auto px-6 py-12"}
      >
        {!isVR ? (
          /* 2D Fallback Mode */
          <div>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl font-extrabold dark:text-white">
                  {shop.name}
                </h1>
                <p className="text-gray-500 mt-2">
                  Premium {shop.category} vendor in {shop.country}
                </p>
              </div>
              <button
                onClick={() => setIsVR(true)}
                className="bg-[#FF5224] text-white px-8 py-3 rounded-full font-bold flex items-center shadow-lg hover:scale-105 transition-all"
              >
                <Eye className="mr-2" size={20} /> Enter VR Mode
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-dark-surface-elevated border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-square bg-gray-50 dark:bg-white/5 relative overflow-hidden">
                    <img
                      src={
                        product.images?.[0] ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={product.name}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg dark:text-white mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[#FF5224] font-bold">
                        {product.base_price_irr.toLocaleString()} IRR
                      </span>
                      <button
                        onClick={() => handleProductClick(product)}
                        className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-[#FF5224] hover:text-white transition-colors"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* VR Immersive Mode */
          <div className="relative h-full w-full">
            <button
              onClick={() => setIsVR(false)}
              className="absolute top-8 left-8 z-[9999] bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full font-bold hover:bg-white/40 transition-all"
            >
              Exit VR
            </button>

            <a-scene embedded className="h-full w-full">
              <a-assets>
                <img
                  id="sky"
                  src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1600&q=80"
                />
                <a-asset-item
                  id="shelf"
                  src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf"
                ></a-asset-item>
              </a-assets>

              <a-sky src="#sky"></a-sky>
              <a-plane
                position="0 0 0"
                rotation="-90 0 0"
                width="20"
                height="20"
                color="#f5f5f5"
              ></a-plane>

              {/* Shop Walls */}
              <a-box
                position="0 2.5 -5"
                width="10"
                height="5"
                depth="0.1"
                color={shop.decoration?.color || "#ffffff"}
              ></a-box>
              <a-box
                position="-5 2.5 0"
                rotation="0 90 0"
                width="10"
                height="5"
                depth="0.1"
                color={shop.decoration?.color || "#ffffff"}
              ></a-box>
              <a-box
                position="5 2.5 0"
                rotation="0 -90 0"
                width="10"
                height="5"
                depth="0.1"
                color={shop.decoration?.color || "#ffffff"}
              ></a-box>

              {/* Products as 3D Objects (Placeholders) */}
              {products?.map((p, idx) => (
                <a-entity key={p.id} position={`${(idx % 4) * 2 - 3} 1.5 -4`}>
                  <a-box
                    color="#FF5224"
                    scale="0.5 0.5 0.5"
                    class="clickable"
                    onClick={() => handleProductClick(p)}
                  ></a-box>
                  <a-text
                    value={p.name}
                    position="0 0.5 0.3"
                    align="center"
                    scale="0.5 0.5 0.5"
                    color="#000"
                  ></a-text>
                </a-entity>
              ))}

              <a-entity camera look-controls wasd-controls position="0 1.6 0">
                <a-cursor color="#FF5224"></a-cursor>
              </a-entity>

              <a-light type="ambient" color="#fff"></a-light>
              <a-light
                type="directional"
                position="-1 1 1"
                intensity="0.5"
              ></a-light>
            </a-scene>
          </div>
        )}
      </main>
    </div>
  );
}
