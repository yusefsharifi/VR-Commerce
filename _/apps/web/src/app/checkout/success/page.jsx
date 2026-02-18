import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState("confirming");
  const [orderId, setOrderId] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (sessionId) {
        const confirmOrder = async () => {
          try {
            const res = await fetch("/api/orders/confirm", {
              method: "POST",
              body: JSON.stringify({ sessionId }),
            });
            const data = res.ok ? await res.json() : null;

            if (data?.status === "success") {
              setStatus("success");
              setOrderId(data.orderId);
              clearCart();
            } else {
              setStatus("pending");
            }
          } catch (error) {
            console.error(error);
            setStatus("error");
          }
        };
        confirmOrder();
      } else {
        setStatus("error");
      }
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Header />

      <main className="max-w-xl mx-auto px-6 py-24 text-center">
        {status === "confirming" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Package size={40} className="text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold dark:text-white">
              Confirming your order...
            </h1>
            <p className="text-gray-500">
              We're verifying your payment with Stripe. Please don't close this
              window.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-bold dark:text-white">
              Order Confirmed!
            </h1>
            <p className="text-gray-500 text-lg">
              Your order #{orderId} has been successfully placed. You'll receive
              a confirmation email shortly.
            </p>
            <div className="pt-8">
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-black text-white px-8 py-3 rounded-full font-bold flex items-center justify-center mx-auto hover:bg-[#FF5224] transition-colors"
              >
                Back to Lobby <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold dark:text-white">
              Something went wrong
            </h1>
            <p className="text-gray-500">
              We couldn't confirm your payment. If you've been charged, please
              contact support.
            </p>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
