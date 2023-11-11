
import LocationList from './LocationList'
import AppointmentList from './AppointmentList'
import {useAppContext} from '../AppContextProvider'

import {useState } from 'react'

export const BodyPanelState = Object.freeze({
    Location: "Location",
    Appointment: "Appointment",
});

export function BodyPanel({
    startingMode = null,
    filteredLocations = [],
    appointments = [],
    icons = [],
    loading = false,
  }){
  
    const [ mode, setMode ] = useState(startingMode);
   console.log("bps: ", mode, filteredLocations,  appointments, icons, loading)
  
  //useEffect( () => {console.log("//////////////////////////////////init////////////////////////////////////////")}, []);//
  
  const context = useAppContext();
  
    context.handleManageAppointments = () =>setMode(BodyPanelState.Appointment)
  
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
                    <button onClick={e=>setMode(BodyPanelState.Location)} className="cancel_new_appointment_btn">X</button>
                    <AppointmentList {...{appointments, icons} } loading={loading}/> 
                  </div>
              </>
          default: return <></>
      }
    }
  
    return (<>{getBodyUI(mode)}</>)
  }

  export default BodyPanel;