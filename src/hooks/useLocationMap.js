import {useState, useEffect, useMemo } from 'react'

function useLocationMap(data = [], selectedFilters = []){

    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [mapPreviewProps, setMapPreviewProps] = useState(null);
    const [locations, setLocations] = useState([...data]);

    useEffect( () => { setLocations([...data]) }, [data]);

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

    function viewMapPreview(LatLng, info, title){
        //console.log("vsmi", lat, lng)
        setMapPreviewProps({LatLng:{...LatLng}, info, title})
    }
    
    function cancelMapPreview(){
        setMapPreviewProps(null)
    }
    
    function getMapProps(){
        let mapProps = {}
    
        if(mapPreviewProps){
    
           // console.log("sampleLocation", mapPreviewProps)
    
            mapProps = {
                posts: [{...mapPreviewProps, id: "mapPreviewProps"}] ,
                selected: "mapPreviewProps" ,
                startZoom: 17 ,
                centerLat: mapPreviewProps.LatLng.lat,
                centerLng :mapPreviewProps.LatLng.lng,
                handleSelectedLocation: ()=>{}
            }
      
        }else{
    
            mapProps = {
                posts: locations,
                startZoom: 17 ,
                selected: selectedLocationId ,
                handleSelectedLocation: (id)=>setSelectedLocationId(id)
            }         
        }
    
       // console.log("mapProps", mapProps)
    
        return mapProps
    
    }

    return {
        locations, 
        filteredLocations,
        selectedLocationId,
        selectLocation: (id)=>setSelectedLocationId(id),
        getMapProps,
        viewMapPreview,
        cancelMapPreview,
    }
}

export default useLocationMap;