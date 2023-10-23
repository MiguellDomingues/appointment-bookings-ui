import {useState, useEffect, useMemo } from 'react'

import { useAuth, AuthProvider,useConfig, } from './AuthProvider'

import LocationList from './components/LocationList'
import AppointmentList from './components/AppointmentList'
import MyMap from './components/Map.tsx'

import { IconList, Icons } from './components/IconList'

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

  function getIconsForLocations(locations = []){ //create a list of possible icons for the locations
    const locationIcons = []
    locations.forEach((location)=>{ //for each location
      location?.icons?.forEach((icon)=>{ //for each icon describing a location
        !locationIcons.includes(icon) && locationIcons.push(icon) //
      })
    })

    return locationIcons;
  }

  function toggleIcon(icon_key = ""){

    console.log(icon_key)
    if(!Object.keys(Icons).includes(icon_key)){
      return
    }
   
    if(selectedIcons.includes(icon_key)){
     // setSelectedIcons(...selectedIcons.filter(icon=>icon !== icon_key) )
      setSelectedIcons( (selectedIcons)=>selectedIcons.filter(icon=>icon !== icon_key) )
    }else{
     // setSelectedIcons([...selectedIcons, icon_key])
      setSelectedIcons( (selectedIcons)=>[...selectedIcons, icon_key] )
    }
  }

  function filterLocationsBySelectedIcons(locations = [], selected_icons = []){

    if(selected_icons.length === 0){
      return locations;
    }

    const filtered_locations = [];
    locations.forEach((location)=>{
      location.icons.some((location_icon)=>{
        if(selected_icons.includes(location_icon)){
          filtered_locations.push(location)
          return true;
        }else{
          return false;
        }})
    })

    return filtered_locations;
  }

  return (<>     
        <Header refetchLocations={getPosts}/>
        <Body
          locations={filterLocationsBySelectedIcons(data,selectedIcons)}

          locationsIcons={getIconsForLocations(data)}
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
  locationsIcons = [],
  selectedIcons = [],
  
  selectLocation = ()=>{}, 
  refetchLocations = ()=>{},
  toggleIcon = () =>{}
}){

  const { isUser, isStoreOwner } = useAuth();

  function getSelectedLocationAppointments(location_id){

    console.log("selected: ", location_id)

    const selected_location = locations.find(({id})=>id === location_id)

    if(!location_id){ //if no location is selected
      return [];
    }
    return selected_location?.appointments
  }



  return(
  <div className="body">

    <div className="body_map">
      {/*<MyMap posts={locations} selected={selected} handleSelectedLocation={selectLocation} />*/}
    </div>

    <div className="body_locations">
      <div className="icon_filter_container">
        <IconList 
          iconSize={20}
          icons={locationsIcons}
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
          appointments={getSelectedLocationAppointments(selectedLocation)} 
          selectedLocationId={selectedLocation}
          refetchLocations={refetchLocations}/> : 
        <></>}
    </div>

  </div>);
}