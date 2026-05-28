export type ExerciseCategory = 'legs' | 'back' | 'core' | 'shoulders'
export type ExerciseType = 'timed' | 'reps'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  type: ExerciseType
  sets: number
  reps?: number
  duration?: number
  rest: number
}

export const exercises: Exercise[] = []
