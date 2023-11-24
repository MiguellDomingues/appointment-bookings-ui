import {useState, useEffect, } from 'react'

function useAppointments(dataAppointments = [], ){

  console.log("///////useCalendarAppointments///////////",)

  const [appointments, setAppointments] = useState([...dataAppointments]);
  const [selectedAppointments, setSelectedAppointments] = useState([]);

  useEffect( () => {  setAppointments([...dataAppointments]) }, [dataAppointments]);
  
    //updates the appointment list when user clicks on calendar days
   // function setSelectedAppointments(apts = []){
   //   console.log("selectedCalendarDayAppointments: ", apts)
   //     setSelectedAppointments([...apts])
   // }

    function getSelectedLocationAppointmentsIcons(locations = [], selected_location_id = null){
  
        const selected_location = locations.find(({id})=>id === selected_location_id)
    
        if(!selected_location){ //if no location was found, return empty list
          return {appointments: [], icons:[] };
        }
        return { appointments: selected_location.appointments, icons: selected_location.icons}
    }


// const [appointments, setAppointments] = useState(data);console.log(appointments)

    return {
      selectedAppointments, 
      appointments,
      getSelectedLocationAppointmentsIcons, 
      selectAppointments: (appointments)=>setSelectedAppointments(appointments)
    }

}

export default useAppointments;