import { useState} from 'react'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import {BrowserRouter as Router ,Routes,Route, useLocation,Navigate} from "react-router-dom"
import LandingPage from './Pages/LandingPage'
import UserPage from './Pages/userPage'
import ProfileCard from './Pages/ProfileCard'
import {bgcolor} from './contexts/context'
import Authentication from './Pages/authenticationPage'
import { auth } from './contexts/context'

function App() {
  const [isDark,setIsDark]=useState(true);
  const [isLogin,setIsLogin]=useState(false);
  const [userDetail,setUserDetail]=useState(null);
  const [error,setError]=useState(null);
  const [loading,setLoading]=useState(true);
  const value={isLogin,setIsLogin,userDetail,setUserDetail,error,setError,loading,setLoading};
  return (
    <div style={{height:"100vh",width:"100%"}}>

      <auth.Provider value={value}>
       <bgcolor.Provider value ={{
            isDark,setIsDark
          }}>

      <Router>
        <Approuter/>
      </Router>

       </bgcolor.Provider>
      </auth.Provider>
       
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
          <Route path="/profileCard" element={<ProfileCard/>}/>
          <Route path="*"/>
    </Routes>
  )
}
export default App
