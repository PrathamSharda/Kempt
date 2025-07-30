import { auth } from "../contexts/context"
import { useContext, useEffect } from "react"
import axios from "axios"


export default function useLogout()
{
    const {isLogin,setIsLogin,userDetail,setUserDetail,error,setError,loading,setLoading}=useContext(auth);
    
    useEffect(() => {
        console.log("called")
    const checkLogin = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/auth/isValid/");
        console.log(response);
        if (response.data && response.status === 200) {
          setIsLogin(true);
          setUserDetail({
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            token: response.data.token,
            email: response.data.email
          });
          setError(null);
        } else {
          setIsLogin(false);
          setError("Authentication failed");
        }
      } catch (err) {
        setIsLogin(false);
        setError(err.response?.data?.message || err.message || "Login check failed");
      } finally {
        setLoading(false);
      }
    };
    
    checkLogin();
  }, []);
}