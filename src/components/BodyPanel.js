
import LocationList from './LocationList'
import AppointmentList from './AppointmentList'

import {useAppContext} from '../AppContextProvider'

import {useState, useEffect } from 'react'

export const BodyPanelState = Object.freeze({
    Location: "Location",
    Appointment: "Appointment",
    Availability: "Availability"
});

export function BodyPanel({
    startingMode = null,
    filteredLocations = [],
    appointments = [],
    icons = [],
    loading = false,
    isToggleable = null
  }){
  
  const [ mode, setMode ] = useState(startingMode);
  //console.log("bps: ", mode, filteredLocations,  appointments, icons, loading)
  
   useEffect( () => setMode(startingMode), [startingMode]);//
  
    const context = useAppContext();
  
    context.handleManageAppointments = () =>setMode(BodyPanelState.Appointment)

    function getBodyUI(selectedMode){    
  
      switch(selectedMode){
          case BodyPanelState.Location:
              return <>
                <LocationList locations={filteredLocations} loading={loading}/>
              </>
          case BodyPanelState.Appointment:
              return <>
                { isToggleable ? <button onClick={e=>setMode(startingMode)} className="cancel_panel_btn">X</button> : <></>}
                <AppointmentList //{...{appointments, icons} } 
                  appointments={[...appointments]}
                  icons={[...icons]}
                  loading={loading}/> 
              </>
           
          default: return <></>
      }
    }
  
    return (<>{getBodyUI(mode)}</>)
  }

  export default BodyPanel;