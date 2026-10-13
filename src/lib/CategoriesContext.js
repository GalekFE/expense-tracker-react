import { createContext, useContext } from 'react'
import { DEFAULT_CATEGORIES } from './constants'

export const CategoriesContext = createContext(DEFAULT_CATEGORIES)

export function useLiveCategories() {
  return useContext(CategoriesContext)
}
