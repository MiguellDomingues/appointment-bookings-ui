import {useEffect,createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {DOMAIN,ENDPOINT_URL_AUTH,ENDPOINT_URL_REGISTER} from './constants'

const AuthContext = createContext(null);

const AuthUserTypes = Object.freeze({
  User: "USER",
  StoreOwner: "STOREOWNER"
});


function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const AuthProvider = ({children}) => {

    const [token, setToken] = useState(null);
    //const [loadingUser, setLoadingUser] = useState(false);
    const navigate = useNavigate();
  console.log("authprovider rerender ", token)
    /*
    useEffect( () => {

      const dataFetch = async () => {    

        setTimeout(async ()=>{
        
          if(credentials){
            internalLogOn(credentials)
          }else{
            onLogInSuccess(null)
          }
        }, randomIntFromInterval(1000, 5000))  
        
      };

      dataFetch();
    }, []);
*/
    
    useEffect( () => {

      console.log("AUTO NAVIGATING: ", token)
      if(!token){
        navigate("/", { replace: true} )
      }else if(token.type === AuthUserTypes.User){
        navigate(`/${AuthUserTypes.User}`, { replace: true})
      }else if(token.type === AuthUserTypes.StoreOwner){
        navigate(`/${AuthUserTypes.StoreOwner}`, { replace: true})
      }

    }, [token]);

  


/* 
       async function internalLogOn(credentials){

          setLoadingUser(true)
          const auth_path = `${DOMAIN}${ENDPOINT_URL_AUTH}`

          setTimeout(async ()=>{
            await startSession(credentials,auth_path)
            .then((t)=>{
              t.username = credentials.username
              setToken(t); 
              onLogInSuccess(t);
            }, 
            (err)=>{
              onLogInError(err)
            })
            .finally(()=>{
              setLoadingUser(false)
              onLogInFinally();
              
            })
          }, randomIntFromInterval(3000, 7000))  
       
       }



      //////////////TEMP FETCHING CONFIGS HERE ///////////////////////////////END

    PUBLIC FUNCTIONS
    const handleLogin = async (request, callback) => { 
      const auth_path = `${DOMAIN}${ENDPOINT_URL_AUTH}`  
      await startSession(request,auth_path).then(setToken, callback)
    };
  
    const handleLogout = () => {
      
      setToken(null);
    };
  
    const handleRegistration  = async (request, callback) => {
     // console.log("handle regis: ", request)
      const register_path = `${DOMAIN}${ENDPOINT_URL_REGISTER}`
      await registerUser(request,register_path).then(setToken, callback)
    };
     */

    const value = {
      token,
      //config,
     // loadingUser: loadingUser,
     // loadingConfigs: loadingConfigs,
      setToken: (newToken)=>setToken(newToken),
      unsetToken:()=>setToken(null),
      //onLogin: handleLogin,
      //onLogout: handleLogout,
     // onRegistration: handleRegistration,
      isAuth: ()=> !!(token),
      isUser: ()=> token?.type === AuthUserTypes.User,
      isStoreOwner: ()=> token?.type === AuthUserTypes.StoreOwner,
      isGuest: ()=> !(!!token),
      getUserType: ()=> token?.type,
    };
  
   //console.log("auth provider:", value)
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  };

export const useAuth = () => {
  return useContext(AuthContext);
};











/***************************USER LOGGING ON ENDPOINT***********************/
//const ENDPOINT_URL_AUTHENTICATE = 'http://localhost:8080/auth'

const START_SESSION_FAILURE = {
    reason: "bad crddddeds"
  }
  
  export const startSession = (request,path) => {
   // console.log("---logging on---", request, path)
  
    return new Promise( (resolve, reject) => {
  
      const request_body = {
        user_name: request.username,
        password: request.password
      }
  
      fetch(path, {
        method: 'POST',
        body: JSON.stringify(request_body),
        // need to set header to 'application/json' to send POST methods
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(((res) => res.json()))
      .then((data) => {
  
       // console.log("RESPONSE FROM SERVER IN AUTHENTICATE: ", data);
  
        if(data.key && data.type && data.path){
          data.success = true
          return resolve(data)
        }
  
        return reject(START_SESSION_FAILURE)
      })
      .catch((error) => {
        //console.log('Error logging on.', error);
        return reject(START_SESSION_FAILURE)
      });
  
    })
  ;}
  
  /************************************************************************************************/
  
  /***************************REGISTER NEW USER ACCOUNT ENDPOINT***********************/
  
  //const ENDPOINT_URL_CREATEUSER = 'http://localhost:8080/register'
  
  const REGISTER_USER_FAILURE = {
    reason: "username taken"
  }
  
  const registerUser = (request,path) => {
  
   // console.log("---creating new user---", request)
  
    return new Promise( (resolve, reject) => {
  
      const request_body = {
        type: request.type,
        user_name: request.username,
        password: request.password
      }
  
      fetch(path, {
        method: 'POST',
        body: JSON.stringify(request_body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(((res) => res.json()))
      .then((data) => {
  
        console.log("RESPONSE FROM SERVER IN createuser: ", data);
  
        if(data.key && data.type && data.path){
          data.success = true
          return resolve(data)
        }
  
        return reject( REGISTER_USER_FAILURE )
      })
      .catch((error) => {
       // console.log('Error creating user.', error);
        return reject(REGISTER_USER_FAILURE)
      });
  });}
  
  
  ///////////////////////////////////////////////////////////////////////////////////////////////
  const endSession = (success, request) => {
      const myPromise = new Promise( (resolve, reject) => {
        setTimeout(() => {
          if(success){
            return resolve({}) 
          }else{
            return reject({})  
          }
        }, 1000);
      });
      return myPromise;
    }
  
  /************************************************************************************************/


  /***************************FETCH CONFIGS**********************

const ENDPOINT_URL_CONFIGS = 'http://localhost:8080/configs'

const GET_CONFIGS_FAILURE = 
{
  success: false, 
  reason: "fetching config failed"
}

const _fetchClientConfigs = (key) => {

  return new Promise( (resolve, reject) => {

    fetch(ENDPOINT_URL_CONFIGS)
    .then((res) => res.json())
    .then((data) => {
      data.success = true
     // console.log("fetch config: ", data)
      return resolve(data);
    })
    .catch((error) => {
     // console.log('Error fetching configs', error)
      return reject(GET_CONFIGS_FAILURE);
      //
    });
  });
}

*/



