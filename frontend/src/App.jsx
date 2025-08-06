import { useContext, useState} from 'react'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import {BrowserRouter as Router ,Routes,Route, useLocation,useNavigate} from "react-router-dom"
import LandingPage from './Pages/LandingPage'
import UserPage from './Pages/userPage'
import ProfileCard from './Pages/ProfileCard'
import {bgcolor,auth,userMessage,loader,actionToPerform,Response,isError} from './contexts/context'
import Authentication from './Pages/authenticationPage'
import Chat from './Pages/chatPage'
import NotFoundPage from "../src/Pages/NotFoundPage"
import WrapperBuyPremiumPage from "../src/Pages/premiumPage"
import AuthCallback from "../src/Pages/authCallback"

function App() {
  const [isDark,setIsDark]=useState(true);
  const [isLogin,setIsLogin]=useState(false);
  const [userDetail,setUserDetail]=useState(null);
  const [error,setError]=useState(null);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState([]);
  const value={isLogin,setIsLogin,userDetail,setUserDetail,error,setError,loading,setLoading};
  const [chatLoader,setChatLoader]=useState(false);
  const [selectedAction, setSelectedAction] = useState('summarize');
  const [success,setSuccess]=useState(true)
  const [errorWhileFetch,setErrorWhileFetch]=useState(false)
  
  return (
    <div style={{height:"100vh",width:"100%"}}>
      <isError.Provider value={{errorWhileFetch,setErrorWhileFetch}}>
      <Response.Provider value={{success,setSuccess}}>
      <actionToPerform.Provider value={{selectedAction, setSelectedAction}}>
      <loader.Provider value={{chatLoader,setChatLoader}}>
      <userMessage.Provider value={{message,setMessage}}>
      <auth.Provider value={value}>
       <bgcolor.Provider value ={{
            isDark,setIsDark
          }}>

      <Router>
        <Approuter/>
      </Router>

       </bgcolor.Provider>
      </auth.Provider>
       </userMessage.Provider>
       </loader.Provider>
       </actionToPerform.Provider>
       </Response.Provider>
       </isError.Provider>
    </div>
  )
  
  
}

function Approuter()
{
  const location=useLocation();
  
  return(
    <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/auth" element={<Authentication/>}/>
          <Route path="/home" element={<UserPage/>}/>
          <Route path="/chat" element={<Chat/>}/>
          <Route path="/auth/callback" element={<AuthCallback/>}/>
          <Route path="/profileCard" element={<ProfileCard/>}/>
          <Route path='/buyPremium' element={<WrapperBuyPremiumPage/>}/>
          <Route path="*"element={<NotFoundPage/>}/>
    </Routes>
  )
}
export default App
