import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api';
import '../styles/dataTable.css'
import { useTranslation } from 'react-i18next';

const PostDataTable = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { postId } = useParams(); 
  const navigate = useNavigate(); // Hook pour naviguer

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/posts/data/${postId}/`);
        setData(response.data);
      } catch (err) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  if (loading) return <p>{t('chargement')}</p>;
  if (error) return <p>{t('Erreur : {error}')}</p>;

  return (
    <div >
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowBackIcon /> 
      </button>
      
      <table>
        <thead>
          <tr>
            {data.length > 0 && Object.keys(data[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="piedPage"/>
    </div>
  );
};

export default PostDataTable;
