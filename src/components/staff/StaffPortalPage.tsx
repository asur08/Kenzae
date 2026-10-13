import React from 'react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { StaffLoginPage } from './StaffLoginPage';
import { StaffDashboard } from './StaffDashboard';

interface StaffPortalPageProps {
  onReturnToStore: () => void;
}

export const StaffPortalPage: React.FC<StaffPortalPageProps> = ({ onReturnToStore }) => {
  const { isAuthenticated } = useStaffAuth();

  if (!isAuthenticated) {
    return <StaffLoginPage onReturnToStore={onReturnToStore} />;
  }

  return <StaffDashboard onReturnToStore={onReturnToStore} />;
};

export default StaffPortalPage;
