import { useAuth,useConfig,} from '../AuthProvider'
import {useState, useEffect, useMemo } from 'react'

import LocationList from './LocationList'
import AppointmentList from './AppointmentList'
import MyMap from './Map.tsx'

import {useAppContext} from '../AppContextProvider'

import LoadingOverlay from './LoadingOverlay'

import useAPI from '../useAPI'
import '../styles.css';

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

const BodyPanelState = Object.freeze({
    Location: "Location",
    Appointment: "Appointment"
});

function UserView({
  startingMode = BodyPanelState.Location
}){

    const { config, loadingConfigs, loadingUser } = useConfig();
    const { token, isUser, isStoreOwner } = useAuth();
    const { fetchLocations } = useAPI();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ mode, setMode ] = useState( startingMode );
     /* track the id of the selected entity to update map/list*/
    const [selectedLocationId, setSelectedLocation] = useState(null);

    useEffect( () => getData(), [token, config]);

  const val = useAppContext();

  val.handleManageAppointments = () =>setMode(BodyPanelState.Appointment)
  val.refetchLocations = () => getData()
  val.selectedLocationId = selectedLocationId
  val.selectLocation = (id) => setSelectedLocation(id)

    function getData(){ 
        setLoading(true)

        setTimeout(async ()=>{
            fetchLocations()
                .then((results)=>{setData(results.posts)})
                .catch((err)=>console.log("error getting data", err))
                .finally(()=>{setLoading(false)});
        }, randomIntFromInterval(1000, 3000))  
    }

    function getSelectedLocationAppointmentsIcons(locations = [], selected_location_id = null){
  
      const selected_location = locations.find(({id})=>id === selected_location_id)
  
      if(!selected_location){ //if no location was found, return empty list
        return {};
      }
      return { appointments: selected_location.appointments, icons: selected_location.icons}
    }
 
    const { appointments, icons } =  getSelectedLocationAppointmentsIcons(data, selectedLocationId);

    //const isLocationSelected = () => selectedLocationId !== null;

    function getUI(selectedMode){      
      switch(selectedMode){
          case BodyPanelState.Location:
              return <>
                <div className="body_panel body_locations">
                  <LoadingOverlay 
                    isLoading={loading && !loadingConfigs && !loadingUser} 
                    isFullscreen={false}
                    loadingText={"Loading Data"}/>

                    <LocationList 
                      {...{selectedLocationId}}
                      locations={data}
                      selectLocation={ (id)=>setSelectedLocation(id) }
                      handleManageAppointments={()=>setMode(BodyPanelState.Appointment)}/>
                </div>
              </>
          case BodyPanelState.Appointment:
              return <>
                  <div className="body_panel body_appointments">
                    <button onClick={e=>setMode(BodyPanelState.Location)} className="cancel_new_appointment_btn">X</button>
                    
                    <LoadingOverlay 
                    isLoading={loading && !loadingConfigs && !loadingUser} 
                    isFullscreen={false}
                    loadingText={"Loading Data"}/>

                    <AppointmentList 
                      {...{appointments, icons, selectedLocationId}}
                      refetchLocations={getData}/> 
                  </div>
              </>
          default: return <></>
      }
    }

    return (<>     

    <LoadingOverlay 
      isLoading={loadingConfigs} 
      isFullscreen={true}
      loadingText={"Loading Configurations..."}/>

    <LoadingOverlay 
      isLoading={loadingUser} 
      isFullscreen={true}
      loadingText={"Authenticating..."}/>

      <div className="page">
  
        <div className="page_section_left">
          {/*<MyMap 
            posts={locations} 
            selected={selectedLocationId} 
            handleSelectedLocation={(id)=>setSelectedLocation(id)} /> */}
        </div>
  
        <div className="page_section_right">
  
          <Header refetchLocations={getData} refetching={loading}/>
          {getUI(mode)}
         
        </div>

      </div>
    </>);
  }

  function Header({refetchLocations,refetching}){

    const { token, loadingUser } = useAuth();

    return( 
    <div className="header">
      <span>
      {loadingUser ? 
        <>Athenticating....</> : 
        <>Welcome {token && token?.username ? <>{token.username}</> : <>Guest</> }    
      </>}
      </span>
      
      <span> <button disabled={refetching} onClick={e=>refetchLocations()}>Refresh</button> </span>
    </div>);
  }
  
  export default UserView;
