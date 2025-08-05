import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ActiveAnalysesState {
    analysisIds: string[]
}

const initialState: ActiveAnalysesState = {
    analysisIds: []
}

const activeAnalysesSlice = createSlice({
    name: 'activeAnalyses',
    initialState,
    reducers: {
        addActiveAnalysis: (state, action: PayloadAction<string>) => {
            if (!state.analysisIds.includes(action.payload)) {
                state.analysisIds.push(action.payload)
            }
        },
        removeActiveAnalysis: (state, action: PayloadAction<string>) => {
            state.analysisIds = state.analysisIds.filter(id => id !== action.payload)
        },
        clearActiveAnalyses: state => {
            state.analysisIds = []
        }
    }
})

export const { addActiveAnalysis, removeActiveAnalysis, clearActiveAnalyses } =
    activeAnalysesSlice.actions

export default activeAnalysesSlice.reducer
