import React, { useState, useEffect, useRef } from 'react';
import './Header.css';

const Header = ({ currentTab, setCurrentTab, user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(true); // Start with nav menu open
  const headerRef = useRef(null);
  const profileMenuRef = useRef(null);

  const tabs = [];

  // Role-based tab visibility
  if (user.role === 'ADMIN' || user.role === 'MANAGER') {
    tabs.push('Projects', 'Tickets', 'Organization');
  } else if (user.role === 'DESIGNER') {
    tabs.push('Projects', 'Tickets', 'Organization');
  }

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setShowNavMenu(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        const profileButton = event.target.closest('.profile-button');
        if (!profileButton) {
          setShowProfileMenu(false);
        }
      }

      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowNavMenu(false);
      }
    };

    if (showProfileMenu || showNavMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProfileMenu, showNavMenu]);

  return (
    <header className="header" ref={headerRef}>
      {/* Top section with profile and hamburger */}
      <div className="header-top">
        <button
          className="profile-button"
          onClick={() => {
            setShowProfileMenu(!showProfileMenu);
            setShowNavMenu(false);
          }}
          aria-label="Profile"
        >
          <div className="profile-photo">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        </button>

        <button
          className="hamburger-button"
          onClick={() => {
            setShowNavMenu(!showNavMenu);
            setShowProfileMenu(false);
          }}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Profile dropdown menu */}
      {showProfileMenu && (
        <div className="profile-menu" ref={profileMenuRef}>
          <div className="profile-menu-header">
            <div className="profile-menu-photo">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-menu-info">
              <div className="profile-menu-name">{user.displayName}</div>
              <div className="profile-menu-email">{user.email}</div>
              <div className="profile-menu-role">{user.role}</div>
            </div>
          </div>
          <div className="profile-menu-divider"></div>
          <button className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
            View Profile
          </button>
          <button className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
            Settings
          </button>
          <button
            className="profile-menu-item"
            onClick={() => {
              setShowProfileMenu(false); // existing behavior
              onLogout();                 // log out the user
            }}
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div className={`nav-buttons ${showNavMenu ? 'nav-buttons-open' : ''}`}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`nav-button ${currentTab === tab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;