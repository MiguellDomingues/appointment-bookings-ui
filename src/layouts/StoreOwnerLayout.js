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

import LoadingWrapper from '../components/LoadingWrapper';
import LocationCard from '../components/LocationCard';
import LocationForm from '../components/LocationForm';
import AppointmentList from '../components/AppointmentList';

import useAvailability from '../hooks/useAvailability';
import useLocationMap from '../hooks/useLocationMap';

import { Routes, Route, useNavigate } from "react-router-dom";

import useAPI from '../useAPI.js'

import API from '../API'


import '../styles.css';


function StoreOwnerLayout(){

  const [data, setData] = useState([]);

  const navigate = useNavigate();

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
    cancelMapPreview,
    editLocationLoading,
    editLocation,
    fetchMapInfo,
    fetchMapInfoLoading,
   } = useLocationMap(data, [], ()=>navigate(-1))

   
  useEffect( () => getData(), []);

  useEffect( () => { 
  
      if(data[0]?.id){
        selectLocation(data[0].id)
        setAppointments(data[0].appointments)
      }
      
   }, [data]);


 function getData(){fetchAuthLocations()}


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
  context.selectAppointments =  (appointments)=>selectAppointments(appointments)

  console.log("locations: ", locations)

  const location = locations.length > 0 ? locations[0] : []

  return(<>
    <Routes>
      <Route path="/*" element={<>
          <PageLayout 
            leftPanel={<>
              <LoadingWrapper loading={fetchMapInfoLoading}>
                <MyMap
                  posts={locations}
                  startZoom= {17} 
                  selected ={selectedLocationId} 
                  handleSelectedLocation={selectLocation}/>      
              </LoadingWrapper>
            </>} 

            rightPanel={<>
                <LoadingWrapper loading={loading || editLocationLoading}>
                  <div className="body_locations">
                    <Routes>       
                        <Route path="/*" element={<>

                          <div className="location_card">
                            <LocationCard 
                              location={location} 
                              isLocationSelected={true} //replace this with an array of buttons to add to the card
                              handleSetEdit={()=>navigate("/STOREOWNER/edit_location")}/>
                          </div>
                                    
                        </>}/>
                        <Route path="/edit_location" element={<>

                          <div className="location_card">
                            <LocationForm
                              cancelForm={() =>navigate("/STOREOWNER")}
                              submitForm ={editLocation} 
                              form={ {...location} }
                              cancelMapPreview={cancelMapPreview}
                              fetchMapInfo={fetchMapInfo}                   
                              currentIcons={location.icons}/>  
                          </div>   

                        </>}/>       
                  </Routes>
                </div>
              </LoadingWrapper>
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






