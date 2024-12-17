import '../styles/vizualisation.css';
import React, { useState, useEffect } from 'react';
import api from '../api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


const COULEURS = ['#12372A','#5A856C', '#2A5140', '#426B56','#A3D3AF',  '#739F82', '#8BB999',  '#BBEDC5'];

const VisualisationDesDonneesPost = () => {
  const [donneesNumeriques, setDonneesNumeriques] = useState({});
  const [donneesNonNumeriques, setDonneesNonNumeriques] = useState({});
  const [axeXSelectionne, setAxeXSelectionne] = useState('');
  const [axeYSelectionne, setAxeYSelectionne] = useState('');
  const { postId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  

  useEffect(() => {
    const recupererDonnees = async () => {
      try {
        const reponse = await api.get(`/api/posts/dash/${postId}/`);
        setDonneesNumeriques(reponse.data.numeric_data);
        setDonneesNonNumeriques(reponse.data.non_numeric_data);
      } catch (error) {
        console.error(t("errorfetchingData"), error);
      }
    };

    recupererDonnees();
  }, [postId]);

  // Fonction pour générer le PDF
const telechargerPDF = async () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const chartContainers = document.querySelectorAll('.chart-scatter, .chart-histo, .chart-pair'); // Capture tous les graphiques

  let position = 10; // Position initiale pour le premier graphique

  for (let i = 0; i < chartContainers.length; i++) {
    const chartContainer = chartContainers[i];
    
    // Capturer le conteneur du graphique en image
    const canvas = await html2canvas(chartContainer);
    const imgData = canvas.toDataURL('image/png');

    const imgWidth = 190;  // Largeur de l'image dans le PDF
    const pageHeight = pdf.internal.pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Vérifie si l'image dépasse la page actuelle
    if (position + imgHeight > pageHeight) {
      pdf.addPage();  // Ajoute une nouvelle page si nécessaire
      position = 10; // Réinitialise la position pour la nouvelle page
    }

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    position += imgHeight + 10; // Met à jour la position pour le prochain graphique
  }

  pdf.save('portfolio.pdf');  // Sauvegarde le PDF final
};


  const gererChangementAxeX = (e) => {
    setAxeXSelectionne(e.target.value);
  };

  const gererChangementAxeY = (e) => {
    setAxeYSelectionne(e.target.value);
  };

  const obtenirMappingCouleur = (donneesAxeX) => {
    const valeursUniques = [...new Set(donneesAxeX)];
    const mappingCouleur = {};

    valeursUniques.forEach((valeur, index) => {
      mappingCouleur[valeur] = COULEURS[index % COULEURS.length];
    });

    return mappingCouleur;
  };

  // Identifier la première clé pour l'exclure des sélecteurs et des histogrammes
  const clesNumeriques = Object.keys(donneesNumeriques);
  const premiereCleNumerique = clesNumeriques[0]; // Supposons que la première colonne soit celle-ci

  // Section 1: Visualisation des corrélations (Diagramme de dispersion et Histogrammes)
  const renderiserDiagrammeDeDispersion = () => {
    const donneesAxeX = donneesNumeriques[axeXSelectionne] || [];
    const donneesAxeY = donneesNumeriques[axeYSelectionne] || [];

    if (!axeXSelectionne || !axeYSelectionne) return <p>{t("selectionXY")}</p>;

    const donneesDispersion = donneesAxeX.map((valeurX, i) => ({ x: valeurX, y: donneesAxeY[i] }));

    return (
      <div className="chart-scatter">
        <h5>{t('dispesiondiag')} {axeYSelectionne} (Axe Y) vs {axeXSelectionne} (Axe X)</h5>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="x" name={axeXSelectionne} />
            <YAxis dataKey="y" name={axeYSelectionne} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Points de données" data={donneesDispersion} fill="#436851" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderiserHistogrammes = () => {
    const cles = Object.keys(donneesNumeriques).filter(cles => cles !== premiereCleNumerique); // Exclure la première colonne

    if (cles.length === 0) return <p>{t('errorDiag')}</p>;

    return cles.map((cle) => {
      const donnees = donneesNumeriques[cle].map((valeur, index) => ({
        x: donneesNumeriques[premiereCleNumerique][index],
        valeur,
      }));

      return (
        <div className="chart-histo" key={cle}>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={donnees}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" label={{ value: premiereCleNumerique, position: 'insideBottomRight', offset: -10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valeur" fill="#ABDC9F" />
            </BarChart>
          </ResponsiveContainer>
          <h5>{t('histofor')} {cle}</h5>
        </div>
      );
    });
  };

  
  // Section 2: Études catégorielles (Graphiques en secteurs et Graphiques en beignets)
  const renderiserGraphiquesEnSecteurs = () => {
    const cles = Object.keys(donneesNonNumeriques);
    if (cles.length === 0) return <p>{t('errorDiag')}</p>;

    return cles.map((cle) => {
      const compteValeurs = donneesNonNumeriques[cle].reduce((acc, valeur) => {
        acc[valeur] = (acc[valeur] || 0) + 1;
        return acc;
      }, {});

      const donnees = Object.entries(compteValeurs).map(([nom, valeur]) => ({ nom, valeur }));
      const mappingCouleur = obtenirMappingCouleur(donnees.map((item) => item.nom));

      return (
        <div className="chart-pair" key={cle}>
          <div className="chart-pie">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={donnees} dataKey="valeur" nameKey="nom" cx="50%" cy="50%" outerRadius={80} label>
                  {donnees.map((entree, i) => (
                    <Cell key={`cell-${i}`} fill={mappingCouleur[entree.nom]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <h5>{t('diagSect')} {cle}</h5>
          </div>

          <div className="chart-pie">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={donnees} dataKey="valeur" nameKey="nom" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                  {donnees.map((entree, i) => (
                    <Cell key={`cell-${i}`} fill={mappingCouleur[entree.nom]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <h5>{t('diagAnn')} {cle}</h5>
          </div>
        <div className="legend-table">
          <table>
            <thead>
              <tr>
                <th>{t('element')}</th>
                <th>{t('couleur')}</th>
              </tr>
            </thead>
            <tbody>
              {donnees.map((entree, i) => (
                <tr key={i}>
                  <td>{entree.nom}</td>
                  <td>
                    <div
                      style={{
                        backgroundColor: mappingCouleur[entree.nom],
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    ></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      );
    });
  };

  return (
    
    <div className="visualization-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowBackIcon /> 
      </button>
      <button onClick={telechargerPDF} className="download-button">
        {t('downloadPDF')}
      </button>
      
      {/* Section 1: Étude des graphiques de corrélations */}
      <div className="numeric-visualization">
        <h3>{t('relationvars')}</h3>
        <div className="axis-selector">
          <label htmlFor="x-axis">Axe X:</label>
          <select id="x-axis" onChange={gererChangementAxeX} value={axeXSelectionne}>
            <option value="">{t('selectX')}</option>
            {clesNumeriques.filter(cles => cles !== premiereCleNumerique).map((cles) => ( // Exclure la première colonne
              <option key={cles} value={cles}>{cles}</option>
            ))}
          </select>

          <label htmlFor="y-axis">Axe Y:</label>
          <select id="y-axis" onChange={gererChangementAxeY} value={axeYSelectionne}>
            <option value="">{t('selectY')}</option>
            {clesNumeriques.filter(cles => cles !== premiereCleNumerique).map((cles) => ( // Exclure la première colonne
              <option key={cles} value={cles}>{cles}</option>
            ))}
          </select>
        </div>

        {renderiserDiagrammeDeDispersion()}
        <h3>{t('HistoTitle')}</h3>
        {renderiserHistogrammes()}
      </div>

      {/* Section 2: Études catégorielles */}
      <div className="categorical-visualization">
        <h3>{t("etudecat")}</h3>
        {renderiserGraphiquesEnSecteurs()}
      </div>
      <div className='piedPage'/>
    </div>
    
  );
};

export default VisualisationDesDonneesPost;
