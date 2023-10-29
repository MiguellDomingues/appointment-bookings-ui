import { useAuth,useConfig,} from '../AuthProvider'
import {useState, useEffect, useMemo } from 'react'

import CircleLoader from "react-spinners/ClipLoader";

import LocationList from './LocationList'
import AppointmentList from './AppointmentList'
import MyMap from './Map.tsx'
import { IconList, getIcons } from './IconList'

import useAPI from '../useAPI'
import '../styles.css';

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

function UserView(){

    const { config, loadingConfigs, loadingUser } = useConfig();
    const { token, isUser, isStoreOwner } = useAuth();
    
    const { fetchLocations } = useAPI();
  
    const [data, setData] = useState([]);

    const [loading, setLoading] = useState(false);
  
     /* track the id of the selected entity to update map/list*/
    const [selectedLocationId, setSelectedLocation] = useState(null);
    const [selectedIcons, setSelectedIcons] = useState([]);
  
    //const locationsIcons = useMemo(() => getLocationIcons(data), [data]);
  
    useEffect( () => getData(), [token, config]);
  
    function getData(){ 
        setLoading(true)

        setTimeout(async ()=>{
            fetchLocations()
                .then((results)=>{setData(results.posts)})
                .catch((err)=>console.log("error getting data", err))
                .finally(()=>{setLoading(false)});
        }, randomIntFromInterval(1000, 3000))  
    }
  
    //create a list of disabled icons for the locations that were fetched
    //an icon is disabled when it doesnt exist in any of the locations
    function getDisabledIconsForLocations(locations = []){ 
      const locationIcons = [] //first generate a list of icons that exist across all locations
  
      locations.forEach((location)=>{ //for each location
        location?.icons?.forEach((icon)=>{ //for each icon describing a location
          if(!locationIcons.includes(icon)){  //if the icon is not present in the return list, add it
            locationIcons.push(icon) 
          }
        })
      })
  
      //get the icons that dont exist in any of the locations
      return  getIcons().filter(icon=>!locationIcons.includes(icon))
    }
  
    function toggleIcon(icon_key = ""){
  
      console.log(icon_key)
      if(!getIcons().includes(icon_key)){
        return
      }
     
      if(selectedIcons.includes(icon_key)){ //toggle icon
        setSelectedIcons( selectedIcons=>selectedIcons.filter(icon=>icon !== icon_key) )
      }else{ //add icon
        setSelectedIcons( selectedIcons=>[...selectedIcons, icon_key] )
      }
    }
  
    //only show locations that contain at least 1 of the icons in the icon list
    function filterLocationsBySelectedIcons(locations = [], selected_icons = []){
  
      if(selected_icons.length === 0){ //if no icons selected, show all locations
        return locations;
      }
  
      const filtered_locations = [];
      locations.forEach((location)=>{                 // for each location ...
        location.icons.some((location_icon)=>{          // for each icon describing the location...
          if(selected_icons.includes(location_icon)){     // if that icon is present in the selected icon list...
            filtered_locations.push(location)               // add that location to the output array...
            return true;                                    // and check the next location (otherwise we add the same location multiple times)
          }else{
            return false;                                 // otherwise check the next icon
          }})
      })
  
      return filtered_locations;
    }
  
    function getSelectedLocationAppointmentsIcons(locations = [], location_id = null){
  
      console.log("selected: ", location_id)
  
      const selected_location = locations.find(({id})=>id === location_id)
  
      if(!selected_location){ //if no location was found, return empty list
        return {};
      }
      return { appointments: selected_location.appointments, icons: selected_location.icons}
    }
  
    const locations = filterLocationsBySelectedIcons(data,selectedIcons);
    const disabledIcons = getDisabledIconsForLocations(data);
    const { appointments, icons } =  getSelectedLocationAppointmentsIcons(locations, selectedLocationId);

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
          {<MyMap 
            posts={locations} 
            selected={selectedLocationId} 
            handleSelectedLocation={(id)=>setSelectedLocation(id)} />}
        </div>
  
        <div className="page_section_right">
  
          <Header refetchLocations={getData} refetching={loading}/>
  
          <div className="body_locations">
  
            <div className="icon_list_container">
                <IconList 
                  iconSize={24}
                  disabledIcons={disabledIcons}
                  icons={getIcons()}
                  selectedIcons={selectedIcons}
                  toggleIcon={toggleIcon}/>
            </div>
            
            <LocationList 
              {...{locations, selectedLocationId}} 
              selectLocation={ (id)=>setSelectedLocation(id) }
              refetchLocations={getData}/>
  
            {isUser() || isStoreOwner() ? //only show the appointments to user, storeowner user types
              <AppointmentList 
                {...{appointments, icons, selectedLocationId}}
                refetchLocations={getData}/> 
                : <></>}
          </div>
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