import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/comments.css";
import { Comment as CommentIcon, Send as SendIcon } from '@mui/icons-material';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import Avatar from '@mui/material/Avatar';  
import { useTranslation } from 'react-i18next';

function Comments({ postId }) {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false); // Gérer la visibilité des commentaires
  const [isEditing, setIsEditing] = useState(null); // Gérer l'édition de chaque commentaire
  const [updatedContent, setUpdatedContent] = useState(""); // Nouveau contenu pour le commentaire

  useEffect(() => {
        getUserId();
    }, []);

  // Récupérer l'utilisateur courant
  const getUserId = () => {
    api.get("/api/user/").then((res) => {
        setUserId(res.data.id);
    });
};



  const handleUpdate = (e, commentId) => {
    e.preventDefault();

    api.put(`/api/posts/comment/update/${commentId}/`, {
      content: updatedContent,
    })
      .then(() => {
        alert("Commentaire mis à jour avec succès !");
        setComments(comments.map(comment => 
          comment.id === commentId ? { ...comment, content: updatedContent } : comment
        ));
        setIsEditing(null); // Fermer le mode édition
      })
      .catch(() => {
        alert("Échec de la mise à jour du commentaire.");
      });
  };

  const deleteComment = (id) => {
    api.delete(`/api/posts/comment/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) {
          alert("Commentaire supprimé !");
          setComments(comments.filter(comment => comment.id !== id));
        } else {
          alert("Échec de la suppression du commentaire.");
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          alert("Vous n'avez pas la permission de supprimer ce commentaire.");
        } else {
          alert("Erreur lors de la suppression du commentaire.");
        }
      });
  };

  useEffect(() => {
    api.get(`/api/posts/${postId}/comments/`)
      .then(response => setComments(response.data))
      .catch(err => console.error(err));
  }, [postId]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    api.post(`/api/posts/${postId}/comment/`, { content: comment })
      .then(response => {
        setComments([...comments, response.data]);
        setComment("");
      })
      .catch(err => alert(err));
  };

  return (
    <div className="comments-section">
      <div className="comments-header" onClick={() => setShowComments(!showComments)}>
        <h4>{t('comments')}</h4>
        <div className="comments-info">
          <CommentIcon className="comments-icon" />
          <span className="comments-count">{comments.length}</span>
        </div>
      </div>

      {showComments && (
        <div className="comments-list">
          {comments.length === 0 ? (
            <p>Pas de commentaires.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                {comment?.author?.username && (
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
              {comment.author.username.charAt(0).toUpperCase()}
            </Avatar>
          )}
                  <div className="comment-author-info">
                    <p className="comment-author">{comment.author.username}</p>
                    <p className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="comment-actions">
                    {   comment.author.id === userId && (
                      <>
                      <div className="toolbox">
                        <FaEdit className="edit-icon" onClick={() => { setIsEditing(comment.id); setUpdatedContent(comment.content); }} />
                        <FaTrash className="delete-icon" onClick={() => deleteComment(comment.id)} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {isEditing === comment.id ? (
                  <form onSubmit={(e) => handleUpdate(e, comment.id)} className="edit-form">
                    <input
                      type="text"
                      value={updatedContent}
                      onChange={(e) => setUpdatedContent(e.target.value)}
                      className="edit-input"
                    />
                    <button type="submit" className="save-button">
                      <FaSave /> Enregistrer
                    </button>
                  </form>
                ) : (
                  <p className="comment-content">{comment.content}</p>
                )}
              </div>
            ))
          )}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("add-comment")}
              className="comment-input"
            />
            <button type="submit" className="submit-button">
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Comments;
