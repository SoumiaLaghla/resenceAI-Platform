import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import AssistantIcon from '@mui/icons-material/Assistant';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';
import PsychologySharpIcon from '@mui/icons-material/PsychologySharp';
import LanguageIcon from '@mui/icons-material/Language'; 
import { useTranslation } from 'react-i18next'; 
import '../styles/sidebar.css';

function Sidebar() {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Effet pour initialiser l'état de la sidebar et la direction lors du chargement du composant
  useEffect(() => {
    const sidebarState = localStorage.getItem('sidebarOpen') === 'true';
    setIsSidebarOpen(sidebarState);
    
    const direction = localStorage.getItem('direction') || 'ltr'; // 'ltr' par défaut
    document.body.dir = direction;
    i18n.changeLanguage(direction === 'rtl' ? 'ar' : 'en'); // Changez la langue selon la direction
  }, []);

  const handleLogout = () => {
    localStorage.clear();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    localStorage.setItem('sidebarOpen', !isSidebarOpen); // Sauvegarder l'état dans localStorage
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    const isRTL = lng === 'ar';
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    localStorage.setItem('direction', document.body.dir); // Sauvegarder la direction dans localStorage
  };

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header" onClick={toggleSidebar}>
          <PsychologySharpIcon className="sidebar-logo" sx={{ width: '30px', height: '30px' }} />
          {isSidebarOpen && <h1 className="sidebar-title">RecenseAI</h1>}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-link active-link' : 'sidebar-link'}>
            <HomeIcon className="sidebar-icon" /> {isSidebarOpen && t('home')}
          </NavLink>
          <NavLink to="/communities" className={({ isActive }) => isActive ? 'sidebar-link active-link' : 'sidebar-link'}>
            <PeopleIcon className="sidebar-icon" /> {isSidebarOpen && t('communities')}
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => isActive ? 'sidebar-link active-link' : 'sidebar-link'}>
            <AssistantIcon className="sidebar-icon" /> {isSidebarOpen && t('explore')}
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'sidebar-link active-link' : 'sidebar-link'}>
            <AccountBoxIcon className="sidebar-icon" /> {isSidebarOpen && t('profile')}
          </NavLink>
          <NavLink to="/logout" className="sidebar-link" onClick={handleLogout}>
            <LogoutIcon className="sidebar-icon" /> {isSidebarOpen && t('logout')}
          </NavLink>
          
          {/* Options de langues */}
          <div className="sidebar-link" onClick={() => changeLanguage('fr')}>
            <LanguageIcon className="sidebar-icon" /> {isSidebarOpen && t('french')}
          </div>
          <div className="sidebar-link" onClick={() => changeLanguage('en')}>
            <LanguageIcon className="sidebar-icon" /> {isSidebarOpen && t('english')}
          </div>
          <div className="sidebar-link" onClick={() => changeLanguage('ar')}>
            <LanguageIcon className="sidebar-icon" /> {isSidebarOpen && t('arabic')}
          </div>
        </nav>
      </div>

      <div className="main-content">
        {/* Ajoutez le reste de votre page ici */}
      </div>
    </div>
  );
}

export default Sidebar;
