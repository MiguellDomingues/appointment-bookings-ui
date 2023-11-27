import {useState, useEffect, } from 'react'

import {useAuth} from '../AuthProvider'

import MyMap from '../components/Map.tsx'
import PageLayout from '../layouts/PageLayout';
import LocationList from '../components/LocationList'

import useIcons from '../hooks/useIcons'
import useLocationMap from '../hooks/useLocationMap';

import useAPI from '../useAPI.js'
import API from '../API'

import {useAppContext } from '../AppContextProvider'

import '../styles.css';


const PageState = Object.freeze({
  Map: "Map",
  Registration: "Registration",
  LogOn: "LogOn"
});

function GuestLayout({
  startingMode = PageState.Map
}){

    const {
      fetchGuestLocations, 
      loading 
    } = useAPI(
        API.fetchGuestLocations,
        (results)=>setData([...results.posts])
      );

    const [data, setData] = useState([]);

    const {selectedIcons,toggleIcon} = useIcons();

    const [ mode, setMode ] = useState(  startingMode );

    const { filteredLocations,selectedLocationId,selectLocation,} = useLocationMap(data, selectedIcons)

    useEffect( () => getData(), []);

    const context = useAppContext();

    context.refetchLocations = () => getData()
    context.selectedLocationId = selectedLocationId
    context.selectLocation = selectLocation
    context.selectedIcons =  selectedIcons
    context.toggleIcon =  toggleIcon

    context.links = [
      {
        name: "Home",
        handler: ()=>setMode(PageState.Map)
      },
      {
        name: "Log In",
        handler: ()=>setMode(PageState.LogOn)
      },
      {
        name: "Register",
        handler: ()=>setMode(PageState.Registration)
      },
    ]


    function getData(){
      fetchGuestLocations()
    }


    function getPageUI(selectedMode){
      
      switch(selectedMode){
          case PageState.Map:{
            return {
              leftPanel:<>
                <MyMap 
                  posts={filteredLocations} 
                  selected={selectedLocationId} 
                  handleSelectedLocation={selectLocation} /> 
              </>,
              rightPanel: <>         
                  <LocationList {...{loading}}
                  locations={filteredLocations}/>            
              </>} 
          }
          case PageState.LogOn:{
            return {
              leftPanel:<>
                <MyMap 
                  posts={filteredLocations} 
                  selected={selectedLocationId} 
                  handleSelectedLocation={selectLocation} /> 
              </>,
              rightPanel: <>         
                  <Authentication/>             
              </>} 
          }
          case PageState.Registration:{
            return {
              leftPanel:<>
                <MyMap 
                  posts={filteredLocations} 
                  selected={selectedLocationId} 
                  handleSelectedLocation={selectLocation} /> 
              </>,
              rightPanel: <>         
                            Register  
              </>} 
          }      
          default: return <></>
      }
    }

    const { leftPanel, rightPanel } = getPageUI(mode)

    return(<>
      <PageLayout leftPanel={leftPanel} rightPanel={rightPanel}/>
    </>)
  }

export default GuestLayout

function Authentication(){

  const {setToken, token} = useAuth()

  const {startSession, loading } = useAPI(
    API.startSession, 
    (result)=>{
      console.log("log in user:", result)
  });


  const handleLogInUser = () =>{
    startSession()
  }

  return(<>
      <button onClick={e=>handleLogInUser()}>Log on as User</button>
      <button onClick={e=>console.log("log in storeowner")}>Log on as Store Owner</button>
  </>);
}


//credentials: {username: "a", password: "a"} ,