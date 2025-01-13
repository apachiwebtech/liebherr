import React, { useEffect, useState } from 'react'
import Header from './Header'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SyncLoader } from 'react-spinners';
import Modalbox from './Modalbox';
import { Base_Url } from '../../Utils/Base_Url';

function History() {
  const { id } = useParams();
  const [complaints, setcomplaints] = useState([]);
  const [complaintdata, setComplaintdata] = useState([])
  const [loaders, setloaders] = useState(true)
  const [modals, setModals] = useState(false)

  async function getcomplaintlist(id) {
    setloaders(true)
    axios.get(`${Base_Url}/getcomplaintlist/${id}`)
      .then((res) => {
        if (res.data != 0) {
          setcomplaints(res.data)
          setloaders(false)
        }
      })
      .catch((err) => {
        setloaders(false)
        console.log(err)
      })
  }

  useEffect(() => {
    getcomplaintlist(id)


  }, [])


  const getviewdata = (id) => {
    console.log(id)
    axios.get(`${Base_Url}/getcompdata/${id}`)
      .then((res) => {
        if (res.data != 0) {
          setComplaintdata(res.data)
          setModals(true)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <>
      <Header />
      {loaders ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional dim background
            zIndex: 999, // Ensure the loader is on top
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

          }}
        >
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      ) : null}


      <main class="container mt-5 pt-3">

        <table className="table table-striped table-bordered">
          <thead className="thead-dark">

            <tr>
              <th className='text-center' >#</th>
              <th  >Complaint ID</th>
              <th className='text-center' >View</th>
            </tr>
          </thead>
          < tbody>
            {complaints.map((complaint, index) => (
              <tr key={index}>
                <td className="text-center">{index + 1}</td>
                <td className="text-start">{complaint.ticket_no}</td>
                <td className="text-center">
                  <a type='button' onClick={() => getviewdata(complaint.id)} className="btn text-light btn-primary btn-sm">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        {modals && (
        <Modalbox
          data={complaintdata}
          open={modals}
          handleClose={() => setModals(false)} // Now this updates parent state
        />
      )}

      </main>
    </>
  )
}

export default History
