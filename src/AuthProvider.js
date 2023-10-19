
import {useEffect,createContext } from "react";

import React from 'react'

//import { auth } from '../utils/API/auth'
//import { configs } from '../utils/API/configs'

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [token, setToken] = React.useState(null);

    const [config, setConfig] = React.useState(null);

    //const { startSession, registerUser, endSession } = auth
    //const { fetchClientConfigs } = configs

    const [loading, setLoading] = React.useState(false);

///////////////TEMP FETCHING CONFIGS HERE ///////////////////////////////

    /* prevent the double useEffect call/double fetch() on first render */
   // const dataFetchedRef = useRef(false);

    const success = (configs) => {

      console.log("CONFIG OBJECT: ", configs)
      setConfig(configs); 
    }

    const failure = (r) => {
     // console.log("error FETCH CONFIG", r.reason) 
      setConfig(r);    
    }

    const finish = (r) => {
     // console.log("FINISH CONFIG")
      setLoading(false)
    }

    useEffect( () => {
       // console.log("USEFFECT")

     

        /* this is the pattern utilized for all async calls in functional components 
        prevents useEffect() from firing twice on init */
         // if(dataFetchedRef.current) return
 
          const dataFetch = async () => {    
            setLoading(true) 
            await fetchClientConfigs(null).then(success, failure).finally(finish)  
          };
  
         // dataFetchedRef.current = true;
          dataFetch();
      }, []);

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
      loadingConfigs: loading,
      onLogin: handleLogin,
      onLogout: handleLogout,
      onRegistration: handleRegistration
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
  
  const startSession = (request,path) => {
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

const fetchClientConfigs = (key) => {

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



const GET_GUEST_POSTS_FAILURE = 
{
  success: false, 
  reason: "session expired GUEST. please refresh your browser"
}

export const fetchGuestLocations = (key,path) => {
  console.log("fetchGuest: ", key, path)
  return new Promise( (resolve, reject) => {    

    fetch(path)
    .then((res) => { 
      return res.json()})
    .then((data) => {
      data.success = true
     // console.log("fetch guest posts: ", data)
      return resolve(data);
    })
    .catch((error) => {
     // console.log('Error fetching guest posts', error)
      return reject(GET_GUEST_POSTS_FAILURE);
      //
    });

  });

}


const GET_USER_POSTS_FAILURE = 
{
  success: false, 
  reason: "session expired USER. please refresh your browser"
}

export const fetchUserLocations = (key,path) => {

  return new Promise( (resolve, reject) => {

    fetch(path + '?key=' + key)
    .then((res) => res.json())
    .then((data) => {
      data.success = true
      console.log("fetch user posts: ", data)
      return resolve(data);
    })
    .catch((error) => {
      console.log('Error fetching user posts', error)
      return reject(GET_USER_POSTS_FAILURE);
      //
    });
  });
}

const GET_STOREOWNER_POSTS_FAILURE = 
{
  success: false, 
  reason: "session expired STOREOWNER. please refresh your browser"
}

export const fetchLocationsStoreOwner = (key,path) => {

  return new Promise( (resolve, reject) => {

    fetch(path + '?key=' + key)
    .then((res) => res.json())
    .then((data) => {
      data.success = true
      console.log("fetch storeowner posts: ", data)
      return resolve(data);
    })
    .catch((error) => {
      console.log('Error fetching storeowner posts', error)
      return reject(GET_STOREOWNER_POSTS_FAILURE);
    });
  });
}





const POST_USER_APPOINTMENT_FAILURE = {
  success:false,
  reason: "failed to post user appointment"
}

export const postUserAppointment = (appointment, key,path) => {

  console.log("post user appointment mock:")
  console.log("appointment: ", appointment)
  console.log("key: ", key)

  return new Promise( (resolve, reject) => { 

    const request_body = {
      loc_id:     appointment.loc_id,
      user_id:    key,
      date:       appointment.date,
      start_time: appointment.start_time,
      end_time:   appointment.end_time
    }

    fetch(path + '?key=' + key, {
      method: 'POST',
      body: JSON.stringify(request_body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(((res) => res.json()))
    .then((data) => {

      console.log("post user appointment SERVER RESPONSE:", data)
      
      if(data){
        data.success = true
        return resolve(data)
      }

      return reject(POST_USER_APPOINTMENT_FAILURE)
    })
    .catch((error) => {
      console.log('Error Posting User Appointment.', error);
      return reject(POST_USER_APPOINTMENT_FAILURE)
    });

});}


const DELETE_USER_APPOINTMENT_FAILURE = {
  success:false,
  reason: "failed to deletet user appointment"
}

export const deleteUserAppointment = (appointment_id, key,path) => {

  console.log("delete user appointment mock:")
  console.log("appointment id: ", appointment_id)
  console.log("key: ", key)
  console.log("path: ", path)

  return new Promise( (resolve, reject) => { 

    const request_body = {
      apt_id:     appointment_id,
      user_id:    key,
    }
    
    console.log("deleteUserApt: ", request_body)

      fetch(path + '?key=' + key, {
      method: 'DELETE',
      body: JSON.stringify(request_body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(((res) => res.json()))
    .then((data) => {
      
      console.log("delete user appointment SERVER RESPONSE:", data)
      
      if(data){
        data.success = true
        return resolve(data)
      }

      return reject(DELETE_USER_APPOINTMENT_FAILURE)
    })
    .catch((error) => {
      console.log('Error Posting User Appointment.', error);
      return reject(DELETE_USER_APPOINTMENT_FAILURE)
    });

});}




/*

 createLocation:  async function(payload, onSuccess , onFail, onFinish){
      await locations.putStoreOwnerLocation(payload, token.key,locations_path).then(onSuccess, onFail).finally(onFinish)  
    },

   
    deleteLocation: async function(payload, onSuccess , onFail, onFinish){
      await locations.deleteLocation(payload, token.key,locations_path).then(onSuccess, onFail).finally(onFinish)  
    },

    editStoreOwnerLocation: async function(payload, onSuccess , onFail, onFinish){
      await locations.editStoreOwnerLocation(payload, token.key,locations_path).then(onSuccess, onFail).finally(onFinish)  
    },

    updateAppointmentStatus: async function(payload, onSuccess , onFail, onFinish){
      await appointments.updateAppointmentStatus(payload, token.key,appointments_path).then(onSuccess, onFail).finally(onFinish)  
    },

*/

const PATCH_STOREOWNER_APPOINTMENT_FAILURE = {
  success:false,
  reason: "failed to edit storeowner location"
}

export const updateAppointmentStatus = (payload, key,path) => {

  console.log("edit storeowner appointment:")
  console.log("apt_id: ",     payload.apt_id)
  console.log("new_status: ", payload.new_status)
  console.log("storeowner key: ", key)

  return new Promise( (resolve, reject) => { 

    const request_body = {
      storeowner_id:    key, 
      ...payload
    }

    console.log("updateAppointmentStatus SERVER REQUEST BODY:", request_body)

    fetch(path+ '?key=' + key, {
      method: 'PATCH',
      body: JSON.stringify(request_body),
      headers: { 'Content-Type': 'application/json'}
    })
    .then(((res) => res.json()))
    .then((data) => {

      console.log("updateAppointmentStatus SERVER RESPONSE:", data)
      
      if(data){
        data.success = true
        return resolve(data.appointment)
      }

      return reject(PATCH_STOREOWNER_APPOINTMENT_FAILURE)
    })
    .catch((error) => {
      console.log('Error posting storeowner location.', error);
      return reject(PATCH_STOREOWNER_APPOINTMENT_FAILURE)
    });

});}


const PATCH_STOREOWNER_LOCATION_FAILURE = {
  success:false,
  reason: "failed to edit storeowner location"
}

export const editStoreOwnerLocation = (location, key,path) => {

  console.log("edit storeowner location:")
  console.log("location: ", location)
  console.log("storeowner key: ", key)

  return new Promise( (resolve, reject) => { 

    //return random double between min and max inclusive/exclusive
    function getRandom(min, max) {
      return Math.random() * (max - min) + min;
    }

    const lat = location.LatLng.lat + getRandom(-2.5, 2.5)
    const lng = location.LatLng.lng + getRandom(-0.5, 0.5)


    const request_body = {
      storeowner_id:    key, 
      location:{
        ...location,
        LatLng: {
          lat: lat, //because i have no way yet of turning an address into a lat/lng, add a small randomized offset to the input lat/lng
          lng: lng
        },
      }
    }

    console.log("edit storeowner location SERVER REQUEST BODY:", request_body)

    fetch(path + '?key=' + key, {
      method: 'PATCH',
      body: JSON.stringify(request_body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(((res) => res.json()))
    .then((data) => {

      console.log("patch storeowner location SERVER RESPONSE:", data)
      
      if(data){
        data.success = true
        return resolve(data.location)
      }

      return reject(PATCH_STOREOWNER_LOCATION_FAILURE)
    })
    .catch((error) => {
      console.log('Error posting storeowner location.', error);
      return reject(PATCH_STOREOWNER_LOCATION_FAILURE)
    });

});}

const POST_STOREOWNER_LOCATION_FAILURE = {
  success:false,
  reason: "failed to post storeowner location"
}

export const putStoreOwnerLocation = (location, key, path) => {

  console.log("post storeowner location:")
  console.log("location: ", location)
  console.log("key: ", key)

  return new Promise( (resolve, reject) => { 

    //return random double between min and max inclusive/exclusive
    function getRandom(min, max) {
      return Math.random() * (max - min) + min;
    }

    const request_body = {
      storeowner_id:    key, 
      LatLng: {
        lat: 47.91961776025469 + getRandom(-2.5, 2.5), 
        lng: -0.7844604492 + getRandom(-0.5, 0.5)
      },
      appointments: [],
      ...location
    }

    fetch(path+ '?key=' + key, {
      method: 'POST',
      body: JSON.stringify(request_body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(((res) => res.json()))
    .then((data) => {

      console.log("post storeowner location SERVER RESPONSE:", data)
      
      if(data){
        data.success = true
        return resolve(data)
      }

      return reject(POST_STOREOWNER_LOCATION_FAILURE)
    })
    .catch((error) => {
      console.log('Error posting storeowner location.', error);
      return reject(POST_STOREOWNER_LOCATION_FAILURE)
    });

});}

const DELETE_STOREOWNER_LOCATION_FAILURE = {
  success:false,
  reason: "failed to deletet storeowner location"
}

export const deleteLocation = (loc_id, key,path) => {

  console.log("delete storeowner location:")
  console.log("location id: ", loc_id)
  console.log("key: ", key)

  return new Promise( (resolve, reject) => { 

    const request_body = {
      loc_id:     loc_id,
      storeowner_id:    key,
    }
    
    console.log("deleteLocation: ", request_body)

      fetch(path + '?key=' + key, {
      method: 'DELETE',
      body: JSON.stringify(request_body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(((res) => res.json()))
    .then((data) => {
      
      console.log("delete storeowner location SERVER RESPONSE:", data)
      
      if(data){
        data.success = true
        return resolve(data)
      }

      return reject(DELETE_STOREOWNER_LOCATION_FAILURE)
    })
    .catch((error) => {
      console.log('Error Delete Storeowner Location.', error);
      return reject(DELETE_STOREOWNER_LOCATION_FAILURE)
    });

});}




