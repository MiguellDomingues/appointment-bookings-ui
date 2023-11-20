import Calendar from 'react-calendar';

import {useState, useMemo, useEffect } from 'react'

import {IconList} from './IconList'

import {useAppContext} from '../AppContextProvider'
import 'react-calendar/dist/Calendar.css';
import '../styles.css';

//convert react-calendar date to a YYYY-MM-DD string
const dateToYYYYMMDDString = (date) => (date.toISOString().split('T')[0] )

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

function CalendarPanel({
    appointments = []
}){

    const {  selectCalendarDayAppointments } = useAppContext();

    const groupedAppointments = useMemo(() => groupAppointmentsByDate(appointments), [appointments]);

    const [selectedDay, setSelectedDay] = useState(new Date());

    useEffect(()=>{ //when app first renders, set the appointments to appear in right panel to todays appointments
        selectCalendarDayAppointments(getGroupedAppointmentsByDate(selectedDay))
    }, [])

    //when all appointments are updated from a refresh, refresh the calendarDayAppointments so the appointmentlist rerenders
    useEffect(()=>{  
        selectCalendarDayAppointments(getGroupedAppointmentsByDate(selectedDay))
    }, [appointments])


    function handleSelectDay(date){
        selectCalendarDayAppointments(getGroupedAppointmentsByDate(date))
        setSelectedDay(date)
    }

    const getGroupedAppointmentsByDate = (date) => groupedAppointments[dateToYYYYMMDDString(date)]

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
   // console.log("calced data", groupedAppointments)

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