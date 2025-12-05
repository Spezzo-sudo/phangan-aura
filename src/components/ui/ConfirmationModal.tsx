"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "success" | "info" | "warning";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "info",
    onConfirm,
    onCancel
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "danger": return <AlertCircle className="text-red-500" size={32} />;
            case "success": return <CheckCircle className="text-green-500" size={32} />;
            case "warning": return <AlertCircle className="text-yellow-500" size={32} />;
            default: return <HelpCircle className="text-blue-500" size={32} />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case "danger": return "bg-red-500 hover:bg-red-600";
            case "success": return "bg-green-500 hover:bg-green-600";
            case "warning": return "bg-yellow-500 hover:bg-yellow-600";
            default: return "bg-blue-500 hover:bg-blue-600";
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                >
                    <div className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-50' : type === 'success' ? 'bg-green-50' : 'bg-blue-50'}`}>
                                {getIcon()}
                            </div>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-600 mb-6">{message}</p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all ${getButtonColor()}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
