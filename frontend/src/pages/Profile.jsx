import React, { useState, useEffect } from 'react';
import api from '../api';
import UserCommunities from "../components/UserCommunities";
import FavPosts from './FavPosts';
import { Avatar, IconButton, Modal, TextField, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import '../styles/profile.css'; // Fichier CSS pour styliser le composant
import { useTranslation } from 'react-i18next';

function Profile() {
    const [userData, setUserData] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [updatedData, setUpdatedData] = useState({ username: '', password: '' });

    const { t } = useTranslation();


    useEffect(() => {
        // Récupérer les données du profil utilisateur
        api.get('/api/user/')
            .then(response => {
                setUserData(response.data);
                setUpdatedData({ username: response.data.username, password: '' }); // On initialise les valeurs du formulaire
            })
            .catch(err => console.error(err));
    }, []);

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleChange = (e) => {
        setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Utilisation de `updatedData` pour les valeurs
        api.put('/api/user/', updatedData)
            .then(() => {
                // Mise à jour de l'état avec les nouvelles informations de l'utilisateur
                setUserData({ ...userData, username: updatedData.username });
                handleCloseModal(); // Ferme le modal après la mise à jour réussie
            })
            .catch(err => {
                console.error('Erreur lors de la mise à jour:', err.response?.data || err.message);
                alert("Erreur lors de la mise à jour des informations");
            });
    };

    return (
        <div className="profile">
            <div className="profile-header">
                
                <Avatar 
                    sx={{ 
                        width: 200,  /* Largeur de l'avatar */
                        height: 200, /* Hauteur de l'avatar */
                        fontSize: 100,  /* Taille de la police à l'intérieur de l'avatar */
                        backgroundColor: '#12372A',  /* Couleur de fond de l'avatar */
                        border: '5px solid black'  /* Bordure noire autour de l'avatar */
                    }} 
                    className="profile-avatar"
                >
                    {userData.username ? userData.username.charAt(0).toUpperCase() : 'A'}
                    {/* Vérifie si le username existe avant d'afficher la première lettre, sinon affiche "A" par défaut */}
                </Avatar>

                <div className="profile-info">
                    <h1>
                        {userData.username || 'Nom d\'utilisateur'}
                        <IconButton onClick={handleOpenModal}>
                            <EditIcon className="edit-icon" />
                        </IconButton>
                    </h1>
                </div>
            </div>

            <UserCommunities />
            <FavPosts />

            {/* Modal pour modifier le nom d'utilisateur et le mot de passe */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <div className="modal-content">
                    <h2>{t("update-user")}</h2>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label={t("username")}
                            name="username"
                            value={updatedData.username} // Utilisation de updatedData.username
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label={t("password")}
                            name="password"
                            type="password"
                            value={updatedData.password} // Utilisation de updatedData.password
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <Button className="form-button" type="submit" variant="contained" sx={{ backgroundColor: '#3e6149', color: 'white', '&:hover': { backgroundColor: '#2e4a37' } }}>
                            {t("Save")}
                        </Button>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

export default Profile;
