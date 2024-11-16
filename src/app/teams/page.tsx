'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface IPair {
    player1: string;
    player2: string;
    club: string;
}

interface IPlayers {
    player: string;
    club: string;
}



export default function Teams() {
    const router = useRouter()
    const [teams, setTeams] = useState<string[]>([]) // Equipos disponibles
    const [newTeam, setNewTeam] = useState('')
    const [pairs, setPairs] = useState<IPair[]>([]) // Parejas generadas
    const [assignedTeams, setAssignedTeams] = useState<(string | null)[][]>([]) // Equipos asignados a las parejas
    const [players, setPlayers] = useState<IPlayers[]>()
    const [assignedPlayers, setAssignedPlayers] = useState<IPlayers[]>([])
    const [tournamentType, setTournamentType] = useState<string>(); 

    useEffect(() => {
        const type = localStorage.getItem('tournamentType')
        if (type) setTournamentType(type)
        const storedTeams = localStorage.getItem('teams')
        if (storedTeams)  setTeams(JSON.parse(storedTeams))
        const storedPairs = localStorage.getItem('pairs')
        if (storedPairs) setPairs(JSON.parse(storedPairs))
        const storedPlayers = localStorage.getItem('participants_individual')
        if (storedPlayers) setPlayers(JSON.parse(storedPlayers))
    }, [])

    const addTeam = () => {
        if (newTeam.trim()) {
            const updatedTeams = [...teams, newTeam.trim()]
            setTeams(updatedTeams)
            localStorage.setItem('teams', JSON.stringify(updatedTeams))
            setNewTeam('')
        }
    }

    const removeTeam = (index: number) => {
        const updatedTeams = teams.filter((_, i) => i !== index)
        setTeams(updatedTeams)
        localStorage.setItem('teams', JSON.stringify(updatedTeams))
    }

    const assignTeamsToPairs = () => {
        // Asignamos el equipo a cada par de manera aleatoria
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5); // Mezclar equipos aleatoriamente
        const newAssignedTeams = pairs.map((pair, index) => {
          const team = shuffledTeams[index] || null;  // Si no hay equipo, asigna null
      
          // Asignar el equipo al campo `club` de cada pair
          pair.club = team || '';  // Se asigna el equipo a la propiedad club de cada par, o una cadena vacía si es null
      
          // Devolver el par con el equipo asignado
          return [pair.player1, pair.player2, team];
        });
      
        // Guardar todo el objeto pairs con los equipos asignados en localStorage
        localStorage.setItem('pairs', JSON.stringify(pairs));
      
        // Actualizar el estado de los equipos asignados
        setAssignedTeams(newAssignedTeams);
      };
      

    const handleSubmit = () => {
        router.push('/tournament')
    }

    const assignClubs = () => {
        if (tournamentType === 'pairs') {
            assignTeamsToPairs(); // Asignar equipos a parejas si el torneo es de parejas
        } else {
            assignTeamsToPlayers(); // Asignar equipos a jugadores si no es de parejas
        }
    }

    const areAllTeamsAssigned = assignedTeams.length === pairs.length && 
    assignedTeams.every((assignment) => assignment[2] !== null);

    const assignTeamsToPlayers = () => {
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        const newAssignedPlayers: IPlayers[] = players ? players.map((player, index) => {
            const club = shuffledTeams[index] || null; 
            return {
                player: player as unknown as string,
                club: club || ''
            };
        }) : []; 
    
        localStorage.setItem('assignedPlayers', JSON.stringify(newAssignedPlayers));
        setAssignedPlayers(newAssignedPlayers);
    };
    

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Equipos de Fútbol</h1>
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
            <div className="flex space-x-2 mb-4">
                <Input
                    type="text"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    placeholder="Nombre del equipo"
                />
                <Button onClick={addTeam}>Agregar</Button>
            </div>

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Clubes Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {teams.map((team, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span>{team}</span>
                                <Button variant="destructive" onClick={() => removeTeam(index)}>Eliminar</Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>{tournamentType === 'pairs' ? 'Parejas Generadas' : 'Jugadores Disponibles'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {tournamentType === 'pairs' ? ( // Verificamos el tipo de torneo
                            pairs.map((pair, index) => (
                                <li key={index} className="flex justify-between items-center">
                                    <span>Pareja #{index + 1}: {pair.player1} y {pair.player2}</span>
                                    <span>{assignedTeams[index] && assignedTeams[index][2] ? `${assignedTeams[index][2]}` : 'Sin equipo'}</span>
                                </li>
                            ))
                        ) : (
                            assignedPlayers?.map((player, index) => ( // Renderizamos jugadores si el torneo es individual
                                <li key={index} className="flex justify-between items-center">
                                    <span>Jugador #{index + 1}: {player.player}</span>
                                    <span>{player.club ? `${player.club}` : 'Sin equipo'}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </CardContent>
            </Card>
            
            {tournamentType === 'pairs' ? (
                <Button onClick={assignClubs} disabled={teams.length < 2 || pairs.length < 2}>Asignar Clubes</Button>
            ) : (
                <Button onClick={assignClubs} disabled={players && players.length < 2}>Asignar Clubes</Button>
            )}
            {areAllTeamsAssigned && ( // Renderizar botón solo si todos los equipos están asignados
                <Button onClick={handleSubmit} className="ms-4">Continuar al Sorteo</Button>
            )}

        </div>
    )
}
