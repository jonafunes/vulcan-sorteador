'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Shield } from 'lucide-react'

interface SlotMachineClubProps {
    finalClub: string
    allClubs: string[]
    duration?: number
    onComplete?: () => void
}

export function SlotMachineClub({ 
    finalClub, 
    allClubs, 
    duration = 2000,
    onComplete 
}: SlotMachineClubProps) {
    const [currentClub, setCurrentClub] = useState<string>('???')
    const [isSpinning, setIsSpinning] = useState(true)

    useEffect(() => {
        if (!isSpinning) return

        let count = 0
        const totalSpins = 25
        const baseInterval = 50
        
        const spin = () => {
            if (count >= totalSpins) {
                setCurrentClub(finalClub)
                setIsSpinning(false)
                setTimeout(() => onComplete?.(), 600)
                return
            }

            // Desacelerar progresivamente
            const delay = baseInterval + (count * count * 2)
            
            setTimeout(() => {
                const randomClub = allClubs[Math.floor(Math.random() * allClubs.length)]
                setCurrentClub(randomClub)
                count++
                spin()
            }, delay)
        }

        spin()
    }, [isSpinning, allClubs, finalClub, onComplete])

    return (
        <div className="relative h-14 flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentClub}
                    initial={{ y: -60, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 60, opacity: 0, scale: 0.8 }}
                    transition={{ 
                        duration: 0.15,
                        ease: "easeOut"
                    }}
                    className="absolute"
                >
                    <Badge 
                        variant={isSpinning ? "outline" : "default"} 
                        className={`text-base px-4 py-2 ${
                            !isSpinning 
                                ? 'bg-green-500 hover:bg-green-600 text-white border-green-600' 
                                : 'border-2'
                        }`}
                    >
                        <Shield className="h-4 w-4 mr-2" />
                        {currentClub}
                    </Badge>
                </motion.div>
            </AnimatePresence>
            
            {/* Efecto de glow al finalizar */}
            {!isSpinning && (
                <>
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                            scale: [0.8, 1.5, 1.2],
                            opacity: [0, 0.6, 0]
                        }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl" />
                    </motion.div>
                    
                    {/* Partículas de celebración */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                            initial={{ 
                                x: 0, 
                                y: 0,
                                scale: 0
                            }}
                            animate={{
                                x: Math.cos((i * Math.PI * 2) / 8) * 40,
                                y: Math.sin((i * Math.PI * 2) / 8) * 40,
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1
                            }}
                        />
                    ))}
                </>
            )}
        </div>
    )
}
