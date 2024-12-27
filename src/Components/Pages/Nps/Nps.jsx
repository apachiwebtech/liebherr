import React from 'react'
import { useParams } from 'react-router-dom'

const Nps = () => {

    const {email,ticketno} = useParams()
    return (
        <div>
            Nps Page 
        </div>
    )
}

export default Nps