import { useAuth,useConfig,} from '../AuthProvider'
import {useState, useEffect, useMemo } from 'react'
import moment from "moment";

import { Calendar, momentLocalizer } from "react-big-calendar";

import Week from "react-big-calendar/lib/Week";
import PropTypes from "prop-types";
import React from "react";
import TimeGrid from "react-big-calendar/lib/TimeGrid";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { nanoid } from 'nanoid'

import WorkingPlanList   from '../components/WorkingPlanList'
import BreakList   from '../components/BreakList'
import ServiceDurationList   from '../components/ServiceDurationList'

import BodyPanel from '../components/BodyPanel'

import CalendarPanel from '../components/CalendarPanel'
import MyMap from '../components/Map.tsx'
import LoadingOverlay from '../components/LoadingOverlay'
import Header from '../components/Header'


import {useAppContext} from '../AppContextProvider'

import useAPI from '../useAPI'
import '../styles.css';



const mockWorkingPlan = [
  {
      day: "Monday",
      start: "08:00",
      end:   "16:00",
  },
  {
      day: "Tuesday",
      start: "06:00",
      end:   "16:00",
  },
  {
      day: "Wednesday",
      start: "08:00",
      end:   "18:00",
  },
  {
      day: "Thursday",
      start: "08:00",
      end:   "16:00",
  },
  {
      day: "Friday",
      start: "12:15",
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

let mockBreaks = [
  {
      days: ["Mon", "Tue", "Wed", "Thu","Fri"],
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

const mockServiceDurations = [
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



const PageState = Object.freeze({
  Map: "Map",
  Calendar: "Calendar",
  Availability: "Availability"
});

 const BodyPanelState = Object.freeze({
  Location: "Location",
  Appointment: "Appointment",
});

moment.locale("en-CA");
const localizer = momentLocalizer(moment);


function StoreOwnerLayout({
  startingMode = PageState.Map
}){

    const { loadingConfigs, } = useConfig();
    const { loadingUser  } = useAuth();
   // const { fetchLocations } = useAPI();

   const { fetchAuthLocations, loading } = useAPI();

    const [data, setData] = useState({});


    const [ mode, setMode ] = useState(  startingMode );

    // for location selection//////////////////////////////
     /* track the id of the selected entity to update map/list*/
    const [selectedLocationId, setSelectedLocation] = useState(null);
     // for appointments//////////////////////////////

       // for location address previwing//////////////////////////////
    const [mapPreviewProps, setMapPreviewProps] = useState(null);


    function viewMapPreview(LatLng, info, title){
      //console.log("vsmi", lat, lng)
      setMapPreviewProps({LatLng:{...LatLng}, info, title})
    }
  
    function cancelMapPreview(){
      setMapPreviewProps(null)
    }
  
      // //////////////////////////////



       // for appointment selections ////////////////////////////
    const [selectedAppointments, setSelectedAppointments] = useState([]);

    //updates the calendar
    function selectedCalendarDayAppointments(appointments = []){
      console.log("selectedCalendarDayAppointments: ", appointments)
      if(appointments?.length > 0){
        setSelectedAppointments([...appointments])
      }else{
        setSelectedAppointments([])
      } 
    
    }
        // ////////////////////////////


    //for data fetching///////////////
    function getData(){ 
        fetchAuthLocations({},(results)=>{
            setData({...results.posts[0]});
        })
    }

    useEffect( () => getData(), []);

    useEffect( () => { 

        if(data?.id){
            setSelectedLocation(data.id)
        }
        
    }, [data]);

    
////////////////////////////availability forms state

const [serviceDurations, setServiceDurations] = useState([...mockServiceDurations])

function updateServiceDuration(id, duration){
    serviceDurations[id].duration = duration
    setServiceDurations((_serviceDurations)=>[ ..._serviceDurations ])
}

const [workingPlan, setWorkingPlan] = useState([...mockWorkingPlan])

function updateWorkingPlanDay(day, start, end){
    setWorkingPlan((workingPlan)=>[ ...workingPlan.map((wp)=>wp.day===day ? {day, start, end} : wp)  ])
}

const [breaks, setWorkingBreaks] = useState(()=>{
  //console.log("mockBreaks" , mockBreaks)
  const  _mockBreaks = mockBreaks.map((b)=>( {...b, id: nanoid() } )) //temp
  return [..._mockBreaks]
})


function deleteWorkingBreak(id){
  setWorkingBreaks((workingBreaks)=>[...(workingBreaks.filter(wb=>wb.id!==id) )])
}

function addWorkingBreak(days, start, end){
  setWorkingBreaks((workingBreaks)=>[ ...workingBreaks, {days, start, end, id: nanoid()}])
}


////////////////////////////////////////////////////

  const context = useAppContext();
  context.refetchLocations = () => getData()
  context.selectedLocationId = selectedLocationId
  context.selectLocation = (id) => setSelectedLocation(id)
  context.viewMapPreview = viewMapPreview
  context.cancelMapPreview = cancelMapPreview
  //context.selectedIcons =  selectedIcons
  //context.toggleIcon =  toggleIcon
  context.selectedCalendarDayAppointments = selectedCalendarDayAppointments
  context.handleConfigureAvailability = () =>setMode(PageState.Availability)


    function getPageUI(selectedMode){
      
      switch(selectedMode){
          case PageState.Map:{
            

            let mapProps = {}

            if(mapPreviewProps){

                console.log("sampleLocation", mapPreviewProps)

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
                    posts: data.LatLng ? [{...data}] : [], 
                    startZoom: 17 ,
                    selected: selectedLocationId ,
                    handleSelectedLocation: (id)=>setSelectedLocation(id)
                }         
            }

            console.log("mapProps", mapProps)

            return {
              leftPanel:<>
                <MyMap  {...{...mapProps}}/> 
              </>,
              rightPanel: <>
                <BodyPanel 
                    startingMode={BodyPanelState.Location}
                    filteredLocations={[{...data}]}
                    isToggleable={true}
                    loading={loading}/>
              </>} 
          }   
          case PageState.Calendar:{

             // appointments = selectedAppointments

            return {
              leftPanel:<>
                <CalendarPanel appointments={data?.appointments ? data.appointments : []}/>
              </>,
              rightPanel:<>
                    <BodyPanel 
                        startingMode={BodyPanelState.Appointment}
                        appointments={selectedAppointments}
                        icons={data.icons}
                        loading={loading}/>
              </>}  
          }  
          case PageState.Availability:

          //create the events which decorate the calendar with time intervals that show the stores close hours
          //constraint: startMin must be > endMax
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

          const eventPropGetter = (event, start, end, isSelected) => ({ //override some CSS for the event containers
            className: `RBC_events_override ${event.isBreak ? ` RBC_break_interval_override ` : ` RBC_close_interval_override `}` 
          })

          const formats = { 
            eventTimeRangeFormat: (event, culture, localizer) => "",                        //removes the start/end time strings from each event
            dayFormat: (date, culture, localizer) =>localizer.format(date, 'ddd', culture), //change the day columns to only display the day of the week
          }

          const {closeIntervals, startMin, endMax, timeStep} = createCloseIntervals(workingPlan)
          const breakIntervals = createBreakIntervals(breaks)

            //console.log(createBreakIntervals(breaks))




            /*

            updating the days in a week for the workweek view:
              https://codesandbox.io/s/z2jqpmlr14?file=/src/Calendar.component.js

            slotGroupPropGetter: pass css to each time slot
            eventPropGetter: pass css to each event
            backgroundEvents: events that can be stacked on top of other events



            */

       



          return {
            leftPanel:<>
             <Calendar
              //views={["work_week"]} //{["day", "agenda", "work_week", "month"]}
              min={new Date("2023", 10, 20, startMin.h, startMin.m, 0, 0)}
              max={new Date("2023", 10, 20, endMax.h, endMax.m, 0, 0)}
              //selectable
              formats={formats}
              localizer={localizer}
              defaultDate={new Date("2023", 10, 20, 0, 0, 0, 0)}
              defaultView="work_week"
              events={ closeIntervals}
              step={timeStep}
              toolbar={false}
              views = {{work_week: MyWorkWeek}}
              eventPropGetter={eventPropGetter}
              backgroundEvents={breakIntervals}
              //timeslots={2}
              //style={}
              onSelectEvent={(event) => console.log("clicked event ")}
              onSelectSlot={()=>{console.log("clicked Slot")}}/>
            </>,
            rightPanel:<>
              <WorkingPlanList {...{workingPlan,updateWorkingPlanDay}}/>
              <BreakList {...{breaks, deleteWorkingBreak, addWorkingBreak}}/>
              <ServiceDurationList {...{serviceDurations,updateServiceDuration }}/>
            </>}  
 
          default: return <></>
      }
    }

    const { leftPanel, rightPanel } = getPageUI(mode)

    //console.log("storeowner: ", data)

    return (<>     

    <LoadingOverlay 
      isLoading={loadingConfigs} 
      isFullscreen={true}
      loadingText={"Loading Configurations..."}/>

    <LoadingOverlay 
      isLoading={loadingUser} 
      isFullscreen={true}
      loadingText={"Authenticating..."}/>

      <div className="page">
  
        <div className="page_section_left">
          {leftPanel}
        </div>
  
        <div className="page_section_right">
          <Header 
            refetchLocations={getData} 
            refetching={loading}
            handleSetAvailabilityPage={()=>setMode(PageState.Availability)} 
            handleSetMapPage={()=>setMode(PageState.Map)}
            handleSetCalendarPage={()=>{
                setMode(PageState.Calendar)
                cancelMapPreview()}
            }/>
          {rightPanel} 
        </div>

      </div>
    </>);
  }

export default StoreOwnerLayout;





const workWeekRange = (date, options) =>([
  new Date("2023", 10, 20, 0, 0 , 0, 0),
  new Date("2023", 10, 21, 0, 0 , 0, 0),
  new Date("2023", 10, 22, 0, 0 , 0, 0),
  new Date("2023", 10, 23, 0, 0 , 0, 0),
  new Date("2023", 10, 24, 0, 0 , 0, 0),
  new Date("2023", 10, 25, 0, 0 , 0, 0),
  new Date("2023", 10, 26, 0, 0 , 0, 0),
])

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



