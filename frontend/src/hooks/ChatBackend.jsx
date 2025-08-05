import{useEffect,useRef,useCallback,useContext} from 'react'
import axios from 'axios';
import {useNavigate} from "react-router-dom"
import useErrorToast from "./useToast"
import {Link}  from "react-router-dom"
import {isError,auth} from "../contexts/context"

export default function useChatBackend()
{
    const {setErrorWhileFetch} = useContext(isError);
    const {userDetail}=useContext(auth);
    const navigate=useNavigate();
    const chatBackendCaller=useCallback(async (url,formData,setMessage,setLoading)=>{
        try{
           // console.log("inside the function")
             if(userDetail.token>0)
            {
                userDetail.token=userDetail.token-1;
            }

            const response = await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                    
                }

            })
           
            if(response.status!=200)throw {error:"communication with backend couldnt be established"};
            
            setErrorWhileFetch(false);
            setMessage((prev) => {
                const currentMessages = Array.isArray(prev) ? prev : [];
                let newArray=[]
                if(typeof response.data.message=="object")
                {

                        newArray =response.data.message.map((url)=>{
                                return url;
                        })
                }else{

                    const finalValue=`RESPONSE:\n\nANSWER:-${response.data.message}`
                    newArray.push(finalValue);
                }
                    
                  
                return [...currentMessages, ...newArray]; 
            });
            navigate("/chat");
            setLoading(false);
             return {success:true}
            }
            catch(error)
            {
                setErrorWhileFetch(true);
                const finalValue=`RESPONSE:\n\nANSWER:-${error.message}`
             setMessage((prev)=>[...prev,finalValue])   ;
              setLoading(false);
               return {success:false}
                
                
            }
            
        })
        return {chatBackendCaller};
}

