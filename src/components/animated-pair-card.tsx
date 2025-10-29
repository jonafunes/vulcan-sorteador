'use client'

import { motion } from 'motion/react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Sparkles } from 'lucide-react'

interface AnimatedPairCardProps {
    pair: [string, string]
    index: number
    onAnimationComplete?: () => void
}

export function AnimatedPairCard({ pair, index, onAnimationComplete }: AnimatedPairCardProps) {
    return (
        <motion.div
            initial={{ 
                opacity: 0, 
                scale: 0.5,
                rotateY: -90 
            }}
            animate={{ 
                opacity: 1, 
                scale: 1,
                rotateY: 0 
            }}
            transition={{
                duration: 0.6,
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
            }}
            onAnimationComplete={onAnimationComplete}
            style={{ perspective: 1000 }}
        >
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                {/* Efecto de brillo que recorre la card */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                        duration: 1.5,
                        delay: index * 0.15 + 0.3,
                        ease: "easeInOut"
                    }}
                />
                
                <CardHeader>
                    <motion.div 
                        className="flex items-center justify-between"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                    >
                        <Badge className="text-base px-3 py-1">
                            <Users className="h-4 w-4 mr-1" />
                            Pareja #{index + 1}
                        </Badge>
                        <motion.div
                            animate={{ 
                                rotate: [0, 360],
                                scale: [1, 1.3, 1]
                            }}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.15 + 0.5
                            }}
                        >
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                        </motion.div>
                    </motion.div>
                </CardHeader>
                
                <CardContent>
                    <motion.div 
                        className="flex items-center gap-2 text-lg font-medium justify-center"
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.15 + 0.3 }}
                    >
                        <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                                delay: index * 0.15 + 0.4,
                                type: "spring",
                                stiffness: 200
                            }}
                            className="text-primary font-bold"
                        >
                            {pair[0]}
                        </motion.span>
                        <motion.span 
                            className="text-muted-foreground text-2xl"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ 
                                delay: index * 0.15 + 0.45,
                                duration: 0.3
                            }}
                        >
                            +
                        </motion.span>
                        <motion.span
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                                delay: index * 0.15 + 0.5,
                                type: "spring",
                                stiffness: 200
                            }}
                            className="text-primary font-bold"
                        >
                            {pair[1]}
                        </motion.span>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
