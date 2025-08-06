import { useState, useContext } from 'react';
import { Moon, Sun, User, Lock, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { bgcolor,auth} from '../contexts/context';
import { useNavigate } from 'react-router-dom';
import Transtion from '../transitions/transiton.jsx';
import axios from 'axios'
import useLogin from '../hooks/loginFunction.jsx';
import ErrorToast from './Toast.jsx';
import useErrorToast from '../hooks/useToast.jsx';


axios.defaults.withCredentials = true;
export default function Authentication() {
  const { isDark, setIsDark } = useContext(bgcolor);
  const {isLogin,setIsLogin,userDetail,setUserDetail,error,setError,loading,setLoading}=useContext(auth)
  const [showPassword, setShowPassword] = useState(false);
  const [password,Setpassword]=useState('');
  const [email,Setemail]=useState('');
  const [firstName,SetfirstName]=useState('');
  const [lastName,SetlastName]=useState('');
  const navigate = useNavigate();
  const { errorforToast, seterrorforToast, hideError }=useErrorToast();

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
    inputBg: isDark ? "#1f1f1f" : "#f8f8f8",
    inputBorder: isDark ? "#404040" : "#d0d0d0"
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const handleGoogleLogin = () => {
    window.location.href="https://kempt-1017350567380.europe-west1.run.app/auth/LoginWithGoogle/"
  };


  return (
    <Transtion>
      {errorforToast && (
      <ErrorToast 
        message={JSON.stringify(errorforToast)} 
        onClose={hideError}
      />
    )}
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundColor: theme.bg,
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden",
      transition: "background-color 0.3s ease"
    }}>
      
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
        transition: "background-color 0.3s ease"
      }} />
      
      <div style={{
        position: "absolute",
        bottom: "-150px",
        left: "-100px",
        width: "400px",
        height: "400px",
        backgroundColor: theme.circle2,
        borderRadius: "50%",
        opacity: 0.4,
        transition: "background-color 0.3s ease"
      }} />
      
      <div style={{
        position: "absolute",
        top: "50%",
        right: "-50px",
        width: "200px",
        height: "200px",
        backgroundColor: theme.circle3,
        borderRadius: "50%",
        opacity: 0.3,
        transition: "background-color 0.3s ease"
      }} />

      {/* Large background Kempt logo */}
      <div style={{
        position: "absolute",
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

      

      {/* Back button */}
      <button style={{
        position: "fixed",
        top: "2rem",
        left: "2rem",
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
        transition: "all 0.3s ease",
        zIndex: 30
      }}
      onClick={()=>{navigate('/')}}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
      }}>
        <ArrowLeft size={16} />
        Back to home
      </button>

      {/* Dark mode toggle */}
      <div style={{
        position: "fixed",
        top: "2rem",
        right: "2rem",
        zIndex: 30
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

      {/* Main content */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 2rem 2rem 2rem",
        position: "relative",
        zIndex: 10
      }}>
        
        {/* Auth card */}
        <div style={{
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: "24px",
          padding: "3rem",
          width: "100%",
          maxWidth: "450px",
          boxShadow: isDark 
            ? "0 20px 40px rgba(0,0,0,0.4)" 
            : "0 20px 40px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease"
        }}>
          
          {/* Yellow circle with icon */}
          <div style={{
            width: "100px",
            height: "100px",
            backgroundColor: theme.yellow,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 2rem auto"
          }}>
            <User size={50} color={isDark ? "#1a1a1a" : "#333"} />
          </div>

          {/* Toggle buttons */}
          <div style={{
            display: "flex",
            backgroundColor: theme.inputBg,
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: "50px",
            padding: "4px",
            margin: "0 0 2rem 0",
            transition: "all 0.3s ease"
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: "0.8rem 1.5rem",
                borderRadius: "50px",
                border: "none",
                backgroundColor: isLogin ? theme.yellow : "transparent",
                color: isLogin ? (isDark ? "#1a1a1a" : "#333") : theme.textSecondary,
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: "0.8rem 1.5rem",
                borderRadius: "50px",
                border: "none",
                backgroundColor: !isLogin ? theme.yellow : "transparent",
                color: !isLogin ? (isDark ? "#1a1a1a" : "#333") : theme.textSecondary,
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "2.2rem",
            fontWeight: "bold",
            color: theme.text,
            textAlign: "center",
            margin: "0 0 0.5rem 0",
            transition: "color 0.3s ease"
          }}>
            {isLogin ? 'Welcome back' : 'Join Kempt'}
          </h1>

          <p style={{
            fontSize: "1rem",
            color: theme.textSecondary,
            textAlign: "center",
            margin: "0 0 2rem 0",
            transition: "color 0.3s ease"
          }}>
            {isLogin 
              ? 'Sign in to access your documents' 
              : 'Create your account to get started'
            }
          </p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              backgroundColor: theme.cardBg,
              border: `2px solid ${theme.inputBorder}`,
              borderRadius: "12px",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              color: theme.text,
              transition: "all 0.3s ease",
              marginBottom: "1.5rem"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.borderColor = theme.yellow;
              e.target.style.boxShadow = `0 4px 12px ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.borderColor = theme.inputBorder;
              e.target.style.boxShadow = "none";
            }}
          >
            <GoogleIcon />
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            margin: "1.5rem 0",
            gap: "1rem"
          }}>
            <div style={{
              flex: 1,
              height: "1px",
              backgroundColor: theme.inputBorder,
              transition: "background-color 0.3s ease"
            }} />
            <span style={{
              color: theme.textTertiary,
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "color 0.3s ease"
            }}>
              or
            </span>
            <div style={{
              flex: 1,
              height: "1px",
              backgroundColor: theme.inputBorder,
              transition: "background-color 0.3s ease"
            }} />
          </div>

          {/* Form */}
          <div>
            
            {/* Name fields (only for signup) */}
            {!isLogin && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{
                  display: "flex",
                  gap: "1rem"
                }}>
                  {/* First Name */}
                  <div style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    flex: 1
                  }}>
                    <User 
                      size={20} 
                      color={theme.textTertiary}
                      style={{
                        position: "absolute",
                        left: "1rem",
                        zIndex: 2
                      }}
                    />
                    <input
                      type="text"
                      placeholder="First name"
                      style={{
                        width: "100%",
                        padding: "1rem 1rem 1rem 3rem",
                        backgroundColor: theme.inputBg,
                        border: `1px solid ${theme.inputBorder}`,
                        borderRadius: "12px",
                        fontSize: "1rem",
                        color: theme.text,
                        outline: "none",
                        transition: "all 0.3s ease"
                      }}
                      onChange={(e)=>{
                        SetfirstName(e.target.value);
                        //console.log(firstName);
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.yellow;
                        e.target.style.boxShadow = `0 0 0 3px ${theme.yellow}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.inputBorder;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  
                  {/* Last Name */}
                  <div style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    flex: 1
                  }}>
                    <User 
                      size={20} 
                      color={theme.textTertiary}
                      style={{
                        position: "absolute",
                        left: "1rem",
                        zIndex: 2
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      style={{
                        width: "100%",
                        padding: "1rem 1rem 1rem 3rem",
                        backgroundColor: theme.inputBg,
                        border: `1px solid ${theme.inputBorder}`,
                        borderRadius: "12px",
                        fontSize: "1rem",
                        color: theme.text,
                        outline: "none",
                        transition: "all 0.3s ease"
                      }}
                      onChange={(e)=>{
                        SetlastName(e.target.value);
                       // console.log(lastName);
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.yellow;
                        e.target.style.boxShadow = `0 0 0 3px ${theme.yellow}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.inputBorder;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email field */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center"
              }}>
                <Mail 
                  size={20} 
                  color={theme.textTertiary}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    zIndex: 2
                  }}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  style={{
                    width: "100%",
                    padding: "1rem 1rem 1rem 3rem",
                    backgroundColor: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: "12px",
                    fontSize: "1rem",
                    color: theme.text,
                    outline: "none",
                    transition: "all 0.3s ease"
                  }}
                      onChange={(e)=>{
                        Setemail(e.target.value);
                        //console.log(email);
                      }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.yellow;
                    e.target.style.boxShadow = `0 0 0 3px ${theme.yellow}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.inputBorder;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: !isLogin ? "1.5rem" : "2rem" }}>
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center"
              }}>
                <Lock 
                  size={20} 
                  color={theme.textTertiary}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    zIndex: 2
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  style={{
                    width: "100%",
                    padding: "1rem 3rem 1rem 3rem",
                    backgroundColor: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: "12px",
                    fontSize: "1rem",
                    color: theme.text,
                    outline: "none",
                    transition: "all 0.3s ease"
                  }}
                  onChange={(e)=>{
                    Setpassword(e.target.value);
                   // console.log(password);
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.yellow;
                    e.target.style.boxShadow = `0 0 0 3px ${theme.yellow}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.inputBorder;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: theme.textTertiary,
                    padding: "0",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password field (only for signup) */}
            

            {/* Submit button */}
            <button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: theme.yellow,
                color: isDark ? "#1a1a1a" : "#333",
                border: "none",
                borderRadius: "12px",
                padding: "1rem",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(244, 196, 48, 0.3)",
                marginBottom: "1.5rem"
              }}
              onClick={async(e) => {
                  e.preventDefault();
                 // console.log(email,firstName,lastName,password);
                  
                  try {
                    let response;
                    
                    if(!isLogin) {
                      response = await axios.post('https://kempt-1017350567380.europe-west1.run.app/auth/signup', {
                        
                        email: email.toLowerCase(),
                        password,
                        firstName: firstName.toLowerCase(),
                        lastName: lastName.toLowerCase()
                      });
                    } else {
                      response = await axios.post('https://kempt-1017350567380.europe-west1.run.app/auth/signin', {
                        email: email.toLowerCase(), // Add toLowerCase here too
                        password,
                      });
                      
                    }
                    navigate(`/auth/callback?token=${response.data.token}`)
                    
                  } catch (error) {
                   seterrorforToast(error.response?.data || error.message);
                   
                  }
                 
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
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transtion>
  );
}
 