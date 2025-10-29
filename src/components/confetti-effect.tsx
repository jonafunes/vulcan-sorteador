'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

interface ConfettiPiece {
    id: number
    x: number
    color: string
    delay: number
    size: number
    rotation: number
}

export function ConfettiEffect() {
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

    useEffect(() => {
        const pieces: ConfettiPiece[] = []
        const colors = [
            '#FFD700', // Oro
            '#FF6B6B', // Rojo
            '#4ECDC4', // Turquesa
            '#45B7D1', // Azul
            '#FFA07A', // Salmón
            '#98D8C8', // Verde agua
            '#F7DC6F', // Amarillo
            '#BB8FCE'  // Púrpura
        ]
        
        // Generar 40 piezas de confetti
        for (let i = 0; i < 40; i++) {
            pieces.push({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.3,
                size: 4 + Math.random() * 6,
                rotation: Math.random() * 360
            })
        }
        
        setConfetti(pieces)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confetti.map((piece) => (
                <motion.div
                    key={piece.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${piece.x}%`,
                        backgroundColor: piece.color,
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
                        top: '-20px'
                    }}
                    initial={{ 
                        y: -20, 
                        opacity: 1, 
                        rotate: piece.rotation,
                        scale: 0
                    }}
                    animate={{
                        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 1000,
                        opacity: [0, 1, 1, 1, 0],
                        rotate: piece.rotation + (360 * 4),
                        scale: [0, 1, 1, 1, 0.5],
                        x: [
                            0, 
                            Math.sin(piece.id) * 100,
                            Math.cos(piece.id) * 80,
                            Math.sin(piece.id * 2) * 60
                        ]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        delay: piece.delay,
                        ease: "easeIn",
                        times: [0, 0.1, 0.5, 0.9, 1]
                    }}
                />
            ))}
        </div>
    )
}
