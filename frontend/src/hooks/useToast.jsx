import {useState} from "react"

export default function useErrorToast() {
  const [errorforToast, seterrorforToast] = useState(null);

  const hideError = () => {
    seterrorforToast(null);
  };

  return { errorforToast, seterrorforToast, hideError };
}
