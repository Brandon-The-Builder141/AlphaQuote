// Utility functions for managing module visibility based on wizard settings

export const getEnabledModules = () => {
  try {
    const enabledModules = localStorage.getItem('alphaquote_enabled_modules');
    if (enabledModules) {
      return JSON.parse(enabledModules);
    }
  } catch (error) {
    console.error('Error loading enabled modules:', error);
  }

  // Default to all modules enabled if no settings found
  return {
    estimation: true,
    vendorManagement: true,
    reporting: false
  };
};

export const isModuleEnabled = (moduleId) => {
  const enabledModules = getEnabledModules();
  return enabledModules[moduleId] || false;
};

export const getModuleDisplayName = (moduleId) => {
  const names = {
    estimation: 'Estimation',
    vendorManagement: 'Vendor Management',
    reporting: 'Reporting & Analytics'
  };
  return names[moduleId] || moduleId;
};

export const getModuleIcon = (moduleId) => {
  const icons = {
    estimation: '📊',
    vendorManagement: '🏪',
    reporting: '📈'
  };
  return icons[moduleId] || '⚙️';
};

export const getEnabledModulesList = () => {
  const enabledModules = getEnabledModules();
  return Object.entries(enabledModules)
    .filter(([_, enabled]) => enabled)
    .map(([moduleId, _]) => ({
      id: moduleId,
      name: getModuleDisplayName(moduleId),
      icon: getModuleIcon(moduleId)
    }));
};
