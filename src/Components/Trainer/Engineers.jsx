import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url } from '../Utils/Base_Url';
import { FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export function Engineers(params) {

  const [open, setOpen] = React.useState(false);
  const [engineer, setEngineer] = useState([])
  const [msp, setMsp] = useState([])
  const [csp, setCsp] = useState([])
  const [value, setValue] = useState({
    id: "",
    title: "",
    msp: "",
    csp: ""
  })
  const token = localStorage.getItem("token")

  const handleClickOpen = (id, title, msp, csp) => {
    setValue({
      id: id,
      title: title,
      msp: msp,
      csp: csp
    })
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setValue({})
  };





  async function ApproveEng(params) {
    axios.get(`${Base_Url}/getapproveEng`, {
      headers: {
        Authorization: token, // Send token in headers
      }
    })
      .then((res) => {
        console.log(res.data)
        setEngineer(res.data)
      })
  }
  async function getCsp(params) {
    axios.get(`${Base_Url}/getcsp`, {
      headers: {
        Authorization: token, // Send token in headers
      }
    })
      .then((res) => {

        setCsp(res.data)
      })
  }
  async function getMsp(params) {
    axios.get(`${Base_Url}/getmsp`, {
      headers: {
        Authorization: token, // Send token in headers
      }
    })
      .then((res) => {

        setMsp(res.data)
      })
  }


  const handleApprove = (id) => {

    const data = {
      eng_id: id
    }
    axios.post(`${Base_Url}/finalapproveenginner`, data , {
      headers :{
        Authorization : token
      }
    })
      .then((res) => {
        alert("Engineer Approved")
        ApproveEng()
        setOpen(false)
      })
  }


  useEffect(() => {
    ApproveEng()
    getMsp()
    getCsp()
  }, [])


  return (
    <div className="row mp0">
      <div className="col-md-12 col-12">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Enginer_Id</th>
              <th>Engineer_Name</th>
              <th>MSP</th>
              <th>CSP</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>

            {engineer.map((item, index) => {
              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.engineer_id}</td>
                  <td>{item.title}</td>
                  <td>{item.mfranchise_id}</td>
                  <td>{item.cfranchise_id}</td>
                  <td>{item.mobile_no}</td>
                  <td>{item.email}</td>
                  <td><FaEye style={{ cursor: "pointer" }} onClick={() => handleClickOpen(item.id, item.title, item.mfranchise_id, item.cfranchise_id)} /></td>
                </tr>
              )
            })}


            <BootstrapDialog
              onClose={handleClose}
              aria-labelledby="customized-dialog-title"
              open={open}

            >
              <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                <p> {value.title}</p>
              </DialogTitle>
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={(theme) => ({
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: theme.palette.grey[500],
                })}
              >
                <CloseIcon />
              </IconButton>
              <DialogContent dividers sx={{ width: "500px" }}>

                <div className="row mb-3">
                  <div className="col-lg-12 my-2">
                    <label>MSP</label>
                    <Autocomplete
                      disablePortal={false}
                      options={msp} // Array of options
                      size="small"
                      getOptionLabel={(option) => option.title} // Specify how to extract the label from an option
                      renderInput={(params) => <TextField {...params} label="Select MSP" />}
                    />

                  </div>
                  <div className="col-md-12 my-2">
                    <label>CSP</label>
                    <Autocomplete
                      disablePortal={false}
                      options={csp} // Array of options
                      size="small"

                      getOptionLabel={(option) => option.title} // Specify how to extract the label from an option
                      renderInput={(params) => <TextField {...params} label="Select CSP" />}
                    />
                  </div>

                  <div className="col-md-12 my-2">
                    <div className="form-group">
                      <label>Level</label>
                      <select
                        className="form-control"
                        name="status"
                      >
                        <option value="">Select Level</option>
                        <option value="L1">L1</option>
                        <option value="L2">L2</option>
                        <option value="L3">L3</option>
                        <option value="L4">L4</option>
                        <option value="L5">L5</option>

                      </select>
                    </div>
                  </div>

                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleApprove(value.id)}>
                  Approve
                </Button>
              </DialogActions>
            </BootstrapDialog>



          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Engineers;
