import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutCallback() {
    const navigate = useNavigate();
    
    useEffect(() => {
        const logout = () => {
            console.log("called");
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            
            navigate('/auth', { replace: true });
        };
        
        logout();
    }, [navigate]);
    
    return <div>Logging out...</div>;
}

export default LogoutCallback;