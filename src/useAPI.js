import { useAuth, useConfig} from './AuthProvider'

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
    const { token, loadingConfigs } = useAuth();

    const locations_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_LOCATION}` : ''
    const appointments_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_APPOINTMENT}` : ''


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
        fetchLocations, postLocation ,deleteLocation,editLocation,
        postAppointment, deleteAppointment, editAppointmentStatus
    }

}

export default useAPI

/*

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

*/

