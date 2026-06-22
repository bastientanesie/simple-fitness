export type ExerciseCategory = 'legs' | 'hips' | 'back' | 'core' | 'shoulders'

export interface Exercise {
  id: string
  name: string
  emoji: string
  tc: string
  category: ExerciseCategory
  target: string
  sets: number
  reps?: string
  duration?: number
  rest: number
  gear: string | null
  pos: string
  cue: string
  sides?: true
}

export const CAT_LABELS: Record<ExerciseCategory, string> = {
  legs: 'Jambes',
  hips: 'Hanches',
  back: 'Dos',
  core: 'Gainage',
  shoulders: 'Épaules',
}

export const exercises: Exercise[] = [
  // JAMBES / GENOUX
  {
    id: 'squat', category: 'legs', name: 'Squat', emoji: '🦵', tc: '#60a5fa',
    target: 'Jambes · Genoux', sets: 3, reps: '12 reps', rest: 45, gear: null,
    pos: "Debout, pieds écartés largeur épaules, orteils légèrement vers l'extérieur",
    cue: "Descends comme pour t'asseoir sur une chaise. Genoux dans l'axe des orteils. Dos droit, regard devant. Remonte en poussant dans les talons.",
  },
  {
    id: 'lunge', category: 'legs', name: 'Fente avant', emoji: '🚶', tc: '#60a5fa',
    target: 'Jambes · Genoux', sets: 3, reps: '10 reps / côté', rest: 45, gear: null,
    pos: 'Debout, pieds joints',
    cue: "Grand pas en avant, descends le genou arrière vers le sol sans le toucher. Genou avant dans l'axe du pied, pas au-delà des orteils. Repousse pour revenir.",
  },
  {
    id: 'lunge-back', category: 'legs', name: 'Fente arrière', emoji: '🔙', tc: '#60a5fa',
    target: 'Jambes · Fessiers', sets: 3, reps: '10 reps / côté', rest: 45, gear: null,
    pos: 'Debout, pieds joints, mains sur les hanches',
    cue: "Grand pas en arrière, descends le genou arrière près du sol sans le toucher. Tronc droit. Repousse sur le pied avant pour revenir. Alterne les côtés.",
  },
  {
    id: 'wallsit', category: 'legs', name: 'Chaise', emoji: '🪑', tc: '#60a5fa',
    target: 'Jambes · Genoux', sets: 3, reps: '30 s', duration: 30, rest: 45, gear: null,
    pos: 'Dos contre le mur, pieds à 60 cm du mur, genoux à 90°',
    cue: "Dos bien plaqué contre le mur, cuisses parallèles au sol. Respire normalement. Si 30s devient confortable après quelques séances, vise 45s.",
  },
  {
    id: 'glute', category: 'legs', name: 'Pont fessier', emoji: '🌉', tc: '#60a5fa',
    target: 'Genoux · Fessiers', sets: 3, reps: '10 reps', rest: 45, gear: null,
    pos: 'Sur le dos — genoux fléchis à 90°, pieds à plat au sol',
    cue: "Soulève le bassin jusqu'à une ligne droite épaules → genoux. Tiens 2s en haut. Redescends lentement.",
  },
  {
    id: 'clam', category: 'legs', name: 'Clamshell', emoji: '🦪', tc: '#60a5fa',
    target: 'Genoux · Hanches', sets: 2, reps: '12 reps / côté', rest: 45, gear: 'élastique',
    sides: true,
    pos: 'Couché sur le côté — élastique au-dessus des genoux, hanches fléchies ~45°, genoux pliés',
    cue: "Ouvre le genou du dessus vers le plafond comme une moule. Pieds collés. Résiste à l'élastique à la fermeture — ne laisse pas claquer.",
  },
  {
    id: 'squat-jump', category: 'legs', name: 'Squat sauté', emoji: '⚡', tc: '#60a5fa',
    target: 'Jambes · Cardio', sets: 3, reps: '10 reps', rest: 45, gear: null,
    pos: 'Debout, pieds écartés largeur épaules',
    cue: "Descends en squat, puis pousse explosivement pour décoller du sol. Réception souple sur les avant-pieds, genoux légèrement fléchis à l'atterrissage. Enchaîne directement.",
  },
  // HANCHES
  {
    id: 'fire-hydrant', category: 'hips', name: 'Fire Hydrant', emoji: '🐕', tc: '#fb923c',
    target: 'Hanches · Fessier profond', sets: 3, reps: '10 reps / côté', rest: 30, gear: null,
    pos: 'À 4 pattes — poignets sous épaules, genoux sous hanches',
    cue: "Ouvre le genou latéralement vers le plafond en gardant la jambe fléchie à 90°. Bassin immobile — toute la rotation vient de la hanche. Reviens lentement. Change de côté.",
  },
  {
    id: 'hip-9090', category: 'hips', name: 'Hip 90/90', emoji: '🧘', tc: '#fb923c',
    target: 'Hanches · Mobilité', sets: 2, reps: '8 reps / côté', rest: 30, gear: null,
    pos: 'Assis au sol — jambe avant fléchie à 90° devant toi, jambe arrière fléchie à 90° sur le côté (tibia parallèle au tronc). Mains au sol pour l\'équilibre.',
    cue: "Bascule lentement le poids d'un côté à l'autre en passant par le centre. Le genou avant passe devant, le genou arrière part derrière. Tu dois sentir l'étirement dans les rotateurs de hanche. Pas de douleur articulaire.",
  },
  {
    id: 'band-walk', category: 'hips', name: 'Lateral Band Walk', emoji: '🦀', tc: '#fb923c',
    target: 'Hanches · Genoux', sets: 2, reps: '10 pas / côté', rest: 30, gear: 'élastique',
    pos: 'Debout — élastique au-dessus des genoux, pieds écartés largeur hanches, légère flexion de genoux',
    cue: "Fais 10 pas latéraux vers la droite, puis 10 vers la gauche. Garde les pieds parallèles, ne laisse pas les genoux rentrer vers l'intérieur. Résiste à l'élastique à chaque pas.",
  },
  // DOS
  {
    id: 'catcow', category: 'back', name: 'Cat-Cow', emoji: '🐈', tc: '#4ade80',
    target: 'Dos', sets: 2, reps: '10 reps', rest: 30, gear: null,
    pos: 'À 4 pattes — poignets sous épaules, genoux sous hanches',
    cue: "Inspiration : creuse le dos, ventre vers le sol, tête qui se lève. Expiration : arrondis le dos vers le plafond, tête qui tombe. Lent, guidé par la respiration.",
  },
  {
    id: 'birddog', category: 'back', name: 'Bird-Dog', emoji: '🦅', tc: '#4ade80',
    target: 'Dos · Gainage', sets: 3, reps: '8 reps / côté', rest: 45, gear: null,
    pos: 'À 4 pattes — même position que le cat-cow',
    cue: "Tends le bras droit et la jambe gauche simultanément, horizontaux. Tiens 2-3s, reviens, change de côté. Dos plat, pas de rotation du bassin. Le plus technique — prends le temps de bien te placer.",
  },
  {
    id: 'superman', category: 'back', name: 'Superman', emoji: '🦸', tc: '#4ade80',
    target: 'Dos · Lombaires', sets: 3, reps: '10 reps', rest: 45, gear: null,
    pos: 'Allongé sur le ventre, bras tendus devant toi',
    cue: "Soulève simultanément bras et jambes du sol, tiens 2s, redescends lentement. Regard vers le sol, pas de tension dans la nuque.",
  },
  // GAINAGE
  {
    id: 'plank', category: 'core', name: 'Planche', emoji: '🏋️', tc: '#a78bfa',
    target: 'Gainage', sets: 3, reps: '20 s', duration: 20, rest: 45, gear: null,
    pos: 'Avant-bras au sol, corps en ligne droite des épaules aux talons',
    cue: "Contracte le ventre et les fessiers. Ne laisse pas le bassin monter ou descendre. Respire. Si 20s devient confortable, vise 30s.",
  },
  {
    id: 'deadbug', category: 'core', name: 'Dead Bug', emoji: '🐛', tc: '#a78bfa',
    target: 'Gainage · Dos', sets: 3, reps: '8 reps / côté', rest: 45, gear: null,
    pos: "Sur le dos, bras tendus vers le plafond, genoux fléchis à 90° en l'air",
    cue: "Descends simultanément le bras droit et la jambe gauche vers le sol sans les poser. Dos plaqué au sol. Reviens, change de côté. Lent et contrôlé.",
  },
  {
    id: 'mountain-climber', category: 'core', name: 'Mountain Climber', emoji: '🧗', tc: '#a78bfa',
    target: 'Gainage · Cardio', sets: 3, reps: '20 s', duration: 20, rest: 45, gear: null,
    pos: 'Position de pompe — bras tendus, mains sous les épaules, corps en planche',
    cue: "Ramène les genoux vers la poitrine en alternance, le plus rapidement possible sans creuser le dos. Respire régulièrement. Si 20s devient facile, vise 30s.",
  },
  // ÉPAULES / POSTURE
  {
    id: 'pullap', category: 'shoulders', name: 'Band Pull-Apart', emoji: '💪', tc: '#f472b6',
    target: 'Épaules · Posture', sets: 2, reps: '12 reps', rest: 30, gear: 'élastique',
    pos: 'Debout — élastique à hauteur de poitrine, bras tendus devant toi',
    cue: "Écarte les bras latéralement jusqu'à ce que l'élastique touche ta poitrine. Contrôle le retour — pas de relâchement brutal. Omoplates qui se rapprochent dans le dos.",
  },
  {
    id: 'wallang', category: 'shoulders', name: 'Wall Angel', emoji: '😇', tc: '#f472b6',
    target: 'Épaules · Mobilité', sets: 2, reps: '10 reps', rest: 30, gear: null,
    pos: "Dos contre le mur, bras fléchis à 90° (position « mains en l'air »), coudes et poignets contre le mur",
    cue: "Fais glisser les bras vers le haut pour former un W puis un Y, en gardant contact avec le mur. Lent. Si les poignets décollent, ne force pas — c'est normal au début.",
  },
]
