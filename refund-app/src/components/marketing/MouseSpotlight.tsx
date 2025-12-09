'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export default function MouseSpotlight() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring physics for "Liquid" feel (stiff: 150, damping: 15 makes it lag slightly)
    const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Center the spotlight on the cursor
            mouseX.set(e.clientX - 400); // 400 is half the width
            mouseY.set(e.clientY - 400); // 400 is half the height
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            aria-hidden="true"
        >
            <motion.div
                className="absolute w-[800px] h-[800px] bg-[#0052FF] rounded-full blur-[120px] opacity-15"
                style={{
                    x: springX,
                    y: springY,
                }}
            />
        </motion.div>
    );
}
