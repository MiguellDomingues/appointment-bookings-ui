import moment from "moment";
import { momentLocalizer } from "react-big-calendar";
import {useState, useMemo, useEffect } from 'react'

import useAPI from '../useAPI.js'
import API from '../API'

import Week from "react-big-calendar/lib/Week";
import PropTypes from "prop-types";
import React from "react";
import TimeGrid from "react-big-calendar/lib/TimeGrid";

moment.locale("en-CA");
const localizer = momentLocalizer(moment);

const defaultWorkingPlan = [
    {
        day: "Monday",
        start: "",
        end:   "",
    },
    {
        day: "Tuesday",
        start: "",
        end:   "",
    },
    {
        day: "Wednesday",
        start: "",
        end:   "",
    },
    {
        day: "Thursday",
        start: "",
        end:   "",
    },
    {
        day: "Friday",
        start: "",
        end:   ""
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
  
///////////////////////////////visual scedualer/////////////////////////////////////
  
function createCloseIntervals(workingPlan = []){
  
    if(workingPlan.length !== 7){
      throw new Error("createCloseIntervals(workingPlan) workingPlan must be an array with the 7 days of the week from Monday to Sunday")
    }

    const timeStrToHoursMinutes = (timeStr) => ({h: parseInt(timeStr.split(":")[0]), m: parseInt(timeStr.split(":")[1])})

    const isEqual = (t1, t2) => t1.h === t2.h && t1.m === t2.m

    const createCloseInterval = (closeIntervals, startHM, endHM, weekStart) => {
      closeIntervals.push({
        id: closeIntervals.length, 
        start: new Date("2023", 10, weekStart, startHM.h , startHM.m , 0, 0), 
        end: new Date("2023", 10, weekStart, endHM.h, endHM.m, 0, 0), 
      })
    }

      //find the min/max start/end times across all the stores 
    function getMinMaxWorkingPlanTimes(workingPlan){

      const hourMinutestoTotalMinutes = timeString => parseInt(timeString.split(":")[0])*60 + parseInt(timeString.split(":")[1])
      const totalMinutesToHoursMinutes = totalMins => ({h: Math.floor(totalMins/60) , m: totalMins%60})

      if(!workingPlan.some(wp=>wp.start && wp.end)){ //when working plan does not have at least a single set open/close time
        return { startMin: {h:0, m:0}, endMax: {h:23, m:59} }
      }

      let minMinutes =   hourMinutestoTotalMinutes("23:59")
      let maxMinutes =  hourMinutestoTotalMinutes("00:00")

      workingPlan.forEach((wp)=>{
        const {start, end} = wp

        if(start && end){
          minMinutes = Math.min(hourMinutestoTotalMinutes(start), minMinutes)
          maxMinutes = Math.max(hourMinutestoTotalMinutes(end), maxMinutes)
        }
      })

      return { startMin: totalMinutesToHoursMinutes(minMinutes), endMax: totalMinutesToHoursMinutes(maxMinutes)}
    }

      //we want to find the time steps (in minutes) betwen each box for a 24 hour work day such that it does not scroll the screen 
    function getTimeSlotStep(startMin, endMax){

        const TIME_SLOT_BOXES = 20 //number of boxes we want on the screen at once to prevent scrolling
        const TIME_SLOT_STEP_CHOICES = [15,30,60] //the minutes for each time slot size

        const HMToMinutes = (time) => (time.h*60)+time.m
        const f = (minutes, slotSize) => Math.abs( TIME_SLOT_BOXES - (minutes/slotSize) )

        const timeDiff = HMToMinutes(endMax) - HMToMinutes(startMin)

        let min = Number.MAX_SAFE_INTEGER, step = null
    
        TIME_SLOT_STEP_CHOICES.forEach(tlsc=>{
        let diff = f(timeDiff, tlsc)
        if(diff < min){
            min = diff
            step = tlsc
        }
        })
                
        return step;
    }


    const {startMin, endMax} = getMinMaxWorkingPlanTimes(workingPlan)


    const closeIntervals = []

    let weekStart = 20, i = 0 //start at day 20 (monday) and count until the 26 (sunday)
    let weekEnd = weekStart+7 //18 to 25 is mondays, tuesday.... to sunday

    while(weekStart < weekEnd){ //for each day of the week

        const {start, end} = workingPlan[i] 

        if(start && end){ //if the store is open (start and end are not empty strings)

        const startHoursMinutes = timeStrToHoursMinutes(start) //convert HM to total minutes
        
        if(!isEqual(startHoursMinutes, startMin)){  
            createCloseInterval(closeIntervals, startMin, startHoursMinutes, weekStart)
        }

        const endHoursMinutes = timeStrToHoursMinutes(end)
        
        if(!isEqual(endHoursMinutes, endMax)){
        createCloseInterval(closeIntervals, endHoursMinutes, endMax, weekStart)
        }
        }
        else{ //otherwise mark the entire day as clossed
        createCloseInterval(closeIntervals, startMin, endMax, weekStart)    
        }

        i++;

        weekStart++;
    
    }    

    return { closeIntervals , startMin, endMax, timeStep: getTimeSlotStep(startMin, endMax)}

}

function createBreakIntervals(breaks = []){

    const daysOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    const breakIntervals = []

    const timeStrToHoursMinutes = (timeStr) => ({h: parseInt(timeStr.split(":")[0]), m: parseInt(timeStr.split(":")[1])})

    breaks.forEach(b=>{
        const {days, start, end} = b
        //console.log(start, end)
        days.forEach((day)=>{

        const dayOffSet = daysOfTheWeek.indexOf(day)

        if(dayOffSet === -1){
            throw new Error(`createBreakIntervals(): string "${day}" inside days:[..] is not a valid day abbreviation`)
        }

        const dayOfTheWeek = 20+dayOffSet

        const startHoursMinutes = timeStrToHoursMinutes(start) //convert HM to total minutes      
        const endHoursMinutes = timeStrToHoursMinutes(end)

        breakIntervals.push({
            id: breakIntervals.length + 100, 
            start: new Date("2023", 10, dayOfTheWeek, startHoursMinutes.h , startHoursMinutes.m , 0, 0), 
            end: new Date("2023", 10, dayOfTheWeek, endHoursMinutes.h, endHoursMinutes.m, 0, 0), 
            isBreak: true,
            title: "Break"
        })                  
        })
    })

    return breakIntervals      
}

function getAvailabilityPropsFromData(dataArr = []){
    return {
        locationId: dataArr[0] ? dataArr[0].id : null,
        workingPlan: dataArr[0] ? dataArr[0].workingPlan : defaultWorkingPlan,
        breaks: dataArr[0] ? dataArr[0].breaks : [],
        serviceDurations: dataArr[0] ? dataArr[0].serviceDurations : [],
    }
}

function useAvailability(dataArr = []){

    ////////////////////////states
    const [locationId, setLocationId] = useState(null)
    const [workingPlan, setWorkingPlan] = useState([...defaultWorkingPlan])
    const [serviceDurations, setServiceDurations] = useState([])
    const [breaks, setWorkingBreaks] = useState([])

    ////////////////////////calendar apperence data///////////////
    const {closeIntervals, startMin, endMax, timeStep} =  useMemo( ()=>createCloseIntervals(workingPlan), [workingPlan])
    const breakIntervals =  useMemo( ()=>createBreakIntervals(breaks), [breaks])

    ////////////////////////on load and refetches, retreive the availability props from data///////////////
    useEffect( () => { 
        //console.log("useavail use effect")
        const {workingPlan, breaks, serviceDurations,locationId } = getAvailabilityPropsFromData(dataArr);
        setLocationId(locationId)
        setWorkingPlan([...workingPlan]);
        setWorkingBreaks([...breaks]);
        setServiceDurations([...serviceDurations]);
    }, [dataArr]);

    const { 
        updateWorkingPlan, 
        loading: loadingUpdateWorkingPlan
    } = useAPI(
            API.updateWorkingPlan,
            ({wp_id, start, end}) => setWorkingPlan((workingPlan)=> 
                [ ...workingPlan.map((wp)=> 
                    wp.id===wp_id ? {id: wp_id, day: wp.day, start: start, end: end} : wp)])); //on successful working plan update, update the UI state

    const { 
        postBreak, 
        loading: loadingpostBreak
    } = useAPI
            (API.postBreak,
            ({days, start, end, break_id})=> setWorkingBreaks((workingBreaks)=>
                [ ...workingBreaks, {days, start, end, id: break_id}]));  //on successful break delete, update the UI state

    const { 
        deleteBreak, 
        loading: loadingdeleteBreak
    } = useAPI(
            API.deleteBreak,
            ({break_id})=> setWorkingBreaks((workingBreaks)=>
                [...(workingBreaks.filter(wb=>wb.id!==break_id) )])); //on successful break add, update the UI state

    const { 
        updateServiceDuration,
        loading: loadingupdateServiceDuration
    } = useAPI(
            API.updateServiceDuration,
            ({sd_id, new_duration})=> setServiceDurations((serviceDurations)=>
                [ ...serviceDurations.map((sd)=>
                    sd.id===sd_id ? {id: sd_id, duration: new_duration, service: sd.service} : sd)])); //on successful service duration update , update the UI state
 
     
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
  
    const eventPropGetter = (event, start, end, isSelected) => ({ //override some CSS for the event containers
        className: `RBC_events_override ${event.isBreak ? ` RBC_break_interval_override ` : ` RBC_close_interval_override `}` 
    })

    const formats = { 
        eventTimeRangeFormat: (event, culture, localizer) => "",                        //removes the start/end time strings from each event
        dayFormat: (date, culture, localizer) =>localizer.format(date, 'ddd', culture), //change the day columns to only display the day of the week
    }

    return {
        calendarProps: {
            min: new Date("2023", 10, 20, startMin.h, startMin.m, 0, 0),
            max: new Date("2023", 10, 20, endMax.h, endMax.m, 0, 0),
            
            formats:            formats,
            localizer:          localizer,
            defaultDate:        new Date("2023", 10, 20, 0, 0, 0, 0),
            defaultView:        "work_week",
            events:             closeIntervals,
            step:               timeStep,
            toolbar:            false,
            views:              {work_week: MyWorkWeek},
            eventPropGetter:    eventPropGetter,
            backgroundEvents:   breakIntervals,
            //timeslots={2}
            //style={}
            onSelectEvent:      (event) => console.log("clicked event "),
            onSelectSlot:       ()=>console.log("clicked Slot")   
        },
        workingPlanListProps: {
            workingPlan,
            updateWorkingPlanDay: (...props) => updateWorkingPlan(...props, locationId),//updateWorkingPlan, //re-alias callout names to match cmp prop names
            loading: loadingUpdateWorkingPlan
        },
        breakListProps: {
            breaks,
            deleteWorkingBreak: (...props) => deleteBreak(...props, locationId), //inject the location_id into the callouts
            addWorkingBreak:    (...props) => postBreak(...props, locationId),   //this avoids having to pass the id into the cmps
            loading: loadingpostBreak || loadingdeleteBreak
        },
        serviceDurationListProps: {
            serviceDurations, 
            loading: loadingupdateServiceDuration,
            updateServiceDuration,
        }
    }


}

export default useAvailability

//boilerplate to override the calendar apperence
const workWeekRange = (date, options) =>([
    new Date("2023", 10, 20, 0, 0 , 0, 0),
    new Date("2023", 10, 21, 0, 0 , 0, 0),
    new Date("2023", 10, 22, 0, 0 , 0, 0),
    new Date("2023", 10, 23, 0, 0 , 0, 0),
    new Date("2023", 10, 24, 0, 0 , 0, 0),
    new Date("2023", 10, 25, 0, 0 , 0, 0),
    new Date("2023", 10, 26, 0, 0 , 0, 0),
  ])

  //override default work week so it shows all 7 days of the week monday->sunday
  class MyWorkWeek extends React.Component {
    render() {
      let { date, ...props } = this.props;
      let range = workWeekRange(date, this.props);
      return <TimeGrid {...props} range={range} eventOffset={15} />;
    }
  }
  
  MyWorkWeek.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired
  };
  
  MyWorkWeek.defaultProps = TimeGrid.defaultProps;
  
  MyWorkWeek.range = workWeekRange;
  
  MyWorkWeek.navigate = Week.navigate;
  
  MyWorkWeek.title = (date, { localizer }) => {
    let [start, ...rest] = workWeekRange(date, { localizer });
    return localizer.format({ start, end: rest.pop() }, "dayRangeHeaderFormat");
  };
  