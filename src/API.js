import {
    DOMAIN, 
    ENDPOINT_URL_APPOINTMENT,
    ENDPOINT_URL_LOCATION,
    MAPS_API_KEY,
    MAPS_ENDPOINT,
    ENDPOINT_WORKING_PLANS,    
    ENDPOINT_BREAKS ,          
    ENDPOINT_SERVICE_DURATIONS,
    ENDPOINT_URL_AUTH,
    ENDPOINT_URL_REGISTER
  } from './constants'

  const locations_path = `${DOMAIN}${ENDPOINT_URL_LOCATION}`
  const appointments_path = `${DOMAIN}${ENDPOINT_URL_APPOINTMENT}`
  const availability_workingplan_path = `${DOMAIN}${ENDPOINT_WORKING_PLANS}`
  const availability_breaks_path = `${DOMAIN}${ENDPOINT_BREAKS}`
  const availability_servicedurations_path = `${DOMAIN}${ENDPOINT_SERVICE_DURATIONS}`
  const auth_path = `${DOMAIN}${ENDPOINT_URL_AUTH}`

async function fetchWrapper(url, options){
    return new Promise( (resolve, reject) => { 
      fetch(url, options)
        .then(res=>res.json())
          .then(data => resolve({success: true, ...data }))
            .catch(error=>reject({success: false, reason: error}));
  });}

export const API = {
    fetchGuestLocations: async () => fetchWrapper(locations_path, null),

    fetchAuthLocations : async (key) => fetchWrapper(`${locations_path}`, {headers: {key: key}}),

    editLocation : async (location,key) => {
        //console.log("el: ", location)
        return fetchWrapper(`${locations_path}`,  {
            method: 'PATCH',
            body: JSON.stringify({
                storeowner_id:    key, 
                location:{
                ...location,
                LatLng: {
                    lat: location.LatLng.lat , 
                    lng: location.LatLng.lng 
                },
                }
            }),
            headers: {
            'Content-Type': 'application/json',
            key: key
        }})},

    editAppointmentStatus : async (apt_id, new_status,key) => 
        fetchWrapper(`${appointments_path}`,  {
            method: 'PATCH',
            body: JSON.stringify({
                storeowner_id:    key, 
                apt_id:           apt_id,
                new_status:      new_status
            }),
            headers: {
            'Content-Type': 'application/json',
             key: key
        }}),

    postAppointment : async (appointment,key) => 
        fetchWrapper(`${appointments_path}`,  {
            method: 'POST',
            body: JSON.stringify({
                loc_id:     appointment.loc_id,
                user_id:    key,
                date:       appointment.date,
                start_time: appointment.start_time,
                end_time:   appointment.end_time,
                apt_types:  appointment.apt_types
            }),
            headers: {
            'Content-Type': 'application/json',
            key: key
        }}),

    deleteAppointment : async (appointment_id,key) => 
        fetchWrapper(`${appointments_path}`,  {
            method: 'DELETE',
            body: JSON.stringify({
                apt_id:     appointment_id,
                user_id:    key,
            }),
            headers: {
            'Content-Type': 'application/json',
            key: key
        }}),

    fetchMapInfo : async (streetNumber,city,province,country,postalCode) => 
        fetchWrapper(`${MAPS_ENDPOINT}?key=${MAPS_API_KEY}&address=${streetNumber}%20${city}%20${province}%20${country}%20${postalCode}`, {}),


    updateWorkingPlan: async (wp_id, start, end, key) => 
      fetchWrapper(`${availability_workingplan_path}`,  {
        method: 'PATCH',
        body: JSON.stringify({wp_id, start, end}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),

    postBreak: async (days, start, end, key) => 
      fetchWrapper(`${availability_breaks_path}`,  {
        method: 'POST',
        body: JSON.stringify({days, start, end}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),

    deleteBreak: async (break_id, key) => 
      fetchWrapper(`${availability_breaks_path}`,  {
        method: 'DELETE',
        body: JSON.stringify({break_id}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),

    updateServiceDuration: async (sd_id, new_duration, key) => 
      fetchWrapper(`${availability_servicedurations_path}`,  {
        method: 'PATCH',
        body: JSON.stringify({sd_id, new_duration}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),
    /*

    const addNewBreak = (req, res)=>{
    console.log("/////////addNewBreak",req.body)
    res.send( JSON.stringify({...req.body}) );
}

const deleteBreak = (req, res)=>{
    console.log("/////////deleteBreak",req.body)
    res.send( JSON.stringify({...req.body}) );
}

const updateServiceDuration = (req, res)=>{
    console.log("/////////updateServiceDuration",req.body)
    res.send( JSON.stringify({...req.body}) );
}






    fetchWorkingPlans : async (key)=> fetchWrapper(availability_workingplan_path, {
      method: 'GET',
      headers: {'Content-Type': 'application/json',key: key}
    }),

    fetchBreaks : async (key)=> fetchWrapper(availability_breaks_path, {
      method: 'GET',
      headers: {'Content-Type': 'application/json',key: key}
    }),

    fetchServiceDurations : async (key)=> fetchWrapper(availability_servicedurations_path, {
      method: 'GET',
      headers: {'Content-Type': 'application/json',key: key}
    }),
    */
    
    
    
    startSession : async (user_name, password)=>
       fetchWrapper(auth_path, {
        method: 'POST',
        body: JSON.stringify({user_name: user_name, password: password}),
        headers: {
        'Content-Type': 'application/json',
      }}),

      endSession : async (key)=>
       fetchWrapper(auth_path, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',key: key}
      }),
  }

export default API

//${DOMAIN}${ENDPOINT_URL_AUTH}

/*
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
*/


















/*
unused callouts:

 const postLocation = async (location) => 
        fetchWrapper(`${locations_path}?key=${token?.key}`,  {
            method: 'POST',
            body: JSON.stringify( {
                storeowner_id: token?.key, 
                LatLng: {
                  lat: 47.91961776025469 + getRandom(-2.5, 2.5), 
                  lng: -0.7844604492 + getRandom(-0.5, 0.5)
                },
                appointments: [],
                ...location
              }),
            headers: {
              'Content-Type': 'application/json'
            }
    })

    const deleteLocation = async (loc_id) => 
        fetchWrapper(`${locations_path}?key=${token?.key}`,  {
            method: 'DELETE',
            body: JSON.stringify({
                loc_id:        loc_id,
                storeowner_id: token?.key,
              }),
            headers: {
              'Content-Type': 'application/json'
            }
    })
    ///////////////////////////////
*/
