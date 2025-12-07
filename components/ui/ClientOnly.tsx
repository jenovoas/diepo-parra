"use client";

import { useEffect, useState } from "react";

export function ClientOnly({ children, className }: { children: React.ReactNode, className?: string }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return (
        <div className={className}>
            {children}
        </div>
    );
}
