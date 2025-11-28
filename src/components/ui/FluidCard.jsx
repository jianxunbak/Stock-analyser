import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import './FluidCard.css';

export const FluidCard = ({ children, className = '' }) => {
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);

    // Smooth out the velocity to avoid jitter
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 300
    });

    // Map velocity to scaleY (stretch)
    // When scrolling fast, stretch vertically (scaleY > 1)
    // Adjusted range for balanced effect (max 3.5% stretch)
    const scaleY = useTransform(smoothVelocity, [-3000, 0, 3000], [1.035, 1, 1.035]);

    return (
        <motion.div
            className={`fluid-card-container ${className}`}
            style={{
                scaleY,
                transformOrigin: "center center",
                willChange: "transform"
            }}
        >
            {children}
        </motion.div>
    );
};
