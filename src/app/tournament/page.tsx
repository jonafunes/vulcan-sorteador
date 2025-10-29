'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Shuffle, Play, Loader2, Swords } from 'lucide-react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type Match = {
    player1?: string
    player2?: string
    team1?: IPair
    team2?: IPair | string
    score1?: number
    score2?: number
    round: string
}


interface IPair {
    player1: string;
    player2: string;
    club: string;
}

export default function Tournament() {
    const router = useRouter()
    const [type, setType] = useState<'individual' | 'pairs'>('individual')
    const [participants, setParticipants] = useState<string[]>([])
    const [pairs, setPairs] = useState<string[]>([])
    const [tournamentPhase, setTournamentPhase] = useState<string>('')
    const [visibleMatches, setVisibleMatches] = useState<Match[]>([])
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
    const [allMatches, setAllMatches] = useState<Match[]>([])
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0)
    const [isManualMode, setIsManualMode] = useState<boolean>(false)

    useEffect(() => {
        const storedType = localStorage.getItem('tournamentType') as 'individual' | 'pairs'
        if (storedType) {
            setType(storedType)
        }

        const storedParticipants = localStorage.getItem(`participants_${storedType}`)
        if (storedParticipants) {
            setParticipants(JSON.parse(storedParticipants))
        }

        if (storedType === 'pairs') {
            const storedPairs = localStorage.getItem('pairs')
            if (storedPairs) {
                setPairs(JSON.parse(storedPairs))
            }
        }
    }, [])

    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)) as number;
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const determineTournamentPhase = (participantCount: number) => {
        const count = type === 'pairs' ? participantCount / 2 : participantCount;
        if (count <= 2) return 'Final'
        if (count <= 4) return 'Semifinales'
        if (count <= 8) return 'Cuartos de Final'
        if (count <= 16) return 'Octavos de Final'
        return 'Dieciseisavos de Final'
    }

    const generateMatches = (manual: boolean = false) => {
        setIsGenerating(true)
        setIsManualMode(manual)
        localStorage.removeItem('matches')
        localStorage.removeItem('stats')
        localStorage.removeItem('tournamentWinner')

        const shuffledParticipants = shuffleArray([...participants])
        const shuffledPairs = shuffleArray([...pairs])

        const newMatches: Match[] = []
        const phase = determineTournamentPhase(shuffledParticipants.length)
        setTournamentPhase(phase)

        if (type === 'individual') {
            // Cruces entre jugadores individuales
            for (let i = 0; i < shuffledParticipants.length; i += 2) {
                if (i + 1 < shuffledParticipants.length) {
                    const match: Match = {
                        player1: shuffledParticipants[i],
                        player2: shuffledParticipants[i + 1],
                        round: phase,
                    }
                    newMatches.push(match)
                } else {
                    newMatches.push({
                        player1: shuffledParticipants[i],
                        player2: 'BYE',
                        round: phase,
                    })
                }
            }
        } else if (type === 'pairs') {
            // Cruces entre parejas (no mezclar jugadores)
            for (let i = 0; i < shuffledPairs.length; i += 2) {
                if (i + 1 < shuffledPairs.length) {
                    const match: Match = {
                        team1: shuffledPairs[i],
                        team2: shuffledPairs[i + 1],
                        round: phase,
                    }
                    newMatches.push(match)
                } else {
                    newMatches.push({
                        team1: shuffledPairs[i],
                        team2: 'BYE',
                        round: phase,
                    })
                }
            }
        }
        setAllMatches(newMatches)
        setCurrentMatchIndex(0)
        
        if (manual) {
            // Modo manual: no mostrar nada automáticamente
            setVisibleMatches([])
            setIsGenerating(false)
        } else {
            // Modo automático: mostrar todos con animación
            setVisibleMatches([])
            newMatches.forEach((match, index) => {
                setTimeout(() => {
                    setVisibleMatches((prev) => [...prev, match])
                    if (index === newMatches.length - 1) {
                        setIsGenerating(false)
                    }
                }, index * 1000)
            })
        }

        localStorage.setItem('matches', JSON.stringify(newMatches))
        localStorage.setItem('tournamentPhase', phase)
    }

    const revealNextMatch = () => {
        if (currentMatchIndex < allMatches.length) {
            setVisibleMatches((prev) => [...prev, allMatches[currentMatchIndex]])
            setCurrentMatchIndex(currentMatchIndex + 1)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h1 className="text-3xl font-bold">Sorteo del Torneo</h1>
            </div>
            <Breadcrumb className='mb-6'>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Torneo</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shuffle className="h-5 w-5" />
                        Generar Cruces del Torneo
                    </CardTitle>
                    <CardDescription>
                        Elige cómo generar los enfrentamientos aleatorios
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-3">
                        <Button 
                            onClick={() => generateMatches(false)} 
                            size="lg" 
                            disabled={isGenerating}
                            className="flex-1"
                            variant="default"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <Shuffle className="mr-2 h-5 w-5" />
                                    Sorteo Automático
                                </>
                            )}
                        </Button>
                        <Button 
                            onClick={() => generateMatches(true)} 
                            size="lg" 
                            disabled={isGenerating}
                            className="flex-1"
                            variant="outline"
                        >
                            <Trophy className="mr-2 h-5 w-5" />
                            Sorteo Manual (Presentación)
                        </Button>
                    </div>
                    {isManualMode && allMatches.length > 0 && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                            <p className="text-sm font-medium mb-2">
                                Modo Presentación: {visibleMatches.length} de {allMatches.length} partidos revelados
                            </p>
                            {currentMatchIndex < allMatches.length && (
                                <Button 
                                    onClick={revealNextMatch}
                                    size="lg"
                                    className="w-full"
                                >
                                    <Play className="mr-2 h-5 w-5" />
                                    Revelar Siguiente Partido
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {tournamentPhase && (
                <div className="flex items-center gap-3 mb-6">
                    <Badge variant="default" className="text-lg px-4 py-2">
                        <Trophy className="h-4 w-4 mr-2" />
                        {tournamentPhase}
                    </Badge>
                    <Badge variant="secondary" className="text-base">
                        {visibleMatches.length} {visibleMatches.length === 1 ? 'partido' : 'partidos'}
                    </Badge>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleMatches.map((match, index) => (
                    <Card 
                        key={index} 
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Partido {index + 1}</CardTitle>
                                <Swords className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {type === 'individual' && match.player1 && match.player2 ? (
                                <div className="space-y-3">
                                    <div className="p-3 rounded-lg bg-accent/50">
                                        <p className="font-semibold text-center">{match.player1}</p>
                                    </div>
                                    <p className="text-center text-muted-foreground font-bold">VS</p>
                                    <div className="p-3 rounded-lg bg-accent/50">
                                        <p className="font-semibold text-center">{match.player2}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 rounded-lg bg-accent/50">
                                        <div className="flex items-center gap-2 justify-center mb-1">
                                            <span className="font-semibold">{(match.team1 as IPair).player1}</span>
                                            <span className="text-muted-foreground">+</span>
                                            <span className="font-semibold">{(match.team1 as IPair).player2}</span>
                                        </div>
                                        <Badge variant="secondary" className="w-full justify-center">
                                            {(match.team1 as IPair).club}
                                        </Badge>
                                    </div>
                                    <p className="text-center text-muted-foreground font-bold">VS</p>
                                    <div className="p-3 rounded-lg bg-accent/50">
                                        <div className="flex items-center gap-2 justify-center mb-1">
                                            <span className="font-semibold">{(match.team2 as IPair).player1}</span>
                                            <span className="text-muted-foreground">+</span>
                                            <span className="font-semibold">{(match.team2 as IPair).player2}</span>
                                        </div>
                                        <Badge variant="secondary" className="w-full justify-center">
                                            {(match.team2 as IPair).club}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {visibleMatches.length > 0 && !isGenerating && (
                <div className="flex justify-center mt-8">
                    <Button onClick={() => router.push('/results')} size="lg">
                        <Play className="mr-2 h-5 w-5" />
                        Empezar Torneo
                    </Button>
                </div>
            )}
        </div>
    )
}

// Agregar estilos de animación al globals.css si no existen
// @keyframes slide-in-from-bottom {
//   from { transform: translateY(10px); opacity: 0; }
//   to { transform: translateY(0); opacity: 1; }
// }
