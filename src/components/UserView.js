import { useAuth,useConfig,} from '../AuthProvider'
import {useState, useEffect, useMemo } from 'react'

import LocationList from './LocationList'
import AppointmentList from './AppointmentList'
import MyMap from './Map.tsx'

import useIcons from '../hooks/useIcons'

import {useAppContext} from '../AppContextProvider'

import LoadingOverlay from './LoadingOverlay'

import useAPI from '../useAPI'
import '../styles.css';

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

const BodyPanelState = Object.freeze({
    Location: "Location",
    LocationAppointments: "LocationAppointments"
});

function UserView({
  startingMode = BodyPanelState.Location
}){

    const { config, loadingConfigs, loadingUser } = useConfig();
    const { token, isUser, isStoreOwner } = useAuth();
    const { fetchLocations } = useAPI();

    const [data, setData] = useState([]);

    const {selectedIcons,toggleIcon} = useIcons();

    const [loading, setLoading] = useState(false);
    const [ mode, setMode ] = useState( startingMode );
     /* track the id of the selected entity to update map/list*/
    const [selectedLocationId, setSelectedLocation] = useState(null);

    useEffect( () => getData(), [token,config ]);//

  const context = useAppContext();

  context.handleManageAppointments = () =>setMode(BodyPanelState.LocationAppointments)
  context.refetchLocations = () => getData()
  context.selectedLocationId = selectedLocationId
  context.selectLocation = (id) => setSelectedLocation(id)
  context.selectedIcons =  selectedIcons
  context.toggleIcon =  toggleIcon

    function filterLocationsBySelectedIcons(locations = [], selected_icons = []){

        if(selected_icons.length === 0){ //if no icons selected, show all locations
            return locations;
        }

        const filtered_locations = [];
        locations.forEach((location)=>{                 // for each location ...
            location.icons.some((location_icon)=>{          // for each icon describing the location...
            if(selected_icons.includes(location_icon)){     // if that icon is present in the selected icon list...
                filtered_locations.push(location)               // add that location to the output array...
                return true;                                    // and check the next location (otherwise we add the same location multiple times)
            }else{
                return false;                                 // otherwise check the next icon
            }})
        })

        return filtered_locations;
    }

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

    const filteredLocations = filterLocationsBySelectedIcons(data,selectedIcons)
 
    const { appointments, icons } =  getSelectedLocationAppointmentsIcons(filteredLocations, selectedLocationId);

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

                    <LocationList locations={filteredLocations}/>
                </div>
              </>
          case BodyPanelState.LocationAppointments:
              return <>
                  <div className="body_panel body_appointments">
                    <button onClick={e=>setMode(BodyPanelState.Location)} className="cancel_new_appointment_btn">X</button>

                    <LoadingOverlay 
                    isLoading={loading && !loadingConfigs && !loadingUser} 
                    isFullscreen={false}
                    loadingText={"Loading Data"}/>

                    <AppointmentList {...{appointments, icons}}/> 
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
          {<MyMap 
            posts={filteredLocations} 
            selected={selectedLocationId} 
            handleSelectedLocation={(id)=>setSelectedLocation(id)} />}
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
