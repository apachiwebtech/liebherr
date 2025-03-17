import React, { useEffect, useState } from 'react'
import { Autocomplete, Radio, TextField } from '@mui/material';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { getRoleData } from '../../Store/Role/role-action';
import Lhiusertabs from './Lhiusertabs';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { SyncLoader } from 'react-spinners';
import toast, { Toaster } from 'react-hot-toast';
import CryptoJS from 'crypto-js';


const Roleassign = () => {

    const { loaders, axiosInstance } = useAxiosLoader();
    const [selectedOption, setSelectedOption] = useState(null);
    const [role, setRoleData] = useState([])
    const [rolePages, setRolePages] = useState([])
    const [roleId, setRoleId] = useState(false)
    const token = localStorage.getItem("token");
    const notify = () => toast.success('Data Submitted..');
    // Function to handle changes in the enable/disable state for an ID
    const handleRadioChange = (event, indexToUpdate) => {
        const newAccessid = +event.target.value;
        const updatedRow = { 
            ...rolePages[indexToUpdate], 
            accessid: newAccessid 
        };

        console.log(updatedRow.id[0] , "@#$%^")
    
        // Convert all values to strings before sending
        const formattedRow = {
            id: updatedRow.id[0].toString(),
            roleid: updatedRow.roleid.toString(),
            pageid: updatedRow.pageid.toString(),
            accessid: updatedRow.accessid.toString(),
            deleted: updatedRow.deleted.toString(),
        };
    
        // Send only the updated row to the backend
        axiosInstance.post(`${Base_Url}/assign_role`, formattedRow, {
            headers: { Authorization: token },
        })
        .then((res) => {
            toast.success('Role updated successfully!');
            
            // Update local state to reflect the change
            setRolePages(prevState => prevState.map((item, index) => 
                index === indexToUpdate ? updatedRow : item
            ));
        })
        .catch((err) => {
            console.error('Error updating role:', err);
            toast.error('Failed to update role.');
        });
    };


    async function getRole() {
        axiosInstance.get(`${Base_Url}/getrole`, {
            headers: {
                Authorization: token, // Send token in headers
            },
        })

            .then((res) => {
                // Decrypt the response data
                const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
                const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
                const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8))
                setRoleData(decryptedData)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    useEffect(() => {
        getRole()
    }, [])

    const HandleChange = (selectedValue) => {
        if (selectedValue) {
            setRoleId(true)
            const selectedId = selectedValue.id;
            setSelectedOption(selectedValue);
            // Now you have the selected id, you can use it in your application logic
            getRolePages(selectedId)
        } else {
            setRoleId(false)
            setSelectedOption(null);
        }
        setRolePages([])
    };

    async function getRolePages(rid) {
        axiosInstance.post(`${Base_Url}/role_pages`, { role_id: rid }, {
            headers: {
                Authorization: token, // Send token in headers
            },
        })

            .then((res) => {
                // console.log(res.data, ">>>>>")
                setRolePages(res.data)

            })
            .catch((err) => {
                console.log(err)
            })
    }





    const Decrypt = (encrypted) => {
        encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
        const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
    };

    const storedEncryptedRole = localStorage.getItem("Userrole");
    const decryptedRole = Decrypt(storedEncryptedRole);

    const roledata = {
        role: decryptedRole,
        pageid: String(5)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])
console.log (roleaccess, "roleaccess")

    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <Toaster position="bottom-center"
                reverseOrder={false} />

            <Lhiusertabs />
            {roleaccess > 1 ?   <div className="row mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div
                            className="card-body"
                            style={{ flex: "1 1 auto", padding: "13px 28px" }}
                        >

                            <h4 class="card-title">Select Role</h4>
                            <form class="forms-sample pt-3" >
                                <div className='d-flex justify-content-between my-2'>
                                    <div class="form-group col-lg-6">
                                        <Autocomplete
                                            disablePortal
                                            id="combo-box-demo"
                                            options={role}
                                            value={selectedOption}
                                            getOptionLabel={(option) => option.title}
                                            getOptionSelected={(option, value) => option.id === value.id}
                                            sx={{ width: "100%", border: "none", borderRadius: "5px" }}
                                            renderInput={(params) => <TextField {...params} label="select role" />}
                                            onChange={(event, value) => HandleChange(value)}
                                            name="category"
                                            size='small'
                                        />
                                    </div>

                   
                                </div>

                                {roleId === true && <div class="form-group" >

                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>
                                                    Role Rights
                                                </th>
                                                <th>
                                                    Block
                                                </th>

                                                <th>
                                                    View
                                                </th>
                                                <th>
                                                    Add
                                                </th>
                                                <th>
                                                    Edit
                                                </th>
                                                <th>
                                                    Full
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rolePages.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            {item.pagename}
                                                        </td>
                                                        <td>
                                                            <Radio
                                                                checked={item.accessid === 1}
                                                                onChange={(e) => handleRadioChange(e, index)}
                                                                value={1}
                                                                name={`radio-buttons-${item.pageid}`}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Radio
                                                                checked={item.accessid === 2}
                                                                onChange={(e) => handleRadioChange(e, index)}
                                                                value={2}
                                                                name={`radio-buttons-${item.pageid}`}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Radio
                                                                checked={item.accessid === 3}
                                                                onChange={(e) => handleRadioChange(e, index)}
                                                                value={3}
                                                                name={`radio-buttons-${item.pageid}`}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Radio
                                                                checked={item.accessid === 4}
                                                                onChange={(e) => handleRadioChange(e, index)}
                                                                value={4}
                                                                name={`radio-buttons-${item.pageid}`}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Radio
                                                                checked={item.accessid === 5}
                                                                onChange={(e) => handleRadioChange(e, index)}
                                                                value={5}
                                                                name={`radio-buttons-${item.pageid}`}
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>}
                            </form>


                        </div>
                    </div>
                </div>
            </div> : null}
            </div>
    );
};

export default Roleassign;
