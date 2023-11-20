import {useState, useEffect, } from 'react'

function useCalendarAppointments(){

    const [selectedAppointments, setSelectedAppointments] = useState([]);
  
    //updates the appointment list when user clicks on calendar days
    function selectedCalendarDayAppointments(appointments = []){
      console.log("selectedCalendarDayAppointments: ", appointments)
      if(appointments?.length > 0){
        setSelectedAppointments([...appointments])
      }else{
        setSelectedAppointments([])
      } 
    }

    function getSelectedLocationAppointmentsIcons(locations = [], selected_location_id = null){
  
        const selected_location = locations.find(({id})=>id === selected_location_id)
    
        if(!selected_location){ //if no location was found, return empty list
          return {appointments: [], icons:[] };
        }
        return { appointments: selected_location.appointments, icons: selected_location.icons}
    }

    return {selectedAppointments, selectedCalendarDayAppointments, getSelectedLocationAppointmentsIcons}

}

export default useCalendarAppointments;