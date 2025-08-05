import { Crown, Check, ArrowLeft, Moon, Sun, Zap, Star } from 'lucide-react';
import { useState, useContext } from 'react';
import { bgcolor } from '../contexts/context';
import { useNavigate } from 'react-router-dom';
import Transition from '../transitions/transiton';
import useLogin from '../hooks/loginFunction.jsx';
import { auth } from '../contexts/context';
import ErrorToast from './Toast.jsx';
import useErrorToast from '../hooks/useToast.jsx';

function BuyPremiumPage() {
  const { isDark, setIsDark } = useContext(bgcolor);
  const Navigate = useNavigate();
  const { userDetail } = useContext(auth);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const theme = {
    bg: isDark ? "#1a1a1a" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#333333",
    textSecondary: isDark ? "#cccccc" : "#666666",
    textTertiary: isDark ? "#999999" : "#777777",
    circle1: isDark ? "#2a2a2a" : "#e0e0e0",
    circle2: isDark ? "#333333" : "#d5d5d5",
    circle3: isDark ? "#252525" : "#e8e8e8",
    yellow: "#f4c430",
    red: "#d82f2fff",
    cardBg: isDark ? "#252525" : "#ffffff",
    cardBorder: isDark ? "#333333" : "#e0e0e0",
    green: "#4ade80",
    blue: "#3b82f6",
    purple: "#8b5cf6"
  };

  const plans = {
    monthly: {
      id: 'monthly',
      name: 'Monthly Premium',
      price: 100,
      duration: 'month',
      savings: null,
      popular: false
    },
    yearly: {
      id: 'yearly',
      name: 'Yearly Premium',
      price: 1000,
      duration: 'year',
      savings: '17% OFF',
      popular: true
    }
  };

  const features = [
    { icon: Zap, text: '30 tokens daily' },
  ];

  const handlePurchase = async (planId) => {
    setIsProcessing(true);
    try {
      // Add your payment processing logic here
      console.log(`Processing payment for ${planId} plan`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page or show success message
      alert(`Payment successful for ${plans[planId].name}!`);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
            onClick={() => Navigate(-1)}
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
          minHeight: "100vh"
        }}>
          
          {/* Header Section */}
          <div style={{
            textAlign: "center",
            marginBottom: "3rem"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1rem"
            }}>
              <Crown size={32} color={theme.yellow} />
              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: theme.text,
                margin: 0,
                transition: "color 0.3s ease"
              }}>
                Go Premium
              </h1>
            </div>
            <p style={{
              fontSize: "1.2rem",
              color: theme.textSecondary,
              margin: 0,
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              transition: "color 0.3s ease"
            }}>
              Unlock enhanced features with our premium plans
            </p>
          </div>

          {/* Plans Container */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            maxWidth: "800px",
            margin: "0 auto 3rem"
          }}>
            
            {/* Monthly Plan */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              style={{
                backgroundColor: theme.cardBg,
                border: selectedPlan === 'monthly' 
                  ? `3px solid ${theme.yellow}` 
                  : `1px solid ${theme.cardBorder}`,
                borderRadius: "24px",
                padding: "2rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: selectedPlan === 'monthly'
                  ? `0 8px 32px ${isDark ? 'rgba(244, 196, 48, 0.3)' : 'rgba(244, 196, 48, 0.2)'}`
                  : isDark 
                    ? "0 4px 20px rgba(0,0,0,0.3)" 
                    : "0 4px 20px rgba(0,0,0,0.08)",
                position: "relative",
                transform: selectedPlan === 'monthly' ? "translateY(-4px)" : "translateY(0)"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem"
              }}>
                <h3 style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: theme.text,
                  margin: 0,
                  transition: "color 0.3s ease"
                }}>
                  Monthly
                </h3>
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: `2px solid ${selectedPlan === 'monthly' ? theme.yellow : theme.cardBorder}`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selectedPlan === 'monthly' ? theme.yellow : "transparent",
                  transition: "all 0.3s ease"
                }}>
                  {selectedPlan === 'monthly' && (
                    <Check size={12} color={isDark ? "#1a1a1a" : "#333"} />
                  )}
                </div>
              </div>
              
              <div style={{
                marginBottom: "1.5rem"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.5rem",
                  marginBottom: "0.5rem"
                }}>
                  <span style={{
                    fontSize: "3rem",
                    fontWeight: "bold",
                    color: theme.text,
                    transition: "color 0.3s ease"
                  }}>
                    ₹100
                  </span>
                  <span style={{
                    fontSize: "1.2rem",
                    color: theme.textSecondary,
                    transition: "color 0.3s ease"
                  }}>
                    /month
                  </span>
                </div>
                <p style={{
                  fontSize: "0.9rem",
                  color: theme.textTertiary,
                  margin: 0,
                  transition: "color 0.3s ease"
                }}>
                  Perfect for trying premium features
                </p>
              </div>
            </div>

            {/* Yearly Plan */}
            <div
              onClick={() => setSelectedPlan('yearly')}
              style={{
                backgroundColor: theme.cardBg,
                border: selectedPlan === 'yearly' 
                  ? `3px solid ${theme.yellow}` 
                  : `1px solid ${theme.cardBorder}`,
                borderRadius: "24px",
                padding: "2rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: selectedPlan === 'yearly'
                  ? `0 8px 32px ${isDark ? 'rgba(244, 196, 48, 0.3)' : 'rgba(244, 196, 48, 0.2)'}`
                  : isDark 
                    ? "0 4px 20px rgba(0,0,0,0.3)" 
                    : "0 4px 20px rgba(0,0,0,0.08)",
                position: "relative",
                transform: selectedPlan === 'yearly' ? "translateY(-4px)" : "translateY(0)"
              }}
            >
              {/* Popular badge */}
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: theme.green,
                color: "white",
                padding: "0.4rem 1rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600"
              }}>
                Most Popular
              </div>
              
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem"
              }}>
                <h3 style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: theme.text,
                  margin: 0,
                  transition: "color 0.3s ease"
                }}>
                  Yearly
                </h3>
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: `2px solid ${selectedPlan === 'yearly' ? theme.yellow : theme.cardBorder}`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selectedPlan === 'yearly' ? theme.yellow : "transparent",
                  transition: "all 0.3s ease"
                }}>
                  {selectedPlan === 'yearly' && (
                    <Check size={12} color={isDark ? "#1a1a1a" : "#333"} />
                  )}
                </div>
              </div>
              
              <div style={{
                marginBottom: "1.5rem"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.5rem",
                  marginBottom: "0.5rem"
                }}>
                  <span style={{
                    fontSize: "3rem",
                    fontWeight: "bold",
                    color: theme.text,
                    transition: "color 0.3s ease"
                  }}>
                    ₹1000
                  </span>
                  <span style={{
                    fontSize: "1.2rem",
                    color: theme.textSecondary,
                    transition: "color 0.3s ease"
                  }}>
                    /year
                  </span>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <p style={{
                    fontSize: "0.9rem",
                    color: theme.textTertiary,
                    margin: 0,
                    transition: "color 0.3s ease"
                  }}>
                    Save ₹200 compared to monthly
                  </p>
                  <span style={{
                    backgroundColor: theme.green,
                    color: "white",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "600"
                  }}>
                    17% OFF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div style={{
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "24px",
            padding: "2rem",
            marginBottom: "2rem",
            maxWidth: "600px",
            margin: "0 auto 2rem",
            transition: "all 0.3s ease",
            boxShadow: isDark 
              ? "0 4px 20px rgba(0,0,0,0.3)" 
              : "0 4px 20px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: theme.text,
              margin: "0 0 1.5rem 0",
              textAlign: "center",
              transition: "color 0.3s ease"
            }}>
              Premium Features
            </h3>
            
            <div style={{
              display: "grid",
              gap: "1rem"
            }}>
              {features.map((feature, index) => (
                <div key={index} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.75rem",
                  backgroundColor: isDark ? "#2a2a2a" : "#f8f9fa",
                  borderRadius: "12px",
                  transition: "background-color 0.3s ease"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: theme.yellow,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <feature.icon size={20} color={isDark ? "#1a1a1a" : "#333"} />
                  </div>
                  <span style={{
                    fontSize: "1rem",
                    fontWeight: "500",
                    color: theme.text,
                    transition: "color 0.3s ease"
                  }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Button */}
          <div style={{
            textAlign: "center",
            maxWidth: "400px",
            margin: "0 auto"
          }}>
            <button
              onClick={() => handlePurchase(selectedPlan)}
              disabled={isProcessing}
              style={{
                backgroundColor: theme.yellow,
                color: isDark ? "#1a1a1a" : "#333",
                border: "none",
                borderRadius: "50px",
                padding: "1.2rem 3rem",
                fontSize: "1.2rem",
                fontWeight: "600",
                cursor: isProcessing ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 6px 20px rgba(244, 196, 48, 0.3)",
                width: "100%",
                opacity: isProcessing ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(244, 196, 48, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 20px rgba(244, 196, 48, 0.3)";
                }
              }}
            >
              {isProcessing ? 'Processing...' : `Buy ${plans[selectedPlan].name} - ₹${plans[selectedPlan].price}`}
            </button>
            
            <p style={{
              fontSize: "0.9rem",
              color: theme.textTertiary,
              margin: "1rem 0 0 0",
              transition: "color 0.3s ease"
            }}>
              Secure payment • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </Transition>
  );
}

export default function WrapperBuyPremiumPage() {
  useLogin();
  const navigate = useNavigate();
  const { isLogin, error, loading } = useContext(auth);
  const { errorforToast, seterrorforToast, hideError } = useErrorToast();
  
  if (!isLogin) {
    navigate("/auth");
  }
  
  if (error != null) {
    navigate("/auth");
    seterrorforToast(error.response?.data || error.message);
    return (
      <ErrorToast message={errorforToast} onClose={hideError} />
    );
  }
  
  if (loading) {
    return (
      <div>
        loading.........................
      </div>
    );
  }
  
  return <BuyPremiumPage />;
}