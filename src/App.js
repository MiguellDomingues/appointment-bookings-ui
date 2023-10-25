import {useState, useEffect, useMemo } from 'react'

import { useAuth, AuthProvider,useConfig, } from './AuthProvider'

import LocationList from './components/LocationList'
import AppointmentList from './components/AppointmentList'
import MyMap from './components/Map.tsx'

import { IconList, getIcons } from './components/IconList'

import useAPI from './useAPI'
import './styles.css';

const accounts = [
  {
    type: null,
    credentials: null,
    loading: true,
    error: false,
  },
  {
    type: null,
    credentials:  {username: "aal;'la", password: "al;';l'aa"},
    loading: true,
    error: false,
  },
  {
    type: null,
    credentials: {username: "a", password: "a"} ,
    loading: true,
    error: false,
  }, 
  {
    type: null,
    credentials: {username: "d", password: "d"},
    loading: true,
    error: false,
  },         

]

function App() {

  const [users, setUsers] = useState(accounts)
  const [selectedPage, setSelectedPage] = useState(0)

  useEffect(()=>{}, [])

 function handleUserLoginError(idx){
  return function(err){
    console.log("err log in: ", idx, err)
    users[idx].error = true
    setUsers([...users]);
  }
 }

 function handleUserLoginSuccess(idx){
  return function(token){
    //console.log("idx: ", idx, " token: ", token)

    if(token){
      users[idx].type = token.type
    }else{
      users[idx].type = "GUEST"
      users[idx].loading = false
    }

    setUsers([...users]);
  }
 }

 function handleUserLoginFinally(idx){
  return function(){
    users[idx].loading = false
    setUsers([...users]);
  }
 }


  return (<>

        <div className="user_picker">
          <div>select a user</div> 
          {users.map( (account,idx)=>
            <button 
              key={idx} 
              onClick={ !account.error ? e=>{setSelectedPage(idx)} : e=>{} }
              disabled={account.error}>
              {account.loading ? "loading..." : account.error ? "error": account.type}
            </button>)} 
        </div>

        {users.map( (account,idx)=>
            <AuthProvider      
              key={idx}       
              credentials={account.credentials} 
              onLogInSuccess={handleUserLoginSuccess(idx)}
              onLogInError={handleUserLoginError(idx)}
              onLogInFinally={handleUserLoginFinally(idx)}>
                <div className={idx === selectedPage ? "show_view page_wrapper" : "hide_view page_wrapper"}><UserView/></div>
            </AuthProvider>
          )}
      </>);
}

export default App;

function UserView(){

  const { config } = useConfig()
  const { token } = useAuth();

  const { fetchLocations, loading } = useAPI()

  const [data, setData] = useState([]);

   /* track the id of the selected entity to update map/list*/
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedIcons, setSelectedIcons] = useState([]);

  //const locationsIcons = useMemo(() => getLocationIcons(data), [data]);

  useEffect( () => getPosts(), [token, config]);

  function getPosts(){
    fetchLocations().then((results)=>{setData(results.posts)})
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
   
    if(selectedIcons.includes(icon_key)){
     // setSelectedIcons(...selectedIcons.filter(icon=>icon !== icon_key) )
      setSelectedIcons( selectedIcons=>selectedIcons.filter(icon=>icon !== icon_key) )
    }else{
     // setSelectedIcons([...selectedIcons, icon_key])
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

  return (<>     
        <Header refetchLocations={getPosts}/>
        <Body
          locations={filterLocationsBySelectedIcons(data,selectedIcons)}

          disabledIcons={getDisabledIconsForLocations(data)}
          toggleIcon={toggleIcon}
          selectedIcons={selectedIcons}

          selectedLocation={selectedLocation}
          selectLocation={(id)=>{setSelectedLocation(id)}}
          refetchLocations={getPosts}/>
        <Footer/>   
  </>);
  
}

function Header({refetchLocations}){

  const { token } = useAuth();

  return( <div className="header">
    {token && token?.username ? <>Welcome{token.username}</> : <></> }
    <button onClick={e=>refetchLocations()}>Refresh</button>
  </div>);
}

function Footer(){
  return( <div className="footer"> </div>  );
}

function Body({
  locations = [], 
  selectedLocation = null, 
  selectedIcons = [],
  disabledIcons = [],
  
  selectLocation = ()=>{}, 
  refetchLocations = ()=>{},
  toggleIcon = () =>{}
}){

  const { isUser, isStoreOwner } = useAuth();

  function getSelectedLocationAppointmentsIcons(locations = [], location_id = null){

    console.log("selected: ", location_id)

    const selected_location = locations.find(({id})=>id === location_id)

    if(!selected_location){ //if no location was found, return empty list
      return {};
    }
    return { appointments: selected_location.appointments, icons: selected_location.icons}
  }

  const { appointments, icons } =  getSelectedLocationAppointmentsIcons(locations, selectedLocation)

  return(
  <div className="body">

    <div className="body_map">
      {/*<MyMap posts={locations} selected={selected} handleSelectedLocation={selectLocation} />*/}
    </div>

    <div className="body_locations">
      <div className="icon_list_container">
          <IconList 
            iconSize={24}
            disabledIcons={disabledIcons}
            icons={getIcons()}
            selectedIcons={selectedIcons }
            toggleIcon={toggleIcon}/>
      </div>
      <LocationList 
        locations={locations}  
        selectedLocationId={selectedLocation}  
        selectLocation={selectLocation}
        refetchLocations={refetchLocations}/>

      {isUser() || isStoreOwner() ? //only show the appointments to user, storeowner user types
        <AppointmentList 
          {...{appointments, icons, refetchLocations}}
          selectedLocationId={selectedLocation}/> : 
        <></>}
    </div>

  </div>);
}