<script setup lang="ts">
import { useSession } from '../composables/useSession'
import { exercises } from '../data/exercises'
import { stretches } from '../data/stretches'
import HomeScreen         from '../components/screens/HomeScreen.vue'
import IntroScreen        from '../components/screens/IntroScreen.vue'
import CountdownScreen    from '../components/screens/CountdownScreen.vue'
import ActiveScreen       from '../components/screens/ActiveScreen.vue'
import RestScreen         from '../components/screens/RestScreen.vue'
import ExDoneScreen       from '../components/screens/ExDoneScreen.vue'
import StretchIntroScreen from '../components/screens/StretchIntroScreen.vue'
import StretchScreen      from '../components/screens/StretchScreen.vue'
import DoneScreen         from '../components/screens/DoneScreen.vue'

const s = useSession()
</script>

<template>
  <HomeScreen
    v-if="s.screen.value === 'home'"
    :session="s.session.value"
    :pool-size="exercises.length"
    @commencer="s.handleBegin()"
    @regen="s.handleRegen()"
  />

  <IntroScreen
    v-else-if="s.screen.value === 'intro'"
    :exercise="s.currentExercise.value"
    :exercise-index="s.exerciseIndex.value"
    :session-length="s.session.value.length"
    @start="s.handleStart()"
  />

  <CountdownScreen
    v-else-if="s.screen.value === 'countdown'"
    :countdown-value="s.countdownValue.value"
    :exercise="s.currentExercise.value"
    :set-number="s.setNumber.value"
  />

  <ActiveScreen
    v-else-if="s.screen.value === 'active'"
    :exercise="s.currentExercise.value"
    :exercise-index="s.exerciseIndex.value"
    :session-length="s.session.value.length"
    :set-number="s.setNumber.value"
    :ex-timer-value="s.exTimer.value.value"
    :ex-timer-max="s.exTimer.max.value"
    @ok="s.handleOk()"
  />

  <RestScreen
    v-else-if="s.screen.value === 'rest'"
    :exercise="s.currentExercise.value"
    :exercise-index="s.exerciseIndex.value"
    :session-length="s.session.value.length"
    :set-number="s.setNumber.value"
    :rest-timer-value="s.restTimer.value.value"
    :rest-timer-max="s.restTimer.max.value"
    @skip="s.handleSkipRest()"
  />

  <ExDoneScreen
    v-else-if="s.screen.value === 'exdone'"
    :exercise="s.currentExercise.value"
    :exercise-index="s.exerciseIndex.value"
    :session-length="s.session.value.length"
    :next-exercise="s.session.value[s.exerciseIndex.value + 1] ?? null"
    @next="s.handleNext()"
  />

  <StretchIntroScreen
    v-else-if="s.screen.value === 'stretchIntro'"
    :stretch="s.currentStretch.value"
    :stretch-index="s.stretchIndex.value"
    :stretch-count="stretches.length"
    @start="s.startStretch()"
    @skip="s.skipStretch()"
  />

  <StretchScreen
    v-else-if="s.screen.value === 'stretch'"
    :stretch="s.currentStretch.value"
    :stretch-index="s.stretchIndex.value"
    :stretch-count="stretches.length"
    :stretch-side="s.stretchSide.value"
    :timer-value="s.stretchTimer.value.value"
    :timer-max="s.stretchTimer.max.value"
    @next-side="s.handleNextSide()"
    @skip="s.skipStretch()"
    @done="s.finishCatCow()"
  />

  <DoneScreen
    v-else-if="s.screen.value === 'done'"
    :session-length="s.session.value.length"
    :stretch-count="stretches.length"
    :elapsed="s.elapsed.value"
    @restart="s.handleRestart()"
  />
</template>
