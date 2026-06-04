# Design — Configuration de programme personnalisé

> Conçu le 2026-06-04. Décisions affinées le 2026-06-04 (session de grilling).

## Contexte

L'application fitness est actuellement câblée pour un seul programme en dur (pool de 12 exercices, 5 étirements fixes, 2 jambes + 1 dos + 1 gainage + 1 épaules par séance). L'objectif est de permettre à chaque utilisateur de configurer son propre programme via la page Settings, sans modifier le code — chaque appareil a sa propre config.

---

## Décisions de conception

- **Un seul profil par appareil** — pas de gestion multi-profils.
- **Sélection aléatoire conservée** — on garde le tirage par catégorie (pas de séances A/B fixes).
- **Quotas par catégorie configurables** — l'utilisateur choisit combien d'exercices par catégorie par séance.
- **Personnalisation complète par exercice** — séries et repos modifiables individuellement.
- **Pool extensible dans le code** — les nouveaux exercices sont ajoutés dans `exercises.ts`; l'utilisateur les active/désactive depuis Settings.
- **Config par défaut = comportement actuel** — aucun changement visible sans configuration.
- **Seuls `sets` et `rest` sont configurables** — la durée des exercices `timed` et les reps des exercices `reps` restent dans `exercises.ts` et ne sont pas exposés dans Settings.
- **Auto-save** — chaque modification dans SettingsView est persistée immédiatement via `useLocalStorage`. Pas de bouton "Enregistrer".
- **Settings sans effet sur la séance en cours** — les modifications de config n'affectent que la prochaine séance. La séance active continue avec les exercices générés au départ.

---

## 1. Pool étendu

Ajouter les exercices manquants dans `src/data/exercises.ts` (catégorie, sets/rest/reps par défaut) :

| id | Nom | Catégorie |
|---|---|---|
| `deadbug` | Dead Bug | `core` |
| `lunge-back` | Fente arrière | `legs` |
| `band-pull-apart` | Band Pull-Apart | `shoulders` |
| `plank` | Planche | `core` |
| `wall-angel` | Wall Angel | `shoulders` |

Le fichier reste une liste TypeScript plate, facile à étendre ultérieurement.

---

## 2. Modèle de données

### Type `ProgramConfig`

```ts
// src/composables/useProgram.ts

export interface ExerciseOverride {
  enabled: boolean
  sets: number
  rest: number       // secondes
}

export interface StretchEntry {
  id: string
  enabled: boolean
  duration?: number  // override de la durée (secondes)
  reps?: number      // override des reps (pour étirements sans timer)
}

export interface ProgramConfig {
  categoryQuotas: Record<ExerciseCategory, number>
  exercises: Record<string, ExerciseOverride>
  stretches: StretchEntry[]   // ordre du tableau = ordre de passage
}
```

### Clé localStorage

`program-config` — stocke la `ProgramConfig` sérialisée en JSON.

### Config par défaut

```ts
const DEFAULT_CONFIG: ProgramConfig = {
  categoryQuotas: { legs: 2, back: 1, core: 1, shoulders: 1 },
  exercises: Object.fromEntries(
    exercises.map(e => [e.id, { enabled: true, sets: e.sets, rest: e.rest }])
  ),
  stretches: stretches.map(s => ({
    id: s.id,
    enabled: true,
    ...(s.duration !== null ? { duration: s.duration } : { reps: s.reps }),
  })),
}
```

---

## 3. Composable `useProgram`

**Fichier** : `src/composables/useProgram.ts`

**Responsabilités** :
- Charger / persister la `ProgramConfig` en localStorage via `useLocalStorage`
- Merger les nouveaux exercices/étirements du pool au chargement (voir ci-dessous)
- Calculer les étirements résolus (filtrés, ordonnés, overrides appliqués)
- Exposer `buildSession(lastIds: string[]): Exercise[]`

### Merge au chargement

À l'initialisation, `useProgram` fusionne la config sauvegardée avec `DEFAULT_CONFIG` :

- **Exercices** : tout exercice présent dans le pool mais absent de `config.exercises` est ajouté avec `{ enabled: true, sets: e.sets, rest: e.rest }`. Les overrides existants sont préservés.
- **Étirements** : tout étirement présent dans `stretches.ts` mais absent de `config.stretches` est ajouté **en fin de tableau**, activé, avec ses valeurs par défaut. L'ordre des entrées existantes est préservé.

### `buildSession`

1. Pour chaque catégorie, récupérer les exercices activés dans la config
2. Si `exercices activés dans la catégorie ≤ quota[catégorie]` → ignorer `lastIds` pour cette catégorie (évite les doublons forcés quand le pool est petit)
3. Sinon, exclure les exercices présents dans `lastIds` avant le tirage
4. Piocher aléatoirement `quota[catégorie]` exercices (sans remise), avec dégradation gracieuse si pool insuffisant
5. Retourner le tableau d'exercices avec `sets` et `rest` overridés par la config

**Interface publique** :
```ts
{
  config: Ref<ProgramConfig>
  resolvedStretches: ComputedRef<Stretch[]>
  buildSession: (lastIds: string[]) => Exercise[]
  resetToDefault: () => void
}
```

---

## 4. Changements dans `useSession`

- Remplacer les imports directs de `exercises` et `stretches` par `useProgram()`
- `buildSession` vient de `useProgram`
- La liste d'étirements est fournie par `resolvedStretches` (computed depuis `useProgram`)
- Au rechargement de page en cours d'étirement, `resolvedStretches` est recalculé depuis la config sauvegardée — la liste d'étirements n'est **pas** persistée dans `session-state`
- Si `resolvedStretches.length === 0`, la phase étirements est sautée : `useSession` passe directement de `exdone` à `done`
- `handleRegen` et `handleRestart` appellent `buildSession` via `useProgram`
- La gestion de `last-session-ids` reste dans `useSession`

Aucun changement à la machine d'état ni aux handlers audio/timer.

---

## 5. SettingsView

Trois sections dans `src/views/SettingsView.vue` formant une page scrollable unique.

`SettingsView` importe `exercises` depuis `exercises.ts` (pour la structure du pool) et `config` depuis `useProgram()` (pour l'état des overrides). Pas de helpers supplémentaires dans `useProgram`.

### 5.1 Structure de séance

Pour chaque catégorie (Jambes, Dos, Gainage, Épaules) :
- Label de catégorie
- Stepper libre : `−` / valeur / `+` (min 0)
- Si `exercices activés dans la catégorie < quota` : indicateur d'avertissement inline (ex. "seulement N disponible(s)")

Total affiché sous les steppers : « N exercices par séance » (somme des quotas configurés).

### 5.2 Exercices

Liste groupée par catégorie. Chaque ligne d'exercice :
- Toggle on/off + nom de l'exercice
- Quand activé : stepper libre Séries (incrément 1, min 1) + stepper libre Repos en secondes (incrément 5s, min 0)
- Quand désactivé : options masquées, ligne grisée

### 5.3 Étirements

Liste ordonnée. Chaque ligne :
- Toggle on/off + nom de l'étirement
- Boutons ↑ / ↓ pour réordonner
- Stepper libre de durée en secondes (incrément 5s) — ou reps si l'étirement est de type reps (incrément 1)

### Réinitialisation

Bouton « Réinitialiser » en bas de page : affiche une boîte de dialogue de confirmation (Annuler / Confirmer) avant de remettre `DEFAULT_CONFIG`.

---

## 6. Flux de données

```
exercises.ts / stretches.ts   ← pool complet (source de vérité statique)
        ↓
useProgram()                  ← config utilisateur + résolution des overrides
        ↓
useSession()                  ← machine d'état (buildSession, resolvedStretches)
        ↓
SessionView / SettingsView    ← affichage
```

---

## 7. Hors scope

- Multi-profils sur un même appareil
- Import / export de configuration
- Création d'exercices personnalisés par l'utilisateur (nom, emoji, etc.)
- Progression automatique (augmentation des séries au fil des semaines)
- Durée des exercices `timed` configurable
- Nombre de reps des exercices `reps` configurable
