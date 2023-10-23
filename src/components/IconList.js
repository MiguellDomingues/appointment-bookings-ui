import {cloneElement } from 'react'

import { FaWrench, FaOilCan, FaCarBattery} from 'react-icons/fa';
import { MdLocalCarWash, MdOutlineCarRepair} from 'react-icons/md';
import { GiMechanicGarage } from 'react-icons/gi';

export const Icons = Object.freeze({
    MdOutlineCarRepair: <MdOutlineCarRepair/>,
    FaWrench: <FaWrench/>,
    FaOilCan: <FaOilCan/>,
    MdLocalCarWash: <MdLocalCarWash/>,
    GiMechanicGarage: <GiMechanicGarage/>,
    FaCarBattery: <FaCarBattery/>,
});

export function IconList({
    icons = [],
    selectedIcons = [],
    toggleIcon = () =>{},
    iconSize = 16
}){

    const css = (icon) => selectedIcons.includes(icon) ? "selected_icon" : ""
    
    return(<div className="icon_list_container">
        {icons.map((k, idx)=>
            <div key={idx} className={css(k)} onClick={e=>toggleIcon(k)}>
                {cloneElement(Icons[k], {size: iconSize})}
            </div>)}
    </div>);
}

export default IconList;