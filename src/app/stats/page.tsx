'use client'
import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
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
}

export default function Stats() {
    const router = useRouter()
    const [stats, setStats] = useState<{ [key: string]: PlayerStats }>({})

    useEffect(() => {
        const storedStats = localStorage.getItem('stats')
        if (storedStats) {
            setStats(JSON.parse(storedStats))
        }
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
        csvRows.push(['Jugador', 'Victorias', 'Derrotas', 'Goles a Favor', 'Goles en Contra', 'Diferencia de Goles'])

        // Datos de los jugadores
        Object.entries(stats).forEach(([player, playerStats]) => {
            const { wins, losses, goalsFor, goalsAgainst } = playerStats
            const row = [
                player,
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
        const diffA = statsA.goalsFor - statsA.goalsAgainst
        const diffB = statsB.goalsFor - statsB.goalsAgainst
        return diffB - diffA 
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Estadísticas del Torneo</h1>
            <Breadcrumb className='mb-4'>
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Jugador</TableHead>
                        <TableHead>Victorias</TableHead>
                        <TableHead>Derrotas</TableHead>
                        <TableHead>Goles a Favor</TableHead>
                        <TableHead>Goles en Contra</TableHead>
                        <TableHead>Diferencia de Goles</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedStats.map(([player, playerStats]) => (
                        <TableRow key={player}>
                            <TableCell>{player}</TableCell>
                            <TableCell>{playerStats.wins}</TableCell>
                            <TableCell>{playerStats.losses}</TableCell>
                            <TableCell>{playerStats.goalsFor}</TableCell>
                            <TableCell>{playerStats.goalsAgainst}</TableCell>
                            <TableCell>{playerStats.goalsFor - playerStats.goalsAgainst}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex flex-row gap-4 justify-end mt-4">
                <Button onClick={handleNewTournament}>
                    Nuevo Torneo
                </Button>
                <Button onClick={handleExportData}>
                    Exportar Datos
                </Button>
            </div>
        </div>
    )
}
