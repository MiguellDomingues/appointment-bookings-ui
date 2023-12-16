import {useState, useEffect } from 'react'

import { useLocation } from "react-router-dom";

import PageLayout from '../layouts/PageLayout';

import MyMap from '../components/Map.tsx'
import LocationList from '../components/LocationList'
import AppointmentList from '../components/AppointmentList'
import LocationCard from '../components/LocationCard'
import ModalWrapper from '../components/ModalWrapper'
import AppointmentBooking from '../components/AppointmentBooking'

import useIcons  from '../hooks/useIcons'
import useLocationMap from '../hooks/useLocationMap';
import useAPI from '../useAPI.js'


import API from '../API'

import {useAppContext} from '../AppContextProvider'

import { Routes, Route, useNavigate  } from "react-router-dom";

import '../styles.css';

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



function UserLayout(){

  const [data, setData] = useState([]);


  const loc = useLocation()

  console.log("//////// ", loc)

  const [allAppointments, setAllAppointments] = useState([]);

  const navigate = useNavigate();

  //const { fetchAuthLocations, loading } = useAPI(API.fetchAuthLocations);

  const { 
    fetchAuthLocations, 
    loading
   } = useAPI(
      API.fetchAuthLocations, 
      (results)=>setData([...results.posts]),
      (err)=>{},
      ()=>{},
   )


  const { selectedIcons, toggleIcon} = useIcons();
  const { filteredLocations, selectedLocationId, selectLocation,isLocationSelected} = useLocationMap(data, selectedIcons)
  const [ isOpen, setOpen ] = useState(false)

  //useEffect( () => { setAllAppointments(mergeLocationAppointments(data)) }, [data]);


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
      name: "Home",
      link: "/USER"
    },
  ]

  function getData(){fetchAuthLocations()}

  let { appointments, icons } =  getSelectedLocationAppointmentsIcons(data, selectedLocationId);

  const locationCardButtons = [
    {
      text: "View Appointments",
      handler: ()=>navigate("/USER/location_appointments")
    },
    {
      text: "Book Appointment",
      handler: ()=>setOpen(true)//navigate("/USER/location_appointments")
    }
  ]

  /* render props are like small wrappers around components which are then passed in to children which call the fn
     here we define a define a render prop by hooking up isLocationSelected and locationCardButtons fns
     this avoids needing to propdrill and makes the cmp more reusable
     then definie a fn which takes a location and is called inside the LocationList loop 
  */
  function getLocationById(locations = [], location_id = null){

    if(locations?.length === 0 || !location_id) return null

    //console.log(locations, location_id)

    return locations.find(location=>location.id === location_id)
  }  

  const renderLocationCard = (location) =>
    <div key={location.id} className={`location_card ${isLocationSelected(location.id) ? `location_card_selected` : ""}`}  onClick={e=>selectLocation(location.id)}>
      <LocationCard 
        isLocationSelected={isLocationSelected(location.id)} 
        location={location} 
        buttons={locationCardButtons}/>
    </div>

    console.log(filteredLocations)
  
  return(<>

    <ModalWrapper isOpen={isOpen} close={()=>setOpen(false)}>              
        <AppointmentBooking location={getLocationById(filteredLocations, selectedLocationId)}/>                         
    </ModalWrapper>   

    <Routes>
      <Route 
        path="/*" 
        element={<>
          <PageLayout 
            leftPanel={<>
            <MyMap 
              posts={filteredLocations} 
              selected={selectedLocationId} 
              handleSelectedLocation={selectLocation}/> 
            </>} 
            rightPanel={<>
                <Routes>
                  <Route 
                    path="/*"
                    element={<>
                    <LocationList 
                      locations={filteredLocations} 
                      loading={loading} 
                      renderLocationCard={renderLocationCard}/></>}/>
                  <Route path="/location_appointments" element={<> 
                      <button onClick={e=>navigate(-1)} className="cancel_panel_btn">X</button>
                        <AppointmentList 
                          appointments={[...appointments]} 
                          icons={[...icons]} 
                          loading={loading}/> 
                    </>}/>
                </Routes>
            </>}/>    
          </>}/>
    </Routes>    
  </>)
}

export default UserLayout;

