
export const DOMAIN = "http://localhost:8080"

export const ICONS= ['FaWrench', 'MdOutlineCarRepair', 'FaOilCan', 'MdLocalCarWash', 'GiMechanicGarage', 'FaCarBattery']
export const STATUS= ['Approved', 'In Progress', 'Completed', 'Canceled']

export const MAPS_API_KEY = `AIzaSyDqveqKgLlKG9gO1NCrs-iHmSjx10TUTkE`

const ROUTES = {
    LOCATIONS:         "/locations",
    APPOINTMENT:       "/appointment",
    AVAILABILITY:      "/availability",
    WORKING_PLANS:     "/workingplans",
    BREAKS:            "/breaks",
    SERVICE_DURATIONS: "/servicedurations",
    AUTH:              "/auth"
}

export const PATHS = {
    LOCATIONS:         `${DOMAIN}${ROUTES.LOCATIONS}`,
    APPOINTMENTS:      `${DOMAIN}${ROUTES.APPOINTMENT}`,
    WORKING_PLAN:      `${DOMAIN}${ROUTES.AVAILABILITY}${ROUTES.WORKING_PLANS}`,
    BREAKS:            `${DOMAIN}${ROUTES.AVAILABILITY}${ROUTES.BREAKS}`,
    SERVICE_DURATIONS: `${DOMAIN}${ROUTES.AVAILABILITY}${ROUTES.SERVICE_DURATIONS}`,
    AUTH:              `${DOMAIN}${ROUTES.AUTH}`,
    MAPS:              `https://maps.googleapis.com/maps/api/geocode/json`
}