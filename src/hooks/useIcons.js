
import {useState } from 'react'

import { getIcons } from '../components/IconList'

function useIcons(startingIcons = []){

    const [selectedIcons, setSelectedIcons] = useState(startingIcons);

    function toggleIcon(icon_key = "", ){
        if(!getIcons().includes(icon_key))
            return   ;
        if(selectedIcons.includes(icon_key))
            setSelectedIcons( selectedIcons=>selectedIcons.filter(icon=>icon !== icon_key) );
        else
            setSelectedIcons( selectedIcons=>[...selectedIcons, icon_key] );
    }

    function toggleIconSingle(icon_key = ""){
        if(!getIcons().includes(icon_key))   
            return;
        if(selectedIcons.includes(icon_key)) 
            clearIcons();
        else              
            setSelectedIcons([icon_key])  ;   
    }  

    function getDisabledIconsForLocations(locations = []){ 
        const locationIcons = [];
    
        locations.forEach((location)=>{ //for each location
          location?.icons?.forEach((icon)=>{ //for each icon describing a location
            if(!locationIcons.includes(icon)){  //if the icon is not present in the return list, add it
              locationIcons.push(icon) ;
            }
          })
        })
    
        //get the icons that dont exist in any of the locations
        return  getIcons().filter(icon=>!locationIcons.includes(icon))
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

    function clearIcons(){
        setSelectedIcons([]);
    }



    return {
        selectedIcons,
        toggleIcon,
        toggleIconSingle,
        clearIcons,
        getDisabledIconsForLocations,
        filterLocationsBySelectedIcons,
    }
}

export default useIcons;