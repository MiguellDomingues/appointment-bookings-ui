import {useState, useEffect, useMemo } from 'react'

import { MemoryRouter, Route, Routes, Navigate,Link } from "react-router";

import PageLayout from '../layouts/PageLayout';

import MyMap from '../components/Map.tsx'
import { BodyPanel,BodyPanelState} from '../components/BodyPanel'

import useIcons from '../hooks/useIcons'
import useLocationMap from '../hooks/useLocationMap';
import useAPI from '../useAPI'

import {useAppContext} from '../AppContextProvider'

import '../styles.css';

const PageState = Object.freeze({
  Map: "Map",
  Calendar: "Calendar"
});


/*merge the appointments from each location into a single array, 
adding the location id to the appointment object 
meant for use for User data */
const mergeLocationAppointments = (locations = []) =>
  locations.reduce((mergedAppointments, {id, appointments}) => 
    mergedAppointments.concat(
      appointments.map(
        appointment=>({...appointment,loc_id: id}))),[]);

const getSelectedLocationAppointments = (appointments, selected_location_id) => 
  appointments.filter(({loc_id})=>selected_location_id=== loc_id)


function getSelectedLocationAppointmentsIcons(locations = [], selected_location_id = null){

  const selected_location = locations.find(({id})=>id === selected_location_id)

  if(!selected_location){ //if no location was found, return empty list
    return {appointments: [], icons:[] };
  }
  return { appointments: selected_location.appointments, icons: selected_location.icons}
}



function UserLayout({
  startingMode = PageState.Map
}){

  const [data, setData] = useState([]);
  const [ mode, setMode ] = useState(  startingMode );

  const [allAppointments, setAllAppointments] = useState([]);

  const { fetchAuthLocations, loading } = useAPI();
  const { selectedIcons, toggleIcon} = useIcons();
  const { filteredLocations, locations, selectedLocationId, selectLocation,} = useLocationMap(data, selectedIcons)

  useEffect( () => { setAllAppointments(mergeLocationAppointments(data)) }, [data]);


  useEffect( () => getData(), []);

  const context = useAppContext();

  context.selectedLocationId = selectedLocationId
  context.selectLocation = selectLocation

  context.selectedIcons =  selectedIcons
  context.toggleIcon =  toggleIcon

  context.refetchLocations = () => getData()
  context.isRefetching = loading

  context.links = [
    {
      name: "Location",
      handler: ()=>setMode(PageState.Map)
    },
  ]

  function getData(){ 
      fetchAuthLocations({},(results)=>{
          setData([...results.posts]);
      })
  }

  let { appointments, icons } =  getSelectedLocationAppointmentsIcons(data, selectedLocationId);

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

  //console.log("user layout apts: ",appointments)



  const { leftPanel, rightPanel } = getPageUI(mode)

  return(<>
    <PageLayout leftPanel={leftPanel} rightPanel={rightPanel}/>
  </>)
}

export default UserLayout;