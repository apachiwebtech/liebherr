// Modify your state initialization
const [formData, setFormData] = useState({
  title: "",
  pfranchise_id: "",
  contact_person: "",
  email: "",
  mobile_no: "",
  password: "",
  country_id: "",
  region_id: "",
  state: "",
  area: "",
  city: "",
  pincode_id: "",
  address: "",
  licare_code: "",
  partner_name: "",
  website: "",
  gst_number: "",
  pan_number: "",
  bank_name: "",
  bank_account_number: "",
  bank_ifsc_code: "",
  bank_address: "",
  last_working_date: "",
  contract_activation_date: "",
  contract_expiration_date: "",
  with_liebherr: ""
});

// Modify fetchchildfranchisepopulate
const fetchchildfranchisepopulate = async (childid) => {
  try {
    const response = await axios.get(`${Base_Url}/getchildfranchisepopulate/${childid}`);
    
    // Directly set the fetched data to formData instead of PopData
    setFormData({
      ...response.data[0],
      // Rename keys to match your formData structure
      pfranchise_id: response.data[0].pfranchise_id,
      title: response.data[0].title,
      contact_person: response.data[0].contact_person,
      email: response.data[0].email,
      mobile_no: response.data[0].mobile_no,
      password: response.data[0].password,
      country_id: response.data[0].country_id,
      region_id: response.data[0].region_id,
      state: response.data[0].geostate_id,
      area: response.data[0].area_id,
      city: response.data[0].geocity_id,
      pincode_id: response.data[0].pincode_id,
      address: response.data[0].address,
      licare_code: response.data[0].licare_code,
      partner_name: response.data[0].partner_name,
      website: response.data[0].webste,
      gst_number: response.data[0].gstno,
      pan_number: response.data[0].panno,
      bank_name: response.data[0].bankname,
      bank_account_number: response.data[0].bankacc,
      bank_ifsc_code: response.data[0].bankifsc,
      bank_address: response.data[0].bankaddress,
      last_working_date: response.data[0].lastworkinddate,
      contract_activation_date: response.data[0].contractacti,
      contract_expiration_date: response.data[0].contractexpir,
      with_liebherr: response.data[0].withliebher
    });
    
    // Additional dependent dropdown fetches
    if (response.data[0].country_id) {
      fetchregion(response.data[0].country_id);
    }
    if (response.data[0].region_id) {
      fetchState(response.data[0].region_id);
    }
    if (response.data[0].geostate_id) {
      fetchdistricts(response.data[0].geostate_id);
    }
    if (response.data[0].area_id) {
      fetchCity(response.data[0].area_id);
    }
    if (response.data[0].geocity_id) {
      fetchpincode(response.data[0].geocity_id);
    }
  } catch (error) {
    console.error("Error fetching Childfranchise:", error);
  }
};

// Update your form inputs to use formData
// For example:
<input
  type="text"
  className="form-control"
  name="title"
  value={formData.title}
  onChange={handleChange}
  placeholder="Enter Child Franchise Master"
/>

// Similar changes for all input fields