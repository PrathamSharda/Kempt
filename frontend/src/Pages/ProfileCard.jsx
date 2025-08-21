import { User, Coins, Crown, Calendar, Moon, Sun } from 'lucide-react';
import { useState ,useContext} from 'react';
import { bgcolor } from '../contexts/context';
import {useNavigate} from 'react-router-dom'
import Transition from '../transitions/transiton';
import useLogin from '../hooks/loginFunction.jsx';
import { auth } from '../contexts/context';
import ErrorToast from './Toast.jsx';
import useErrorToast from '../hooks/useToast.jsx';


function ProfileCard() {
  const {isDark, setIsDark} = useContext(bgcolor);
  const Navigate=useNavigate();
  const {userDetail}=useContext(auth);
  //console.log(userDetail);
  const theme = {
    bg: isDark ? "#1a1a1a" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#333333",
    textSecondary: isDark ? "#cccccc" : "#666666",
    textTertiary: isDark ? "#999999" : "#777777",
    circle1: isDark ? "#2a2a2a" : "#e0e0e0",
    circle2: isDark ? "#333333" : "#d5d5d5",
    circle3: isDark ? "#252525" : "#e8e8e8",
    yellow: "#f4c430",
    red:"#d82f2fff",
    cardBg: isDark ? "#252525" : "#ffffff",
    cardBorder: isDark ? "#333333" : "#e0e0e0",
    green: "#4ade80",
    blue: "#3b82f6"
  };

  // Fix the premium user check - use userDetail.premiumUser instead of hardcoded false
  const isPremium = userDetail.premiumUser;
  
  // Fix the time reset calculation
  let formatted = "N/A";
  if(userDetail.tokenResetTime !== null) {
    const resetTime = new Date(userDetail.tokenResetTime);
    const now = new Date();
    
    // Calculate hours until reset
    const timeDiff = resetTime - now;
    const hoursUntilReset = Math.ceil(timeDiff / (1000 * 60 * 60));
    
    if (hoursUntilReset > 0 && hoursUntilReset <= 24) {
      formatted = `in ${hoursUntilReset}h`;
    } else if (timeDiff > 0) {
      // More than 24 hours, show days
      const daysUntilReset = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      formatted = `in ${daysUntilReset}d`;
    } else {
      // If reset time has passed, show "soon" or actual time
      formatted = "soon";
    }
  }

  const userData = {
    name: `${userDetail.firstName} ${userDetail.lastName}`,
    tokensLeft: userDetail.token,
    isPremium: isPremium, // Use the actual premium status
    dailyLimit: isPremium ? 30 : 5,
    memberSince: "The creator"
  };

  const tokenPercentage = (userData.tokensLeft / userData.dailyLimit) * 100;

  return (
    <Transition>
    <div style={{
      maxHeight:"100%",
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
      
      {/* Back button */}
      <div style={{
        position: "absolute",
        top: "2rem",
        left: "2rem",
        zIndex: 20
      }}>
        <button
          onClick={() => {
           
            Navigate(-1);
            
          }}
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
            e.target.style.color = isDark ? "white" : "#333333";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = theme.cardBg;
            e.target.style.color = theme.text;
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>←</span>
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
      
      {/* Additional background circles */}
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
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxHeight:"100%",
        minHeight: "100vh"
      }}>
        
        {/* Profile Card */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "24px",
            padding: "2.5rem",
            width: "100%",
            maxWidth: "420px",
            transition: "all 0.3s ease",
            boxShadow: isDark 
              ? "0 8px 32px rgba(0,0,0,0.4)" 
              : "0 8px 32px rgba(0,0,0,0.12)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          
          {/* Background decoration */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "150px",
            height: "150px",
            backgroundColor: theme.yellow,
            borderRadius: "50%",
            opacity: 0.05,
            transition: "background-color 0.3s ease"
          }} />
          
          {/* Header with avatar and premium badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
            position: "relative",
            zIndex: 2
          }}>
            
            {/* Avatar */}
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: theme.yellow,
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(244, 196, 48, 0.2)"
            }}>
              <User size={40} color={isDark ? "#1a1a1a" : "#333"} />
            </div>
            
            {/* Name and premium status */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.25rem"
              }}>
                <h2 style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: theme.text,
                  margin: 0,
                  transition: "color 0.3s ease"
                }}>
                  {userData.name}
                </h2>
                
                {isPremium && (
                  <div style={{
                    backgroundColor: theme.yellow,
                    borderRadius: "12px",
                    padding: "0.25rem 0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}>
                    <Crown size={14} color={isDark ? "#1a1a1a" : "#333"} />
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: isDark ? "#1a1a1a" : "#333"
                    }}>
                      Premium
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tokens Section */}
          <div style={{
            backgroundColor: isDark ? "#2a2a2a" : "#f8f9fa",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            transition: "background-color 0.3s ease",
            position: "relative",
            zIndex: 2
          }}>
            
            {/* Tokens header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: `linear-gradient(135deg, ${theme.yellow}, #f5d142)`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(244, 196, 48, 0.3)",
                  position: "relative"
                }}>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    background: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: theme.yellow
                  }}>
                    T
                  </div>
                  <div style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "12px",
                    height: "12px",
                    background: theme.green,
                    borderRadius: "50%",
                    border: `2px solid ${theme.cardBg}`,
                    transition: "background-color 0.3s ease"
                  }} />
                </div>
                <span style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: theme.text,
                  transition: "color 0.3s ease"
                }}>
                  Tokens Today
                </span>
              </div>
              
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem"
              }}>
                <Calendar size={16} color={theme.textSecondary} />
                <span style={{
                  fontSize: "0.8rem",
                  color: theme.textSecondary,
                  transition: "color 0.3s ease"
                }}>
                  Resets {formatted}
                </span>
              </div>
            </div>
            
            {/* Token count */}
            <div style={{
              marginBottom: "1rem"
            }}>
              <div style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: theme.text,
                transition: "color 0.3s ease"
              }}>
                {userData.tokensLeft.toLocaleString()}
                <span style={{
                  fontSize: "1rem",
                  color: theme.textSecondary,
                  fontWeight: "normal",
                  marginLeft: "0.5rem"
                }}>
                  / {userData.dailyLimit.toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb",
              borderRadius: "4px",
              overflow: "hidden",
              transition: "background-color 0.3s ease"
            }}>
              <div style={{
                width: `${tokenPercentage}%`,
                height: "100%",
                backgroundColor: tokenPercentage > 20 ? theme.green : theme.red,
                borderRadius: "4px",
                transition: "all 0.3s ease"
              }} />
            </div>
            
            <p style={{
              fontSize: "0.8rem",
              color: theme.textTertiary,
              margin: "0.5rem 0 0 0",
              transition: "color 0.3s ease"
            }}>
              {isPremium 
                ? "Premium user - Enjoy unlimited access!" 
                : tokenPercentage > 20 
                  ? "You're doing great! Plenty of tokens left." 
                  : "Running low on tokens. Consider upgrading for unlimited access."}
            </p>
          </div>
          
          {/* Buy Premium Button - Only show if user is NOT premium */}
          {!isPremium && (
            <div style={{
              marginTop: "1.5rem",
              textAlign: "center",
              position: "relative",
              zIndex: 2
            }}>
              <button
                onClick={() => {
                  Navigate("/buyPremium");
                }}
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
                  boxShadow: "0 4px 15px rgba(244, 196, 48, 0.3)",
                  width: "100%"
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
                Buy Premium
              </button>
              
              <p style={{
                fontSize: "0.8rem",
                color: theme.textTertiary,
                margin: "0.5rem 0 0 0",
                transition: "color 0.3s ease"
              }}>
                Get unlimited tokens and exclusive features
              </p>
            </div>
          )}

          {/* Premium Status Message - Show if user IS premium */}
          {isPremium && (
            <div style={{
              marginTop: "1.5rem",
              textAlign: "center",
              position: "relative",
              zIndex: 2,
              backgroundColor: isDark ? "#2a2a2a" : "#f0f9ff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: `2px solid ${theme.yellow}`
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem"
              }}>
                <Crown size={20} color={theme.yellow} />
                <span style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: theme.text,
                  transition: "color 0.3s ease"
                }}>
                  Premium Active
                </span>
              </div>
              <p style={{
                fontSize: "0.9rem",
                color: theme.textSecondary,
                margin: 0,
                transition: "color 0.3s ease"
              }}>
                Enjoying unlimited tokens and exclusive features
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </Transition>
  );
}

export default function WrapperProfileCard()
{
  useLogin();
  const {isDark, setIsDark} = useContext(bgcolor);
  const navigate=useNavigate();
  const {isLogin,error,loading}=useContext(auth);
  const {errorforToast,seterrorforToast,hideError}=useErrorToast();
  if(!isLogin)
  {
    navigate("/auth");
  }
  if(error!=null)
  {
    
      navigate("/auth");
      seterrorforToast(error.response?.data || error.message);
      return(
      <ErrorToast message={errorforToast} onClose={hideError}/>
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
  return <ProfileCard/>
}