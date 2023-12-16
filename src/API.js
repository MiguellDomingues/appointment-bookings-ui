import {MAPS_API_KEY, PATHS} from './constants'

async function fetchWrapper(url, options){
    return new Promise( (resolve, reject) => { 
      fetch(url, options)
        .then(res=>res.json())
          .then(data => resolve({success: true, ...data }))
            .catch(error=>reject({success: false, reason: error}));
  });}

export const API = {
    fetchGuestLocations: async () => fetchWrapper(PATHS.LOCATIONS, null),

    fetchAuthLocations : async (key) => fetchWrapper(PATHS.LOCATIONS, {headers: {key: key}}),

    editLocation : async (location,key) => {
        //console.log("el: ", location)
        return fetchWrapper(PATHS.LOCATIONS,  {
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
        fetchWrapper(PATHS.APPOINTMENTS,  {
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
        fetchWrapper(PATHS.APPOINTMENTS,  {
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
        fetchWrapper(PATHS.APPOINTMENTS,  {
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
        fetchWrapper(`${PATHS.MAPS}?key=${MAPS_API_KEY}&address=${streetNumber}%20${city}%20${province}%20${country}%20${postalCode}`, {}),


    updateWorkingPlan: async (wp_id, start, end, location_id, key) => 
      fetchWrapper(PATHS.WORKING_PLAN,  {
        method: 'PATCH',
        body: JSON.stringify({wp_id, start, end, location_id}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),

    postBreak: async (days, start, end, location_id, key) => 
      fetchWrapper(PATHS.BREAKS,  {
        method: 'POST',
        body: JSON.stringify({days, start, end, location_id}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),

    deleteBreak: async (break_id, location_id, key) => 
      fetchWrapper(PATHS.BREAKS,  {
        method: 'DELETE',
        body: JSON.stringify({location_id, break_id}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),

    updateServiceDuration: async (sd_id, new_duration, key) => 
      fetchWrapper(PATHS.SERVICE_DURATIONS,  {
        method: 'PATCH',
        body: JSON.stringify({sd_id, new_duration}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }}),
   
    startSession : async (user_name, password)=>
        fetchWrapper(PATHS.AUTH, {
        method: 'POST',
        body: JSON.stringify({user_name: user_name, password: password}),
        headers: {
        'Content-Type': 'application/json',
    }}),

    endSession : async (key)=>
      fetchWrapper(PATHS.AUTH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',key: key}
    }),

    fetchPossibleBookings : async (service_id, location_id, date_time, key)=>
      fetchWrapper(`${PATHS.APPOINTMENT_AVAILABILITY}?s_id=${service_id}&l_id=${location_id}&dt=${date_time}`,  {
        method: 'GET',
       // body: JSON.stringify({service_id,location_id,date_time}),
        headers: {
        'Content-Type': 'application/json',
        key: key
    }})
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
