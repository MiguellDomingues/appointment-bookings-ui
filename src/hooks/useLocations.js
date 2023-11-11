import {useState, useMemo } from 'react'

function useLocations(locations = [], selectedFilters = []){

    const [selectedLocationId, setSelectedLocationId] = useState(null);

    const filteredLocations = useMemo( ()=>filterLocationsBySelectedIcons(locations, selectedFilters) , [locations,selectedFilters])

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

    return{
        selectedLocationId,
        locations,
        filteredLocations,
        selectLocation: (id)=>setSelectedLocationId(id)
    }

}

export default useLocations;