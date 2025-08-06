import { useEffect,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { bgcolor } from '../contexts/context';
function AuthCallback() {
    const navigate = useNavigate();
    const {isDark,setIsDark}=useContext(bgcolor);
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;

            navigate('/home', { replace: true });
        } else {

            navigate('/login', { replace: true });
        }
    }, [navigate]);
    
    return (
         <>
     <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: isDark ? '#ffffff' : '#333333'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #f4c430',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <h1>completing login...........</h1>
        
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
     </>
    );
}

export default AuthCallback;