import { FileText, Moon, Sun, MessageCircle, FileDown, Zap } from 'lucide-react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { bgcolor } from '../contexts/context';
import Transtion from '../transitions/transiton.jsx';
import { auth } from '../contexts/context';
import useLogin from '../hooks/loginFunction.jsx';

function LandingPage() {
   
  const {isDark, setIsDark} = useContext(bgcolor);
  const {isLogin,setIsLogin,userDetail,setUserDetail,error,setError,loading,setLoading} =useContext(auth);
  const navigate = useNavigate();
  
  const theme = {
    bg: isDark ? "#1a1a1a" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#333333",
    textSecondary: isDark ? "#cccccc" : "#666666",
    textTertiary: isDark ? "#999999" : "#777777",
    circle1: isDark ? "#2a2a2a" : "#e0e0e0",
    circle2: isDark ? "#333333" : "#d5d5d5",
    circle3: isDark ? "#252525" : "#e8e8e8",
    yellow: "#f4c430",
    cardBg: isDark ? "#252525" : "#ffffff",
    cardBorder: isDark ? "#333333" : "#e0e0e0",
    logoBackground: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)"
  };
  
  const features = [
    {
      icon: MessageCircle,
      title: "Chat with your docs",
      description: "Upload any document and start asking questions. Get answers pulled straight from your content, no searching through pages.",
      color: "#4ade80"
    },
    {
      icon: FileDown,
      title: "Smart summaries",
      description: "Turn 50-page reports into 2-minute reads. Our summaries capture what matters most, not just random highlights.",
      color: "#3b82f6"
    },
    {
      icon: Zap,
      title: "Fix broken PDFs",
      description: "Got a PDF where you can't select text? We'll convert it into something you can actually search and copy from.",
      color: "#f59e0b"
    }
  ];

  return (
    <Transtion>
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
          left: "50%",
          transform: "translateX(-50%)",
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
          right: "200px",
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
          top: "100px",
          left: "-100px",
          width: "250px",
          height: "250px",
          backgroundColor: theme.circle3,
          borderRadius: "50%",
          opacity: 0.5,
          transition: "background-color 0.3s ease",
          zIndex: 2
        }} />
        
        {/* Additional background circles for features section */}
        <div style={{
          position: "absolute",
          top: "800px",
          left: "50%",
          width: "200px",
          height: "200px",
          backgroundColor: theme.circle1,
          borderRadius: "50%",
          opacity: 0.3,
          transition: "background-color 0.3s ease",
          zIndex: 2
        }} />
        
        {/* Main content container */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 3rem",
          position: "relative",
          zIndex: 10
        }}>
          
          {/* Header */}
          <div style={{
            position: "absolute",
            top: "2rem",
            left: "1rem",
            fontSize: "3rem",
            fontWeight: "bold",
            color: theme.text,
            transition: "color 0.3s ease"
          }}>
            Kempt.
          </div>
          
          {/* Signup/Login Button */}
          <div style={{
            position: "absolute",
            top: "2rem",
            right: "0rem",
            fontSize: "2rem",
            color: theme.textSecondary,
            transition: "color 0.3s ease"
          }}>
            <button
              onClick={() => navigate('/auth')}
              style={{
                background: theme.bg,
                border: `2px solid ${theme.text}`,
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
                e.target.style.backgroundColor = "#f4c430";
                e.target.style.color = isDark ? "#1a1a1a" : "#333333";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.bg;
                e.target.style.color = theme.text;
              }}
            >
              Signup/Login
            </button>
          </div>
          
          {/* Hero Section */}
          <div style={{
            height: "100vh",
            display: "flex",
            alignItems: "center"
          }}>
            {/* Main content grid */}
            <div style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "center"
            }}>
              
              {/* Left side - Document with yellow circle */}
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                
                {/* Yellow circle background */}
                <div style={{
                  width: "29em",
                  height: "29em",
                  backgroundColor: theme.yellow,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}>
                  
                  {/* Document icon */}
                  <FileText 
                    size={300} 
                    color={isDark ? "#1a1a1a" : "#333"} 
                    style={{
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                    }}
                  />
                </div>
              </div>
              
              {/* Right side - Text content */}
              <div style={{
                color: theme.text
              }}>
                <h1 style={{
                  fontSize: "3.5rem",
                  fontWeight: "bold",
                  lineHeight: "1.1",
                  margin: "0 0 1rem 0",
                  letterSpacing: "-0.02em",
                  color: theme.text,
                  transition: "color 0.3s ease"
                }}>
                  Intelligent Document Insight.
                </h1>
                
                <div style={{
                  fontSize: "1.3rem",
                  color: theme.textTertiary,
                  lineHeight: "1.6",
                  transition: "color 0.3s ease"
                }}>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    Ask questions, get instant answers,
                  </p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    smart summaries that actually work,
                  </p>
                  <p style={{ margin: "0" }}>
                    make any PDF searchable.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div style={{
            padding: "6rem 0",
            textAlign: "center"
          }}>
            {/* Features Title */}
            <h2 style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: theme.text,
              margin: "0 0 1rem 0",
              transition: "color 0.3s ease"
            }}>
              What you can do
            </h2>
            
            <p style={{
              fontSize: "1.1rem",
              color: theme.textSecondary,
              margin: "0 0 4rem 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              transition: "color 0.3s ease"
            }}>
              Three things that'll make your document workflow way better.
            </p>
            
            {/* Features Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "2rem",
              maxWidth: "1100px",
              margin: "0 auto"
            }}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: theme.cardBg,
                      border: `1px solid ${theme.cardBorder}`,
                      borderRadius: "20px",
                      padding: "2.5rem 2rem",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      transform: "translateY(0)",
                      boxShadow: isDark 
                        ? "0 4px 20px rgba(0,0,0,0.3)" 
                        : "0 4px 20px rgba(0,0,0,0.08)",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-8px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Feature Icon */}
                    <div style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: feature.color,
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem auto"
                    }}>
                      <IconComponent size={40} color="white" />
                    </div>
                    
                    {/* Feature Title */}
                    <h3 style={{
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: theme.text,
                      margin: "0 0 1rem 0",
                      transition: "color 0.3s ease"
                    }}>
                      {feature.title}
                    </h3>
                    
                    {/* Feature Description */}
                    <p style={{
                      fontSize: "0.95rem",
                      color: theme.textSecondary,
                      lineHeight: "1.6",
                      margin: "0",
                      transition: "color 0.3s ease"
                    }}>
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Call to Action Section */}
          <div style={{
            textAlign: "center",
            padding: "4rem 0 6rem 0"
          }}>
            <h3 style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: theme.text,
              margin: "0 0 1rem 0",
              transition: "color 0.3s ease"
            }}>
              Ready to try it?
            </h3>
            
            <p style={{
              fontSize: "1rem",
              color: theme.textSecondary,
              margin: "0 0 2rem 0",
              transition: "color 0.3s ease"
            }}>
              Takes literally 30 seconds to get started.
            </p>
            
            <button
              onClick={() => navigate('/auth')}
              style={{
                backgroundColor: theme.yellow,
                color: isDark ? "#1a1a1a" : "#333",
                border: "none",
                borderRadius: "50px",
                padding: "1rem 2.5rem",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(244, 196, 48, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(244, 196, 48, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(244, 196, 48, 0.3)";
              }}
            >
              Try it out
            </button>
          </div>
        </div>
      </div>
    </Transtion>
  );
}

export default function WrapperLandingPage()
{
  useLogin();
   const {isLogin,setIsLogin,userDetail,setUserDetail,error,setError,loading,setLoading} =useContext(auth);
   const {isDark, setIsDark} = useContext(bgcolor);
  const navigate = useNavigate();
  if(!isLogin)
  {
    return <LandingPage/>
  }
  if(error!=null)
  {
    return(
      <div>
        {error}
      </div>
    )
  }
  if(loading)
  {
    return(
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
        <h1>Loading...</h1>
        
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
     </>
    )
  }

  navigate("/home");
}
