'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, Trash2, Shuffle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { SlotMachineClub } from '@/components/slot-machine-club'
import { RevealButton } from '@/components/reveal-button'
import { ConfettiEffect } from '@/components/confetti-effect'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
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
    const [tournamentType, setTournamentType] = useState<string>()
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [isManualMode, setIsManualMode] = useState<boolean>(false)
    const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState<number>(0)
    const [isAssigning, setIsAssigning] = useState<boolean>(false)
    const [shuffledTeamsForAssignment, setShuffledTeamsForAssignment] = useState<string[]>([])
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
    const [revealingClub, setRevealingClub] = useState<boolean>(false)

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
            setIsDrawerOpen(false)
        }
    }

    const removeTeam = (index: number) => {
        const updatedTeams = teams.filter((_, i) => i !== index)
        setTeams(updatedTeams)
        localStorage.setItem('teams', JSON.stringify(updatedTeams))
    }

    const assignTeamsToPairs = (manual: boolean = false) => {
        setIsManualMode(manual);
        setIsAssigning(true);
        
        // Generar un solo shuffle que se usará para todas las asignaciones
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        setShuffledTeamsForAssignment(shuffledTeams);
        
        const newAssignedTeams = pairs.map((pair, index) => {
          const team = shuffledTeams[index] || null;
          pair.club = team || '';
          return [pair.player1, pair.player2, team];
        });
      
        if (manual) {
            // Modo manual: asignar uno por uno
            setAssignedTeams([]);
            setCurrentAssignmentIndex(0);
            setIsAssigning(false);
        } else {
            // Modo automático: asignar todos de una vez
            localStorage.setItem('pairs', JSON.stringify(pairs));
            setAssignedTeams(newAssignedTeams);
            setIsAssigning(false);
        }
      };
      

    const handleSubmit = () => {
        router.push('/tournament')
    }

    const assignClubs = (manual: boolean = false) => {
        if (tournamentType === 'pairs') {
            assignTeamsToPairs(manual);
        } else {
            assignTeamsToPlayers(manual);
        }
    }

    const revealNextAssignment = () => {
        setRevealingClub(true)
        
        // Esperar a que termine la animación del slot machine
        setTimeout(() => {
            if (tournamentType === 'pairs') {
                if (currentAssignmentIndex < pairs.length) {
                    const pair = pairs[currentAssignmentIndex];
                    const team = shuffledTeamsForAssignment[currentAssignmentIndex] || null;
                    pair.club = team || '';
                    const assignment = [pair.player1, pair.player2, team];
                    setAssignedTeams((prev) => [...prev, assignment]);
                    setCurrentAssignmentIndex(currentAssignmentIndex + 1);
                    
                    // Guardar en localStorage después de cada asignación
                    localStorage.setItem('pairs', JSON.stringify(pairs));
                    
                    // Mostrar confetti en la última asignación
                    if (currentAssignmentIndex === pairs.length - 1) {
                        setShowConfetti(true)
                        setTimeout(() => setShowConfetti(false), 4000)
                    }
                }
            } else {
                if (currentAssignmentIndex < (players?.length || 0)) {
                    const player = players![currentAssignmentIndex];
                    const club = shuffledTeamsForAssignment[currentAssignmentIndex] || null;
                    const newPlayer: IPlayers = {
                        player: player as unknown as string,
                        club: club || ''
                    };
                    setAssignedPlayers((prev) => [...prev, newPlayer]);
                    setCurrentAssignmentIndex(currentAssignmentIndex + 1);
                    
                    // Guardar en localStorage después de cada asignación
                    const allAssigned = [...assignedPlayers, newPlayer];
                    localStorage.setItem('assignedPlayers', JSON.stringify(allAssigned));
                    
                    // Mostrar confetti en la última asignación
                    if (currentAssignmentIndex === (players?.length || 0) - 1) {
                        setShowConfetti(true)
                        setTimeout(() => setShowConfetti(false), 4000)
                    }
                }
            }
            setRevealingClub(false)
        }, 100)
    }

    const areAllTeamsAssigned = assignedTeams.length === pairs.length && 
    assignedTeams.every((assignment) => assignment[2] !== null);

    const assignTeamsToPlayers = (manual: boolean = false) => {
        setIsManualMode(manual);
        setIsAssigning(true);
        
        // Generar un solo shuffle que se usará para todas las asignaciones
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        setShuffledTeamsForAssignment(shuffledTeams);
        
        const newAssignedPlayers: IPlayers[] = players ? players.map((player, index) => {
            const club = shuffledTeams[index] || null; 
            return {
                player: player as unknown as string,
                club: club || ''
            };
        }) : []; 
        
        if (manual) {
            // Modo manual: asignar uno por uno
            setAssignedPlayers([]);
            setCurrentAssignmentIndex(0);
            setIsAssigning(false);
        } else {
            // Modo automático: asignar todos de una vez
            localStorage.setItem('assignedPlayers', JSON.stringify(newAssignedPlayers));
            setAssignedPlayers(newAssignedPlayers);
            setIsAssigning(false);
        }
    };
    

    const assignmentProgress = tournamentType === 'pairs' 
        ? (assignedTeams.filter(t => t && t[2]).length / (pairs.length || 1)) * 100
        : (assignedPlayers.filter(p => p.club).length / (players?.length || 1)) * 100

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Equipos de Fútbol</h1>
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
            
            {assignmentProgress > 0 && assignmentProgress < 100 && (
                <Card className="mb-6 border-primary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shuffle className="h-5 w-5" />
                            Progreso de Asignación
                        </CardTitle>
                        <CardDescription>
                            {Math.round(assignmentProgress)}% completado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full bg-secondary rounded-full h-3">
                            <div 
                                className="bg-primary h-3 rounded-full transition-all duration-300"
                                style={{ width: `${assignmentProgress}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    <Button size="lg" className="mb-6 w-full md:w-auto">
                        <Plus className="mr-2 h-5 w-5" />
                        Agregar Club
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Agregar Club</DrawerTitle>
                            <DrawerDescription>
                                Añade un club de fútbol que se asignará aleatoriamente
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 pb-0">
                            <Input
                                type="text"
                                value={newTeam}
                                onChange={(e) => setNewTeam(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                                placeholder="Nombre del club (ej: Real Madrid)"
                                className="text-lg"
                                autoFocus
                            />
                        </div>
                        <DrawerFooter>
                            <Button onClick={addTeam} disabled={!newTeam.trim()} size="lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Agregar
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Clubes Disponibles</CardTitle>
                        <Badge variant="secondary" className="text-base">
                            <Shield className="h-4 w-4 mr-1" />
                            {teams.length}
                        </Badge>
                    </div>
                    <CardDescription>
                        Lista de clubes que se asignarán a los participantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {teams.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No hay clubes aún</p>
                            <p className="text-sm">Agrega clubes arriba para asignarlos</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {teams.map((team, index) => (
                                <li key={index} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{index + 1}</Badge>
                                        <span className="font-medium">{team}</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeTeam(index)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {tournamentType === 'pairs' ? 'Parejas Generadas' : 'Jugadores Disponibles'}
                    </CardTitle>
                    <CardDescription>
                        {tournamentType === 'pairs' 
                            ? 'Asignación de clubes a cada pareja'
                            : 'Asignación de clubes a cada jugador'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {tournamentType === 'pairs' ? (
                            pairs.map((pair, index) => {
                                const hasClub = assignedTeams[index] && assignedTeams[index][2]
                                return (
                                    <li key={index} className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className="text-base">Pareja #{index + 1}</Badge>
                                            {hasClub && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                        </div>
                                        <div className="flex items-center gap-2 text-lg font-medium mb-2">
                                            <span>{pair.player1}</span>
                                            <span className="text-muted-foreground">+</span>
                                            <span>{pair.player2}</span>
                                        </div>
                                        {hasClub ? (
                                            <Badge variant="secondary" className="text-sm">
                                                <Shield className="h-3 w-3 mr-1" />
                                                {assignedTeams[index][2]}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Sin club asignado</span>
                                        )}
                                    </li>
                                )
                            })
                        ) : (
                            assignedPlayers?.map((player, index) => {
                                const hasClub = player.club
                                return (
                                    <li key={index} className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{index + 1}</Badge>
                                                <span className="font-medium text-lg">{player.player}</span>
                                            </div>
                                            {hasClub && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                        </div>
                                        {hasClub ? (
                                            <Badge variant="secondary" className="text-sm">
                                                <Shield className="h-3 w-3 mr-1" />
                                                {player.club}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Sin club asignado</span>
                                        )}
                                    </li>
                                )
                            })
                        )}
                    </ul>
                </CardContent>
            </Card>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shuffle className="h-5 w-5" />
                        Asignar Clubes
                    </CardTitle>
                    <CardDescription>
                        Elige cómo asignar los clubes a los {tournamentType === 'pairs' ? 'parejas' : 'jugadores'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-3">
                        {tournamentType === 'pairs' ? (
                            <>
                                <Button 
                                    onClick={() => assignClubs(false)} 
                                    disabled={teams.length < 2 || pairs.length < 2 || isAssigning}
                                    size="lg"
                                    className="flex-1"
                                    variant="default"
                                >
                                    <Shuffle className="mr-2 h-5 w-5" />
                                    Asignación Automática
                                </Button>
                                <Button 
                                    onClick={() => assignClubs(true)} 
                                    disabled={teams.length < 2 || pairs.length < 2 || isAssigning}
                                    size="lg"
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <Shield className="mr-2 h-5 w-5" />
                                    Asignación Manual (Presentación)
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    onClick={() => assignClubs(false)} 
                                    disabled={!players || players.length < 2 || isAssigning}
                                    size="lg"
                                    className="flex-1"
                                    variant="default"
                                >
                                    <Shuffle className="mr-2 h-5 w-5" />
                                    Asignación Automática
                                </Button>
                                <Button 
                                    onClick={() => assignClubs(true)} 
                                    disabled={!players || players.length < 2 || isAssigning}
                                    size="lg"
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <Shield className="mr-2 h-5 w-5" />
                                    Asignación Manual (Presentación)
                                </Button>
                            </>
                        )}
                    </div>
                    {isManualMode && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                            <p className="text-sm font-medium mb-2">
                                Modo Presentación: {tournamentType === 'pairs' ? assignedTeams.length : assignedPlayers.length} de {tournamentType === 'pairs' ? pairs.length : players?.length || 0} asignaciones reveladas
                            </p>
                            {revealingClub ? (
                                <div className="py-4">
                                    <SlotMachineClub 
                                        finalClub={shuffledTeamsForAssignment[currentAssignmentIndex]}
                                        allClubs={teams}
                                        onComplete={() => {}}
                                    />
                                </div>
                            ) : (
                                ((tournamentType === 'pairs' && currentAssignmentIndex < pairs.length) || 
                                  (tournamentType !== 'pairs' && currentAssignmentIndex < (players?.length || 0))) && (
                                    <RevealButton 
                                        onClick={revealNextAssignment}
                                        icon={Shield}
                                        text="Revelar Siguiente Asignación"
                                        disabled={false}
                                    />
                                )
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="flex gap-4 justify-end">
                {areAllTeamsAssigned && (
                    <Button onClick={handleSubmit} size="lg">
                        Continuar
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
            </div>
            
            {/* Confetti cuando se completan todas las asignaciones */}
            {showConfetti && <ConfettiEffect />}
        </div>
    )
}
