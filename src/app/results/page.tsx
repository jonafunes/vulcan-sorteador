'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Trophy, Save, BarChart3, Minus, Plus } from 'lucide-react'
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
    team2?: IPair
    score1?: number
    score2?: number
    round: string
}

interface IPair {
    player1: string;
    player2: string;
    club: string;
}

export default function Results() {
    const [matches, setMatches] = useState<Match[]>([])
    const [nextRoundMatches, setNextRoundMatches] = useState<Match[]>([])
    const [tournamentWinner, setTournamentWinner] = useState<string | IPair | null>(null)
    const [tournamentType, setTournamentType] = useState<string>('')

    useEffect(() => {
        const storedMatches = localStorage.getItem('matches')
        const storedWinner = localStorage.getItem('tournamentWinner')
        const storedType = localStorage.getItem('tournamentType')

        if (storedMatches) setMatches(JSON.parse(storedMatches))
        if (storedWinner) setTournamentWinner(JSON.parse(storedWinner))
        if (storedType) setTournamentType(storedType)
    }, [])

    const updateScore = (index: number, player: 1 | 2, score: number) => {
        const updatedMatches = [...matches]
        if (player === 1) {
            updatedMatches[index].score1 = score
        } else {
            updatedMatches[index].score2 = score
        }
        setMatches(updatedMatches)
    }


    const calculateWinners = (updatedMatches: Match[]) => {
        return updatedMatches.map((match) => {
            if (match.player2 === "BYE" || (match.team2 && match.team2.player1 === "BYE")) {
                return tournamentType === "pairs" ? match.team1 : match.player1;
            }
            if (match.score1 !== undefined && match.score2 !== undefined) {
                if (match.score1 > match.score2) {
                    return tournamentType === "pairs" ? match.team1 : match.player1;
                } else {
                    return tournamentType === "pairs" ? match.team2 : match.player2;
                }
            }
            return "";
        });
    };
    

    const generateNextRoundMatches = (winners: (string | IPair)[]) => {
        if (winners.length === 1) {
            const winner = winners[0];
            setTournamentWinner(winner); // IPair o string
            localStorage.setItem('tournamentWinner', JSON.stringify(winner));
            return;
        }
    
        const newMatches: Match[] = [];
        for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
                newMatches.push({
                    player1: tournamentType === "pairs" ? undefined : (winners[i] as string),
                    player2: tournamentType === "pairs" ? undefined : (winners[i + 1] as string),
                    team1: tournamentType === "pairs" ? (winners[i] as IPair) : undefined,
                    team2: tournamentType === "pairs" ? (winners[i + 1] as IPair) : undefined,
                    round: "1",
                });
            } else {
                newMatches.push({
                    player1: tournamentType === "pairs" ? undefined : (winners[i] as string),
                    player2: "BYE",
                    team1: tournamentType === "pairs" ? (winners[i] as IPair) : undefined,
                    team2: undefined,
                    round: "1",
                });
            }
        }
        setNextRoundMatches(newMatches);
        localStorage.setItem('matches', JSON.stringify(newMatches));
    };
    

    const saveResults = () => {
        const updatedMatches = [...matches]

        // Calculate winners
        const winners = calculateWinners(updatedMatches)

        const validWinners = winners.filter((winner): winner is string | IPair => !!winner);

        // Generate next round or set tournament winner
        generateNextRoundMatches(validWinners)

        // Load existing stats
        const existingStats = JSON.parse(localStorage.getItem('stats') || '{}')
        const stats: { [key: string]: { wins: number, losses: number, goalsFor: number, goalsAgainst: number, club?: string } } = { ...existingStats }

        // Update stats based on the tournament type (individual or parejas)
        updatedMatches.forEach(match => {
            if (match.score1 !== undefined && match.score2 !== undefined) {
                if (tournamentType === "pairs" ) {
                    // Si es un torneo por parejas
                    
                    const team1Stats = stats[match.team1!.player1+" y "+match.team1!.player2] || { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, club: match.team1!.club }
                    const team2Stats = stats[match.team2!.player1+" y "+match.team2!.player2] || { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, club: match.team2!.club }
                    
                    if (match.score1 > match.score2) {
                        team1Stats.wins++
                        team2Stats.losses++
                    } else if (match.score2 > match.score1) {
                        team2Stats.wins++
                        team1Stats.losses++
                    }

                    team1Stats.goalsFor += match.score1
                    team1Stats.goalsAgainst += match.score2
                    team2Stats.goalsFor += match.score2
                    team2Stats.goalsAgainst += match.score1
                    team1Stats.club = match.team1!.club
                    team2Stats.club = match.team2!.club

                    stats[match.team1!.player1+" y "+match.team1!.player2] = team1Stats
                    stats[match.team2!.player1+" y "+match.team2!.player2] = team2Stats

                } else {
                    // Si es un torneo individual
                    const player1Stats = stats[match.player1!] || { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
                    const player2Stats = stats[match.player2!] || { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }

                    if (match.score1 > match.score2) {
                        player1Stats.wins++
                        player2Stats.losses++
                    } else if (match.score2 > match.score1) {
                        player2Stats.wins++
                        player1Stats.losses++
                    }

                    player1Stats.goalsFor += match.score1
                    player1Stats.goalsAgainst += match.score2
                    player2Stats.goalsFor += match.score2
                    player2Stats.goalsAgainst += match.score1

                    stats[match.player1!] = player1Stats
                    stats[match.player2!] = player2Stats
                }
            }
        })

        // Save updated stats
        localStorage.setItem('stats', JSON.stringify(stats))
        if (nextRoundMatches.length < 0) {
            return
        } else {
            window.location.reload();
        }

    }


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Ingresar Resultados</h1>
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
            {tournamentWinner ? (
                <Card className="border-yellow-500 border-2 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-bounce" />
                        <h2 className="text-3xl font-bold mb-4">
                            ¡Campeón del Torneo!
                        </h2>
                        <div className="text-2xl font-semibold mb-6">
                            {tournamentType === "pairs" && typeof tournamentWinner === 'object' && tournamentWinner !== null
                                ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <span>{(tournamentWinner as IPair).player1}</span>
                                            <span className="text-muted-foreground">+</span>
                                            <span>{(tournamentWinner as IPair).player2}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-lg px-4 py-2">
                                            {(tournamentWinner as IPair).club}
                                        </Badge>
                                    </div>
                                )
                                : <span>{String(tournamentWinner)}</span>}
                        </div>
                        <Button size="lg" asChild>
                            <Link href={"/stats"}>
                                <BarChart3 className="mr-2 h-5 w-5" />
                                Ver Estadísticas
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches.map((match, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Partido {index + 1}</CardTitle>
                                        <Badge variant="outline">{match.round}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {tournamentType === "pairs" && match.team1 && match.team2 ? (
                                        <>
                                            <div className="p-3 rounded-lg border bg-accent/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-1 text-sm font-medium mb-1">
                                                            <span>{(match.team1 as IPair).player1}</span>
                                                            <span className="text-muted-foreground">+</span>
                                                            <span>{(match.team1 as IPair).player2}</span>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {(match.team1 as IPair).club}
                                                        </Badge>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={match.team1.player1 === "BYE" || match.team1.player2 === "BYE" ? '' : match.score1 || ''}
                                                        onChange={(e) => updateScore(index, 1, parseInt(e.target.value) || 0)}
                                                        className="w-16 text-center text-lg font-bold"
                                                        disabled={match.team1.player1 === "BYE" || match.team2.player1 === "BYE"}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-center text-muted-foreground font-semibold">VS</p>
                                            <div className="p-3 rounded-lg border bg-accent/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-1 text-sm font-medium mb-1">
                                                            <span>{(match.team2 as IPair).player1}</span>
                                                            <span className="text-muted-foreground">+</span>
                                                            <span>{(match.team2 as IPair).player2}</span>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {(match.team2 as IPair).club}
                                                        </Badge>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={match.team1.player1 === "BYE" || match.team2.player1 === "BYE" ? '' : match.score2 || ''}
                                                        onChange={(e) => updateScore(index, 2, parseInt(e.target.value) || 0)}
                                                        className="w-16 text-center text-lg font-bold"
                                                        disabled={match.team1.player1 === "BYE" || match.team2.player1 === "BYE"}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-3 rounded-lg border bg-accent/30">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{match.player1}</span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={match.player1 === "BYE" || match.player2 === "BYE" ? '' : match.score1 || ''}
                                                        onChange={(e) => updateScore(index, 1, parseInt(e.target.value) || 0)}
                                                        className="w-16 text-center text-lg font-bold"
                                                        disabled={match.player1 === "BYE" || match.player2 === "BYE"}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-center text-muted-foreground font-semibold">VS</p>
                                            <div className="p-3 rounded-lg border bg-accent/30">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{match.player2}</span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={match.player1 === "BYE" || match.player2 === "BYE" ? '' : match.score2 || ''}
                                                        onChange={(e) => updateScore(index, 2, parseInt(e.target.value) || 0)}
                                                        className="w-16 text-center text-lg font-bold"
                                                        disabled={match.player1 === "BYE" || match.player2 === "BYE"}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-center mt-8">
                        <Button onClick={saveResults} size="lg">
                            <Save className="mr-2 h-5 w-5" />
                            Guardar Resultados
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
