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



  //const { fetchAuthLocations, loading } = useAPI(API.fetchAuthLocations);

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
    serviceDurationListProps } = useAvailability()

    //const { appointments, selectedAppointments, selectAppointments } = useAppointments( data.appointments )

      //const {b} = useFoo(mergeLocationAppointments(data))

     // console.log("b storeowner:",b)

     // console.log("storeowner")

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

 /*
 function getData(){ 
    fetchAuthLocations({},(results)=>{
      setData([{...results.posts[0]}]); //copy the first element of the returned array into a new array
  })
 }
 */



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
  context.selectAppointments =  (appointments)=>selectAppointments(appointments)

  function getPageUI(selectedMode){     
    switch(selectedMode){
        case PageState.Map:{
          return{
            leftPanel:
              <MyMap
                posts={locations}
                startZoom= {17} 
                selected ={selectedLocationId} 
                handleSelectedLocation={selectLocation}/>,
            rightPanel:<LocationList locations={locations} {...{ loading}}/>,
          }
        }   
        case PageState.Calendar:{
          return{
            leftPanel:<CalendarPanel appointments={appointments}/>,
            rightPanel:<AppointmentList appointments={selectedAppointments} loading={loading}/>        
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
