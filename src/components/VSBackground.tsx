"use client";

import React from 'react';
import { motion } from 'framer-motion';

const VSBackground = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
      <motion.svg
        width="600"
        height="600"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="w-[150%] h-[150%] md:w-full md:h-full"
      >
        {/* Épée Gauche */}
        <motion.path
          d="M40 160L160 40"
          stroke="#8A2BE2"
          strokeWidth="0.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />
        {/* Garde Épée Gauche */}
        <motion.path
          d="M55 145L45 155"
          stroke="#4B0082"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        />

        {/* Épée Droite */}
        <motion.path
          d="M160 160L40 40"
          stroke="#8A2BE2"
          strokeWidth="0.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.7, ease: "easeInOut" }}
        />
        {/* Garde Épée Droite */}
        <motion.path
          d="M145 145L155 155"
          stroke="#4B0082"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.7 }}
        />

        {/* Texte VS Central */}
        <motion.text
          x="50%"
          y="52%"
          textAnchor="middle"
          fill="#8A2BE2"
          fontSize="12"
          fontWeight="900"
          fontFamily="Inter, sans-serif"
          style={{ letterSpacing: '0.2em' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ duration: 2, delay: 2 }}
        >
          VS
        </motion.text>

        {/* Animation de respiration lente */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          stroke="#8A2BE2"
          strokeWidth="0.1"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 0.2 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      </motion.svg>
    </div>
  );
};

export default VSBackground;