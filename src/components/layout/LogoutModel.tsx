"use client";
import { useEffect } from "react";
import { LogOut, X } from "lucide-react";
import { Button } from "../components/ui/button";

interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function LogoutModal({ open, onOpenChange, onConfirm }: LogoutModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop/Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 999998 }}
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 999999 }}
      >
        <div
          className="
            bg-white rounded-2xl shadow-2xl
            w-full max-w-[370px]
            p-6
            relative
            animate-in fade-in zoom-in-95 duration-200
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Logout Confirmation
            </h2>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
            Are you sure you want to logout? You'll need to sign in again to continue.
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              className="
                bg-red-600 hover:bg-red-700 text-white
                flex items-center justify-center gap-2 
                w-full py-2.5 font-medium rounded-lg
                transition-colors
              "
              onClick={onConfirm}
            >
              <LogOut size={18} />
              Yes, Logout
            </Button>

            <Button
              variant="secondary"
              className="
                w-full bg-gray-100 hover:bg-gray-200 
                text-black py-2.5 font-medium rounded-lg
                transition-colors
              "
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}