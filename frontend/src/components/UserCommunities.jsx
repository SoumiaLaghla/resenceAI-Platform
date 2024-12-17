import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importer useNavigate
import api from "../api";
import "../styles/userCommunities.css"; // Importation du fichier CSS pour le style
import { useTranslation } from 'react-i18next'; 

function UserCommunities() {
    const { t } = useTranslation();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialisation de useNavigate

    useEffect(() => {
        // Récupérer les communautés dont l'utilisateur est membre
        api.get('/api/user-communities/')
            .then(response => {
                setCommunities(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleCommunityClick = (communityId) => {
        // Rediriger vers la page d'accueil de la communauté
        navigate(`/communities/${communityId}/home`);
    };

    return (
        <div className="user-communities">
            <h2>{t("community-user")}</h2>
            {loading ? (
                <p>Chargement des communautés...</p>
            ) : (
                <div className="community-list">
                    {communities.map(community => (
                        <div 
                            className="community-card-home" 
                            key={community.id} 
                            onClick={() => handleCommunityClick(community.id)} // Ajoute la redirection
                        >
                            <h3>{community.name}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserCommunities;
