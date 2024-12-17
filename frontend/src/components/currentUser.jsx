import { useState, useEffect } from "react";
import api from "../api";

const useCurrentUser = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        api.get("/api/user/")
            .then(response => {
                setUser(response.data); // Stocke les informations de l'utilisateur
            })
            .catch(error => {
                console.error("Failed to fetch user:", error);
            });
    }, []);

    return user;
};

export default useCurrentUser;
