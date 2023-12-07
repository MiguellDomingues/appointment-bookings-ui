import IconList from './IconList'
import LocationCard from './LocationCard'

import {useAppContext} from '../AppContextProvider'

import { getDisabledIconsForLocations, getIcons } from '../hooks/useIcons'

import LoadingOverlay from './LoadingOverlay'

import '../styles.css';

function LocationList({
    locations = [],
    loading = false
   // selectedLocationId = null
}){
  
    const { selectedLocationId, 
        selectedIcons, 
        toggleIcon, 
        selectLocation } = useAppContext()

    const disabledIcons = getDisabledIconsForLocations(locations);

    const isLocationSelected = (location_id) => selectedLocationId === location_id

    return(<>
        <div className="body_locations">

            <LoadingOverlay 
                isLoading={loading} 
                isFullscreen={false}
                loadingText={"Loading Data"}/>

            
            <div className="icon_list_container">
                <IconList 
                    iconSize={24}
                    disabledIcons={disabledIcons}
                    icons={getIcons()}
                    selectedIcons={selectedIcons}
                    toggleIcon={toggleIcon}/>
            </div>
           
            
            {locations.map( (location, idx)=>
                <div className={`location_card ${isLocationSelected(location.id) ? `location_card_selected` : ""}`}  onClick={e=>selectLocation(location.id)}>
                    <LocationCard
                        key={idx}
                        isLocationSelected={isLocationSelected(location.id)}
                        location={location}/> 
                 </div>
            )}

        </div>
    </>)
}

export default LocationList
