import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

// Basic selector
export const selectActiveAnalyses = (state: RootState) => state.activeAnalysesSlice.analysisIds

// Memoized selectors
export const selectActiveAnalysesCount = createSelector(
    [selectActiveAnalyses],
    analysisIds => analysisIds.length
)

export const selectHasActiveAnalyses = createSelector(
    [selectActiveAnalysesCount],
    count => count > 0
)

// Parameterized selector
export const selectIsAnalysisActive = (analysisId: string) => (state: RootState) =>
    state.activeAnalysesSlice.analysisIds.includes(analysisId)
