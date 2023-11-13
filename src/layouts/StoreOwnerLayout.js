import { useAuth,useConfig,} from '../AuthProvider'
import {useState, useEffect, useMemo } from 'react'

import { MemoryRouter, Route, Routes, Navigate,Link } from "react-router";


import BodyPanel from '../components/BodyPanel'
import LocationList from '../components/LocationList'
import AppointmentList from '../components/AppointmentList'
import CalendarPanel from '../components/CalendarPanel'
import MyMap from '../components/Map.tsx'
import LoadingOverlay from '../components/LoadingOverlay'
import Header from '../components/Header'

import useIcons from '../hooks/useIcons'

import {useAppContext} from '../AppContextProvider'


import useLocations from '../hooks/useLocations'
//import DayTimePicker from '@mooncake-dev/react-day-time-picker';


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


function StoreOwnerLayout({
  startingMode = PageState.Map
}){

    const { loadingConfigs, } = useConfig();
    const { loadingUser  } = useAuth();
   // const { fetchLocations } = useAPI();

   const { fetchAuthLocations, loading } = useAPI();

    const [data, setData] = useState({});

    //const {selectedIcons,toggleIcon} = useIcons();

    //const [loading, setLoading] = useState(false);
    const [ mode, setMode ] = useState(  startingMode );
     /* track the id of the selected entity to update map/list*/
    const [selectedLocationId, setSelectedLocation] = useState(null);

    const [mapPreviewProps, setMapPreviewProps] = useState(null);

    const [selectedAppointments, setSelectedAppointments] = useState([]);

    function getData(){ 
        fetchAuthLocations({},(results)=>{
            setData({...results.posts[0]});
        })
    }

    useEffect( () => getData(), []);

    useEffect( () => { 

        if(data?.id){
            setSelectedLocation(data.id)
        }
        
    }, [data]);

    //useEffect( () => setSelectedLocation(), [data]);
   // console.log(data)
  const context = useAppContext();


  context.refetchLocations = () => getData()
  context.selectedLocationId = selectedLocationId
  context.selectLocation = (id) => setSelectedLocation(id)
  context.viewMapPreview = viewMapPreview
  context.cancelMapPreview = cancelMapPreview
  //context.selectedIcons =  selectedIcons
  //context.toggleIcon =  toggleIcon
  context.selectedCalendarDayAppointments = selectedCalendarDayAppointments

  function viewMapPreview(LatLng, info, title){
    //console.log("vsmi", lat, lng)
    setMapPreviewProps({LatLng:{...LatLng}, info, title})
  }

  function cancelMapPreview(){
    setMapPreviewProps(null)
  }


    function selectedCalendarDayAppointments(appointments = []){
      console.log("selectedCalendarDayAppointments: ", appointments)
      if(appointments?.length > 0){
        setSelectedAppointments([...appointments])
      }else{
        setSelectedAppointments([])
      } 
    
    }


    function getPageUI(selectedMode){
      
      switch(selectedMode){
          case PageState.Map:{
            

            let mapProps = {}

            if(mapPreviewProps){

                console.log("sampleLocation", mapPreviewProps)

                mapProps = {
                    posts: [{...mapPreviewProps, id: "mapPreviewProps"}] ,
                    selected: "mapPreviewProps" ,
                    startZoom: 17 ,
                    centerLat: mapPreviewProps.LatLng.lat,
                    centerLng :mapPreviewProps.LatLng.lng,
                    handleSelectedLocation: ()=>{}
                }
         
            }else{

                mapProps = {
                    posts: data.LatLng ? [{...data}] : [], 
                    startZoom: 17 ,
                    selected: selectedLocationId ,
                    handleSelectedLocation: (id)=>setSelectedLocation(id)
                }         
            }

            console.log("mapProps", mapProps)

            return {
              leftPanel:<>
                <MyMap  {...{...mapProps}}/> 
              </>,
              rightPanel: <>
                <BodyPanel 
                    startingMode={BodyPanelState.Location}
                    filteredLocations={[{...data}]}
                    isToggleable={true}
                    loading={loading}/>
              </>} 
          }   
          case PageState.Calendar:{

             // appointments = selectedAppointments

            return {
              leftPanel:<>
                <CalendarPanel appointments={data?.appointments ? data.appointments : []}/>
              </>,
              rightPanel:<>
                    <BodyPanel 
                        startingMode={BodyPanelState.Appointment}
                        appointments={selectedAppointments}
                        icons={data.icons}
                        loading={loading}/>
              </>}  
          }  
          default: return <></>
      }
    }

    const { leftPanel, rightPanel } = getPageUI(mode)

    //console.log("storeowner: ", data)

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
            handleSetMapPage={()=>setMode(PageState.Map)}
            handleSetCalendarPage={()=>{
                setMode(PageState.Calendar)
                cancelMapPreview()}
            }/>
          {rightPanel} 
        </div>

      </div>
    </>);
  }

export default StoreOwnerLayout;