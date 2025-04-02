import axios from "axios";
import CustomError from "./CustomError.js";

export const getGeoCoordinates = async(address) => {
    try {
        const response = await axios.get(`https://us1.locationiq.com/v1/search.php`, {
            params: {
                key: process.env.GEOLOCATION_API_KEY,
                q: address,
                format: 'json',
                limit: 1,
            },
        });
    
        if(response.data.length > 0){
            const { lat, lon} = response.data[0]
            return {latitude : lat, longitude : lon}
        }else {
            throw new CustomError("Invalid address. unable to fetch the geoLocation.", 400)
        }
        
    } catch (error) {
        console.error("Error fetching geocoordinates:", error.message);
        throw new CustomError("Geolocation service failed. Please try again later.", 500);
    }
}
