'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, UserPlus, Trash2, Shuffle, ArrowRight, AlertCircle } from 'lucide-react'
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

export default function Participants() {
    const router = useRouter()
    const [type, setType] = useState<'individual' | 'pairs'>('individual')
    const [participants, setParticipants] = useState<string[]>([])
    const [newParticipant, setNewParticipant] = useState('')
    const [pairs, setPairs] = useState<string[][]>([])
    const [isGeneratingPairs, setIsGeneratingPairs] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [shownPairs, setShownPairs] = useState<string[][]>([])
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [allPairs, setAllPairs] = useState<string[][]>([])
    const [currentPairIndex, setCurrentPairIndex] = useState<number>(0)
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
    }, [])

    const addParticipant = () => {
        if (!newParticipant.trim()) {
            setError("El nombre no puede estar vacío")
            return
        }
        if (participants.includes(newParticipant.trim())) {
            setError("Este participante ya está en la lista")
            return
        }
        const updatedParticipants = [...participants, newParticipant.trim()]
        setParticipants(updatedParticipants)
        localStorage.setItem(`participants_${type}`, JSON.stringify(updatedParticipants))
        setNewParticipant('')
        setError(null)
        setIsDrawerOpen(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addParticipant()
        }
    }

    const removeParticipant = (index: number) => {
        const updatedParticipants = participants.filter((_, i) => i !== index)
        setParticipants(updatedParticipants)
        localStorage.setItem(`participants_${type}`, JSON.stringify(updatedParticipants))
    }

    const generatePairs = (manual: boolean = false) => {
        localStorage.removeItem('pairs');
    
        if (participants.length < 4) {
            setError("Se necesitan al menos 4 participantes para generar parejas.");
            return;
        }
    
        setIsGeneratingPairs(true);
        setIsManualMode(manual);
        setError(null);
    
        // Mezclar el array de participantes
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
        // Generar las parejas con el atributo `club`
        const newPairs: { player1: string; player2: string; club: string }[] = [];
        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                newPairs.push({
                    player1: shuffled[i],
                    player2: shuffled[i + 1],
                    club: '',
                });
            } else {
                newPairs.push({
                    player1: shuffled[i],
                    player2: 'BYE',
                    club: '',
                });
            }
        }
    
        // Guardar las nuevas parejas en el localStorage
        localStorage.setItem('pairs', JSON.stringify(newPairs));
        setPairs(newPairs.map(pair => [pair.player1, pair.player2]));
        setAllPairs(newPairs.map(pair => [pair.player1, pair.player2]));
        setCurrentPairIndex(0);
    
        if (manual) {
            // Modo manual: no mostrar nada automáticamente
            setShownPairs([]);
            setIsGeneratingPairs(false);
        } else {
            // Modo automático: mostrar todas con animación
            setShownPairs([]);
            newPairs.forEach((pair, index) => {
                setTimeout(() => {
                    setShownPairs((prev) => [...prev, [pair.player1, pair.player2]]);
                    if (index === newPairs.length - 1) {
                        setIsGeneratingPairs(false);
                    }
                }, index * 1000);
            });
        }
    };

    const revealNextPair = () => {
        if (currentPairIndex < allPairs.length) {
            setShownPairs((prev) => [...prev, allPairs[currentPairIndex]]);
            setCurrentPairIndex(currentPairIndex + 1);
        }
    };
    
    

    const handleSubmit = () => {
        if (type === 'pairs' && pairs.length === 0) {
            setError("Por favor, genera las parejas antes de continuar.")
            return
        }

        router.push('/teams')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">
                    {type === 'individual' ? 'Participantes Individuales' : 'Participantes para Parejas'}
                </h1>
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
            
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    <Button size="lg" className="mb-6 w-full md:w-auto">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Agregar Participante
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Agregar Participante</DrawerTitle>
                            <DrawerDescription>
                                {type === 'individual' 
                                    ? 'Añade un jugador individual al torneo' 
                                    : 'Añade un jugador que luego se emparejará aleatoriamente'}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 pb-0">
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    value={newParticipant}
                                    onChange={(e) => setNewParticipant(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nombre del participante"
                                    className="text-lg"
                                    autoFocus
                                />
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                        <DrawerFooter>
                            <Button onClick={addParticipant} disabled={!newParticipant.trim()} size="lg">
                                <UserPlus className="mr-2 h-5 w-5" />
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
                        <CardTitle>Lista de Participantes</CardTitle>
                        <Badge variant="secondary" className="text-base">
                            <Users className="h-4 w-4 mr-1" />
                            {participants.length}
                        </Badge>
                    </div>
                    <CardDescription>
                        {type === 'individual' 
                            ? `Mínimo 2 participantes para comenzar` 
                            : `Mínimo 4 participantes para generar parejas`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {participants.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No hay participantes aún</p>
                            <p className="text-sm">Comienza agregando jugadores arriba</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {participants.map((participant, index) => (
                                <li key={index} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{index + 1}</Badge>
                                        <span className="font-medium">{participant}</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeParticipant(index)}
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
            {type === 'pairs' && (
                <>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shuffle className="h-5 w-5" />
                                Generar Parejas
                            </CardTitle>
                            <CardDescription>
                                Elige cómo generar las parejas aleatorias
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-3">
                                <Button 
                                    onClick={() => generatePairs(false)} 
                                    size="lg" 
                                    disabled={isGeneratingPairs || participants.length < 4}
                                    className="flex-1"
                                    variant="default"
                                >
                                    {isGeneratingPairs ? (
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
                                    onClick={() => generatePairs(true)} 
                                    size="lg" 
                                    disabled={isGeneratingPairs || participants.length < 4}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <Users className="mr-2 h-5 w-5" />
                                    Sorteo Manual (Presentación)
                                </Button>
                            </div>
                            {isManualMode && allPairs.length > 0 && (
                                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                                    <p className="text-sm font-medium mb-2">
                                        Modo Presentación: {shownPairs.length} de {allPairs.length} parejas reveladas
                                    </p>
                                    {currentPairIndex < allPairs.length && (
                                        <Button 
                                            onClick={revealNextPair}
                                            size="lg"
                                            className="w-full"
                                        >
                                            <Users className="mr-2 h-5 w-5" />
                                            Revelar Siguiente Pareja
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {shownPairs.length > 0 && allPairs.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Parejas Generadas
                                </CardTitle>
                                <CardDescription>
                                    {shownPairs.length} parejas creadas aleatoriamente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {shownPairs.map((pair, index) => (
                                        <li key={index} className="p-4 rounded-lg border bg-card">
                                            <div className="flex items-center justify-between">
                                                <Badge className="text-base px-3 py-1">Pareja #{index + 1}</Badge>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2 text-lg font-medium">
                                                <span>{pair[0]}</span>
                                                <span className="text-muted-foreground">+</span>
                                                <span>{pair[1]}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
            <div className="flex justify-end">
                {type === 'individual' && participants.length >= 2 && (
                    <Button onClick={handleSubmit} size="lg">
                        Continuar
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
                {shownPairs.length >= 2 && type === 'pairs' && (
                    <Button onClick={handleSubmit} size="lg">
                        Continuar
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    )
}
