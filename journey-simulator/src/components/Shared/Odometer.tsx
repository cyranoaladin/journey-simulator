import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

interface OdometerProps {
    value: number;
    duration?: number;
}

export default function Odometer({ value, duration = 1.2 }: OdometerProps) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

    useEffect(() => {
        const controls = animate(count, value, {
            duration: duration,
            ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for "premium" feel
        });
        return controls.stop;
    }, [value, duration, count]);

    return <motion.span>{rounded}</motion.span>;
}
