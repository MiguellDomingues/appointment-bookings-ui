import {useState, useEffect} from 'react'

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

//const totalMinutesToHoursMinutes= totalMins => ({h: Math.floor(totalMins/60) , m: totalMins%60})

const totalMinutesToHoursMinutesString = (totalMins, is24HourFormat = false) => {

  const hours = is24HourFormat ? Math.floor(totalMins/60) 
  : 
  Math.floor(totalMins/60) === 12 ? 
    Math.floor(totalMins/60) 
    : 
    Math.floor(totalMins/60)%12

  return `${new String(hours)}:${new String(totalMins%60).padStart(2, '0')} ${Math.floor(totalMins/60) < 12 ? `AM` : `PM`}`
}



function AppointmentBooking( {location} ){

    location = location ?? {id: null, icons: [], serviceDurations: [{id: null}]}
    const services = location.icons ?? []
    const locationId = location.id ?? ""

    const [currentFlowIndex, setCurrentFlowIndex ] = useState(0)
    

    const {selectedIcons, toggleIconSingle } = useIcons();


    const [possibleBookingDates, setPossibleBookingDates ] = useState([]);
    const [selectedDate, setSelectedDate ] = useState(null);

    
    const [dateTimeSlots, setDateTimeSlots ] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot ] = useState(null);

    const [bookingTimes, setBookingTimes ] = useState([]);
    const [selectedBookingTime, setSelectedBookingTime ] = useState(null);

    useEffect(()=>{ //when a new date is selected, get the corresponding time slots and clear the currently selected time slot
      setDateTimeSlots( (possibleBookingDates.find( ({date})=> date === selectedDate))?.sceduale || []  )
      setSelectedTimeSlot(null)
    }, [selectedDate])

    
    useEffect(()=>{ //when a new time slot is selected, get the corresponding booking times 
      setBookingTimes( selectedTimeSlot?.open_times  )
      setSelectedBookingTime(null)
    }, [selectedTimeSlot])



    //console.log("selectedTimeSlot",selectedTimeSlot)

    const selectedIcon = selectedIcons[0] ?? null

    const selectedServiceDuration = location.serviceDurations.find(sd=>sd.service === selectedIcon) ?? null

   // console.log("selectedServiceDuration: ", selectedServiceDuration

   //console.log("possibleBookingDates: ", possibleBookingDates)
  // console.log("dateTimeSlots: ", dateTimeSlots) // (possibleBookingDates.find( ({date})=> date === selected_date)).sceduale )
  

    const { 
      fetchPossibleBookings, 
      loading: loadingFetchPossibleBookings
  } = useAPI(
          API.fetchPossibleBookings,
          ({possible_bookings}) => {
            console.log("fetched bookings: ", possible_bookings)
            
            setPossibleBookingDates(possible_bookings)
            setSelectedDate(null)
            nextFlow()
          },
          (err) => {console.log("err in bookings")},
    )

  //selectDate={getTimeSlots}
    
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
              { selectedServiceDuration ? <>{` duration: ${selectedServiceDuration.duration}`}</> : <></>}
            </LoadingWrapper>         
        </>,

        onNext: ()=>{
          fetchPossibleBookings(selectedServiceDuration.id, locationId, Date.now())
        },

        canNext: !!selectedServiceDuration

      },
      {
        
        cmp: <>
          <div className="appointment_selection_layout">

            <div className="appointment_selection_top_layout">
              <div className="appointment_selection_top_content">
                <div>appointment selection for {getIconByKey(selectedIcon)}</div>
                <div>Availability Legend:</div>
                <div className="appointment_selection_top_legend">
                  <div>Very High</div>
                  <div style={{backgroundColor: getCSSColorByAvailability(80)}}>&emsp;</div>
                  <div>High</div>
                  <div style={{backgroundColor: getCSSColorByAvailability(70)}}>&emsp;</div>
                  <div>Medium</div>
                  <div style={{backgroundColor: getCSSColorByAvailability(45)}}>&emsp;</div>
                  <div>Low</div>
                  <div style={{backgroundColor: getCSSColorByAvailability(20)}}>&emsp;</div>
                </div>
                
              </div>
            </div>

           
            <div className="appointment_selection_middle_layout">

              <div className="appointment_selection_middle_content">
                <BookingDates 
                  possibleBookingSlots={possibleBookingDates} 
                  selectedDate={selectedDate} 
                  selectDate={(selected_date) => setSelectedDate(selected_date)}/>
              </div>

              <div className="appointment_selection_middle_content">
                <DateTimeSlots 
                  timeSlots={dateTimeSlots} 
                  selectedTimeSlot={selectedTimeSlot} 
                  selectTimeSlot={(timeSlot)=>setSelectedTimeSlot(timeSlot)}/>
              </div>

              <div className="appointment_selection_middle_content">
                <AvailableBookingTimes 
                  availableTimes={bookingTimes} 
                  selectedTime={selectedBookingTime} 
                  selectTime={(time)=>setSelectedBookingTime(time)} />
              </div>

            </div>

            <div className="appointment_selection_bottom_layout">
              <div className="appointment_selection_bottom_content">
                {selectedDate && selectedBookingTime ? 
                <>
                  booking appointment on: {selectedDate} {totalMinutesToHoursMinutesString(selectedBookingTime)} 
                </>:<></>}
              </div>
            </div>

          </div>

        </>
       ,
        canNext: !!selectedTimeSlot
      },
      {
        cmp: <>
          appointment confirmation
          <button></button>
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
  availability < 25 ? "orangered" :
  availability < 50 ? "yellow" :
  availability < 75 ? "yellowgreen" : "green"

    
  

function BookingDates({possibleBookingSlots, selectedDate, selectDate}){


  possibleBookingSlots = possibleBookingSlots ?? []
  selectDate = selectDate ?? (()=>{})

  return(<>
    {possibleBookingSlots.map( (pbs, idx)=>
      <button
        style={{
          backgroundColor: getCSSColorByAvailability(pbs.day_availability), 
          border: pbs.date === selectedDate && "5px solid black" 
        }}
        disabled={pbs.day_availability === 0} 
        onClick={e=>selectDate(pbs.date)} 
        key={idx}>
          {`${pbs.date} ${pbs.dotw}`}
      </button>)}
  </>)

}

function DateTimeSlots({timeSlots, selectedTimeSlot, selectTimeSlot}){

  timeSlots = timeSlots ?? []
  selectTimeSlot = selectTimeSlot ?? (()=>{})

  return(<>
    {timeSlots.filter(ts=>ts.availability !== 0) //remove 0 availability time slots
      .map( (ts, idx)=>
        <span
          style={{
            backgroundColor: getCSSColorByAvailability(ts.availability),
            border: ts.start === selectedTimeSlot?.start && "5px solid black" 
          }} 
          onClick={e=>selectTimeSlot(ts)} 
          key={idx}>
          {`${totalMinutesToHoursMinutesString(ts.start)} to ${totalMinutesToHoursMinutesString(ts.end)} `}<br/>{ts.desc}     
        </span> 
    )}
  </>)

}

function AvailableBookingTimes({availableTimes, selectedTime, selectTime}){

  availableTimes = availableTimes ?? []
  selectTime = selectTime ?? (()=>{})

  return(<>
    {availableTimes.map( (time, idx)=>
      <button
        style={{
          border: time === selectedTime && "5px solid black" 
        }} 
        onClick={e=>selectTime(time)} 
        key={idx}>
          {totalMinutesToHoursMinutesString(time)}
      </button>
    )}
  </>)

}

/*
function AppointmentPicker({
  _possibleBookingDates,
  _selectedDate,
  selectedIcon
}){


  const [possibleBookingDates, setPossibleBookingDates ] = useState(_possibleBookingDates);
  const [selectedDate, setSelectedDate ] = useState(_selectedDate);

  const [dateTimeSlots, setDateTimeSlots ] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot ] = useState(null);

  const [bookingTimes, setBookingTimes ] = useState([]);
  const [selectedBookingTime, setSelectedBookingTime ] = useState(null);

  return( <div className="appointment_selection_layout">

  <div className="appointment_selection_top_layout">
    <div className="appointment_selection_top_content">
      <div>appointment selection for {getIconByKey(selectedIcon)}</div>
      <div>Availability Legend:</div>
      <div className="appointment_selection_top_legend">
        <div>Very High</div>
        <div style={{backgroundColor: getCSSColorByAvailability(80)}}>&emsp;</div>
        <div>High</div>
        <div style={{backgroundColor: getCSSColorByAvailability(70)}}>&emsp;</div>
        <div>Medium</div>
        <div style={{backgroundColor: getCSSColorByAvailability(45)}}>&emsp;</div>
        <div>Low</div>
        <div style={{backgroundColor: getCSSColorByAvailability(20)}}>&emsp;</div>
      </div>
      
    </div>
  </div>

  <div className="appointment_selection_middle_layout">

    <div className="appointment_selection_middle_content">
      <BookingDates 
        possibleBookingSlots={possibleBookingDates} 
        selectedDate={selectedDate} 
        selectDate={(selected_date) => setSelectedDate(selected_date)}/>
    </div>

    <div className="appointment_selection_middle_content">
      <DateTimeSlots 
        timeSlots={dateTimeSlots} 
        selectedTimeSlot={selectedTimeSlot} 
        selectTimeSlot={(timeSlot)=>setSelectedTimeSlot(timeSlot)}/>
    </div>

    <div className="appointment_selection_middle_content">
      <AvailableBookingTimes 
        availableTimes={bookingTimes} 
        selectedTime={selectedBookingTime} 
        selectTime={(time)=>setSelectedBookingTime(time)} />
    </div>

  </div>

  <div className="appointment_selection_bottom_layout">
    <div className="appointment_selection_bottom_content">
      {selectedDate && selectedBookingTime ? 
      <>
        booking appointment on: {selectedDate} {totalMinutesToHoursMinutesString(selectedBookingTime)} 
      </>:<></>}
    </div>
  </div>

</div>)

}
*/





















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