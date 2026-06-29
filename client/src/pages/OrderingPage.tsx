import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Coffee, Heart } from "lucide-react";
import OrderConfirmationPopup from "@/components/OrderConfirmationPopup";

export default function OrderingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ orderNumber: number; item: string } | null>(null);
  
  const submitOrderMutation = trpc.orders.submit.useMutation({
    onSuccess: (order) => {
      setLastOrder({ orderNumber: order.orderNumber, item: order.item });
      setShowConfirmation(true);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(`Failed to place order: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleOrderClick = (item: "Latte" | "Heart Art") => {
    setIsSubmitting(true);
    submitOrderMutation.mutate({ item });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-light tracking-tight text-gray-900 mb-3">
          Café Ordering
        </h1>
        <p className="text-lg text-gray-600 font-light">
          Select an item to place an order
        </p>
      </div>

      {/* Buttons Container */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16">
        {/* Latte Button */}
        <button
          onClick={() => handleOrderClick("Latte")}
          disabled={isSubmitting}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white border-2 border-amber-200 rounded-2xl px-12 py-16 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
            <Coffee className="w-16 h-16 text-amber-700 mx-auto mb-4" style={{backgroundColor: '#ebebeb'}} />
            <span className="text-2xl font-light text-gray-900 block tracking-wide">
              心形圖案Latte
            </span>
          </div>
        </button>

        {/* Heart Art Button */}
        <button
          onClick={() => handleOrderClick("Heart Art")}
          disabled={isSubmitting}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-pink-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white border-2 border-rose-200 rounded-2xl px-12 py-16 hover:border-rose-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
            <Heart className="w-16 h-16 text-rose-600 mx-auto mb-4 fill-current" />
            <span className="text-2xl font-light text-gray-900 block tracking-wide">
              兩個心圖案的latte
            </span>
          </div>
        </button>
      </div>

      {/* Status Indicator */}
      {isSubmitting && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-light">Submitting order...</span>
          </div>
        </div>
      )}

      {/* Order Confirmation Popup */}
      {lastOrder && (
        <OrderConfirmationPopup
          orderNumber={lastOrder.orderNumber}
          item={lastOrder.item}
          isVisible={showConfirmation}
          onDismiss={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}
