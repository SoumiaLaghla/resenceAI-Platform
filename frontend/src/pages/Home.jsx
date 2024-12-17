import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Post from "../components/Post";
import UserCommunities from "../components/UserCommunities";
import "../styles/posts.css";

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/posts/')
            .then(response => {
                setPosts(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="home-page">
            
            <UserCommunities />

            {/* Section divider for border between communities and posts */}
            <div className="section-divider"></div>

            {loading ? (
                <p>Chargement des publications...</p>
            ) : (
                <div className="post-list">
                    {posts.map(post => (
                        <Post key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;
