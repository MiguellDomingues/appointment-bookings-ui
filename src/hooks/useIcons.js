
import {useState } from 'react'

import { FaWrench, FaOilCan, FaCarBattery} from 'react-icons/fa';
import { MdLocalCarWash, MdOutlineCarRepair} from 'react-icons/md';
import { GiMechanicGarage } from 'react-icons/gi';

//import { getIcons } from '../components/IconList'

export function getDisabledIconsForLocations(locations = []){ 
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

export const Icons = Object.freeze({
    MdOutlineCarRepair: <MdOutlineCarRepair/>,
    FaWrench: <FaWrench/>,
    FaOilCan: <FaOilCan/>,
    MdLocalCarWash: <MdLocalCarWash/>,
    GiMechanicGarage: <GiMechanicGarage/>,
    FaCarBattery: <FaCarBattery/>,
});

export const getIconByKey = (iconName) => Icons[iconName]

export const getIcons = () => Object.keys(Icons)

export function useIcons(startingIcons = []){

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

    function clearIcons(){
        setSelectedIcons([]);
    }

    return {
        selectedIcons,
        toggleIcon,
        toggleIconSingle,
        clearIcons,
    }
}

export default useIcons;