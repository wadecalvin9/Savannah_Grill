import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '../../lib/appwrite';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const res = await getCurrentUser();
            if (res) {
                setIsLoggedIn(true);
                setUser(res);
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        } catch (error) {
            console.error("GlobalProvider fetchUser error:", error);
            setIsLoggedIn(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                isLoading,
                fetchUser
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
