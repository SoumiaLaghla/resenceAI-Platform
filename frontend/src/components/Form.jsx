import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PsychologySharpIcon from '@mui/icons-material/PsychologySharp';
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import api from "../api";
import "../styles/Form.css";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const name = method === "login" ? "Login" : "Register";

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            navigate("/communities");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="sidebar-header" onClick={() => navigate("/")}>
                <PsychologySharpIcon className="sidebar-logo" sx={{ width: '30px', height: '30px' }} />
                <h1 className="sidebar-title">RecenseAI</h1>
            </div>
            
            <form onSubmit={handleSubmit}>
                <input
                    className="form-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button className="form-button" type="submit" disabled={loading}>
                    {name}
                </button>
            </form>

            {/* Lien de redirection conditionnel */}
            <div className="form-links">
                {method === "login" ? (
                    <>
                        <Link to="/register" className="form-link">Créer un compte</Link>
                        <a href="http://localhost:8000/admin" className="form-link">Connexion administrateur</a>
                    </>
                ) : (
                    <Link to="/login" className="form-link">Déjà un compte? Connectez-vous</Link>
                )}
            </div>
        </div>
    );
}

export default Form;
