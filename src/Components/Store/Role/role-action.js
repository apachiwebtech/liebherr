import { Base_Url } from "../../Utils/Base_Url";
import { roleActions } from "./roleSilce";


export const getRoleData = (data) => {
    const token = localStorage.getItem("token");



    return async (dispatch) => {
      

        try {
            const response = await fetch(`${Base_Url}/getRoleData`, {
                method: "POST",
                body: JSON.stringify({
                    role: data.role,
                    pageid: data.pageid,
                }),
                
                headers: {
                    Authorization: token,
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