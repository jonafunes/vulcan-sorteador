'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from 'next/link'
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
    const router = useRouter()
    const [matches, setMatches] = useState<Match[]>([])
    const [nextRoundMatches, setNextRoundMatches] = useState<Match[]>([])
    const [tournamentWinner, setTournamentWinner] = useState<string | IPair | null>(null)
    const [tournamentType, setTournamentType] = useState<string>('')

    useEffect(() => {
        const storedMatches = localStorage.getItem('matches')
        const storedWinner = localStorage.getItem('tournamentWinner')
        const storedType = localStorage.getItem('tournamentType')

        if (storedMatches) setMatches(JSON.parse(storedMatches))
        if (storedWinner) setTournamentWinner(storedWinner)
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
            setTournamentWinner(winner as any); // IPair o string
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

        const validWinners = winners.filter((winner): winner is string => !!winner);

        // Generate next round or set tournament winner
        generateNextRoundMatches(validWinners)

        // Load existing stats
        const existingStats = JSON.parse(localStorage.getItem('stats') || '{}')
        const stats: { [key: string]: { wins: number, losses: number, goalsFor: number, goalsAgainst: number } } = { ...existingStats }

        // Update stats based on the tournament type (individual or parejas)
        updatedMatches.forEach(match => {
            if (match.score1 !== undefined && match.score2 !== undefined) {
                if (tournamentType === "pairs" ) {
                    // Si es un torneo por parejas
                    
                    const team1Stats = stats[match.team1!.player1+" y "+match.team1!.player2] || { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
                    const team2Stats = stats[match.team2!.player1+" y "+match.team2!.player2] || { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
                    
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
            <h1 className="text-3xl font-bold mb-4">Ingresar Resultados</h1>
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
            {tournamentWinner ? (
                 <div className="text-center p-4 bg-green-200 rounded-lg">
                 <h2 className="text-2xl font-bold">
                     ¡{tournamentType === "pairs"
                         ? `${(tournamentWinner as IPair).player1} y ${(tournamentWinner as IPair).player2} del club ${(tournamentWinner as IPair).club}`
                         : `${tournamentWinner}`} ganó el torneo!
                 </h2>
                 <Button className="mt-4">
                     <Link href={"/stats"}>Estadísticas</Link>
                 </Button>
             </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matches.map((match, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle>Partido {index + 1}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Mostrar puntajes y nombres dependiendo del tipo de torneo */}
                                    {tournamentType === "pairs" && match.team1 && match.team2 ? (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                            <p>{(match.team1 as IPair).player1} y {(match.team1 as IPair).player2}</p>
                                                <Input
                                                    type="number"
                                                    value={match.team1.player1 === "BYE" || match.team1.player2 === "BYE" ? '' : match.score1 || ''}
                                                    onChange={(e) => updateScore(index, 1, parseInt(e.target.value))}
                                                    className="w-16"
                                                    disabled={match.team1.player1 === "BYE" || match.team2.player1 === "BYE"}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                {(match.team2 as IPair).player1} y {(match.team2 as IPair).player2}
                                                <Input
                                                    type="number"
                                                    value={match.team1.player1 === "BYE" || match.team2.player1 === "BYE" ? '' : match.score2 || ''}
                                                    onChange={(e) => updateScore(index, 2, parseInt(e.target.value))}
                                                    className="w-16"
                                                    disabled={match.team1.player1 === "BYE" || match.team2.player1 === "BYE"}
                                                />
                                            </div>
                                            <p className="mt-2 text-center">
                                                {`${match.team1.club} vs ${match.team2.club}`}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <span>{match.player1}</span>
                                                <Input
                                                    type="number"
                                                    value={match.player1 === "BYE" || match.player2 === "BYE" ? '' : match.score1 || ''}
                                                    onChange={(e) => updateScore(index, 1, parseInt(e.target.value))}
                                                    className="w-16"
                                                    disabled={match.player1 === "BYE" || match.player2 === "BYE"}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>{match.player2}</span>
                                                <Input
                                                    type="number"
                                                    value={match.player1 === "BYE" || match.player2 === "BYE" ? '' : match.score2 || ''}
                                                    onChange={(e) => updateScore(index, 2, parseInt(e.target.value))}
                                                    className="w-16"
                                                    disabled={match.player1 === "BYE" || match.player2 === "BYE"}
                                                />
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className='flex flex-row gap-4'>
                        <Button onClick={saveResults} className="mt-4">Guardar y Continuar</Button>
                        <Button className="mt-4">
                            <Link href={"/stats"}>Estadísticas</Link>
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
