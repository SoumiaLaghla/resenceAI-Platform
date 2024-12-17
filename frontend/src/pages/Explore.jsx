import React, { useEffect, useState } from 'react';
import api from '../api';
import Post from "../components/Post";
import "../styles/posts.css";
import { useTranslation } from 'react-i18next';

function Explore() {
  const { t } = useTranslation();
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les publications recommandées depuis l'API
  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        const response = await api.get('/api/post-recommend/');  // Endpoint sans userId
        setRecommendedPosts(response.data.recommended_posts); // Assurez-vous que la structure du JSON correspond
        setLoading(false);
      } catch (error) {
        setError(t('fetchError'));
        setLoading(false);
      }
    };

    fetchRecommendedPosts();
  }, []);  // Pas besoin de dépendance à userId, car l'utilisateur est géré par l'API

  if (loading) {
    return <div>{t('loadingRecommendations')}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="explore-page">
      <h2>{t('recommendedForYou')}</h2>
      <div className="posts-container">
        {recommendedPosts.length > 0 ? (
          recommendedPosts.map((post) => (
            <Post
              post={post}
              key={post.id}
            />
          ))
        ) : (
          <p>{t('noRecommendationsAvailable')}</p>
        )}
      </div>
      <div className='piedPage'/>
    </div>
  );
}

export default Explore;
