import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh'
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
          animation: 'spin 0.7s linear infinite'
        }}/>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;