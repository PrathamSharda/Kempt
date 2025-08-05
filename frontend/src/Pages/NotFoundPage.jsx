import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useContext } from 'react';
import { bgcolor } from '../contexts/context';
import { useNavigate } from 'react-router-dom';
import Transition from '../transitions/transiton';

export default function NotFoundPage() {
  const { isDark, setIsDark } = useContext(bgcolor);
  const navigate = useNavigate();
  
  const theme = {
    bg: isDark ? "#1a1a1a" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#333333",
    textSecondary: isDark ? "#cccccc" : "#666666",
    circle1: isDark ? "#2a2a2a" : "#e0e0e0",
    circle2: isDark ? "#333333" : "#d5d5d5",
    circle3: isDark ? "#252525" : "#e8e8e8",
    yellow: "#f4c430",
    cardBg: isDark ? "#252525" : "#ffffff",
    cardBorder: isDark ? "#333333" : "#e0e0e0"
  };

  return (
    <Transition>
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: theme.bg,
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
        transition: "background-color 0.3s ease"
      }}>
        
        {/* Fixed Background Logo */}
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "28rem",
          fontWeight: "900",
          color: theme.text,
          opacity: 0.03,
          zIndex: 1,
          userSelect: "none",
          pointerEvents: "none",
          transition: "color 0.3s ease, opacity 0.3s ease"
        }}>
          Kempt.
        </div>
        
        {/* Dark mode toggle */}
        <div style={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          zIndex: 20
        }}>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              backgroundColor: isDark ? "#f5f5f5" : "#1a1a1a",
              border: `2px solid ${theme.text}`,
              borderRadius: "50px",
              padding: "0.8rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              color: isDark ? "#333333" : "#ffffff",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
        
        {/* Back button */}
        <div style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          zIndex: 20
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: theme.cardBg,
              border: `2px solid ${theme.cardBorder}`,
              borderRadius: "50px",
              padding: "0.8rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              color: theme.text,
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDark ? "#333333" : "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.cardBg;
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        
        {/* Background circles */}
        <div style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "300px",
          height: "300px",
          backgroundColor: theme.circle1,
          borderRadius: "50%",
          opacity: 0.6,
          transition: "background-color 0.3s ease",
          zIndex: 2
        }} />
        
        <div style={{
          position: "absolute",
          bottom: "-150px",
          left: "100px",
          width: "400px",
          height: "400px",
          backgroundColor: theme.circle2,
          borderRadius: "50%",
          opacity: 0.4,
          transition: "background-color 0.3s ease",
          zIndex: 2
        }} />
        
        <div style={{
          position: "absolute",
          top: "300px",
          left: "-150px",
          width: "350px",
          height: "350px",
          backgroundColor: theme.circle3,
          borderRadius: "50%",
          opacity: 0.5,
          transition: "background-color 0.3s ease",
          zIndex: 2
        }} />

        {/* Main content container */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "6rem 3rem 3rem",
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center"
        }}>
          
          {/* 404 Error Display */}
          <div style={{
            position: "relative"
          }}>
            <h1 style={{
              fontSize: "12rem",
              fontWeight: "900",
              color: theme.yellow,
              margin: "0",
              lineHeight: "1",
              textShadow: isDark 
                ? "0 0 50px rgba(244, 196, 48, 0.3)" 
                : "0 0 30px rgba(244, 196, 48, 0.2)",
              transition: "all 0.3s ease"
            }}>
              404
            </h1>
            
            <h2 style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: theme.text,
              margin: "1rem 0",
              transition: "color 0.3s ease"
            }}>
              Page Not Found
            </h2>
            
            <p style={{
              fontSize: "1.1rem",
              color: theme.textSecondary,
              margin: "0",
              transition: "color 0.3s ease"
            }}>
              The page you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  );
}

