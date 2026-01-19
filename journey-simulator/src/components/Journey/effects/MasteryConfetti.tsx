import * as React from 'react';
import { motion } from 'framer-motion';

const MasteryConfetti: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        background: `hsl(${Math.random() * 360}, 70%, 60%)`
                    }}
                    initial={{ y: -20, opacity: 1 }}
                    animate={{ y: 600, opacity: 0, rotate: 360 }}
                    transition={{
                        duration: 3,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 5
                    }}
                />
            ))}
        </div>
    );
};

export default MasteryConfetti;
