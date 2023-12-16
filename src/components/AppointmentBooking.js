import {useState} from 'react'

import IconList from '../components/IconList'
import LoadingWrapper from '../components/LoadingWrapper'

import {useIcons,getIconByKey}  from '../hooks/useIcons'

import useAPI from '../useAPI.js'
import API from '../API'

/*
plan for appointment bookings:

user clicks Book Appointment to open the modal
- do a callout to backend w location_id, selected service
- clicking next moonth on the calendar will do another callout for the next month

- backend looks at location appointments with date/time = today/now up to end of the month and status = requested, status = confirmed
- get the location breaks
- get the location working plan

- now we need to look at the days, start/end times of each appointment, the breaks and workingplan to construct a sceduale that the client consumes to construct a calendar where:
    - the non-working days are unselectable
    - each day is colored:
        green: 75%-100% availability
        yellow: 25%->75% availability
        red: 0-25% availability
        X: unselectable; no availability because the appointment duration is longer then any spare time between appointments
    
*/

function AppointmentBooking( {location = {id: null, icons: [], serviceDurations: [{id: null}]} }){

    //location = location ?? {id: null, icons: [], serviceDurations: [{id: null}]}
    const services = location.icons ?? []
    const locationId = location.id ?? ""

    const {selectedIcons, toggleIconSingle } = useIcons();
    const [possibleBookingDates, setPossibleBookingDates ] = useState([]);

   // const [selectedDate, setSelectedDate ] = useState(null);

    const [dateTimeSlots, setDateTimeSlots ] = useState([]);

    const selectedIcon = selectedIcons[0] ?? null

    const selectedServiceDurationId = (location.serviceDurations.find(sd=>sd.service === selectedIcon))?.id ?? null

   // console.log("apt booking booking location: ", location)

   console.log("possibleBookingDates: ", possibleBookingDates)
   console.log("dateTimeSlots: ", dateTimeSlots) // (possibleBookingDates.find( ({date})=> date === selected_date)).sceduale )
  
    const [currentFlowIndex, setCurrentFlowIndex ] = useState(0)

    const { 
      fetchPossibleBookings, 
      loading: loadingFetchPossibleBookings
  } = useAPI(
          API.fetchPossibleBookings,
          ({possible_bookings}) => {
            console.log("fetched bookings: ", possible_bookings)
            setPossibleBookingDates(possible_bookings)
            nextFlow()
          },
          (err) => {console.log("err in bookings")},
    )

    const getTimeSlots = (selected_date) => 
      setDateTimeSlots( (possibleBookingDates.find( ({date})=> date === selected_date))?.sceduale  )
    
    const nextFlow = (hasOnNextHandler) => {

      if(hasOnNextHandler){
        hasOnNextHandler()
      }else{
        setCurrentFlowIndex(currentFlowIndex=>currentFlowIndex+1)
      }
    
    }

    const previousFlow = () => setCurrentFlowIndex(currentFlowIndex=>currentFlowIndex-1)
    
    const flows = [
      {
        cmp: <>
            <LoadingWrapper loading={loadingFetchPossibleBookings}>
              services
              <IconList iconSize={26} icons={services} selectedIcons={selectedIcons} toggleIcon={toggleIconSingle}/> 
            </LoadingWrapper>         
        </>,

        onNext: ()=>{
         // console.log(selectedServiceDurationId)
          fetchPossibleBookings(selectedServiceDurationId, locationId, Date.now())
        },

        canNext: !!selectedServiceDurationId

      },
      {
        cmp: <>
          appointment selection for {getIconByKey(selectedIcon)}
          <BookingDates possibleBookingSlots={possibleBookingDates} selectDate={getTimeSlots}/>
          <TimeSlots timeSlots={dateTimeSlots} />

        </>,
        canNext: true
      },
      {
        cmp: <>
          appointment confirmation
        </>,
        canNext: true
      },
    ]

    
    const currentFlowCmp = flows[currentFlowIndex].cmp ?? <></>
    const currentFlowOnNexthandler = flows[currentFlowIndex].onNext
    const currentFlowOnCanNext = flows[currentFlowIndex].canNext

    return(<div className='auth_body'>
      
      {currentFlowCmp}
      <div className='flow_buttons_container'>
       <div className='flow_buttons'>
          <button disabled={currentFlowIndex === 0} onClick={previousFlow}>Back</button>  
          <button disabled={ (currentFlowIndex === flows.length-1) || !currentFlowOnCanNext } onClick={e=>nextFlow(currentFlowOnNexthandler)}>Next</button>
        </div>
      </div>
  
    </div>)
}

export default AppointmentBooking;

const getCSSColorByAvailability = (availability) =>
  availability === 0 ? null :
  availability < 25 ? "red" :
  availability < 50 ? "orange" :
  availability < 75 ? "yellow" : "green"


function BookingDates({possibleBookingSlots, selectDate}){

 
  possibleBookingSlots = possibleBookingSlots ?? []
  selectDate = selectDate ?? (()=>{})

  return(<>
    {possibleBookingSlots.map( (pbs, idx)=>
      <button
        style={{backgroundColor: getCSSColorByAvailability(pbs.day_availability)}}
        disabled={pbs.day_availability === 0} 
        onClick={e=>selectDate(pbs.date)} 
        key={idx}>
          {`${pbs.date} ${pbs.dotw}`}
      </button>
    )}
  </>)

}

function TimeSlots({timeSlots, selectTimeSlot}){

  timeSlots = timeSlots ?? []
  selectTimeSlot = selectTimeSlot ?? (()=>{})

  return(<>
    {timeSlots.map( (ts, idx)=>
      <button
        style={{backgroundColor: getCSSColorByAvailability(ts.availability)}}
        disabled={ts.availability === 0}  
        onClick={e=>selectTimeSlot(ts.start)} 
        key={idx}>
          {`${ts.start} ${ts.end}`}
      </button>
    )}
  </>)

}



















/*
function Flows(){
  const [currentFlowIndex, setCurrentFlowIndex ] = useState(0)

  return(<div className='auth_body'>
      
      {currentFlowCmp}
      <button disabled={currentFlowIndex === 0} onClick={previousFlow}>Back</button>  
      <button disabled={currentFlowIndex === flows.length-1} onClick={e=>nextFlow(currentFlowOnNexthandler)}>Next</button>
  
    </div>)
}

  function ServicePicker( {location = {id: null, icons: [], serviceDurations: [{id: null}]} }){

    const services = location.icons ?? []
    const locationId = location.id ?? ""

    const {selectedIcons, toggleIconSingle } = useIcons();

    const selectedServiceDurationId = (location.serviceDurations.find(sd=>sd.service === selectedIcons[0]))?.id ?? null

    return (<>
      services
      <IconList iconSize={26} icons={services} selectedIcons={selectedIcons} toggleIcon={toggleIconSingle}/>   
    </>)
  }

  */