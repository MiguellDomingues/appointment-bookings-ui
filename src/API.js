import {
    DOMAIN, 
    ENDPOINT_URL_APPOINTMENT,
    ENDPOINT_URL_LOCATION,
    MAPS_API_KEY,
    MAPS_ENDPOINT,
  } from './constants'

  const locations_path = `${DOMAIN}${ENDPOINT_URL_LOCATION}`
  const appointments_path = `${DOMAIN}${ENDPOINT_URL_APPOINTMENT}`

async function fetchWrapper(url, options){
    return new Promise( (resolve, reject) => { 
      fetch(url, options)
        .then(((res) => res.json()))
          .then((data) => {resolve({success: true, ...data })})
          .catch((error) => {reject({success: false, reason: error})});
  });}

const API = {
    fetchGuestLocations: async () => fetchWrapper(locations_path, null),

    fetchAuthLocations : async (key) => fetchWrapper(`${locations_path}?key=${key}`, null),

    editLocation : async (key, location) => {
        //console.log("el: ", location)
        return fetchWrapper(`${locations_path}?key=${key}`,  {
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
            'Content-Type': 'application/json'
        }})},
    editAppointmentStatus : async (key, apt_id, new_status) => 
        fetchWrapper(`${appointments_path}?key=${key}`,  {
            method: 'PATCH',
            body: JSON.stringify({
                storeowner_id:    key, 
                apt_id:           apt_id,
                new_status:      new_status
            }),
            headers: {
            'Content-Type': 'application/json'
        }}),
    postAppointment : async (key, appointment) => 
        fetchWrapper(`${appointments_path}?key=${key}`,  {
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
            'Content-Type': 'application/json'
        }}),
    deleteAppointment : async (key, appointment_id) => 
        fetchWrapper(`${appointments_path}?key=${key}`,  {
            method: 'DELETE',
            body: JSON.stringify({
                apt_id:     appointment_id,
                user_id:    key,
            }),
            headers: {
            'Content-Type': 'application/json'
        }}),
    fetchMapInfo : async (streetNumber,city,province,country,postalCode) => 
        fetchWrapper(`${MAPS_ENDPOINT}?key=${MAPS_API_KEY}&address=${streetNumber}%20${city}%20${province}%20${country}%20${postalCode}`, {})      
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
