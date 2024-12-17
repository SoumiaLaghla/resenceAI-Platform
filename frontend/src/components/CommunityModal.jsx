import { useState } from "react";
import api from "../api";
import "../styles/Modal.css";
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next'; 

function CommunityModal({ show, onClose, onCreateSuccess }) {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const createCommunity = (e) => {
        e.preventDefault();
        api.post("/api/communities/", { name, description })
            .then((res) => {
                if (res.status === 201) {
                    alert(t("community-created"));
                    onCreateSuccess();
                    onClose();
                } else {
                    alert(t("community-create-failed"));
                }
            })
            .catch((err) => alert(err));
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <CloseIcon className="modal-close" onClick={onClose}/>
                
                <h2>{t("create-community")}</h2>
                <form onSubmit={createCommunity}>
                    <label htmlFor="name">{t("name")} :</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <label htmlFor="description">{t('desc')} :</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit">{t("Create")}</button>
                </form>
            </div>
        </div>
    );
}

export default CommunityModal;
