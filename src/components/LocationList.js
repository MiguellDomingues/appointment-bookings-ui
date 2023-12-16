import IconList from './IconList'

import {useAppContext} from '../AppContextProvider'

import { getDisabledIconsForLocations, getIcons } from '../hooks/useIcons'

import LoadingOverlay from './LoadingOverlay'

import '../styles.css';

function LocationList({
    locations = [],
    loading = false,
    renderLocationCard = ()=><></>
}){
  
    const { selectedIcons, toggleIcon} = useAppContext()

    const disabledIcons = getDisabledIconsForLocations(locations);

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
           
            
            {locations.map( (location)=>{return renderLocationCard(location)})}

        </div>
    </>)
}

export default LocationList
