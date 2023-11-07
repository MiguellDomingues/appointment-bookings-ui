import Calendar from 'react-calendar';

import { useAuth,} from '../AuthProvider'

import {useState, useMemo } from 'react'

import {IconList} from './IconList'

import {useAppContext} from '../AppContextProvider'

const appointmentsByDMY = {
    "2023-11-6": [
        {
            locationId: "abc",
            apointee: "peter",
            types: ['FaWrench', 'FaCarBattery', "FaOilCan","MdLocalCarWash"],
            start: "10:30",
            end:   "11:30"
        },
        {
            locationId: "def",
            apointee: "tom",
            types: ["MdLocalCarWash"],
            start: "8:00",
            end:   "9:00"
        },
        {
            locationId: "ghi",
            apointee: "jon",
            types: ['FaCarBattery', "FaOilCan"],
            start: "13:45",
            end:   "14:45"
        },
    ],
    "2023-11-7": [
        {
            locationId: "jkl",
            apointee: "peter",
            types: ['FaWrench', 'FaCarBattery', "FaOilCan","MdLocalCarWash"],
            start: "11:15",
            end:   "12:00"
        },
        {
            locationId: "mno",
            apointee: "tom",
            types: ["MdLocalCarWash","GiMechanicGarage","FaCarBattery"],
            start: "14:00",
            end:   "15:00"
        },
    ],
    "2023-11-8":  [
        {
            locationId: "pqr",
            apointee: "thomas",
            types: ['FaWrench', 'FaCarBattery', "MdLocalCarWash"],
            start: "15:25",
            end:   "16:14"
        },
    ],

}

function CalendarPanel({
    appointments = []
}){

    //const {  isUser, isStoreOwner } = useAuth();

    const {  selectedCalendarDayAppointments } = useAppContext();

    const groupedAppointments = useMemo(() => groupAppointmentsByDate(appointments), [appointments]);

    const [selectedDay, setSelectedDay] = useState(new Date());

    const dateToYYYYMMDDString = (date) => (date.toISOString().split('T')[0] )

    function handleSelectDay(date){
        selectedCalendarDayAppointments(groupedAppointments[dateToYYYYMMDDString(date)])
        setSelectedDay(date)
    }

    /*
        - group a list of appointments by date
        - each appointment is a deep-copy
        input:  [{date: a}, {date: b}, {date: c}, {date: a}]
        output: {"a": [{...},{...}], "b": {...}, "c": [{...}]}
    */
    function groupAppointmentsByDate(appointments){

        console.log("RECALC ")

        /*
            - sort the appointment start times on each date key by earliest->latest
            input:  {"a": [{start: "12:10"},{start: "6:10"}], "b": [{start: "6:10"}], }
            output: {"a": [{start: "6:10"},{start: "12:10"}], "b": [{start: "6:10"}], }
        */
        function sortGroupedAppointmentsByEarliestStart(groupedAppointments){

            //input:  a string representing the hours/minutes time between 0:0 and 23:59 inclusive
            //output: an int representation of the hours/minutes time between 0 and 2359 inclusive
            const timeStringToInteger = (time_str) =>{
                const split = time_str.split(":")
                return parseInt(`${split[0]}${split[1]}`)
            }
    
            //sort each days appointments from earliest to latest start times
            Object.keys(groupedAppointments).forEach(dateKey=>{
                groupedAppointments[dateKey].sort((apt1,apt2)=>timeStringToInteger(apt1.start) - timeStringToInteger(apt2.start))
            })
    
            return groupedAppointments
        }

        const groupedAppointments = {};

        appointments.forEach((appointment)=>{

            if(!groupedAppointments[appointment.date]) 
                groupedAppointments[appointment.date] = [];
            
            groupedAppointments[appointment.date].push({ //push a copy of the appointment
                ...appointment, 
                appointment_types: [...appointment.appointment_types] 
             });
        })

        return sortGroupedAppointmentsByEarliestStart(groupedAppointments);
    }

    //the appointments on a calendar tile
    function tileAppointments({ date, view }) {

       // const getTodaysAppointments = (calendarDate, appointmentDates) => Object.keys(appointmentDates).find( DMY=> new Date(DMY).toDateString() === calendarDate?.toDateString() )
        const todaysAppointments = groupedAppointments[dateToYYYYMMDDString(date)] 

        return (<>
            <div className="appointments_slot">
                {todaysAppointments ?
                    <CalendarTile tileAppointments={ todaysAppointments}/> 
                : <></>}
            </div>
        </>);
    }

    //the day of the month displayed on the calendar
    function tileDay(locale, date){
        return (
            <div className="date_slot">
                <div>{date.toDateString().split(" ")[2]}</div>
            </div>)
    }

   // console.log("static data", appointmentsByDMY)
    console.log("calced data", groupedAppointments)

    return(<>

        <Calendar 
          className="calendar_wrapper"
          //activeStartDate={null}
          //defaultActiveStartDate={null}
          formatDay={tileDay}
          onChange={handleSelectDay} 
          value={selectedDay} 
          tileClassName={ ()=> "calendar_appointments_wrapper"} //react-calendar__tile--now
          tileContent={tileAppointments}
          minDate={new Date()}
        />
    

    </>);

}

function CalendarTile({
    tileAppointments = []
}){
    //console.log(tileAppointments )
    return(<>
        {tileAppointments.map(({start, appointment_types}, idx)=>
            <div className="columns" key={idx}>
                <div className="calendar_appointment_icons"><IconList iconSize={11} icons={appointment_types}/></div>
                <div className="calendar_appointment_time">{`${start}`}</div>           
            </div>)}
    </>);
}

export default CalendarPanel;