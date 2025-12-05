"use client";

import { useState } from "react";
import { UserRole } from "@/types/database";
import { Check, ChevronDown, Loader2 } from "lucide-react";

interface UserRoleManagerProps {
    currentRole: UserRole;
    onUpdate: (newRole: UserRole) => Promise<void>;
}

export function UserRoleManager({ currentRole, onUpdate }: UserRoleManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const roles: UserRole[] = ['customer', 'staff', 'admin'];

    const handleSelect = async (role: UserRole) => {
        if (role === currentRole) {
            setIsOpen(false);
            return;
        }

        if (!confirm(`Are you sure you want to change this user's role to ${role.toUpperCase()}?`)) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            await onUpdate(role);
        } catch (error) {
            console.error("Failed to update role", error);
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${currentRole === 'admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        : currentRole === 'staff'
                            ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
            >
                {loading ? <Loader2 className="animate-spin" size={12} /> : currentRole.toUpperCase()}
                <ChevronDown size={12} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden">
                        {roles.map((role) => (
                            <button
                                key={role}
                                onClick={() => handleSelect(role)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between text-gray-700"
                            >
                                <span className="capitalize">{role}</span>
                                {currentRole === role && <Check size={12} className="text-green-500" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
