import React from "react";
import { useState } from "react";
import axios from "axios";
import { Base_Url } from "../Utils/Base_Url";

const QueryPage = ()=>{
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null)

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setResult(null)
        setError(null)

        axios.post(`${Base_Url}/query`,{query},{
            headers: {
                'x-api-key': 'a8f2b3c4-d5e6-7f8g-h9i0-12345jklmn67' // Include API key here
            }
        })
        .then((res)=>{  
            setResult(res.data);
        })
        .catch((err)=>{
            if(err.response){
                setError(err.response.data);
            }
        })
    }

    return (
    <div className="p-3 d-flex flex-column gap-4">
        <form onSubmit={handleSubmit} className="d-flex flex-column">
            <textarea id='q2' className='form-control rounded-0 border border-dark mb-3' rows={5} value={query}
                onChange={(e)=>setQuery(e.target.value)}>
            </textarea>
            <button type="submit" className="btn btn-primary align-self-center">Submit</button>
        </form>
        {
            result?
                <div className="p-4 rounded-0 border border-dark">
                    <pre>
                        {JSON.stringify(result,null, 2)}
                    </pre>
                </div>:
            error?
                <div className="p-4 rounded-0 border border-dark">
                    <pre>
                        {JSON.stringify(error,null, 2)}
                    </pre>
                </div>:
            null
        }    
    </div>
    )
}

export default QueryPage