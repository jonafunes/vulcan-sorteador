'use client'
import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Trophy, Download, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { ConfettiEffect } from '@/components/confetti-effect'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type PlayerStats = {
    wins: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    club?: string
}

export default function Stats() {
    const router = useRouter()
    const [stats, setStats] = useState<{ [key: string]: PlayerStats }>({})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [showConfetti, setShowConfetti] = useState<boolean>(false)

    useEffect(() => {
        const storedStats = localStorage.getItem('stats')
        if (storedStats) {
            const parsedStats = JSON.parse(storedStats)
            setStats(parsedStats)
            // Mostrar confetti si hay estadísticas
            if (Object.keys(parsedStats).length > 0) {
                setShowConfetti(true)
                setTimeout(() => setShowConfetti(false), 5000)
            }
        }
        setIsLoading(false)
    }, [])

    const handleNewTournament = () => {
        localStorage.removeItem('tournamentWinner')
        localStorage.removeItem('stats')
        setStats({})
        router.push("/tournament")
    }

    const handleExportData = () => {
        const csvRows = []
        // Cabeceras del CSV
        csvRows.push(['Posición', 'Jugador', 'Club', 'Victorias', 'Derrotas', 'Goles a Favor', 'Goles en Contra', 'Diferencia de Goles'])

        // Datos de los jugadores
        sortedStats.forEach(([player, playerStats], index) => {
            const { wins, losses, goalsFor, goalsAgainst, club } = playerStats
            const row = [
                index + 1,
                player,
                club || 'Sin club',
                wins,
                losses,
                goalsFor,
                goalsAgainst,
                goalsFor - goalsAgainst
            ]
            csvRows.push(row)
        })

        // Crear el CSV como cadena
        const csvString = csvRows.map(row => row.join(',')).join('\n')

        // Crear el archivo CSV
        const blob = new Blob([csvString], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'stats.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    
    const sortedStats = Object.entries(stats).sort(([, statsA], [, statsB]) => {
        // 1. Ordenar por victorias (descendente)
        if (statsB.wins !== statsA.wins) {
            return statsB.wins - statsA.wins
        }
        
        // 2. Si empatan en victorias, ordenar por diferencia de goles (descendente)
        const diffA = statsA.goalsFor - statsA.goalsAgainst
        const diffB = statsB.goalsFor - statsB.goalsAgainst
        if (diffB !== diffA) {
            return diffB - diffA
        }
        
        // 3. Si empatan en diferencia de goles, ordenar por goles a favor (descendente)
        return statsB.goalsFor - statsA.goalsFor
    })

    // Mostrar loader mientras carga
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                    <p className="text-lg text-muted-foreground">Cargando estadísticas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h1 className="text-3xl font-bold">Estadísticas del Torneo</h1>
            </div>
            <Breadcrumb className='mb-6'>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/results">Torneo</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Estadisticas</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            {sortedStats.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No hay estadísticas disponibles</h3>
                        <p className="text-muted-foreground mb-6">Comienza un torneo para ver las estadísticas</p>
                        <Button onClick={handleNewTournament}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Nuevo Torneo
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Tabla de Posiciones</CardTitle>
                        <CardDescription>
                            Ordenado por victorias, diferencia de goles y goles a favor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">Pos.</TableHead>
                                    <TableHead>Jugador/Pareja</TableHead>
                                    <TableHead>Club</TableHead>
                                    <TableHead className="text-center">V</TableHead>
                                    <TableHead className="text-center">D</TableHead>
                                    <TableHead className="text-center">GF</TableHead>
                                    <TableHead className="text-center">GC</TableHead>
                                    <TableHead className="text-center">DG</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedStats.map(([player, playerStats], index) => {
                                    const goalDiff = playerStats.goalsFor - playerStats.goalsAgainst
                                    return (
                                        <TableRow key={player} className={index === 0 ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}>
                                            <TableCell className="font-bold">
                                                {index + 1}
                                                {index === 0 && <Trophy className="inline h-4 w-4 text-yellow-500 ml-1" />}
                                            </TableCell>
                                            <TableCell className="font-medium">{player}</TableCell>
                                            <TableCell>
                                                {playerStats.club ? (
                                                    <Badge variant="secondary">{playerStats.club}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Sin club</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="default" className="bg-green-500">{playerStats.wins}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="destructive">{playerStats.losses}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">{playerStats.goalsFor}</TableCell>
                                            <TableCell className="text-center font-semibold">{playerStats.goalsAgainst}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {goalDiff > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                    {goalDiff < 0 && <TrendingDown className="h-4 w-4 text-red-500" />}
                                                    <span className={goalDiff > 0 ? 'text-green-600 font-bold' : goalDiff < 0 ? 'text-red-600 font-bold' : 'font-bold'}>
                                                        {goalDiff > 0 ? '+' : ''}{goalDiff}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
            
            <div className="flex flex-row gap-4 justify-end mt-6">
                <Button variant="outline" onClick={handleNewTournament}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Nuevo Torneo
                </Button>
                <Button onClick={handleExportData} disabled={sortedStats.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Datos
                </Button>
            </div>
            
            {/* Confetti para celebrar las estadísticas */}
            {showConfetti && <ConfettiEffect />}
        </div>
    )
}
