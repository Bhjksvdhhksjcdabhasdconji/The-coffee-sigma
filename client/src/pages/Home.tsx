import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Coffee, BarChart3 } from "lucide-react";
import StaffPasswordDialog from "@/components/StaffPasswordDialog";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="mb-16 text-center max-w-2xl">
        <h1 className="text-6xl md:text-7xl font-light tracking-tight text-gray-900 mb-4">
          密cafe
        </h1>
        <p className="text-xl text-gray-600 font-light">
          Welcome take ur time:)
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-2xl w-full mb-12">
        {/* Ordering Card */}
        <button
          onClick={() => setLocation("/order")}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white border-2 border-amber-200 rounded-2xl p-8 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-center">
            <Coffee className="w-12 h-12 text-amber-700 mx-auto mb-4" />
            <h2 className="text-2xl font-light text-gray-900 mb-2" style={{fontSize: '36px'}}>
              下單
            </h2>
            <p className="text-sm text-gray-600 font-light">
              Self ordering
            </p>
          </div>
        </button>

        {/* Dashboard Card */}
        <button
          onClick={() => setShowPasswordDialog(true)}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-slate-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-center">
            <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h2 className="text-2xl font-light text-gray-900 mb-2">
              View Dashboard Staff
            </h2>
            <p className="text-sm text-gray-600 font-light">
              Real-time order tracking
            </p>
          </div>
        </button>
      </div>

      {/* Features */}
      <div className="max-w-2xl w-full text-center">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-2xl font-light text-amber-700 mb-2">✓</div>
            <p className="text-gray-600 font-light">Instant order placement</p>
          </div>
          <div>
            <div className="text-2xl font-light text-rose-600 mb-2">✓</div>
            <p className="text-gray-600 font-light">Real-time updates</p>
          </div>
          <div>
            <div className="text-2xl font-light text-slate-600 mb-2">✓</div>
            <p className="text-gray-600 font-light">Persistent storage</p>
          </div>
        </div>
      </div>

      {/* Staff Password Dialog */}
      <StaffPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSuccess={() => setLocation("/dashboard")}
      />
    </div>
  );
}
