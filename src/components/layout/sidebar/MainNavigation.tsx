
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavItem as NavItemType, QubeItem, personaItems } from './sidebarData';
import NavItem from './NavItem';
import IQubesSection from './IQubesSection';
import PersonaSection from './PersonaSection';

interface MainNavigationProps {
  navItems: NavItemType[];
  activePath: string;
  collapsed: boolean;
  iQubeItems: QubeItem[];
  iQubesOpen: boolean;
  toggleIQubesMenu: () => void;
  personaOpen: boolean;
  togglePersonaMenu: () => void;
  selectedIQube: string | null;
  activeQubes: {[key: string]: boolean};
  handleIQubeClick: (iqubeId: string) => void;
  toggleIQubeActive: (e: React.MouseEvent<HTMLDivElement>, qubeName: string) => void;
  location: { pathname: string };
  toggleMobileSidebar?: () => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ 
  navItems, 
  activePath, 
  collapsed,
  iQubeItems,
  iQubesOpen,
  toggleIQubesMenu,
  personaOpen,
  togglePersonaMenu,
  selectedIQube,
  activeQubes,
  handleIQubeClick,
  toggleIQubeActive,
  location,
  toggleMobileSidebar
}) => {
  const navigate = useNavigate();
  
  // Handle Persona nav item click
  const handlePersonaNavClick = () => {
    // Navigate to profile page and toggle menu
    navigate('/profile');
    togglePersonaMenu();
  };

  return (
    <div className="flex-1 px-3 py-2 space-y-1">
      {/* Regular Nav Items */}
      {navItems.map((item, index) => {
        // Special handling for Persona nav item
        if (item.name === 'Persona') {
          return (
            <div key={index} onClick={handlePersonaNavClick}>
              <NavItem 
                icon={item.icon}
                href={item.href}
                active={activePath === item.href}
                collapsed={collapsed}
                onClick={handlePersonaNavClick} // Navigate to profile and toggle menu
                toggleMobileSidebar={toggleMobileSidebar}
              >
                {item.name}
              </NavItem>
            </div>
          );
        }

        return (
          <NavItem 
            key={index}
            icon={item.icon}
            href={item.href}
            active={activePath === item.href}
            collapsed={collapsed}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            {item.name}
          </NavItem>
        );
      })}
      
      {/* Persona Section - Collapsible submenu for persona items */}
      <PersonaSection 
        personaItems={personaItems}
        personaOpen={personaOpen}
        togglePersonaMenu={togglePersonaMenu}
        collapsed={collapsed}
        selectedIQube={selectedIQube}
        activeQubes={activeQubes}
        handleIQubeClick={handleIQubeClick}
        toggleIQubeActive={toggleIQubeActive}
        location={location}
        toggleMobileSidebar={toggleMobileSidebar}
      />
      
      {/* iQubes Section - Now only contains model qubes */}
      <IQubesSection 
        iQubeItems={iQubeItems}
        iQubesOpen={iQubesOpen}
        toggleIQubesMenu={toggleIQubesMenu}
        collapsed={collapsed}
        selectedIQube={selectedIQube}
        activeQubes={activeQubes}
        handleIQubeClick={handleIQubeClick}
        toggleIQubeActive={toggleIQubeActive}
        location={location}
        toggleMobileSidebar={toggleMobileSidebar}
      />
    </div>
  );
};

export default MainNavigation;
