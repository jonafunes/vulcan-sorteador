'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Users2, Trophy } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const handleTournamentTypeSelection = (type: 'individual' | 'pairs') => {
    localStorage.setItem('tournamentType', type)
    router.push(`/participants?type=${type}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-12">
        <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-4xl font-bold mb-2 text-center">Torneo de FIFA</h1>
        <p className="text-muted-foreground text-center">Selecciona el tipo de torneo que deseas crear</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200"
          onClick={() => handleTournamentTypeSelection('individual')}
        >
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <User className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Torneo Individual</CardTitle>
            <CardDescription className="text-base">
              Competencia uno contra uno
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Cada jugador compite por su cuenta
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Sistema de eliminación directa
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Ideal para 4-16 jugadores
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200"
          onClick={() => handleTournamentTypeSelection('pairs')}
        >
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Torneo en Parejas</CardTitle>
            <CardDescription className="text-base">
              Competencia en equipos de dos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Parejas aleatorias o personalizadas
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Asignación de clubes por pareja
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Ideal para 8-32 jugadores
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}