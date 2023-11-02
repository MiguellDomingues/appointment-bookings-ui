import { useAuth,useConfig,} from '../AuthProvider'
import {useState, useEffect, useMemo } from 'react'

import CircleLoader from "react-spinners/ClipLoader";

import LocationList from './LocationList'
import AppointmentList from './AppointmentList'
import MyMap from './Map.tsx'
import { IconList, getIcons } from './IconList'

import {useAppContext} from '../AppContextProvider'

import useAPI from '../useAPI'
import '../styles.css';

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

const BodyPanelState = Object.freeze({
    Location: "Location",
    Appointment: "Appointment"
});

function UserView({
  startingMode = BodyPanelState.Location
}){

    const { config, loadingConfigs, loadingUser } = useConfig();
    const { token, isUser, isStoreOwner } = useAuth();
    const { fetchLocations } = useAPI();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ mode, setMode ] = useState( startingMode );
     /* track the id of the selected entity to update map/list*/
    const [selectedLocationId, setSelectedLocation] = useState(null);

    useEffect( () => getData(), [token, config]);

  const val = useAppContext();

  val.handleManageAppointments = () =>setMode(BodyPanelState.Appointment)
  val.refetchLocations = () => getData()
  val.selectedLocationId = selectedLocationId
  val.selectLocation = (id) => setSelectedLocation(id)

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
 
    const { appointments, icons } =  getSelectedLocationAppointmentsIcons(data, selectedLocationId);

    //const isLocationSelected = () => selectedLocationId !== null;

    function getUI(selectedMode){      
      switch(selectedMode){
          case BodyPanelState.Location:
              return <>
                <div className="body_panel body_locations">
                  <LocationList 
                    {...{selectedLocationId}}
                    locations={data}
                    selectLocation={ (id)=>setSelectedLocation(id) }
                    handleManageAppointments={()=>setMode(BodyPanelState.Appointment)}/>
                </div>
              </>
          case BodyPanelState.Appointment:
              return <>
                  <div className="body_panel body_appointments">
                    <button onClick={e=>setMode(BodyPanelState.Location)} className="cancel_new_appointment_btn">X</button>
                    <AppointmentList 
                      {...{appointments, icons, selectedLocationId}}
                      refetchLocations={getData}/> 
                  </div>
              </>
          default: return <></>
      }
    }

    return (<>     

      {loadingConfigs || loadingUser ? 
        <div className="model">
            <div className="loading_container">
                <CircleLoader
                    color={"#ffffff"}
                    loading={true}
                    cssOverride={{display: "block",margin: "0 auto"}}
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"/>   
                <div className="loading_text">
                    {loadingConfigs ? "Loading Configurations..." : "Authenticating..."}
                </div>
            </div> 
        </div> 
      : <></>}
  
      <div className="page">
  
        <div className="page_section_left">
          {/*<MyMap 
            posts={locations} 
            selected={selectedLocationId} 
            handleSelectedLocation={(id)=>setSelectedLocation(id)} /> */}
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

    const override = {
        display: "block",
        opacity: .5,
        margin: "0 auto",
        borderColor: "black",
      };
  
    return( 
    <div className="header">
      <span>
      {loadingUser ? 
        <>Athenticating....</> : 
        <>Welcome {token && token?.username ? <>{token.username}</> : <>Guest</> }    
      </>}
      </span>
      
      <span> <button disabled={refetching} onClick={e=>refetchLocations()}>Refresh</button> </span>
      <span>{refetching ? 
        <div>
            fetching data
            <CircleLoader
                color={"#ffffff"}
                loading={true}
                cssOverride={override}
                size={15}
                aria-label="Loading Spinner"
                data-testid="loader"/>      
        </div> 
      : <>fetching data done</>}</span> 
    </div>);
  }
  

  export default UserView;