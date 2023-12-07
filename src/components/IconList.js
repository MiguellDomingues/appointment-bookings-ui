import {cloneElement } from 'react'

import {Icons} from '../hooks/useIcons'

function IconList({
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