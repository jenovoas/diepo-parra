"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Context
interface DialogContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

// Root
interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    // Determine if controlled or uncontrolled
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = isControlled && onOpenChange ? onOpenChange : setUncontrolledOpen;

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
}

// Trigger
interface DialogTriggerProps {
    asChild?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string; // Add className to props
}

export function DialogTrigger({ asChild, children, onClick, className }: DialogTriggerProps) {
    const context = useContext(DialogContext);

    const handleClick = (e: React.MouseEvent) => {
        onClick?.();
        context?.setOpen(true);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                (children.props as any).onClick?.(e);
                handleClick(e);
            },
            className: cn(className, (children.props as any).className)
        });
    }

    return (
        <button onClick={handleClick} className={className}>
            {children}
        </button>
    );
}

// Content
interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
    const context = useContext(DialogContext);

    if (!context?.open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => context.setOpen(false)}
            />
            {/* Modal */}
            <div
                className={cn(
                    "relative z-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 max-h-[90vh] overflow-y-auto",
                    className
                )}
                role="dialog"
            >
                <button
                    onClick={() => context.setOpen(false)}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors z-20"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
                {children}
            </div>
        </div>
    );
}
