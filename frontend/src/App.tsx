import React from 'react';
import { RouterProvider, useRouter } from './router/RouterContext';
import { LandingPage } from './components/Landing/LandingPage';
import { Dashboard } from './components/Dashboard/Dashboard';

const AppContent: React.FC = () => {
  const { currentPath } = useRouter();

  if (currentPath === '/explore') {
    return <Dashboard />;
  }

  return <LandingPage />;
};

export const App: React.FC = () => {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
};

export default App;
