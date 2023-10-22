import { useAuth, useConfig} from './AuthProvider'
import { useState } from 'react'

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

    const { config } = useConfig()
    const { token } = useAuth();

    const [loading, setLoading] = useState(false)

    const locations_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_LOCATION}` : ''
    const appointments_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_APPOINTMENT}` : ''

    function APIWrapper(CB, params, successCB = ()=>{}, errorCB = ()=>{}, finallyCB = ()=>{}){
        setLoading(true)        //always set loading when callout begins
        params = Object.keys(params).map(e=>params[e])
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
    }
  
    const fetchGuestLocations = async () => fetchWrapper(locations_path, null)

    const fetchUserLocations = async (key) => fetchWrapper(`${locations_path}?key=${key}`, null)

    const fetchLocationsStoreOwner = async (key) => fetchWrapper(`${locations_path}?key=${key}`, null)
    
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

    const postAppointment = async (appointment) => 
    fetchWrapper(`${appointments_path}?key=${token?.key}`,  {
        method: 'POST',
        body: JSON.stringify({
            loc_id:     appointment.loc_id,
            user_id:    token?.key,
            date:       appointment.date,
            start_time: appointment.start_time,
            end_time:   appointment.end_time
          }),
        headers: {
          'Content-Type': 'application/json'
    }})

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

    
    return{
        loading,
        deleteAppointment:      (params={}, ...args )=>APIWrapper(deleteAppointment , params, ...args),
        fetchLocations         ,
        deleteLocation:         (params={}, ...args )=>APIWrapper(deleteLocation , params, ...args),
        editLocation:           (params={}, ...args )=>APIWrapper(editLocation , params, ...args),
        postAppointment:        (params={}, ...args )=>APIWrapper(postAppointment, params, ...args),
        postLocation:           (params={}, ...args )=>APIWrapper(postLocation, params, ...args),
        editAppointmentStatus:  (params={}, ...args )=>APIWrapper(editAppointmentStatus, params, ...args)
    }

}

export default useAPI

/*
 const fetchClientConfigs = () => {

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
