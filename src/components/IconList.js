import {cloneElement } from 'react'

import { FaWrench, FaOilCan, FaCarBattery} from 'react-icons/fa';
import { MdLocalCarWash, MdOutlineCarRepair} from 'react-icons/md';
import { GiMechanicGarage } from 'react-icons/gi';

const Icons = Object.freeze({
    MdOutlineCarRepair: <MdOutlineCarRepair/>,
    FaWrench: <FaWrench/>,
    FaOilCan: <FaOilCan/>,
    MdLocalCarWash: <MdLocalCarWash/>,
    GiMechanicGarage: <GiMechanicGarage/>,
    FaCarBattery: <FaCarBattery/>,
});

export const getIconByKey = (iconName) => Icons[iconName]

export const getIcons = () => Object.keys(Icons)

export function IconList({
    icons = [],
    disabledIcons = [],
    selectedIcons = [],
    toggleIcon = () =>{},
    iconSize = 16
}){

    const isIconDisabled = (icon) => disabledIcons.includes(icon)
    const isIconSelected = (icon) => selectedIcons.includes(icon)

    function getCSS(icon){
        if(isIconSelected(icon)) return "selected_icon"
        if(isIconDisabled(icon)) return "disabled_icon"
        return ""
    }

    return(<>
        {icons.map((k, idx)=>
            <span key={idx} 
                 className={getCSS(k)} 
                 onClick={e=>!isIconDisabled(k) && toggleIcon(k)}>
                    {cloneElement(Icons[k], {size: iconSize})}
            </span>)}
    </>);
}

export default IconList;