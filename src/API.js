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


    updateWorkingPlan: async (wp_id, start, end, location_id, key) => 
      fetchWrapper(`${availability_workingplan_path}`,  {
        method: 'PATCH',
        body: JSON.stringify({wp_id, start, end, location_id}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),

    postBreak: async (days, start, end, location_id, key) => 
      fetchWrapper(`${availability_breaks_path}`,  {
        method: 'POST',
        body: JSON.stringify({days, start, end, location_id}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),

    deleteBreak: async (break_id, location_id, key) => 
      fetchWrapper(`${availability_breaks_path}`,  {
        method: 'DELETE',
        body: JSON.stringify({location_id, break_id}),
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
