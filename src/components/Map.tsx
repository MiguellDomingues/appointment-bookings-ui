//AIzaSyDqveqKgLlKG9gO1NCrs-iHmSjx10TUTkE

/*
todo:
- make the map move and pan smoothly when switching locations
  -- right now it just jarringly moves suddenly

- save the zoom levels between re-renders
  -- save it on the map object

  - make selected icons glow or something?
  - make icons with appointments distinguishable

  - add a custom loading screen?
    -- should probabley be added to the entire screen

  - look into why the right side of the map is getting pushed out
    -- prob the flexbox css on the right container
*/

import * as React from "react";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { createCustomEqual } from "fast-equals";
import { isLatLngLiteral } from "@googlemaps/typescript-guards";


    const render = (status: Status) => {
        return <h1>{status}</h1>;
      };
      
      const MyMap = ( { 
        posts, 
        selected, 
        handleSelectedLocation }) => {



        console.log("Map start:" , posts, selected)

       // const { 
        //  data, 
        //  selected, 
        //  handleSelectedLocation } = props?.context

       const markers = posts || [];

       const [zoom, setZoom] = React.useState(4); // initial zoom

      const [center, setCenter] = React.useState<google.maps.LatLngLiteral>({
          lat: 45.91961776025469,
          lng: -0.7844604492,
        });
        
        const onMarkerClick = (iw: google.maps.InfoWindow, e: google.maps.MapMouseEvent, id: Number) => {

         // console.log("onmarkerclick: ", iw, e, id)

          const {lat, lng} = e.latLng.toJSON()

          //console.log("lat: ", lat, " lng: ", lng)
          setCenter({lat: lat, lng: lng})

          //selectedLocationHandler(null, id)
          handleSelectedLocation(id)
          

         // setZoom(4)
        };
      
        const onClick = (e: google.maps.MapMouseEvent) => {

          const {lat, lng} = e.latLng.toJSON()
          //setClicks([...clicks, e.latLng!]);
          //setCenter({lat: lat, lng: lng})
          //setZoom(15)
        };
      
        const onIdle = (m: google.maps.Map) => {
          //console.log("onIdle");
          setZoom(m.getZoom()!);
          setCenter(m.getCenter()!.toJSON());
        };
      
        /*
        const form = (
          <div
            style={{
              padding: "1rem",
              flexBasis: "250px",
              height: "100%",
              overflow: "auto",
            }}
          >
            <label htmlFor="zoom">Zoom</label>
            <input
              type="number"
              id="zoom"
              name="zoom"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <br />
            <label htmlFor="lat">Latitude</label>
            <input
              type="number"
              id="lat"
              name="lat"
              value={center.lat}
              onChange={(event) =>
                setCenter({ ...center, lat: Number(event.target.value) })
              }
            />
            <br />
            <label htmlFor="lng">Longitude</label>
            <input
              type="number"
              id="lng"
              name="lng"
              value={center.lng}
              onChange={(event) =>
                setCenter({ ...center, lng: Number(event.target.value) })
              }
            />
            <h3>{clicks.length === 0 ? "Click on map to add markers" : "Clicks"}</h3>
            {clicks.map((latLng, i) => (
              <pre key={i}><></>{ JSON.stringify(latLng.toJSON(), null, 2)}</pre>
            ))}
            <button onClick={() => setClicks([])}>Clear</button>
          </div>
        );
        */

        return (
          <div style={{ display: "flex", height: "100%" , width: "100%"}}>
            <Wrapper apiKey={"AIzaSyDqveqKgLlKG9gO1NCrs-iHmSjx10TUTkE"} render={render}>
              <Map
                center={center}
                //onClick={onClick}
                //onIdle={onIdle}
                zoom={zoom}
                style={{ flexGrow: "1", height: "100%" }}
              >
                {markers.map((data, i) => (
                  <Marker                               /* instantiate a new marker object for each entry in the list */
                    key={data.id}
                    id={data.id}
                    selected={data.id === selected} 
                    position={data.LatLng}
                    title={"marker title"} 
                    label={i.toString()}
                    content={data.info}
                    onClick={onMarkerClick}              
                  />
                ))}
              </Map>
            </Wrapper>

            {/*form*/}
          </div>
        );
      };
      interface MapProps extends google.maps.MapOptions {
        style: { [key: string]: string };
        onClick?: (e: google.maps.MapMouseEvent) => void;
        onIdle?: (map: google.maps.Map) => void;
        children?: React.ReactNode;
      }
      
      const Map: React.FC<MapProps> = ({
        onClick,
        onIdle,
        children,
        style,
        ...options
      }) => {
        const ref = React.useRef<HTMLDivElement>(null);
        const [map, setMap] = React.useState<google.maps.Map>();

        const [openInfoWindow, setOpenInfoWindow] = React.useState<google.maps.InfoWindow>();
        
        /* when a markers info window is open, close the current open info window */
        const toggleInfoWindow = (iw: google.maps.InfoWindow, m: google.maps.Marker) =>{

          
          //console.log("hello info window: ", iw, m)

          /* if there exists an openInfoWindow, close it..*/
          if(openInfoWindow){
            openInfoWindow.close()
          }

          /* open the passed in infoWindow and set it to the component */
          iw && iw.open({anchor: m, map: map});
          setOpenInfoWindow(iw)    
        }

        React.useEffect(() => {
          if (ref.current && !map) {
            setMap(new window.google.maps.Map(ref.current, {}));
          }
        }, [ref, map]);
      
        // because React does not do deep comparisons, a custom hook is used
        // see discussion in https://github.com/googlemaps/js-samples/issues/946
        useDeepCompareEffectForMaps(() => {
          if (map) {
            map.setOptions(options);
          }
        }, [map, options]);
      
        React.useEffect(() => {
          
          if (map) {
            ["click", "idle"].forEach( (eventName) => {
              google.maps.event.clearListeners(map, eventName)
          });
      
            if (onClick) {
              //map.addListener("click", onClick);
            }
      
            if (onIdle) {
              map.addListener("idle", () => onIdle(map));
            }
          }
        }, [map, onClick, onIdle]);
      
        return (
          <>
            <div ref={ref} style={style} />
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // set the map prop on the child component
                // @ts-ignore
                return React.cloneElement(child, { map, toggleInfoWindow });
              }
            })}
          </>
        );
      };

/*
      interface MarkerProps extends google.maps.MarkerOptions {
        
        onClick?: (e: google.maps.MapMouseEvent) => void;
      }
  */    
      const Marker: React.FC<google.maps.MarkerOptions> = (options) => {

      const [marker, setMarker] = React.useState<google.maps.Marker>();

      const [infoWindow, setInfoWindow] = React.useState<google.maps.InfoWindow>();

      //.log("marker: ", options)

      const { map, content, id, selected, toggleInfoWindow } = options;

      //console.log("marker selected: ", selected)

        React.useEffect(() => {

          //console.log("marker useeffect: ", id)

          if (!marker) {
            const myMarker = new google.maps.Marker({title: options.title});
            const infowindow = new google.maps.InfoWindow({content: content}); 
            
            setInfoWindow(infowindow)
            setMarker(myMarker);

            if(selected){
              toggleInfoWindow(infoWindow, marker)
            }
            
          }
      
          // remove marker from map on unmount
          return () => {
            if (marker) {
              //console.log("marker removal")
              marker.setMap(null);
              
            }
          };
        }, [marker, infoWindow]);

      
        React.useEffect(
          () => {
          if (marker) {

            ["click"].forEach( (eventName) => {
                google.maps.event.clearListeners(marker, eventName)
            });

            marker.setOptions(options);

            marker.addListener("click", (e) => {
              options.onClick(infoWindow, e, id)
              toggleInfoWindow(infoWindow, marker)
            });

            /* when a marker is selected; either by clicking on it on the map or clicking the cooresponding list widget */
            if(selected){
              toggleInfoWindow(infoWindow, marker) // close the current info window (if open) and open this one
              map.setCenter(marker.getPosition()) // and center the map on the marker
            }
          }      
        }, [marker, options, infoWindow]);
      
        return null;
      };

      const deepCompareEqualsForMaps = createCustomEqual(
        (deepEqual) => (a: any, b: any) => {

         // console.log("188")

          if (
            isLatLngLiteral(a) ||
            a instanceof google.maps.LatLng ||
            isLatLngLiteral(b) ||
            b instanceof google.maps.LatLng
          ) {
            return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
          }
      
          // TODO extend to other types
      
          // use fast-equals for other objects
          return deepEqual(a, b);
        }
      );
      
      function useDeepCompareMemoize(value: any) {
        const ref = React.useRef();
      
        if (!deepCompareEqualsForMaps(value, ref.current)) {
          ref.current = value;
        }
      
        return ref.current;
      }
      
      function useDeepCompareEffectForMaps(
        callback: React.EffectCallback,
        dependencies: any[]
      ) {
        React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
      }

export default MyMap;