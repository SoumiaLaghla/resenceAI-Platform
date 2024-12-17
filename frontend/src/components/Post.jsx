import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import api from "../api";
import Comments from "../components/Comments"; 
import "../styles/post.css";
import { FaLink, FaStar, FaHeart, FaChartBar, FaTable, FaTrash } from 'react-icons/fa'; // Importation de l'icône de corbeille
import { Avatar } from '@mui/material';
import { FaEdit, FaSave } from 'react-icons/fa'; 
import { useTranslation } from 'react-i18next'; 

function Post({ post }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post?.likes_count || 0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);  
  const [updatedTitle, setUpdatedTitle] = useState(post.title);
  const [updatedDescription, setUpdatedDescription] = useState(post.description);

  const useCurrentUser = () => {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      api.get("/api/user/")  
        .then(response => {
          setUser(response.data);  
        })
        .catch(error => {
          console.error("Failed to fetch user:", error);
        });
    }, []);
  
    return user;
  };

  const currentUser = useCurrentUser();

  

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    api.put(`/api/posts/${post.id}/update/`, {
      title: updatedTitle,
      description: updatedDescription,
    })
    .then((response) => {
      alert(t("post-update-succes"));
      // Mettre à jour localement le post avec les nouvelles données
      post.title = updatedTitle;
      post.description = updatedDescription;
      setIsEditing(false);
    })
    .catch((error) => {
      alert(t("post-update-failed"));
    });
  };

  const deletePost = (id) => {
    api
      .delete(`/api/posts/${id}/delete/`)
      .then((res) => {
        if (res.status === 204) {
          alert();
        } else {
          alert(t("post-delete-failed"));
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          alert(t("permission-post"));
        } else {
          alert(t("error-delete-post"));
        }
      });
  };

  useEffect(() => {
    if (!post) return;

    // Vérifiez si le post est dans les favoris
    api.get(`/api/favorites/`)
      .then(response => {
        const favoritePosts = response.data;
        const isFav = favoritePosts.some(fav => fav.post.id === post.id);
        setIsFavorite(isFav);
      })
      .catch(err => console.error(err));

    // Vérifiez si le post est aimé
    api.get(`/api/posts/${post.id}/is_liked/`)
      .then(response => setIsLiked(response.data.is_liked))
      .catch(err => console.error(err));
  }, [post]);

  const formattedDate = post?.created_at
    ? new Date(post.created_at).toLocaleDateString("fr-FR") 
    : "Date inconnue";

  const handleLike = (e) => {
    e.stopPropagation();
    api.post(`/api/posts/${post.id}/like/`)
  .then(response => {
    console.log(response.data);  // Ajoute cette ligne pour vérifier la réponse
    if (response.data.message === "Post liked") {
      setLikes(likes + 1);
      setIsLiked(true);
    } else {
      setLikes(likes - 1);
      setIsLiked(false);
    }
  })
  .catch(err => {
    console.error("Erreur lors du like :", err);  // Vérifie ce que tu reçois en cas d'erreur
    alert("Une erreur est survenue.");
  });

  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    api.post(`/api/posts/${post.id}/favorite/`)
      .then(() => setIsFavorite(!isFavorite)) 
      .catch(err => alert(err));
  };

  const handleViewTable = () => {
    navigate(`/posts/${post.id}/data`);
  };

  const handleViewVisualisation = () => {
    navigate(`/posts/${post.id}/dash`);
  };

  const filePath = post?.file ? post.file : null;
  const fileName = filePath ? filePath.split('/').pop() : null;

  return (
    <div className="post">
      <div className="postTop">
        <div className="postTopLeft">
          {/* Avatar ou icône par défaut */}
          {post?.author?.username && (
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                fontSize: 25, 
                backgroundColor: '#12372A',
                border: '2px solid white'  // White border
              }} 
              className="profile-avatar"
            >
              {post.author.username.charAt(0).toUpperCase()}
            </Avatar>
          )}


          
          <div className="postAuthorInfo">
            <div className="postAuthorCommunity">
              <span className="postUsername">{post?.author?.username || "Utilisateur inconnu"}</span>
              <span className="postCommunity">/ { post?.community_name || "Communauté inconnue"}</span>
            </div>
            <span className="postDate">{formattedDate}</span>
          </div>
        </div>

        <div className="postTopRight">
        {currentUser && currentUser.username === post.author.username && (
          <>
            <FaEdit className="edit-icon" onClick={toggleEdit} />
            <FaTrash className="delete-icon" onClick={() => deletePost(post.id)} />
          </>
        )}
        </div>
      </div>

      <div className="postCenter">
      {isEditing ? (
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
            <textarea
              value={updatedDescription}
              onChange={(e) => setUpdatedDescription(e.target.value)}
            />
            <button type="submit">
              <FaSave /> Enregistrer
            </button>
          </form>
        ) : (
          <>
            <p className="postTitle">{post.title}</p>
            <p className="postContent">{post.description}</p>
          </>
        )}
        {filePath && (
          <a href={filePath} download className="postActions">
            <FaLink className="icon" /> {t('download')} {fileName}
          </a>
        )}
        <div className="action-cards">
          <div className="action-card" onClick={handleViewTable}>
            <FaTable className="action-icon" />
            <h4>{t('view-table')}</h4>
            <p>{t('explore-table')}</p>
          </div>
          <div className="action-card" onClick={handleViewVisualisation}>
            <FaChartBar className="action-icon" />
            <h4>{t("view-stats")}</h4>
            <p>{t('explore-stats')}</p>
          </div>
        </div>
      </div>
      
      <div className="postBottom">
        <div className="postBottomLeft">
          <FaHeart
            className="icon"
            color={isLiked ? "red " : "gray"}
            onClick={handleLike}
            
          />
          <span className="postLikeCounter">{likes} {t('likes')}</span>
        </div>
        <div className="postBottomRight">
          <FaStar
            className="icon"
            color={isFavorite ? "gold" : "gray"}
            onClick={handleFavorite}
          />
        </div>
      </div>
      
      <div className="comments">
      <Comments postId={post.id} />
      </div>
    </div>
  );
}

export default Post;
