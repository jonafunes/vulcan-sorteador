'use client'

import { motion } from 'motion/react'
import { Button } from "@/components/ui/button"
import { LucideIcon } from 'lucide-react'

interface RevealButtonProps {
    onClick: () => void
    icon: LucideIcon
    text: string
    disabled?: boolean
}

export function RevealButton({ onClick, icon: Icon, text, disabled }: RevealButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
            <Button 
                onClick={onClick}
                size="lg"
                className="w-full relative overflow-hidden"
                disabled={disabled}
            >
                {/* Efecto de pulso en el fondo */}
                {!disabled && (
                    <motion.div
                        className="absolute inset-0 bg-primary/20"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}
                
                <motion.div
                    className="flex items-center gap-2 relative z-10"
                    animate={!disabled ? {
                        x: [0, 5, 0]
                    } : {}}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <motion.div
                        animate={!disabled ? {
                            rotate: [0, 360]
                        } : {}}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <Icon className="h-5 w-5" />
                    </motion.div>
                    <span>{text}</span>
                </motion.div>
            </Button>
        </motion.div>
    )
}
