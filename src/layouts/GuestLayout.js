import {useState, useEffect, } from 'react'

import {useAuth} from '../AuthProvider'

import MyMap from '../components/Map.tsx'
import PageLayout from '../layouts/PageLayout';
import LocationList from '../components/LocationList'

import LoadingOverlay         from '../components/LoadingOverlay'

import useIcons from '../hooks/useIcons'
import useLocationMap from '../hooks/useLocationMap';

import useAPI from '../useAPI.js'
import API from '../API'

import {useAppContext } from '../AppContextProvider'

import { Routes, Route, } from "react-router-dom";

import '../styles.css';

function GuestLayout(){

    const {
      fetchGuestLocations, 
      loading 
    } = useAPI(
        API.fetchGuestLocations,
        (results)=>setData([...results.posts])
      );

    const [data, setData] = useState([]);

    const {selectedIcons,toggleIcon} = useIcons();

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
        route: "/"
      },
      {
        name: "Log In",
        route: "/login"
      },
      {
        name: "Register",
        route: "/register"
      },
    ]


    function getData(){
      fetchGuestLocations()
    }

return(<>
  <Routes>
      <Route 
        index
        element={<>
          <PageLayout 
            leftPanel={<>
            <MyMap 
                posts={filteredLocations} 
                selected={selectedLocationId} 
                handleSelectedLocation={selectLocation} /> 
            </>} 
            rightPanel={<>
                <LocationList {...{loading}} locations={filteredLocations}/> 
            </>}/>    
          </>}/>
      <Route 
        path={`login`} 
        element={<>
          <PageLayout 
            leftPanel={<>
              <MyMap 
                posts={filteredLocations} 
                selected={selectedLocationId} 
                handleSelectedLocation={selectLocation}/>           
            </>} 
            rightPanel={<>
                <Authentication/>   
            </>}/> 
        </>}/>
      <Route 
        path={`register`} 
        element={<>
        <PageLayout 
          leftPanel={<>
            <MyMap 
              posts={filteredLocations} 
              selected={selectedLocationId} 
              handleSelectedLocation={selectLocation} /> 
          </>} 
          rightPanel={<>
            Register 
          </>}/> 
      </>}/>
    </Routes>
  </>)
}

export default GuestLayout

function Authentication(){

  const { setToken } = useAuth()

  const {startSession, loading } = useAPI(
    API.startSession, 
    (result)=>{
      const {key, path, type} = result
      setToken({key, path, type})
      console.log("log in user:", result)
  });


  const handleStartSession = (user_name, password) =>{
    startSession(user_name, password)
  }

  return(<>

        <LoadingOverlay 
          isLoading={loading} 
          isFullscreen={true}
          loadingText={"Authenticating..."}/>

      <button onClick={e=>handleStartSession("a", "a")}>Log on as User</button>
      <button onClick={e=>handleStartSession("d", "d")}>Log on as Store Owner</button>
  </>);
}
