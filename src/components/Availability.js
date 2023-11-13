import {getIconByKey}   from './IconList'


const workingPlan = [
    {
        day: "Monday",
        start: "8:00 AM",
        end:   "4:00 PM",
    },
    {
        day: "Tuesday",
        start: "8:00 AM",
        end:   "4:00 PM",
    },
    {
        day: "Wednesday",
        start: "8:00 AM",
        end:   "4:00 PM",
    },
    {
        day: "Thursday",
        start: "8:00 AM",
        end:   "4:00 PM",
    },
    {
        day: "Friday",
        start: "9:15 AM",
        end:   "2:30 PM"
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

const breaks = [
    {
        days: ["Mon", "Tue", "Wed", "Thu"],
        start: "10:15 AM",
        end: "10:30 AM"
    },
    {
        days: ["Mon", "Tue", "Wed", "Thu",],
        start: "12:00 PM",
        end: "1:00 PM"
    },
    {
        days: ["Fri"],
        start: "11:00 PM",
        end: "11:30 PM"
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

const abbreviatedDays = Object.freeze({
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  });



function Availability({
    locationIcons = []
}){


    return(<>
        <WorkingPlanList/>
        <BreaksList/>
        <ServiceDurations/>
    </>);

}
//<div className="table_container table_border ">
function WorkingPlanList({}){

    return(<> 
        <table className="table_border">
        <caption className="table_title">Working Plan</caption>
            <tbody>
                <tr>    
                    <th>Day</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Action</th>
                </tr>
                
                {workingPlan.map(({day, start, end}, idx)=>
                    <tr key={idx} className="table_row">
                        <td>{day}</td>
                        <td>{start || " -- : -- "}</td>
                        <td>{end || " -- : -- "}</td>
                        <td><button>Edit</button></td>
                    </tr>)}
            </tbody>
        </table> 
    </>);
}

function BreaksList({}){

    return(<>
         <table className="table_border">
            <caption className="table_title">Breaks</caption>
            <tbody>
                <tr>    
                    <th>Days</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Action</th>
                </tr>
                
                {breaks.map(({days, start, end}, idx)=>
                    <tr key={idx} className="table_row">
                        <td>{days.join(' ,')}</td>
                        <td>{start}</td>
                        <td>{end}</td>
                        <td>Edit</td>
                    </tr>)}
            </tbody>
        </table>   
    </>);
}

function ServiceDurations({}){
    return(<>
         <table className="table_border">
            <caption className="table_title">Service Durations</caption>
            <tbody>

                <tr>    
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Action</th>
                </tr>
                
                {serviceDurations.map(({type, duration}, idx)=>
                    <tr key={idx} className="table_row">
                        <td>{getIconByKey(type)}</td>
                        <td>{duration}</td>
                        <td>Edit</td>                      
                    </tr>)}
            </tbody>
        </table>   
    </>);
}

export default Availability;