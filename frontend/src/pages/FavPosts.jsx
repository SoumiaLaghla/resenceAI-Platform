import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';  // Importation du hook useTranslation
import api from "../api";
import Post from "../components/Post"; 
import '../styles/favposts.css';

function FavPosts() {
  const { t } = useTranslation();  // Utilisation du hook useTranslation
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchFavoritePosts = async () => {
      try {
        const response = await api.get("/api/favorites/");
        setFavoritePosts(response.data.map(fav => fav.post)); // Ajustez selon votre structure de données
      } catch (error) {
        console.error(t("errorFetchingFavorites"), error); // Traduction de l'erreur
      }
    };

    fetchFavoritePosts();
  }, []);

  const displayedPosts = showMore ? favoritePosts : favoritePosts.slice(0, 2);

  return (
    <div className="fav-posts">
      <h2>{t("favorites")}</h2> {/* Traduction du titre */}
      <div className="fav-posts-grid">
        {displayedPosts.map(post => (
          <Post key={post?.id} post={post} />
        ))}
      </div>
      {favoritePosts.length > 2 && (
        <button className="show-more-button" onClick={() => setShowMore(!showMore)}>
          {showMore ? t("showLess") : t("showMore")} {/* Traduction des boutons Voir plus / Voir moins */}
        </button>
      )}
    </div>
  );
}

export default FavPosts;
