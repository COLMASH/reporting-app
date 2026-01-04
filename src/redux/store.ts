import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { filesApi } from './services/filesApi'
import { reportingAnalysesApi } from './services/reportingAnalysesApi'
import { resultsApi } from './services/resultsApi'
import { portfolioApi } from './services/portfolioApi'
import { portfolioReportsApi } from './services/portfolioReportsApi'
import themeSlice from './features/themeSlice'
import activeAnalysesSlice from './features/activeAnalysesSlice'

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['themeSlice', 'activeAnalysesSlice'] // Persist theme and active analyses
}

const rootReducer = combineReducers({
    themeSlice,
    activeAnalysesSlice,
    [filesApi.reducerPath]: filesApi.reducer,
    [reportingAnalysesApi.reducerPath]: reportingAnalysesApi.reducer,
    [resultsApi.reducerPath]: resultsApi.reducer,
    [portfolioApi.reducerPath]: portfolioApi.reducer,
    [portfolioReportsApi.reducerPath]: portfolioReportsApi.reducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        }).concat([
            filesApi.middleware,
            reportingAnalysesApi.middleware,
            resultsApi.middleware,
            portfolioApi.middleware,
            portfolioReportsApi.middleware
        ])
})

export const persistor = persistStore(store)

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
