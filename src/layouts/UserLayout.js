import { useAuth,useConfig,} from '../AuthProvider'
import {useState, useEffect, useMemo } from 'react'

import { MemoryRouter, Route, Routes, Navigate,Link } from "react-router";



import MyMap from '../components/Map.tsx'
import LoadingOverlay from '../components/LoadingOverlay'
import Header from '../components/Header'
import BodyPanel from '../components/BodyPanel'

import useIcons from '../hooks/useIcons'

import useLocations from '../hooks/useLocations'

import {useAppContext} from '../AppContextProvider'

import useAPI from '../useAPI'
import '../styles.css';

const PageState = Object.freeze({
  Map: "Map",
  Calendar: "Calendar"
});

 const BodyPanelState = Object.freeze({
  Location: "Location",
  Appointment: "Appointment",
});


function UserLayout({
  startingMode = PageState.Map
}){

    const { config, loadingConfigs, } = useConfig();
    const { token , loadingUser  } = useAuth();

    const { fetchAuthLocations, loading } = useAPI();

    const [data, setData] = useState([]);

    const {selectedIcons,toggleIcon} = useIcons();

    const [ mode, setMode ] = useState(  startingMode );

    const {filteredLocations, selectedLocationId, selectLocation} =  useLocations(data, selectedIcons)

    useEffect( () => getData(), []);

  const context = useAppContext();

  context.refetchLocations = () => getData()
  context.selectedLocationId = selectedLocationId
  context.selectLocation = selectLocation
  context.selectedIcons =  selectedIcons
  context.toggleIcon =  toggleIcon

    function getData(){ 
        fetchAuthLocations({},(results)=>{
            setData([...results.posts]);
        })
    }

    function getSelectedLocationAppointmentsIcons(locations = [], selected_location_id = null){
  
      const selected_location = locations.find(({id})=>id === selected_location_id)
  
      if(!selected_location){ //if no location was found, return empty list
        return {};
      }
      return { appointments: selected_location.appointments, icons: selected_location.icons}
    }


    let { appointments, icons } =  getSelectedLocationAppointmentsIcons(filteredLocations, selectedLocationId);

    //console.log("/////////////////////", filteredLocations)


    function getPageUI(selectedMode){
      
      switch(selectedMode){
          case PageState.Map:{

            return {
              leftPanel:<>
                <MyMap 
                  posts={filteredLocations} 
                  selected={selectedLocationId} 
                  handleSelectedLocation={selectLocation} /> 
              </>,
              rightPanel: <>
                  <BodyPanel 
                    startingMode={BodyPanelState.Location}
                    filteredLocations={filteredLocations}
                    appointments={appointments}
                    isToggleable={true}
                    icons={icons}
                    loading={loading}/>
              </>} 
          }    
          default: return <></>
      }
    }

    const { leftPanel, rightPanel } = getPageUI(mode)

     // console.log("user: ", filteredLocations)

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
          {leftPanel}
        </div>
  
        <div className="page_section_right">
          <Header 
            refetchLocations={getData} 
            refetching={loading}
            handleSetMapPage={()=>setMode(PageState.Map)}/>
            
          {rightPanel} 
        </div>

      </div>
    </>);
  }

export default UserLayout;



