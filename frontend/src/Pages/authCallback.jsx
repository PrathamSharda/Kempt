import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthCallback() {
    const navigate = useNavigate();
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;
            navigate('/home', { replace: true });
        } else {
            navigate('/auth', { replace: true });
        }
    }, [navigate]);
    
    return <div>Completing login...</div>;
}

export default AuthCallback;