import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import api from "../api";
import Post from "../components/Post";
import Modal from "../components/ModalPost";
import "../styles/posts.css";
import useCurrentUser from "../components/currentUser";
import { useTranslation } from 'react-i18next'; 

function CommunityHome() {
    const navigate = useNavigate(); // Use the useNavigate hook
    const currentUser = useCurrentUser();
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tags, setTags] = useState([]);
    const { community_id } = useParams();
    const [community, setCommunity] = useState(null);

    useEffect(() => {
        api.get(`/api/communities/${community_id}/`)
            .then(response => setCommunity(response.data))
            .catch(error => console.error("Failed to fetch community:", error));
    }, [community_id]);

    const handleManageUsersClick = () => {
        navigate(`/communities/${community_id}/manage-users`); // Use navigate here
    };

    useEffect(() => {
        getPosts();
    }, [community_id]);

    const getPosts = () => {
        api.get(`/api/communities/${community_id}/posts/`)
            .then((res) => setPosts(res.data))
            .catch((err) => alert(err));
    };

    const createPost = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (file) {
            formData.append('file', file);
        }

        api.post(`/api/communities/${community_id}/posts/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then((res) => {
            if (res.status === 201) {
                alert(t("created-post"));
                getPosts();
                setTitle("");
                setDescription("");
                setFile(null);
                setTags([]);
                setShowModal(false);
            } else {
                alert();
            }
        })
        .catch((err) => {
            if (err.response && err.response.data) {
                console.error("Erreur :", err.response.data);
                alert(`Erreur : ${JSON.stringify(err.response.data)}`);
            } else {
                alert("Une erreur s'est produite lors de la création de la publication.");
            }
        });
    };

    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <div className="posts">
            <div className="bouttons">
            <button className="create-post-button" onClick={() => setShowModal(true)}>
                <span className="plus-icon">+</span>
                <span className="post-text">{t("create-post-button")}</span>
            </button>
            {community && currentUser && currentUser.id === community.admin.id && (
                <>
                    <button className="manage-users-button" onClick={handleManageUsersClick}>
                    ⚙️
                    </button>
                    
                </>
            )}
            </div>
            <div className="posts-container">
                {posts.map((post) => (
                    <Post post={post} key={post.id} />
                ))}
            </div>
            <Modal
                show={showModal}
                handleClose={handleClose}
                handleSubmit={createPost}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                file={file}
                setFile={setFile}
                tags={tags}
                setTags={setTags}
            />
        </div>
    );
}

export default CommunityHome;
