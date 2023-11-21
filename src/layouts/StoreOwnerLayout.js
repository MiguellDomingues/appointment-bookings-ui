import {useState, useEffect, useMemo } from 'react'

import {useAppContext} from '../AppContextProvider'

import { Calendar,  } from "react-big-calendar";
import CalendarPanel from '../components/CalendarPanel';

import "react-big-calendar/lib/css/react-big-calendar.css";

import PageLayout from '../layouts/PageLayout';

import WorkingPlanList   from '../components/WorkingPlanList'
import BreakList   from '../components/BreakList'
import ServiceDurationList   from '../components/ServiceDurationList'
import MyMap from '../components/Map.tsx';
import LocationList from '../components/LocationList';
import AppointmentList from '../components/AppointmentList';
import {BodyPanel,BodyPanelState} from '../components/BodyPanel';

import useAvailability from '../hooks/useAvailability';
import useLocationMap from '../hooks/useLocationMap';
import useCalendarAppointments from '../hooks/useCalendarAppointments';
import useAPI from '../useAPI'

import '../styles.css';

const PageState = Object.freeze({
  Map: "Map",
  Calendar: "Calendar",
  Availability: "Availability"
});

function StoreOwnerLayout({
  startingMode = PageState.Map
}){

  const [data, setData] = useState([]);
  const [ mode, setMode ] = useState(  startingMode );

  const { fetchAuthLocations, loading } = useAPI();

  const {
    calendarProps, 
    workingPlanListProps, 
    breakListProps, 
    serviceDurationListProps } = useAvailability()

  const {
    locations, 
    selectedLocationId,
    selectLocation,
    getMapProps,
    viewMapPreview,
    cancelMapPreview } = useLocationMap(data)

  const {
    selectedAppointments, 
    selectedCalendarDayAppointments } = useCalendarAppointments()

    useEffect( () => getData(), []);
    //for data fetching///////////////

    useEffect( () => { 
  
      if(data[0]?.id){
        selectLocation(data[0].id)
      }
      
   }, [data]);

   useEffect( () => { 
  
    if(mode !== PageState.Map){
      cancelMapPreview()
    }
    
 }, [mode]); //if the user navigates to a new page, close the map preview

 function getData(){ 
  fetchAuthLocations({},(results)=>{
    console.log("////////////////AUTH FETCH", data)
      setData([{...results.posts[0]}]); //copy the first element of the returned array into a new array
  })
}

  const context = useAppContext();

  context.refetchLocations = () => getData()
  context.isRefetching = loading

  context.links = [
    {
      name: "Location",
      handler: ()=>setMode(PageState.Map)
    },
    {
      name: "Availability",
      handler: ()=>setMode(PageState.Availability)
    },
    {
      name: "Appointments",
      handler: ()=>setMode(PageState.Calendar)
    },
  ]

  context.selectedLocationId = selectedLocationId
  context.selectLocation = selectLocation
  context.viewMapPreview = viewMapPreview
  context.cancelMapPreview = cancelMapPreview
  context.selectCalendarDayAppointments = selectedCalendarDayAppointments

  function getPageUI(selectedMode){     
    switch(selectedMode){
        case PageState.Map:{
          return{
            leftPanel:<MyMap  {...{...getMapProps()}}/>,
            rightPanel:<LocationList {...{locations, loading}}/>,
          }
        }   
        case PageState.Calendar:{
          return{
            leftPanel:<CalendarPanel appointments={data[0].appointments}/>,
            rightPanel:<AppointmentList appointments={selectedAppointments} icons={data[0].icons}loading={loading}/>        
          }  
        }  
        case PageState.Availability:
          return{
            leftPanel:<Calendar {...calendarProps}/>,
            rightPanel:<>
              <div className="body_availability">
                <WorkingPlanList {...workingPlanListProps}/>
                <BreakList {...breakListProps}/>
                <ServiceDurationList {...serviceDurationListProps}/> 
              </div>
            </>}        
        default: return <></>
    }
  }

  const {leftPanel, rightPanel} = getPageUI(mode)

  return(<>
    <PageLayout leftPanel={leftPanel} rightPanel={rightPanel}/>
  </>)

}

export default StoreOwnerLayout;
