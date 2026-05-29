export type Stretch =
  | {
      id: string
      name: string
      emoji: string
      tc: string
      sides: boolean
      pos: string
      cue: string
      duration: number
    }
  | {
      id: string
      name: string
      emoji: string
      tc: string
      sides: boolean
      pos: string
      cue: string
      duration: null
      reps: number
    }

export const stretches: Stretch[] = [
  {
    id: 'child-pose', name: 'Posture enfant', emoji: '🧘', tc: '#4ade80',
    duration: 40, sides: false,
    pos: 'À genoux, assis sur les talons, bras étirés devant toi sur le sol, front posé',
    cue: "Laisse le dos s'allonger naturellement. Respiration profonde et lente. Relâche les épaules complètement à chaque expiration.",
  },
  {
    id: 'hamstring', name: 'Ischio-jambiers couché', emoji: '🦵', tc: '#60a5fa',
    duration: 30, sides: true,
    pos: 'Sur le dos — une jambe tendue vers le plafond, mains derrière la cuisse',
    cue: "Tire doucement la jambe vers toi sans plier le genou. Tu dois sentir l'arrière de la cuisse. L'autre jambe reste à plat au sol. Pas de douleur, juste une tension douce.",
  },
  {
    id: 'piriformis', name: 'Piriforme', emoji: '🔄', tc: '#a78bfa',
    duration: 30, sides: true,
    pos: "Sur le dos — cheville d'une jambe posée sur le genou opposé",
    cue: "Tire la jambe du dessous vers ta poitrine. Tu dois sentir l'étirement profond dans la fesse. Respire et relâche à chaque expiration.",
  },
  {
    id: 'chest-opener', name: 'Ouverture pectorale', emoji: '🤸', tc: '#f472b6',
    duration: 30, sides: true,
    pos: 'Au sol sur le côté — bras supérieur tendu vers le plafond, puis laisse-le tomber derrière toi',
    cue: "Laisse l'épaule et la poitrine s'ouvrir vers l'arrière sous le poids du bras. Hanches stables. Respiration lente.",
  },
  {
    id: 'cat-cow', name: 'Cat-cow lent', emoji: '🐈', tc: '#fbbf24',
    duration: null, sides: false, reps: 8,
    pos: 'À 4 pattes — poignets sous épaules, genoux sous hanches',
    cue: "8 répétitions très lentes, guidées par la respiration. C'est la clôture de la séance — prends ton temps, ressens chaque vertèbre.",
  },
]
