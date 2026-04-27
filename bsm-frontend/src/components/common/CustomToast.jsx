import { useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function CustomToast({ t, type = "default", title, message, onDismiss }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - e.target.getBoundingClientRect().left;
      setDragX(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 100) {
      onDismiss?.();
    } else {
      setDragX(0);
    }
    setIsDragging(false);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-white border-slate-200";
    }
  };

  return (
    <div
      className={`
        ${getBackgroundColor()}
        border rounded-xl shadow-lg p-4 min-w-[300px] max-w-md
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? "scale-105" : "scale-100"}
      `}
      style={{
        transform: `translateX(${dragX}px)`,
        opacity: Math.max(0, 1 - Math.abs(dragX) / 200),
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-slate-800 text-sm mb-1">
              {title}
            </h4>
          )}
          <p className="text-slate-600 text-sm">
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Swipe indicator */}
      <div className="mt-2 flex justify-center">
        <div className="w-12 h-1 bg-slate-300 rounded-full opacity-50"></div>
      </div>
    </div>
  );
}
