import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Coffee, Heart } from "lucide-react";

export default function OrderingPage() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitOrderMutation = trpc.orders.submit.useMutation({
    onSuccess: (order) => {
      toast.success(`Order #${order.orderNumber} placed: ${order.item}`, {
        duration: 3000,
      });
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
            <Coffee className="w-16 h-16 text-amber-700 mx-auto mb-4" />
            <span className="text-2xl font-light text-gray-900 block tracking-wide">
              Latte
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
              Heart Art
            </span>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setLocation("/dashboard")}
          className="px-8 py-2 text-sm border-gray-300 hover:border-gray-400"
        >
          View Dashboard
        </Button>
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
    </div>
  );
}
