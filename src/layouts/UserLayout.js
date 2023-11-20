import {useState, useEffect, useMemo } from 'react'

import { MemoryRouter, Route, Routes, Navigate,Link } from "react-router";

import PageLayout from '../layouts/PageLayout';

import MyMap from '../components/Map.tsx'
import { BodyPanel,BodyPanelState} from '../components/BodyPanel'

import useIcons from '../hooks/useIcons'
import useLocationMap from '../hooks/useLocationMap';
import useCalendarAppointments from '../hooks/useCalendarAppointments';
import useAPI from '../useAPI'

import {useAppContext} from '../AppContextProvider'

import '../styles.css';

const PageState = Object.freeze({
  Map: "Map",
  Calendar: "Calendar"
});

function UserLayout({
  startingMode = PageState.Map
}){

  const [data, setData] = useState([]);
  const [ mode, setMode ] = useState(  startingMode );

  const { fetchAuthLocations, loading } = useAPI();
  const { selectedIcons, toggleIcon} = useIcons();
  const { filteredLocations,selectedLocationId,selectLocation,} = useLocationMap(data, selectedIcons)
  const { getSelectedLocationAppointmentsIcons } = useCalendarAppointments()

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

    let { appointments, icons } =  getSelectedLocationAppointmentsIcons(filteredLocations, selectedLocationId);

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

    return(<>
      <PageLayout leftPanel={leftPanel} rightPanel={rightPanel}/>
    </>)
  }

export default UserLayout;