import { useAuth } from '../src/AuthProvider'
import { useState } from 'react'

import {
  DOMAIN, 
  ENDPOINT_URL_APPOINTMENT,
  ENDPOINT_URL_LOCATION,
  MAPS_API_KEY,
  MAPS_ENDPOINT,
} from '../src/constants'

const locations_path = `${DOMAIN}${ENDPOINT_URL_LOCATION}`
const appointments_path = `${DOMAIN}${ENDPOINT_URL_APPOINTMENT}`

async function fetchWrapper(url, options){
    return new Promise( (resolve, reject) => { 
      fetch(url, options)
        .then(((res) => res.json()))
          .then((data) => {resolve({success: true, ...data })})
          .catch((error) => {reject({success: false, reason: error})});
  });}

  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }
  
function useAPI(){

    const { token } = useAuth();

    const [loading, setLoading] = useState(false)


    function APIWrapper(CB, params, successCB = ()=>{}, errorCB = ()=>{}, finallyCB = ()=>{}){

        setLoading(true)        //always set loading when callout begins
        params = Object.keys(params).map(e=>params[e])
        console.log("KEY: ", token?.type, token?.key)
        setTimeout(async ()=>{   
          CB(...params).then((result)=>{
              //setError(false)     //successfull callouts will clear the previous err
              successCB(result)
          }).catch((err)=>{
              console.log("ERROR: ", err)
              //setError(true)      
              errorCB(err)
          }).finally(()=>{
              setLoading(false)  //always unset loading when callout ends
              finallyCB()
          })

      }, getRandom(1000, 3000))  
    }
  //
    const fetchGuestLocations = async () => fetchWrapper(locations_path, null)

   // const fetchUserLocations = async (key) => fetchWrapper(`${locations_path}?key=${key}`, null)

   // const fetchLocationsStoreOwner = async (key) => fetchWrapper(`${locations_path}?key=${key}`, null)
//
    const fetchAuthLocations = async (key) => fetchWrapper(`${locations_path}?key=${key}`, null)
    
    ///////////////UNUSED///////////
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


//
    const editLocation = async (location) => 
    fetchWrapper(`${locations_path}?key=${token?.key}`,  {
        method: 'PATCH',
        body: JSON.stringify({
            storeowner_id:    token?.key, 
            location:{
              ...location,
              LatLng: {
                lat: location.LatLng.lat + getRandom(-2.5, 2.5), 
                lng: location.LatLng.lng + getRandom(-0.5, 0.5)
              },
            }
          }),
        headers: {
          'Content-Type': 'application/json'
    }})

//
    const postAppointment = async (appointment) => 
      fetchWrapper(`${appointments_path}?key=${token?.key}`,  {
          method: 'POST',
          body: JSON.stringify({
              loc_id:     appointment.loc_id,
              user_id:    token?.key,
              date:       appointment.date,
              start_time: appointment.start_time,
              end_time:   appointment.end_time,
              apt_types:  appointment.apt_types
            }),
          headers: {
            'Content-Type': 'application/json'
    }})
//
    const deleteAppointment = async (appointment_id) => 
        fetchWrapper(`${appointments_path}?key=${token?.key}`,  {
            method: 'DELETE',
            body: JSON.stringify({
                apt_id:     appointment_id,
                user_id:    token?.key,
            }),
            headers: {
            'Content-Type': 'application/json'
    }})

    //
    const editAppointmentStatus = async (apt_id, new_status) => 
    fetchWrapper(`${appointments_path}?key=${token?.key}`,  {
        method: 'PATCH',
        body: JSON.stringify({
            storeowner_id:    token?.key, 
            apt_id:           apt_id,
            new_status:      new_status
          }),
        headers: {
        'Content-Type': 'application/json'
    }})

    const fetchMapInfo = async (streetNumber,city,province,country,postalCode) => 
      fetchWrapper(`${MAPS_ENDPOINT}?key=${MAPS_API_KEY}&address=${streetNumber}%20${city}%20${province}%20${country}%20${postalCode}`, {})



    /*
    function fetchLocations(){
        if(!config){
            return new Promise( reject => reject("") )
        }

        if(token?.type === "USER" && token.key){
            return fetchUserLocations(token.key)
        }else if(token?.type === "STOREOWNER" && token.key){
            return fetchLocationsStoreOwner(token.key)
        }else{
            return fetchGuestLocations()
        }
    }
*/
    
    return{
        fetchMapInfo:           (params={}, ...args )=>APIWrapper(fetchMapInfo , params, ...args),
        fetchAuthLocations:     (params={}, ...args )=>APIWrapper(fetchAuthLocations , {key: token.key}, ...args),
        fetchGuestLocations:    (params={}, ...args )=>APIWrapper(fetchGuestLocations , params, ...args),
        loading,
        deleteAppointment:      (params={}, ...args )=>APIWrapper(deleteAppointment , params, ...args),
        //fetchLocations         ,
        deleteLocation:         (params={}, ...args )=>APIWrapper(deleteLocation , params, ...args),
        editLocation:           (params={}, ...args )=>APIWrapper(editLocation , params, ...args),
        postAppointment:        (params={}, ...args )=>APIWrapper(postAppointment, params, ...args),
        postLocation:           (params={}, ...args )=>APIWrapper(postLocation, params, ...args),
        editAppointmentStatus:  (params={}, ...args )=>APIWrapper(editAppointmentStatus, params, ...args)
    }

}

export default useAPI
