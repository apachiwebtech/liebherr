import React, { useEffect, useState } from 'react';
import Header from './Header';
import axios from 'axios';
import { Base_Url } from '../../Utils/Base_Url';

function Dashbord() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [serach, setserach] = useState(false);
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [value, setValue] = useState({
    cancleled: 0,
    pendingTickets: 0,
    totalTickets: 0,
  });

  async function getdata() {
    const en_id = localStorage.getItem('userid');

    axios.get(`${Base_Url}/getheaddata?en_id=${en_id}`, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data !== 0) {
          setValue({
            cancleled: res.data.cancleled,
            pendingTickets: res.data.pendingTickets,
            totalTickets: res.data.totalTickets,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const getComplaints = async () => {
    const en_id = localStorage.getItem("userid");
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      console.log(page, "page");

      const res = await axios.get(`${Base_Url}/getcomplaint/${en_id}/${page}/10`, {
        headers: {
            Authorization: token, // Send token in headers
        },
    });
      console.log("message", res.data.message);
      if (res.data.message != "No records found") {
        if (res.data.data !== 0 || res.data.data.length !== 0) {

          setList((prev) => [...prev, ...res.data.data]); // Append new data
          setFilteredList((prev) => [...prev, ...res.data.data]);
          // Increment the page using the functional update form
          setPage((prevPage) => prevPage + 1);


        } else {
          setHasMore(false); // No more data to load
        }
      } else {
        setHasMore(false); // No more data to load
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {

    getComplaints();

    console.log('i fire once');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.scrollHeight
      ) {
        getComplaints(); // Fetch more complaints when scrolled to the bottom
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page]); // Add page as a dependency


  useEffect(() => {
    getdata();

  }, []);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    // Filter the list based on the search term
    const filtered = list.filter(item =>
      (item.ticket_no && item.ticket_no.toLowerCase().includes(searchValue)) ||
      (item.serial_no && String(item.serial_no).toLowerCase().includes(searchValue)) ||
      (item.customer_mobile && item.customer_mobile.toLowerCase().includes(searchValue)) ||
      (item.customer_name && item.customer_name.toLowerCase().includes(searchValue)) ||
      (item.customer_id && String(item.customer_id).toLowerCase().includes(searchValue)) ||
      (item.customer_email && String(item.customer_email).toLowerCase().includes(searchValue))

    );



    setFilteredList(filtered);
  };

  const Name = localStorage.getItem('Name');

  const handlesett = () => {
    setserach(true)
  }
  const handlesetf = () => {
    setserach(false)
  }
  return (
    <>
      <Header />

      <main className="container mt-5 pt-3">
        <h3 className="headh4 pt-3 pb-2">Welcome {Name},</h3>

        <div id="compTag" className="rounded row">
          <div className="col-4">
            <div className="colorTotal">
              <div className="dcount">{value.totalTickets}</div>
              <h5>Total Call</h5>
            </div>
          </div>
          <div className="col-4">
            <div className="colorPending">
              <div className="dcount">{value.pendingTickets}</div>
              <h5>Pending</h5>
            </div>
          </div>
          <div className="col-4">
            <div className="colorCompleted">
              <div className="dcount">{value.cancleled}</div>
              <h5>Completed</h5>
            </div>
          </div>
        </div>

        {serach ? (
          <>
            {/* Search Input */}
            <div className="row bg-light m-auto rounded pos1">
              <h3 className="headh4 pt-3 d-flex">
                <p className="col-8 ">Search Complaint By</p>
                <p className="col-4 text-right pos" onClick={handlesetf}><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                </svg></p>
              </h3>

              <p>Search by Ticket No. / Serial No. / Mobile No./ Customer Name / Customer Id / Email Id</p>
              <div className="col-12 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

          </>
        ) : (
          <>
            <div className="row bg-light m-auto rounded ">
              <h3 className="headh4 pt-3" onClick={handlesett}>Search Complaint</h3>
            </div>
          </>
        )}

        {/* List of complaints */}
        <div className="row mt-4">
          {filteredList && filteredList.length > 0 ? (
            filteredList.map((item) => (
              <div key={item.id} className="col-12">
                <div className="bg-light mb-3 p-2 rounded">
                  <h3 className="mainheadinh">
                    <span id="compaintno1">{item.ticket_no}</span>
                    <span className="complDate">{item.ticket_date}</span>
                  </h3>
                  <h4 className="pname">{item.customer_name}</h4>
                  <p>{item.address} , {item.area} , {item.city} , {item.pincode}</p>

                  <div className="btniconHol">
                    <a href={`tel:${item.customer_mobile}`} className="btn btn-success m-1">
                      <i className="fa-solid fa-phone" style={{ color: '#fff' }}></i>
                    </a>
                    {item.alt_mobileno ? (
                      <>
                        <a href={`tel:${item.customer_mobile}`} className="btn btn-success m-1">
                          <i className="fa-solid fa-phone" style={{ color: '#fff' }}></i>
                        </a>
                      </>
                    ) : null}
                    <a href={`/mobapp/details/${item.id}`} className="btn btn-info mr-2">
                      <i className="fa-solid fa-eye"></i>
                    </a>
                    <p className="btn btn-warning ml-2 statusbx">
                      {item.call_status}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No complaints found</p>
          )}
        </div>
      </main>
    </>
  );
}

export default Dashbord;
