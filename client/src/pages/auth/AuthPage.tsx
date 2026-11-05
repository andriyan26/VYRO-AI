import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InteractiveLumenLamp } from '../../components/auth/InteractiveLumenLamp';

export const AuthPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleAuthSuccess = () => {
    navigate('/');
  };

  return <InteractiveLumenLamp onSuccess={handleAuthSuccess} />;
};

