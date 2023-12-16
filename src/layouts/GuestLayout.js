import {useState, useEffect, } from 'react'

import MyMap from '../components/Map.tsx'
import PageLayout from '../layouts/PageLayout';
import LocationList from '../components/LocationList'
import LocationCard from '../components/LocationCard'

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

    const { filteredLocations,selectedLocationId,selectLocation,isLocationSelected} = useLocationMap(data, selectedIcons)

    useEffect( () => getData(), []);

    const context = useAppContext();

    context.refetchLocations = () => getData()
    //context.selectedLocationId = selectedLocationId
    //context.selectLocation = selectLocation
    context.selectedIcons =  selectedIcons
    context.toggleIcon =  toggleIcon

    context.links = [
      {
        name: "Home",
        route: "/"
      },
    ]


    function getData(){
      fetchGuestLocations()
    }

    const renderLocationCard = (location) =>
      <div key={location.id} className={`location_card ${isLocationSelected(location.id) ? `location_card_selected` : ""}`}  onClick={e=>selectLocation(location.id)}>
        <LocationCard 
          isLocationSelected={isLocationSelected(location.id)} 
          location={location} 
          buttons={[]}/>
        </div>

   
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
                  <LocationList {...{loading}} locations={filteredLocations} renderLocationCard={renderLocationCard}/> 
              </>}/>    
            </>}/>
      </Routes>
    </>)
}

export default GuestLayout