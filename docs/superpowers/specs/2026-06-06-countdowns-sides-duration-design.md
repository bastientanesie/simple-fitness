# Design — Countdowns, changements de côté & durées configurables

**Date :** 2026-06-06

## Contexte

Quatre améliorations au flux de séance :

1. Décompte 5-4-3-2-1-GO avant le début de chaque étirement
2. Décompte 5-4-3-2-1-GO au changement de côté d'un étirement (5s au lieu de 3)
3. Décompte 5-4-3-2-1-GO au changement de côté d'un exercice bilatéral (clamshell)
4. Durée des exercices "Planche" et "Chaise" configurable dans les réglages

Le décompte 3-2-1-GO des exercices passe également à 5-4-3-2-1-GO pour uniformiser.

---

## Décisions d'architecture

### Décompte unifié

Un seul mécanisme de décompte (`countdownValue` + watch) couvre tous les écrans de countdown. `countdownValue` va de 1 à 6 :
- valeurs 1–5 → `audio.tick()`, affichage `6 - countdownValue` (soit 5, 4, 3, 2, 1)
- valeur 6 → `audio.go()`, puis transition vers l'écran suivant

Aucun `useTimer` supplémentaire n'est nécessaire pour les side-change screens.

### Composant SideChangeScreen partagé

`SideChangeScreen.vue` est utilisé pour les changements de côté étirement ET exercice. Il reçoit un prop `title: string` (nom de l'étirement ou de l'exercice). Le décompte y suit le même mécanisme que `CountdownScreen`.

### Exercices bilatéraux — uniquement clamshell

Seul le clamshell (`id: 'clam'`) reçoit `sides: true`. Les fentes ("10 reps / côté") restent gérées manuellement par l'utilisateur sans side-switch dans la machine d'état.

### Configuration des durées

`ExerciseOverride` reçoit un champ `duration?: number`. `buildSession()` l'applique aux exercices ayant un `duration` dans la pool. Les steppers dans `SettingsView` n'apparaissent que pour les exercices `timed` (planche, chaise).

---

## Nouveaux états de la machine d'état

`ScreenName` reçoit trois nouveaux états :

| État | Déclencheur | Transition sortante |
|------|-------------|---------------------|
| `'stretchCountdown'` | `startStretch()` appelé depuis `StretchIntroScreen` | GO → `'stretch'` |
| `'stretchSideChange'` | Côté 0 terminé sur étirement bilatéral | GO → `'stretch'` (côté 1) |
| `'exerciseSideChange'` | Dernier set côté 0 d'un exercice `sides: true` | GO → `'countdown'` (côté 1) |

`snapScreen` pour la persistance :
- `'stretchSideChange'` → snaps vers `'stretchIntro'`
- `'exerciseSideChange'` → snaps vers `'intro'`

---

## Flux de la machine d'état (useSession.ts)

### Nouvel état

```ts
const exerciseSide = ref<0 | 1>(0)
```

Ajouté à `PersistedState` et persisté avec le reste de la session.

### Watch countdownValue — version unifiée

Le watch sur `[screen, countdownValue]` couvre désormais quatre écrans :
`'countdown'`, `'stretchCountdown'`, `'stretchSideChange'`, `'exerciseSideChange'`.

Comportement identique pour tous : ticks à 1–5, go à 6. La transition après GO dépend de l'écran :

- `'countdown'` → `'active'`
- `'stretchCountdown'` → `'stretch'` (avec `stretchSide = 0`)
- `'stretchSideChange'` → `stretchSide = 1`, démarrage `stretchTimer`, `'stretch'`
- `'exerciseSideChange'` → `exerciseSide = 1`, `setNumber = 1`, `'countdown'`

### startStretch()

```ts
function startStretch() {
  screen.value = 'stretchCountdown'
}
```

`stretchSide` est initialisé à 0 au moment de l'entrée dans `'stretchCountdown'` (dans le screen watch).

### handleNextSide()

```ts
function handleNextSide() {
  stretchTimer.stop()
  audio.side()
  countdownValue.value = 1
  screen.value = 'stretchSideChange'
}
```

La transition vers `'stretch'` avec `stretchSide = 1` et le démarrage du `stretchTimer` se font dans le watch countdown au GO.

### Fin du dernier set d'un exercice bilatéral

Dans la logique existante de fin de set (actuellement `→ 'exdone'` ou `→ 'rest'`) : si `exercise.sides === true && exerciseSide.value === 0` et c'est le dernier set → `screen = 'exerciseSideChange'`.

Après le dernier set côté 1 → flux normal `'exdone'` → exercice suivant, et `exerciseSide.value = 0`.

`exerciseSide` est remis à 0 à chaque changement d'exercice (dans `handleNext()` et `handleRestart()`).

### Ticks audio sur les side-change screens

Le watch existant sur `restTimer.value` et `stretchTimer.value` joue `audio.tick()` pour les 3 dernières secondes. Les side-change screens utilisent `countdownValue`, donc les ticks sont déjà couverts par le watch countdown unifié.

---

## Composants UI

### CountdownScreen.vue — modifications

Prop supplémentaire optionnel :

```ts
const props = defineProps<{
  countdownValue: number
  exercise?: Exercise
  setNumber?: number
  stretchName?: string
}>()
```

Logique d'affichage :
- Valeur affichée : `countdownValue <= 5 ? (6 - countdownValue) : 'GO'` (au lieu de `4 - countdownValue`)
- En mode étirement (`stretchName` fourni) : affiche le nom de l'étirement à la place de l'exercice + numéro de set

### SideChangeScreen.vue — nouveau composant

```
src/components/screens/SideChangeScreen.vue
```

Props :
```ts
defineProps<{
  title: string        // nom de l'exercice ou de l'étirement
  countdownValue: number
}>()
```

Affiche :
- "Changez de côté"
- `title`
- Décompte : `countdownValue <= 5 ? (6 - countdownValue) : 'GO'`

Style cohérent avec les écrans existants.

### SessionView.vue — modifications

Ajouter les trois nouveaux cas dans le template :

```html
<CountdownScreen
  v-else-if="s.screen.value === 'stretchCountdown'"
  :countdown-value="s.countdownValue.value"
  :stretch-name="s.currentStretch.value?.name"
/>

<SideChangeScreen
  v-else-if="s.screen.value === 'stretchSideChange'"
  :title="s.currentStretch.value?.name"
  :countdown-value="s.countdownValue.value"
/>

<SideChangeScreen
  v-else-if="s.screen.value === 'exerciseSideChange'"
  :title="s.currentExercise.value?.name"
  :countdown-value="s.countdownValue.value"
/>
```

---

## Données et configuration

### exercises.ts

**Interface Exercise** : ajout de `sides?: true`.

**Exercice `clam`** : ajouter `sides: true`.

### useProgram.ts

**ExerciseOverride** : ajout de `duration?: number`.

```ts
export interface ExerciseOverride {
  enabled: boolean
  sets: number
  rest: number
  duration?: number
}
```

**makeDefault()** : initialiser `duration` pour les exercices timed :

```ts
exercises: Object.fromEntries(
  exercises.map(e => [e.id, {
    enabled: true,
    sets: e.sets,
    rest: e.rest,
    ...(e.duration !== undefined ? { duration: e.duration } : {}),
  }])
)
```

**mergeConfig()** : propager `duration` lors de la fusion (même pattern que sets/rest).

**buildSession()** : appliquer `override.duration` à l'exercice construit si présent.

### SettingsView.vue

Dans la section de configuration par exercice, ajouter un stepper durée pour les exercices `timed` (ceux ayant `duration` dans la pool) :

- Pas : 5 secondes
- Minimum : 10 secondes
- Pas de maximum
- Label : "Durée"
- Affiché uniquement si `exercise.duration !== undefined`

Pattern identique aux steppers sets/rest existants (`adjustExerciseDuration(id, delta)`).

---

## Fichiers modifiés / créés

| Fichier | Action |
|---------|--------|
| `src/composables/useSession.ts` | Modifier — nouveaux états, watch unifié, `exerciseSide` |
| `src/data/exercises.ts` | Modifier — `sides?: true` sur interface + `clam` |
| `src/composables/useProgram.ts` | Modifier — `duration?` dans ExerciseOverride, makeDefault, mergeConfig, buildSession |
| `src/components/screens/CountdownScreen.vue` | Modifier — `stretchName` prop, affichage 6-countdownValue |
| `src/components/screens/SideChangeScreen.vue` | Créer |
| `src/views/SessionView.vue` | Modifier — 3 nouveaux cas dans le template |
| `src/views/SettingsView.vue` | Modifier — stepper durée pour exercices timed |
