import {useState, useEffect, useMemo, useRef } from 'react'

import useAPI from '../useAPI'
import API from '../API'

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

const getLocationPropsFromData = dataArr => 
    dataArr.map(data=>({
        LatLng:{...data.LatLng },
        address: data.address,
        city: data.city,
        country: data.country,
        email: data.email,
        id: data.id,
        icons: [...data.icons],
        info: data.info,
        phone: data.phone,
        postal_code: data.postal_code,
        province: data.province,
        title: data.title,
}))


function useLocationMap(dataArr = [], selectedFilters = [], navHome){

    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [locations, setLocations] = useState(getLocationPropsFromData(dataArr));

    const originalLocation = useRef(null); //when i switch pages, the address is not replaced. i need to reset the map when the page changes
    //put map preview in its own path? storeowner/edit_location/map_preview?
    //put map preview into its own hook


    useEffect( () => { setLocations(getLocationPropsFromData(dataArr)) }, [dataArr]);

    const filteredLocations = useMemo( ()=>filterLocationsBySelectedIcons(locations, selectedFilters) , [locations,selectedFilters])

    const {
        loading: editLocationLoading, 
        editLocation,
     } = useAPI(
            API.editLocation, 
            ({location})=>{
                console.log("edit location success", location)
                setLocations([{...location}])
                navHome()
            }
        );

    const {
        loading: fetchMapInfoLoading, 
        fetchMapInfo,
        } = useAPI(
            API.fetchMapInfo, 
            ({ success, results, status})=>{
                console.log(success)
                console.log(results)
                console.log(status)
    
                if(!success || status !== "OK"){
                    throw new Error(" fetchMapInfo API error")          
                }else{
                    //do the swap here
                    console.log(results[0].geometry.location)

                    const previewLatLng = results[0].geometry.location

                    originalLocation.current = [{...locations[0], LatLng: {...locations[0].LatLng}}]

                    console.log("locs",locations)
                    console.log("ref loc",originalLocation.current)

                    setLocations(locations=>[{...locations[0], LatLng: {...previewLatLng}}])
                }
        
            },
            (err)=>{ console.log("error callback map: ", err)}
        );

    function cancelMapPreview(){
        if(originalLocation.current){
            setLocations([{...originalLocation.current[0]}])
            originalLocation.current = null
        }    
    }
    
    return {
        locations, 
        filteredLocations,
        selectedLocationId,
        selectLocation: (id)=>setSelectedLocationId(id),
        cancelMapPreview,
        editLocationLoading,
        editLocation,
        fetchMapInfo,
        fetchMapInfoLoading,
    }
}

export default useLocationMap;

