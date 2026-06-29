import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Coffee, Heart, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "../../../drizzle/schema";

const POLL_INTERVAL = 2000; // Poll every 2 seconds for new orders

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: ordersData, refetch } = trpc.orders.list.useQuery(undefined, {
    refetchInterval: POLL_INTERVAL,
  });

  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Order cleared", { duration: 2000 });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to clear order: ${error.message}`);
    },
  });

  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getItemIcon = (item: string) => {
    if (item === "Latte") {
      return <Coffee className="w-5 h-5 text-amber-700" />;
    } else if (item === "Heart Art") {
      return <Heart className="w-5 h-5 text-rose-600 fill-current" />;
    }
    return null;
  };

  const getItemColor = (item: string) => {
    if (item === "Latte") {
      return "bg-amber-50 border-amber-200 hover:border-amber-400";
    } else if (item === "Heart Art") {
      return "bg-rose-50 border-rose-200 hover:border-rose-400";
    }
    return "bg-gray-50 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-gray-900">
              Order Dashboard
            </h1>
            <p className="text-sm text-gray-600 font-light mt-1">
              Real-time order tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={() => setLocation("/order")}
              variant="default"
              size="sm"
            >
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Order Count */}
        <div className="mb-8">
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-sm font-light text-gray-700">
              Total Orders: <span className="font-semibold">{orders.length}</span>
            </span>
          </div>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Coffee className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-light text-lg">
              No orders yet. Start taking orders to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${getItemColor(
                  order.item
                )}`}
              >
                {/* Order Number */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-white/60 rounded-full text-sm font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </span>
                </div>

                {/* Item with Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0">
                    {getItemIcon(order.item)}
                  </div>
                  <span className="text-2xl font-light text-gray-900">
                    {order.item}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-600 font-light mb-4">
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>

                {/* Clear Order Button */}
                <button
                  onClick={() => deleteOrderMutation.mutate({ id: order.id })}
                  disabled={deleteOrderMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-light text-gray-700 bg-white/50 hover:bg-white/80 border border-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Clear Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-refresh Indicator */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 text-xs text-gray-600 font-light">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Live updates enabled</span>
      </div>
    </div>
  );
}
