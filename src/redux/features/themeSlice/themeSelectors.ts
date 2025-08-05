import type { RootState } from '@/redux/store'

// Basic selectors
export const selectTheme = (state: RootState) => state.themeSlice.theme
export const selectIsDarkMode = (state: RootState) => state.themeSlice.theme === 'dark'
export const selectIsLightMode = (state: RootState) => state.themeSlice.theme === 'light'
