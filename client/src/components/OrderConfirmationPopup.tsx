import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface OrderConfirmationPopupProps {
  orderNumber: number;
  item: string;
  isVisible: boolean;
  onDismiss: () => void;
}

export default function OrderConfirmationPopup({
  orderNumber,
  item,
  isVisible,
  onDismiss,
}: OrderConfirmationPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Confetti Background */}
      {showConfetti && (
        <>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#FFD700",
                  "#FF69B4",
                  "#00CED1",
                  "#FF6347",
                  "#32CD32",
                ][Math.floor(Math.random() * 5)],
                animation: `fall ${2 + Math.random() * 1}s linear forwards`,
                animationDelay: `${Math.random() * 0.3}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Main Popup */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full mx-4 pointer-events-auto"
        style={{
          animation: isVisible
            ? "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "none",
        }}
      >
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div
            className="relative"
            style={{
              animation: "bounce 0.8s ease-in-out infinite",
            }}
          >
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </div>
        </div>

        {/* Order Number - Large and Prominent */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 font-light mb-2">Order Number</p>
          <p
            className="text-7xl font-light text-gray-900 tracking-tight"
            style={{
              animation: "scaleUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            #{orderNumber}
          </p>
        </div>

        {/* Item Name */}
        <div className="mb-6">
          <p className="text-2xl font-light text-gray-700">{item}</p>
        </div>

        {/* Message */}
        <p className="text-gray-600 font-light text-lg mb-2">
          Order Confirmed!
        </p>
        <p className="text-sm text-gray-500 font-light">
          Your order has been placed successfully
        </p>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes popIn {
          0% {
            transform: scale(0.5) translateY(20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes scaleUp {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
