import React from 'react';
import '../styles/Modal.css';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next'; 

const Modal = ({ show, handleClose, handleSubmit, title, setTitle, description, setDescription, file, setFile }) => {
    if (!show) return null;

    const { t } = useTranslation();
    const onFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
            <CloseIcon className="modal-close" onClick={handleClose}/>
            <h2>{t("create-post")}</h2>
                <form onSubmit={onFormSubmit}>
                    <label htmlFor="title">{t("title")}</label>
                    <input
                        type="text"
                        id="title"
                        required
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                    />

                    <label htmlFor="description">{t("desc")}</label>
                    <textarea
                        id="description"
                        required
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    />

                    <label htmlFor="file">{t("download")}</label>
                    <input
                        type="file"
                        id="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files[0])}
                    />

                    <button type="submit">{t("save")}</button>
                </form>
            </div>
        </div>
    );
};

export default Modal;
