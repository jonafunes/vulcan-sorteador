'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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

    const generateMatches = () => {
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
        setVisibleMatches([])

        newMatches.forEach((match, index) => {
            setTimeout(() => {
                setVisibleMatches((prev) => [...prev, match])
            }, index * 2000)
        })

        localStorage.setItem('matches', JSON.stringify(newMatches))
        localStorage.setItem('tournamentPhase', phase)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Sorteo del Torneo</h1>
            <Breadcrumb className='mb-4'>
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
            <Button onClick={generateMatches} className="mb-4">Generar Cruces</Button>
            {tournamentPhase && (
                <h2 className="text-2xl font-semibold mb-4">{tournamentPhase}</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleMatches.map((match, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{`${match.round} ${index + 1}`}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardContent>
                                {type === 'individual' && match.player1 && match.player2 ? (
                                    <p className='text-center'>{match.player1} vs {match.player2}</p>
                                ) : (
                                    <div className='flex flex-col items-center'>
                                        <p><strong>{(match.team1 as IPair).player1} y {(match.team1 as IPair).player2} </strong> vs  <strong>{(match.team2 as IPair).player1} y {(match.team2 as IPair).player2}</strong></p>
                                        <p><strong>{(match.team1 as IPair).club} </strong> vs  <strong>{(match.team2 as IPair).club} </strong></p>
                                    </div>

                                )}
                            </CardContent>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {visibleMatches.length > 0 && (
                <Button onClick={() => router.push('/results')} className="mt-4">Empezar Torneo</Button>
            )}
        </div>
    )
}
