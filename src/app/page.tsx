'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  const handleTournamentTypeSelection = (type: 'individual' | 'pairs') => {
    localStorage.setItem('tournamentType', type)
    router.push(`/participants?type=${type}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Torneo de FIFA</h1>
      <div className="flex flex-col items-center space-y-4">
        <Button 
          size="lg" 
          onClick={() => handleTournamentTypeSelection('individual')}
          className="w-full max-w-xs"
        >
          Torneo Individual
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleTournamentTypeSelection('pairs')}
          className="w-full max-w-xs"
        >
          Torneo en Parejas
        </Button>
      </div>
    </div>
  )
}