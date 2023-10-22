
import {useEffect,createContext } from "react";

import React from 'react'




const AuthContext = createContext(null);

export const AuthProvider = ({ 
  children, 
  credentials = null, 
  onLogInSuccess=()=>{} ,
  onLogInError =()=>{} ,
  onLogInFinally =()=>{},
}) => {

    const [token, setToken] = React.useState(null);

    const [config, setConfig] = React.useState(null);

    //const { startSession, registerUser, endSession } = auth
    //const { fetchClientConfigs } = configs

   // const [loading, setLoading] = React.useState(false);

    const [loadingUser, setLoadingUser] = React.useState(false);

///////////////TEMP FETCHING CONFIGS HERE ///////////////////////////////

    /* prevent the double useEffect call/double fetch() on first render */
   // const dataFetchedRef = useRef(false);

  // console.log("TOKEN IN AUTH PROVIDER: ", token)

    const success = (configs) => {

     // console.log("CONFIG OBJECT: ", configs)
      setConfig(configs); 
      if(credentials){
        internalLogOn(credentials, configs)
      }else{
        onLogInSuccess(null)
      }
   
    }

    const failure = (r) => {
     // console.log("error FETCH CONFIG", r.reason) 
     // setConfig(r);    
    }

    const finish = (r) => {
     // console.log("FINISH CONFIG")
    //  setLoading(false)
    }

    /*
    const _fetchClientConfigs = () =>{
console.log("******************************")
      fetchClientConfigs({},(configs)=>{
        setConfig(configs); 
        if(credentials){
          internalLogOn(credentials, configs)
        }else{
          onLogInSuccess(null)
        }
      })

    }

    */
    useEffect( () => {
       // console.log("USEFFECT")

      // _fetchClientConfigs()

        /* this is the pattern utilized for all async calls in functional components 
        prevents useEffect() from firing twice on init */
         // if(dataFetchedRef.current) return
 
          const dataFetch = async () => {    
          // setLoading(true) 
           await _fetchClientConfigs(null).then(success, failure).finally(finish)  
         };
  
         // dataFetchedRef.current = true;
         dataFetch();
      }, []);

      /*
      useEffect( () => {
        console.log("configs ue")
        if(credentials && config){ 
          internalLogOn(credentials)
        }

          
       }, [config, credentials]);
       */


       async function internalLogOn(credentials, config){

        function randomIntFromInterval(min, max) { // min and max included 
          return Math.floor(Math.random() * (max - min + 1) + min)
        }

        setLoadingUser(true)
        const auth_path = `${config.DOMAIN}${config.ENDPOINT_URL_AUTH}`

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
        }, randomIntFromInterval(1000, 5000))  
       
       }



      //////////////TEMP FETCHING CONFIGS HERE ///////////////////////////////END

    /* PUBLIC FUNCTIONS */
    const handleLogin = async (request, callback) => { 
      const auth_path = `${config.DOMAIN}${config.ENDPOINT_URL_AUTH}`  
      await startSession(request,auth_path).then(setToken, callback)
    };
  
    const handleLogout = () => {
     // console.log("handle logout")
      //endSession()...
      setToken(null);
    };
  
    const handleRegistration  = async (request, callback) => {
     // console.log("handle regis: ", request)
      const register_path = `${config.DOMAIN}${config.ENDPOINT_URL_REGISTER}`
      await registerUser(request,register_path).then(setToken, callback)
    };

    const value = {
      token,
      config,
      loadingUser: loadingUser,
      onLogin: handleLogin,
      onLogout: handleLogout,
      onRegistration: handleRegistration,
      isUser: ()=> token && token?.type === "USER",
      isStoreOwner: ()=> token && token?.type === "STOREOWNER",
      isGuest: ()=> !!token
    };
  
   //console.log("auth provider:", value)
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  };

export const useAuth = () => {
  return React.useContext(AuthContext);
};

export const useConfig = () => {
  return React.useContext(AuthContext);
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


  /***************************FETCH CONFIGS***********************/

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



