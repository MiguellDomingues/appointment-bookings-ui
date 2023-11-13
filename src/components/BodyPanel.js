
import LocationList from './LocationList'
import AppointmentList from './AppointmentList'
import Availability from './Availability'

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
    context.handleConfigureAvailability = () =>setMode(BodyPanelState.Availability)


  
    function getBodyUI(selectedMode){    
  
      switch(selectedMode){
          case BodyPanelState.Location:
              return <>
                <div className="body_panel body_locations">
                    <LocationList locations={filteredLocations} loading={loading}/>
                </div>
              </>
          case BodyPanelState.Appointment:
              return <>
                  <div className="body_panel body_appointments">
                    { isToggleable ? <button onClick={e=>setMode(startingMode)} className="cancel_panel_btn">X</button> : <></>}
                    <AppointmentList {...{appointments, icons} } loading={loading}/> 
                  </div>
              </>
           case BodyPanelState.Availability:
            return <>
                <div className="body_panel body_locations">
                  { isToggleable ? <button onClick={e=>setMode(startingMode)} className="cancel_panel_btn">X</button> : <></>}
                  <Availability/>
                </div>
            </>
          default: return <></>
      }
    }
  
    return (<>{getBodyUI(mode)}</>)
  }

  export default BodyPanel;