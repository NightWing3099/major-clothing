import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { getCategoriesMap, initializeDatabase } from '../db/database';

export const CategoriesContext = createContext({
  categoriesMap: {},
  loading: false,
});

export const CategoriesProvider = ({ children }) => {
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await initializeDatabase();
        const map = await getCategoriesMap();
        setCategoriesMap(map);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const value = useMemo(
    () => ({ categoriesMap, loading }),
    [categoriesMap, loading]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => useContext(CategoriesContext);