import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { simulateAuthWithEmail } from '../db/database';

export const UserContext = createContext({
  currentUser: null,
  setCurrentUser: () => {},
  signInWithEmail: () => {},
  signOut: () => {},
});

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const signInWithEmail = useCallback(async (email, password, userData) => {
    const user = await simulateAuthWithEmail(email, password, userData);
    setCurrentUser(user);
    return user;
  }, []);

  const signOut = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({ currentUser, setCurrentUser, signInWithEmail, signOut }),
    [currentUser, signInWithEmail, signOut]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);