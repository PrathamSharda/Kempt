import { FileText, Moon, Sun, Upload, MessageCircle, FileDown, Zap, User, LogOut, Search, Clock, File, Mic, ArrowUp, Plus, Settings, X } from 'lucide-react';
import { useState, useRef, useContext, useCallback,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { bgcolor, userMessage, auth,loader,actionToPerform ,isError} from '../contexts/context';
import Transition from '../transitions/transiton';
import useLogin from '../hooks/loginFunction';
import Cookies from 'universal-cookie';
import axios from "axios"
import ErrorToast from './Toast';
import useErrorToast from '../hooks/useToast';
import useChatBackend from "../hooks/ChatBackend"


function UserPage() {
  const cookies = new Cookies();
  const{errorWhileFetch,setErrorWhileFetch}=useContext(isError);
  const {selectedAction, setSelectedAction}=useContext(actionToPerform);
  const { isDark, setIsDark } = useContext(bgcolor);
  const { message, setMessage } = useContext(userMessage);
  const [prompt,setPrompt]=useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const fileInputRef = useRef(null);
  const { isLogin, setIsLogin, setUserDetail, userDetail, error,loading,setLoading } = useContext(auth);
  const Navigate = useNavigate();
  const { errorforToast, seterrorforToast, hideError } = useErrorToast();
  const{chatBackendCaller}=useChatBackend();
  const [text,setText]=useState("Where should we begin?")
 

  useEffect(()=>{

    if(errorWhileFetch)
    {
      seterrorforToast(`could not  connect to backend try again `)
    }
  },[errorWhileFetch])

  useEffect(()=>{

    if(userDetail==null)return;
    if(userDetail.token==0)
    {
      seterrorforToast(`no token left reset in ${userDetail.tokenResetTime}`)
    }
  },[userDetail,errorWhileFetch])
  

  const theme = {
    bg: isDark ? "#1a1a1a" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#333333",
    textSecondary: isDark ? "#cccccc" : "#666666",
    textTertiary: isDark ? "#999999" : "#777777",
    circle1: isDark ? "#2a2a2a" : "#e0e0e0",
    circle2: isDark ? "#333333" : "#d5d5d5",
    circle3: isDark ? "#252525" : "#e8e8e8",
    inputBg: isDark ? "#2d2d2d" : "#ffffff",
    inputBorder: isDark ? "#404040" : "#e0e0e0",
    yellow: "#f4c430",
    cardBg: isDark ? "#252525" : "#ffffff",
    cardBorder: isDark ? "#333333" : "#e0e0e0",
    success: "#10b981",
    error: "#ef4444"
  };

 

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return <FileText size={16} />;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const maxFiles = 1;
    const maxSizeBytes = 1 * 1024 * 1024; 
    

    if (uploadedFiles.length + fileArray.length > maxFiles) {
      seterrorforToast(`Cannot upload more than ${maxFiles} files. Currently have ${uploadedFiles.length} files.`);
      return;
    }

    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      // Check file size
      const arr=file.name.split(".");
      if(arr[1]!="pdf")
      {
        errors.push(`${file.name} is not a pdf file should be a PDF`);
        return;
      }
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name} is too large (${formatFileSize(file.size)}). Maximum size is 1MB.`);
        return;
      }

      // Check if file already exists
      const fileExists = uploadedFiles.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );

      if (fileExists) {
        errors.push(`${file.name} is already uploaded.`);
        return;
      }



      validFiles.push({
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        id: Date.now() + Math.random() // Simple unique ID
      });
    });
    // Show errors if any
    if (errors.length > 0) {
      seterrorforToast(errors.join('\n'));
    }

    // Add valid files to state
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit =  async (e) => {
  e.preventDefault();
 
  // Validate that we have files or prompt
  if (uploadedFiles.length === 0 && (!prompt || prompt.trim() === "")) {
    seterrorforToast("Please upload at least one file or enter a prompt.");

    return;
  }

  try {
    
    setLoading(true);

    const formData = new FormData();
    
    // Add files to formData
    uploadedFiles.forEach((fileData) => {
      formData.append("files", fileData.file);
    });

    // Add prompt to formData
    const value = prompt?.trim() || "";
    formData.append("prompt", value);
    const finalValue = `USER : \n\n TASK:-${selectedAction=='qa'?"Question and Answer":selectedAction=="fix"?"Fix pdf":"Summarize Pdf"}${uploadedFiles.length > 0 ? `\n\n FILES:${uploadedFiles.map(file => `-${file.name}`).join('\n')}` : ""}${value ? `\n\nPROMPT:-${value}` : ""}`;
    setMessage(prev => [...prev, finalValue]);
    setErrorWhileFetch(false);
  
    // Call the backend
    const response=await chatBackendCaller(
      `http://localhost:3001/user/${selectedAction}`,
      formData, 
      setMessage,
      setLoading
    );

    const success=await response.success;
    if(success===false)
    {

      throw "error";
     
    }else{
    setPrompt("");
    setUploadedFiles([]);
    }
  } catch (error) {

    return;
    
  }
};

  return (
    
    <Transition>
      
      {errorforToast && (
        <ErrorToast 
          message={errorforToast} 
          onClose={hideError}
        />
      )}
      
      <div 
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundColor: theme.bg,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
          transition: "background-color 0.3s ease"
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        
        {/* Fixed Background Logo */}
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "20rem",
          fontWeight: "900",
          color: theme.text,
          opacity: 0.02,
          zIndex: 1,
          userSelect: "none",
          pointerEvents: "none",
          transition: "color 0.3s ease, opacity 0.3s ease"
        }}>
          Kempt.
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
          left: "200px",
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
        
        {/* Drag Overlay */}
        {dragActive && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(244, 196, 48, 0.1)",
            border: `3px dashed ${theme.yellow}`,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)"
          }}>
            <div style={{
              textAlign: "center",
              color: theme.text
            }}>
              <div style={{
                width: "100px",
                height: "100px",
                backgroundColor: theme.yellow,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto"
              }}>
                <Upload size={50} color={isDark ? "#1a1a1a" : "#333"} />
              </div>
              <h2 style={{
                fontSize: "2rem",
                fontWeight: "bold",
                margin: "0 0 0.5rem 0"
              }}>
                Drop your files here
              </h2>
              <p style={{
                fontSize: "1.1rem",
                color: theme.textSecondary,
                margin: "0"
              }}>
                Upload documents to start chatting (Max 1 files, 1MB )
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: `1px solid ${theme.cardBorder}`,
          position: "sticky",
          top: 0,
          backgroundColor: theme.cardBg,
          zIndex: 100,
          transition: "all 0.3s ease"
        }}>
          
          {/* Logo */}
          <div style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: theme.text,
            transition: "color 0.3s ease"
          }}>
            Kempt.
          </div>

          {/* Header Controls */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                backgroundColor: isDark ? "#f5f5f5" : "#1a1a1a",
                border: `2px solid ${theme.text}`,
                borderRadius: "50px",
                padding: "0.8rem 1.2rem",
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
              {isDark ? "Light" : "Dark"}
            </button>

            {/* User Menu */}
            <button style={{
              backgroundColor: theme.cardBg,
              border: `2px solid ${theme.cardBorder}`,
              borderRadius: "50px",
              padding: "0.8rem 1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              color: theme.text,
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
            onClick={() => {
              Navigate('/profileCard')
            }}
            >
              <User size={16} />
              Account
            </button>

            {/* Logout Button */}
            <button 
              onClick={() => {
                const logout = async () => {
                  try {
                    await axios.post('http://localhost:3001/auth/isValid/logout/');
                    setIsLogin(false);
                    setUserDetail(null);
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }
                logout();
              }}
              style={{
                backgroundColor: theme.cardBg,
                border: `2px solid ${theme.cardBorder}`,
                borderRadius: "50px",
                padding: "0.8rem 1.2rem",
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
                e.target.style.backgroundColor = "#ef4444";
                e.target.style.borderColor = "#ef4444";
                e.target.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.cardBg;
                e.target.style.borderColor = theme.cardBorder;
                e.target.style.color = theme.text;
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          minHeight: "calc(100vh - 200px)",
          position: "relative",
          zIndex: 10
        }}>

          {/* Welcome Message */}
          <div style={{
            textAlign: "center",
            marginBottom: "3rem",
            maxWidth: "600px"
          }}>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: theme.text,
              margin: "0 0 1rem 0",
              transition: "color 0.3s ease"
            }}>
              {text}
            </h1>
            <p style={{
              fontSize: "1rem",
              color: theme.textSecondary,
              margin: "0",
              transition: "color 0.3s ease"
            }}>
              <span> Upload a document or ask me anything to get started, maximum at a time you can upload 1 documents,  1 Token == 1 File </span> 
            </p>
          </div>

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div style={{
              width: "100%",
              maxWidth: "700px",
              marginBottom: "1.5rem"
            }}>
              <div style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "12px",
                padding: "1rem",
                boxShadow: isDark 
                  ? "0 4px 20px rgba(0,0,0,0.3)" 
                  : "0 4px 20px rgba(0,0,0,0.1)"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem"
                }}>
                  <h3 style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: theme.text,
                    margin: 0
                  }}>
                    Uploaded Files ({uploadedFiles.length}/1)
                  </h3>
                  <button
                    onClick={() => setUploadedFiles([])}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: theme.textSecondary,
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.error + "20";
                      e.target.style.color = theme.error;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = theme.textSecondary;
                    }}
                  >
                    Clear All
                  </button>
                </div>
                
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem"
                }}>
                  {uploadedFiles.map((fileData) => (
                    <div key={fileData.id} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      backgroundColor: theme.inputBg,
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: "8px",
                      transition: "all 0.3s ease"
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        flex: 1,
                        minWidth: 0
                      }}>
                        <div style={{
                          color: theme.success,
                          flexShrink: 0
                        }}>
                          {getFileIcon(fileData.name)}
                        </div>
                        <div style={{
                          flex: 1,
                          minWidth: 0
                        }}>
                          <div style={{
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            color: theme.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {fileData.name}
                          </div>
                          <div style={{
                            fontSize: "0.75rem",
                            color: theme.textSecondary
                          }}>
                            {formatFileSize(fileData.size)}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFile(fileData.id)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: theme.textSecondary,
                          cursor: "pointer",
                          padding: "0.25rem",
                          borderRadius: "4px",
                          transition: "all 0.3s ease",
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = theme.error + "20";
                          e.target.style.color = theme.error;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = theme.textSecondary;
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div style={{
            width: "100%",
            maxWidth: "700px",
            position: "relative"
          }}>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              multiple
              accept=".pdf"
              style={{ display: "none" }}
            />
            
            {/* Chat Input */}
            <form onSubmit={ handleSubmit } method="post" encType='multipart/form-data'>
              <div style={{
                backgroundColor: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                borderRadius: "25px",
                padding: "1rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                boxShadow: isDark 
                  ? "0 4px 20px rgba(0,0,0,0.3)" 
                  : "0 4px 20px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease"
              }}>
                
                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={uploadedFiles.length >= 3}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    padding: "0.5rem",
                    borderRadius: "8px",
                    cursor: uploadedFiles.length >= 3 ? "not-allowed" : "pointer",
                    color: uploadedFiles.length >= 3 ? theme.textTertiary : theme.textSecondary,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: uploadedFiles.length >= 3 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (uploadedFiles.length < 3) {
                      e.target.style.backgroundColor = theme.cardBg;
                      e.target.style.color = theme.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (uploadedFiles.length < 3) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = theme.textSecondary;
                    }
                  }}
                >
                  <Plus size={20} />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  placeholder="Ask anything"
                  value={prompt||""}
                  onChange={(e) => setPrompt(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: "1rem",
                    color: theme.text,
                    fontFamily: "inherit"
                  }}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  style={{
                    backgroundColor: theme.text,
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    color: theme.bg,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Actions */}
          <div style={{
            marginTop: "2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.8rem",
            justifyContent: "center"
          }}>
            {[
              { 
                id: 'summarize', 
                text: 'Summarize document', 
                description: 'Get a concise summary of your document highlighting the main points and key takeaways'
              },
              { 
                id: 'qa', 
                text: 'Q & A', 
                description: 'Ask specific questions about your document and get detailed answers based on the content'
              },
              { 
                id: 'fix', 
                text: 'Fix PDF text', 
                description: 'Convert scanned PDFs or images with text into searchable and editable documents'
              }
            ].map((action) => (
              <div key={action.id} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setSelectedAction(action.id)}
                  style={{
                    backgroundColor: selectedAction === action.id ? theme.yellow : theme.cardBg,
                    border: `2px solid ${selectedAction === action.id ? theme.yellow : theme.cardBorder}`,
                    borderRadius: "25px",
                    padding: "0.8rem 1.5rem",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color: selectedAction === action.id ? (isDark ? "#1a1a1a" : "#333") : theme.text,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: selectedAction === action.id ? 
                      "0 4px 15px rgba(244, 196, 48, 0.3)" : 
                      (isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)")
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAction !== action.id) {
                      e.target.style.backgroundColor = theme.yellow + "20";
                      e.target.style.borderColor = theme.yellow;
                    }
                    const tooltip = e.target.nextSibling;
                    if (tooltip) {
                      tooltip.style.opacity = "1";
                      tooltip.style.visibility = "visible";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAction !== action.id) {
                      e.target.style.backgroundColor = theme.cardBg;
                      e.target.style.borderColor = theme.cardBorder;
                    }
                    const tooltip = e.target.nextSibling;
                    if (tooltip) {
                      tooltip.style.opacity = "0";
                      tooltip.style.visibility = "hidden";
                    }
                  }}
                >
                  {action.text}
                </button>
                
                {/* Tooltip */}
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '0.5rem',
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '8px',
                  padding: '0.8rem 1rem',
                  fontSize: '0.8rem',
                  color: theme.textSecondary,
                  width: '250px',
                  textAlign: 'center',
                  boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.1)",
                  opacity: 0,
                  visibility: 'hidden',
                  transition: 'opacity 0.3s ease, visibility 0.3s ease',
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}>
                  {action.description}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `6px solid ${theme.cardBorder}`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Transition>
  );
}

export default function WrapperUserPage() {
  useLogin();
  const Navigate = useNavigate();
  const { isLogin, userDetail, error, loading } = useContext(auth);
  const{isDark,setIsDark}=useContext(bgcolor);
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

  if (!isLogin) {
    Navigate("/auth");
  }
   if (error) {
    Navigate("/auth");
  }


  return <UserPage/> ;
}