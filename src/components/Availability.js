
import WorkingPlanList   from './WorkingPlanList'
import BreakList   from './BreakList'
import ServiceDurationList   from './ServiceDurationList'

import { nanoid } from 'nanoid'

const operatingHours = [
    {
        day: "Monday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Tuesday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Wednesday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Thursday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Friday",
        start: "09:15",
        end:   "14:30"
    },
    {
        day: "Saturday",
        start: "",
        end:   ""
    },
    {
        day: "Sunday",
        start: "",
        end:   ""
    },
]

let breaks = [
    {
        days: ["Mon", "Tue", "Wed", "Thu","Fri", "Sat", "Sun"],
        start: "10:15",
        end: "10:30"
    },
    {
        days: ["Mon", "Tue", "Wed", "Thu",],
        start: "12:00",
        end: "13:00"
    },
    {
        days: ["Fri"],
        start: "11:00",
        end: "11:30"
    },
]

const serviceDurations = [
    {
       type: "MdOutlineCarRepair",
       duration: "45"
    },
    {
        type: "FaWrench",
        duration: "25"
     },
     {
        type: "FaOilCan",
        duration: "30"
     }, 
]

function Availability({
    locationIcons = []
}){

    breaks = breaks.map((b)=>( {...b, id: nanoid() } )) //temp

    return(<>
        <WorkingPlanList {...{operatingHours}}/>
        <BreakList {...{breaks}}/>
        <ServiceDurationList {...{serviceDurations }}/>
    </>);

}

export default Availability;