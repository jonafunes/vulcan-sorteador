'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'
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
    const [isGeneratingPairs, setIsGeneratingPairs] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [shownPairs, setShownPairs] = useState<string[][]>([]) // To track displayed pairs

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
        if (newParticipant.trim()) {
            const updatedParticipants = [...participants, newParticipant.trim()]
            setParticipants(updatedParticipants)
            localStorage.setItem(`participants_${type}`, JSON.stringify(updatedParticipants))
            setNewParticipant('')
        }
    }

    const removeParticipant = (index: number) => {
        const updatedParticipants = participants.filter((_, i) => i !== index)
        setParticipants(updatedParticipants)
        localStorage.setItem(`participants_${type}`, JSON.stringify(updatedParticipants))
    }

    const generatePairs = () => {
        localStorage.removeItem('pairs'); // Limpiar el localStorage antes de generar nuevas parejas
    
        if (participants.length < 4) {
            setError("Se necesitan al menos 4 participantes para generar parejas.");
            return;
        }
    
        setIsGeneratingPairs(true);
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
                    club: '', // Atributo `club` vacío por ahora
                });
            } else {
                // Si hay un número impar de participantes, el último se empareja con "BYE"
                newPairs.push({
                    player1: shuffled[i],
                    player2: 'BYE',
                    club: '', // También asignamos el atributo `club` vacío
                });
            }
        }
    
        // Guardar las nuevas parejas en el localStorage con el atributo `club`
        localStorage.setItem('pairs', JSON.stringify(newPairs));
    
        // Mostrar las parejas una por una con un retraso
        setPairs(newPairs.map(pair => [pair.player1, pair.player2]));
        setShownPairs([]); // Restablecer las parejas mostradas antes de empezar
    
        newPairs.forEach((pair, index) => {
            setTimeout(() => {
                setShownPairs((prev) => [...prev, [pair.player1, pair.player2]]);
            }, index * 1000); // 1 segundo de retraso por pareja
        });
    
        setIsGeneratingPairs(false);
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
            <h1 className="text-3xl font-bold mb-4">
                {type === 'individual' ? 'Participantes Individuales' : 'Participantes para Parejas'}
            </h1>
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
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    placeholder="Nombre del participante"
                    className="flex-grow"
                />
                <Button onClick={addParticipant}>Agregar</Button>
            </div>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Lista de Participantes</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {participants.map((participant, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span>{participant}</span>
                                <Button variant="destructive" size="sm" onClick={() => removeParticipant(index)}>Eliminar</Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            {type === 'pairs' && (
                <>
                    <Button onClick={generatePairs} className="mb-4" disabled={isGeneratingPairs}>
                        {isGeneratingPairs ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generando Parejas...
                            </>
                        ) : (
                            'Generar Parejas'
                        )}
                    </Button>
                    {shownPairs.length > 0 && (
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Parejas Generadas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {shownPairs.map((pair, index) => (
                                        <li key={index} className="flex justify-between items-center">
                                            <span><strong>Pareja #{index + 1}:</strong> {pair[0]} y {pair[1]}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
            {type === 'individual' && (
                <Button onClick={handleSubmit}>Continuar</Button>
            )}
            {shownPairs.length >= 2 && type === 'pairs' && (
                <Button onClick={handleSubmit}>Continuar</Button>
            )}
        </div>
    )
}
