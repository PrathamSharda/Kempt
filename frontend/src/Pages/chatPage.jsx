import {useState,useContext,useRef,useEffect} from 'react'
import { bgcolor,auth,userMessage ,actionToPerform,isError} from '../contexts/context';
import { useNavigate } from 'react-router-dom';
import useLogin from '../hooks/loginFunction';
import { Moon, Sun, User, Lock, Mail, ArrowLeft,ArrowUp,Plus, Eye, EyeOff, FileText, Upload, X } from 'lucide-react';
import Transition from '../transitions/transiton';
import useChatBackend from '../hooks/ChatBackend';
import ErrorToast from './Toast';
import useErrorToast from '../hooks/useToast';

function Chat()
{
  
     const { errorforToast, seterrorforToast, hideError } = useErrorToast();
    const { isDark, setIsDark } = useContext(bgcolor);
    const { isLogin,setIsLogin,setUserDetail, userDetail, error, loading ,setLoading} = useContext(auth);
    const Navigate=useNavigate();
    const {message,setMessage}=useContext(userMessage);
    const [dragActive, setDragActive] = useState(false);
    const {selectedAction, setSelectedAction} = useContext(actionToPerform)
    const [uploadedFiles, setUploadedFiles] = useState([]); 
    const fileInputRef = useRef(null);
    const [prompt,setPrompt]=useState("");
    const [isGeneratingResponse,setIsGeneratingResponse]=useState(false);
    const {chatBackendCaller}=useChatBackend();
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const{errorWhileFetch,setErrorWhileFetch}=useContext(isError);


   
useLogin();
  useEffect(()=>{

      if(errorWhileFetch &&(userDetail!=null&& userDetail.token!==0))
      {
        seterrorforToast(`error while connecting to Backend `)
      }else if (errorWhileFetch &&(userDetail!=null&& userDetail.token==0))
      {
        seterrorforToast(`no token left reset in ${userDetail.tokenResetTime}`)
      }
    },[errorWhileFetch])
 
     
       useEffect(()=>{
    if(!isLogin&&!loading) Navigate("/auth");
    },[isLogin,message,Navigate]);

     useEffect(()=>{
     
      if(userDetail==null)return;
    if(userDetail.token==0)
    {
      seterrorforToast(`no token left reset in ${userDetail.tokenResetTime}`)
    }
  },[userDetail,message,errorWhileFetch])

    useEffect(()=>{
      if(userDetail==null)return;
      if(userDetail.token==0)
      {
        setIsGeneratingResponse(true);
      }
    },[userDetail,message,errorWhileFetch])
    
    useEffect(() => {
      scrollToBottom();
    }, [message, isGeneratingResponse]);

    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    };

    const handleInputChange = (e) => {
      setPrompt(e.target.value);
      setTimeout(() => scrollToBottom(), 200); 
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
    if (isGeneratingResponse) {
      seterrorforToast(`Cannot upload right now backend is generating an answer`);
      return;
    }

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
        id: Date.now() + Math.random()
      });
    });
    if (errors.length > 0) {
      seterrorforToast(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

 
    async function handleSubmit1(e)
    {
        e.preventDefault();
        
        if(userDetail.token==0)return;
        if(isGeneratingResponse) {
          seterrorforToast("Please wait for the current response to complete");
          return;
        }

        if (uploadedFiles.length === 0 && (!prompt || prompt.trim() === "")) {
          seterrorforToast("Please upload at least one file or enter a prompt.");
          return;
        }

        if (prompt.trim() || uploadedFiles.length > 0) {
          try{
            setLoading(true);
            setIsGeneratingResponse(true);

          const formData = new FormData();
          
          uploadedFiles.forEach((fileData) => {
            formData.append("files", fileData.file);
          });

          const value = prompt?.trim() || "";
          formData.append("prompt", value);
            const fileNames = uploadedFiles.length > 0 ? uploadedFiles.map(file => file.name).join(', ') : '';
           const finalValue = `USER : \n\n TASK:-${selectedAction=='qa'?"Question and Answer":selectedAction=="fix"?"Fix pdf":"Summarize Pdf"}${uploadedFiles.length > 0 ? `\n\n FILES:${uploadedFiles.map(file => `-${file.name}`).join('\n')}` : ""}${value ? `\n\nPROMPT:-${value}` : ""}`;
            setMessage(prev => [...prev, finalValue]);
            setPrompt("");
            setUploadedFiles([]);
            setErrorWhileFetch(false);
            const response = await chatBackendCaller(
              `https://kempt-1017350567380.europe-west1.run.app/user/${selectedAction}`,
              formData,
              setMessage,
              setIsGeneratingResponse
            );

            const success = await response.success;
            if(success === false) {
              throw "error";
            }
            
          }catch(error)
          {
            setIsGeneratingResponse(false);
            return;
          } finally {
            setLoading(false);
          }
        }
    }
    
    const openFileDialog = () => {
      if (isGeneratingResponse) {
        seterrorforToast(`Cannot upload right now backend is generating an answer`);
        return;
      }
      fileInputRef.current?.click();
    };
    
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
    
const ActionButtons = ({ theme, selectedAction, setSelectedAction, isDark }) => (
  <div style={{
    marginBottom: "1rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.8rem",
    justifyContent: "center",
    width: "100%",
    maxWidth: "1250px"
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
          disabled={isGeneratingResponse}
          style={{
            backgroundColor: selectedAction === action.id ? theme.yellow : theme.cardBg,
            border: `2px solid ${selectedAction === action.id ? theme.yellow : theme.cardBorder}`,
            borderRadius: "25px",
            padding: "0.8rem 1.5rem",
            fontSize: "0.9rem",
            fontWeight: "500",
            color: selectedAction === action.id ? (isDark ? "#1a1a1a" : "#333") : theme.text,
            cursor: (isGeneratingResponse) ? "not-allowed" : "pointer",
            opacity: (isGeneratingResponse) ? 0.6 : 1,
            transition: "all 0.3s ease",
            boxShadow: selectedAction === action.id ? 
              "0 4px 15px rgba(244, 196, 48, 0.3)" : 
              (isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)")
          }}
          onMouseEnter={(e) => {
            if (selectedAction !== action.id && !isGeneratingResponse) {
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
            if (selectedAction !== action.id && !isGeneratingResponse) {
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
);
    return(
        <Transition>
           <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0.6);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `
      }} />
           {errorforToast && (
                  <ErrorToast 
                    message={errorforToast} 
                    onClose={hideError}
                />
            )}
        <div 
          style={{
            maxHeight:"100%",
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
         <div style={{
        position: "fixed",
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
        position: "fixed",
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
        position: "fixed",
        top: "50%",
        right: "-50px",
        width: "200px",
        height: "200px",
        backgroundColor: theme.circle3,
        borderRadius: "50%",
        opacity: 0.3,
        transition: "background-color 0.3s ease"
      }} />

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

      {dragActive && !isGeneratingResponse && (
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
              Upload documents to start chatting (Max 1 file, 1MB)
            </p>
          </div>
        </div>
      )}

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
      onClick={()=>{Navigate('/home')}}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
      }}>
        <ArrowLeft size={16} />
        Back to home
      </button>

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
      
      <div 
        ref={messagesContainerRef}
        style={{ 
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        marginTop:"5em",
        paddingTop: "0px",
        paddingBottom: "70px",
        overflowY: "auto",
        maxHeight: "calc(100vh - 180px)",
        position: "relative",
        zIndex: 1,
        scrollBehavior: "smooth"
        }}>
          {
            message.map((message,key)=><MessageComponent
            key={key}
              message={JSON.stringify(message)}
              id={key}
            />)
          }
          
          {(isGeneratingResponse&&userDetail.token!=0) && <LoadingMessageComponent />}
          
          <div ref={messagesEndRef} style={{ height: "1px" }} />
      </div>
      
        <div style={{
            width: "100%",
            maxWidth: "1300px",
            position: "fixed",
            bottom:"2%",
            left: "50%",
            zIndex:10,
            transform:"translateX(-50%)"
          }}>

            <ActionButtons 
            theme={theme} 
            selectedAction={selectedAction} 
            setSelectedAction={setSelectedAction} 
            isDark={isDark} 
          />

        
          {uploadedFiles.length > 0 && (
            <div style={{
              width: "100%",
              maxWidth: "700px",
              marginBottom: "1.5rem",
              margin: "0 auto 1.5rem auto"
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
                    disabled={isGeneratingResponse}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: isGeneratingResponse ? theme.textTertiary : theme.textSecondary,
                      cursor: isGeneratingResponse ? "not-allowed" : "pointer",
                      fontSize: "0.8rem",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      transition: "all 0.3s ease",
                      opacity: isGeneratingResponse ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isGeneratingResponse) {
                        e.target.style.backgroundColor = theme.error + "20";
                        e.target.style.color = theme.error;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isGeneratingResponse) {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = theme.textSecondary;
                      }
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
                        disabled={isGeneratingResponse}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: isGeneratingResponse ? theme.textTertiary : theme.textSecondary,
                          cursor: isGeneratingResponse ? "not-allowed" : "pointer",
                          padding: "0.25rem",
                          borderRadius: "4px",
                          transition: "all 0.3s ease",
                          flexShrink: 0,
                          opacity: isGeneratingResponse ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isGeneratingResponse) {
                            e.target.style.backgroundColor = theme.error + "20";
                            e.target.style.color = theme.error;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isGeneratingResponse) {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = theme.textSecondary;
                          }
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
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              multiple
              accept=".pdf"
              style={{ display: "none" }}
            />
            <form onSubmit={handleSubmit1} method="post" encType='multipart/form-data'>
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
                
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={uploadedFiles.length >= 1 || isGeneratingResponse}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    padding: "0.5rem",
                    borderRadius: "8px",
                    cursor: (uploadedFiles.length >= 1 || isGeneratingResponse) ? "not-allowed" : "pointer",
                    color: (uploadedFiles.length >= 1 || isGeneratingResponse) ? theme.textTertiary : theme.textSecondary,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: (uploadedFiles.length >= 1 || isGeneratingResponse) ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (uploadedFiles.length < 1 && !isGeneratingResponse) {
                      e.target.style.backgroundColor = theme.cardBg;
                      e.target.style.color = theme.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (uploadedFiles.length < 1 && !isGeneratingResponse) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = theme.textSecondary;
                    }
                  }}
                >
                  <Plus size={20} />
                </button>

                <input
                  type="text"
                  placeholder={isGeneratingResponse ? (userDetail!==null&&userDetail.token==0)?"no token left":"Generating response..." : "Ask anything"}
                  value={prompt}
                  onChange={handleInputChange}
                  disabled={isGeneratingResponse}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: "1rem",
                    color: isGeneratingResponse ? theme.textSecondary : theme.text,
                    fontFamily: "inherit",
                    cursor: isGeneratingResponse ? "not-allowed" : "text"
                  }}
                />

                <button
                  type="submit"
                  disabled={isGeneratingResponse || (!prompt.trim() && uploadedFiles.length === 0)}
                  style={{
                    backgroundColor: (!isGeneratingResponse && (prompt.trim() || uploadedFiles.length > 0)) ? theme.text : theme.textTertiary,
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    cursor: (!isGeneratingResponse && (prompt.trim() || uploadedFiles.length > 0)) ? "pointer" : "not-allowed",
                    color: theme.bg,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isGeneratingResponse ? 0.6 : 1
                  }}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </form>
          </div>
    </div>
    </Transition>
    )
}

function LoadingMessageComponent() {
  const { isDark } = useContext(bgcolor);
  
  const theme = {
    bg: isDark ? "#1a1a1a" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#333333",
    textSecondary: isDark ? "#cccccc" : "#666666",
    messageBgOdd: isDark ? "#333333" : "#e8e8e8",
    cardBorder: isDark ? "#333333" : "#e0e0e0"
  };

  return (
    <div style={{
      backgroundColor: theme.messageBgOdd,
      padding: "1rem 1.5rem",
      margin: "0.5rem 0",
      borderRadius: "12px",
      maxWidth: "80%",
      marginLeft: "auto",
      marginRight: "0",
      color: theme.text,
      fontSize: "1rem",
      lineHeight: "1.5",
      fontFamily: "system-ui, -apple-system, sans-serif",
      border: `1px solid ${theme.cardBorder}`,
      boxShadow: isDark 
        ? "0 2px 10px rgba(0,0,0,0.2)" 
        : "0 2px 10px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      zIndex: 10,
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }}>
      <div style={{
        display: "flex",
        gap: "4px",
        alignItems: "center"
      }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: theme.textSecondary,
            borderRadius: "50%",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0s"
          }}
        />
        <div
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: theme.textSecondary,
            borderRadius: "50%",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0.16s"
          }}
        />
        <div
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: theme.textSecondary,
            borderRadius: "50%",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0.32s"
          }}
        />
      </div>
      <span style={{
        color: theme.textSecondary,
        fontSize: "0.9rem",
        fontStyle: "italic"
      }}>
        Generating response...
      </span>
    </div>
  );
}

function MessageComponent({message,id})
{
  const { isDark } = useContext(bgcolor);
  
  const theme = {
    bg: isDark ? "#1a1a1a" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#333333",
    textSecondary: isDark ? "#cccccc" : "#666666",
    messageBgEven: isDark ? "#2a2a2a" : "#f0f0f0",
    messageBgOdd: isDark ? "#333333" : "#e8e8e8",
    cardBg: isDark ? "#252525" : "#ffffff",
    cardBorder: isDark ? "#333333" : "#e0e0e0"
  };
  const intermediateMessage = message?.replace(/^["']|["']$/g, "") || "";
  const cleanMessage= intermediateMessage
    .replace(/\\n/g, '\n')  
    .replace(/\n/g, '<br>') 
    .replace(/\r/g, '');    

  return (
    <div style={{
      backgroundColor: id % 2 === 0 ? theme.messageBgEven : theme.messageBgOdd,
      padding: "1rem 1.5rem",
      margin: "0.5rem 0",
      borderRadius: "12px",
      maxWidth: "80%",
      marginLeft: id % 2 === 0 ? "0" : "auto",
      marginRight: id % 2 === 0 ? "auto" : "0",
      color: theme.text,
      fontSize: "1rem",
      lineHeight: "1.5",
      fontFamily: "system-ui, -apple-system, sans-serif",
      border: `1px solid ${theme.cardBorder}`,
      boxShadow: isDark 
        ? "0 2px 10px rgba(0,0,0,0.2)" 
        : "0 2px 10px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      wordWrap: "break-word",
      zIndex: 10,
      position: "relative"
    }}>
      {cleanMessage!==undefined&&cleanMessage.includes("https://")?<a 
      href={cleanMessage}
      onClick={(e)=>{
        e.preventDefault();
      
       window.open(cleanMessage, '_blank'); 
      }} 
      target="_blank"
      >Download the extracted text file here</a>:(
        <div dangerouslySetInnerHTML={{ __html: cleanMessage }} />
      )}
    </div>
  );
}

export default function WrapperChatPage() {
  useLogin();
  const Navigate = useNavigate();
  const { isLogin, userDetail, error, loading } = useContext(auth);
  const{isDark,setIsDark}=useContext(bgcolor);
  
  if (!isLogin) {
    Navigate("/auth");
  }
   if (error) {
    Navigate("/auth");
  }


  return <Chat/> ;
}