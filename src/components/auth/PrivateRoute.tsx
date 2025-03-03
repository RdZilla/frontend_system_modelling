import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/tokenStorage.ts';

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
