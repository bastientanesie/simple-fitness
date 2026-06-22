export interface Warmup {
  id: string
  name: string
  emoji: string
  duration: number
  description: string
  detail: string
}

export const warmups: Warmup[] = [
  {
    id: 'bike',
    name: 'Vélo d\'appartement',
    emoji: '🚴',
    duration: 300,
    description: 'Résistance minimale',
    detail: 'Mouvement continu sans impact, chaleur articulaire progressive.',
  },
  {
    id: 'dynamic-mobility',
    name: 'Mobilité dynamique',
    emoji: '🔄',
    duration: 300,
    description: 'Rotations articulaires',
    detail: 'Chevilles → genoux → hanches → épaules → cou, 8 rotations chaque. 10 balancements de jambe avant/arrière par côté.',
  },
  {
    id: 'active-walk',
    name: 'Marche active sur place',
    emoji: '🚶',
    duration: 300,
    description: 'Marche + montées de genoux',
    detail: '2 min marche normale → 2 min montées de genoux → 1 min relâchement. Bras actifs.',
  },
  {
    id: 'floor-mobility',
    name: 'Mobilité au sol',
    emoji: '🧘',
    duration: 300,
    description: 'Tapis · séquence au sol',
    detail: 'Cat-cow × 8 · genoux au ventre 20 s/côté · rotation colonne × 6/côté · pont fessier × 5.',
  },
]
