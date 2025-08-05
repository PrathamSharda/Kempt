import { auth } from "../contexts/context"
import { useContext, useEffect } from "react"
import axios from "axios"


export default function useLogin()
{
    const {isLogin,setIsLogin,userDetail,setUserDetail,error,setError,loading,setLoading}=useContext(auth);
    
    useEffect(() => {
    const checkLogin = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://kempt-1017350567380.europe-west1.run.app/auth/isValid/");

        if (response.data && response.status === 200) {
          setIsLogin(true);
          setUserDetail({
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            token: (parseInt(response.data.token)),
            email: response.data.email,
            tokenResetTime: response.data.tokenResetTime,
            premiumUser:response.data.premiumUser
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