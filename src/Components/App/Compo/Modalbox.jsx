import React from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';

const Modalbox = ({ data, open, handleClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) {
      return dateString; // Return an empty string or a placeholder if dateString is undefined or null
    }

    const date = new Date(dateString.split(" ")[0]);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };


  return (
    <div>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            bottom: '-29%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            Ticket no {data[0].id}
          </Typography>
          <Typography sx={{ mt: 2 }}>
            <div className="col-12">
              <div
                className="bg-white rounded "
                style={{ maxWidth: "600px", margin: "auto" }}
              >
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h6 className="text-primary mb-0" style={{ fontWeight: 600 }}>
                    Complaint No: <span id="compaintno1">{data[0].ticket_no}</span>
                  </h6>
                  <span className="text-muted small">{formatDate(data[0].co)}</span>
                </div>

                {/* Name Section */}
                <h6 className=" mb-3">
                  <strong>Name:</strong> {data[0].customer_name}
                </h6>

                {/* Model Number */}
                <h6 className="text-dark mb-3" style={{ fontWeight: 600 }}>
                  Model Number: <span>{data[0].ModelNumber}</span>
                </h6>

                {/* Address Section */}
                <h6 className="text-secondary small mb-3">
                  <strong>Address:</strong> {data[0].address}, {data[0].area}, {data[0].city},{" "}
                  {data[0].pincode}
                </h6>
                {/* Details Section */}
                <div className=" mb-2">
                  <p className="mb-2 small">
                    <strong>Serial No:</strong> {data[0].serial_no}
                  </p>
                  <p className="mb-0 small">
                    <strong>Ticket Type:</strong> {data[0].ticket_type}
                  </p>
                </div>

                <div className=" mb-2">
                  <p className="mb-2 small">
                    <strong>Call Type:</strong> {data[0].call_type}
                  </p>
                  <p className="mb-0 small">
                    <strong>Customer Class:</strong> {data[0].customer_class}
                  </p>
                </div>
              </div>
            </div>

          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleClose}
            color="primary"
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Modalbox;
