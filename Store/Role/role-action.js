import { BASE_URL } from "../../AdminComponent/BaseUrl";
import { roleActions } from "./roleSilce";


export const getRoleData = (data) => {



    return async (dispatch) => {
      

        try {
            const response = await fetch(`${BASE_URL}/getRoleData`, {
                method: "POST",
                body: JSON.stringify({
                    role: data.role,
                    pageid: data.pageid,
                }),
                
                headers: {
                    "Content-type": "application/json"
                }
            })

            const apidata = await response.json();
            dispatch(roleActions.getRoleData(apidata));

    

        } catch (error) {
            console.log(error)
        }
    }
}