import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import CommunityModal from "../components/CommunityModal";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Avatar, AvatarGroup } from '@mui/material'; // Importation de Avatar et AvatarGroup
import "../styles/communities.css";
import { useTranslation } from 'react-i18next';

function Communities() {
    const { t } =useTranslation();
    const [communities, setCommunities] = useState([]);
    const [userId, setUserId] = useState(null);
    const [showCommunityModal, setShowCommunityModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getCommunities();
        getUserId();
    }, []);

    const getUserId = () => {
        api.get("/api/user/").then((res) => {
            setUserId(res.data.id);
        });
    };

    const getCommunities = () => {
        api.get("/api/communities/")
            .then((res) => res.data)
            .then((data) => setCommunities(data))
            .catch((err) => alert(err));
    };

    const joinCommunity = (id) => {
        api.post(`/api/communities/join/${id}/`)
            .then((res) => {
                if (res.status === 200) alert(t(''));
                getCommunities();
            })
            .catch((error) => alert(t("joinfailed")));
    };

    const leaveCommunity = (id) => {
        api.delete(`/api/communities/leave/${id}/`)
            .then((res) => {
                if (res.status === 204) alert(t('leavesucces'));
                getCommunities();
            })
            .catch((error) => alert(t("leavefailed")));
    };

    const deleteCommunity = (id) => {
        api.delete(`/api/communities/delete/${id}`)
            .then((res) => {
                if (res.status === 204) alert("deletesucces");
                getCommunities();
            })
            .catch((error) => alert(t("deletefailed")));
    };

    const handleCommunityClick = (communityId) => {
        navigate(`/communities/${communityId}/home`);
    };

    return (
        <div className="communities-page">
            <h2>{t("communities")}</h2>
            <div className="communities-grid">
                <div className="create-community-card" onClick={() => setShowCommunityModal(true)}>
                    <AddCircleIcon fontSize="large" style={{ color: '#12372A' }} />
                    <p>{t("create-community")}</p>
                </div>

                {communities.map((community) => (
                    <div 
                        key={community.id} 
                        className="community-card" 
                        onClick={() => handleCommunityClick(community.id)}
                    >
                        <h3 className="community-name">{community.name}</h3>
                        <p className="community-description">{community.description}</p>
                        <p className="community-date">Créé le : {new Date(community.created_at).toLocaleDateString()}</p>

                        {/* AvatarGroup pour afficher les membres de la communauté */}
                        <AvatarGroup max={4} className="community-avatars">
                            {community.members.map((member) => (
                                <Avatar
                                key={member.id}
                                alt={member.username}
                                sx={{ bgcolor: '#12372A' }} // Couleur fixe pour tous les avatars
                            >
                                    {member.username[0].toUpperCase()} {/* Lettre Avatar */}
                                </Avatar>
                            ))}
                        </AvatarGroup>

                        <div className="community-actions" onClick={(e) => e.stopPropagation()}>
                            {community.members.some((member) => member.id === userId) ? (
                                <button className="leave-button" onClick={() => leaveCommunity(community.id)}>
                                    <ExitToAppIcon /> {t("leave")}
                                </button>
                            ) : (
                                <button className="join-button" onClick={() => joinCommunity(community.id)}>
                                    + {t("join")}
                                </button>
                            )}

                            {community.admin.id === userId && (
                                <button className="delete-button" onClick={() => deleteCommunity(community.id)}>
                                    <DeleteIcon style={{ color: '#888' }} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <CommunityModal
                show={showCommunityModal}
                onClose={() => setShowCommunityModal(false)}
                onCreateSuccess={getCommunities}
            />
        </div>
    );
}

export default Communities;
