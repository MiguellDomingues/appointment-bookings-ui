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

import useAvailability from '../hooks/useAvailability';
import useLocationMap from '../hooks/useLocationMap';

import { Routes, Route } from "react-router-dom";

import useAPI from '../useAPI.js'

import API from '../API'

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

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointments, selectAppointments] = useState([]);

  console.log(data)

  const { 
    fetchAuthLocations, 
    loading
   } = useAPI(
      API.fetchAuthLocations, 
      (results)=>setData([{...results.posts[0]}]));

  const {
    calendarProps, 
    workingPlanListProps, 
    breakListProps, 
    serviceDurationListProps } = useAvailability(data)



  const {
    locations, 
    selectedLocationId,
    selectLocation,
    getMapProps,
    viewMapPreview,
    cancelMapPreview } = useLocationMap(data)

   
    useEffect( () => getData(), []);
    //for data fetching///////////////

  useEffect( () => { 
  
      if(data[0]?.id){
        selectLocation(data[0].id)
        setAppointments(data[0].appointments)
      }
      
   }, [data]);

   useEffect( () => { 
  
    if(mode !== PageState.Map){
      cancelMapPreview()
    }
    
 }, [mode]); //if the user navigates to a new page, close the map preview

 function getData(){ fetchAuthLocations()}


  const context = useAppContext();

  context.refetchLocations = () => getData()
  context.isRefetching = loading

  context.links = [
    {
      name: "Home",
      route: "/STOREOWNER"
    },
    {
      name: "Appointments",
      route: "/STOREOWNER/appointments"
    },
    {
      name: "Availability",
      route: "/STOREOWNER/availability"
    },
  ]

  context.selectedLocationId = selectedLocationId
  context.selectLocation = selectLocation
  context.viewMapPreview = viewMapPreview
  context.cancelMapPreview = cancelMapPreview
  context.selectAppointments =  (appointments)=>selectAppointments(appointments)

  return(<>
    <Routes>
      <Route index element={<>
          <PageLayout 
            leftPanel={<>
            <MyMap
                  posts={locations}
                  startZoom= {17} 
                  selected ={selectedLocationId} 
                  handleSelectedLocation={selectLocation}/>,
            </>} 
            rightPanel={<>
                <LocationList locations={locations} {...{ loading}}/>
            </>}/>    
          </>}/>
      <Route 
        path={"appointments"} 
        element={<>
          <PageLayout 
            leftPanel={<>
              <CalendarPanel appointments={appointments}/>          
            </>} 
            rightPanel={<>
                <AppointmentList appointments={selectedAppointments} loading={loading}/>  
            </>}/> 
        </>}/>
      <Route 
        path={`availability`} 
        element={<>
        <PageLayout 
          leftPanel={<>
            <Calendar {...calendarProps}/> 
          </>} 
          rightPanel={<>
            <div className="body_availability">
              <WorkingPlanList {...workingPlanListProps}/>
              <BreakList {...breakListProps}/>
              <ServiceDurationList {...serviceDurationListProps}/> 
            </div> 
          </>}/> 
      </>}/>
  </Routes>
  </>)

}

export default StoreOwnerLayout;
