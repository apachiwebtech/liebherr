// DocumentComponent.jsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import Liebherrlogo from '../../../images/Liebherr-logo-768x432.png';

import axios from 'axios';
// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: "lightslategrey",
        border: '1px solid black',
        borderColor: 'black',
        borderWidth: 1,
        borderStyle: 'solid round',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',

        paddingBottom: 10,

        header1: {
            Alignitems: 'center',
        },
    },
    image: {
        height: 10,
        width: 100,

    },
    headerRight: {
        flex: "13"
    },
    Course: {
        display: 'flex',
        flexDirection: 'row',
    },
    tableCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderCollapse: 'collapse',
    },
    tableCol1: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderCollapse: 'collapse',
    },
    footer: {
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'row',
    },
    tableCol11: {
        borderStyle: 'solid',
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderLeftWidth: 1,

        borderCollapse: 'collapse',
    },
    tableCol12: {
        borderStyle: 'solid',



        borderCollapse: 'collapse',
    },
    tableCol13: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderCollapse: 'collapse',
        backgroundColor: '#D3D3D3'
    },
    tableCol14: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderCollapse: 'collapse',
    },
    tableCol15: {
        borderStyle: 'solid',
        borderRightWidth: 1,


        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderCollapse: 'collapse',

    },
});

const Jobcardpdf = ({ data, duplicate, spare, engineer }) => {



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
    
        return `${day}-${month}-${year}`;
      };






    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Image src={Liebherrlogo} style={styles.image} />
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: '8px', marginLeft: 80, fontWeight: '1700', color: "#000" }}>Job Sheet _ Consumer</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: '8px', marginLeft: 150, color: "#000" }}>FO_1632 LHI</Text>
                    </View>

                </View>

                <View style={styles.Course}>
                    <div style={{ margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol12, { width: '50%' }]}>
                        <Text style={{ fontSize: '8px', color: '#000' }}></Text>
                    </View>
                    <View style={[{ width: '50%' }]}>
                        <Text style={{ fontSize: '8px', marginLeft: 5, color: '#000' }}>Customer Care : 7038100400 </Text>

                    </View>

                </View>
                <View style={styles.Course}>
                    <div style={{ margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol12, { width: '50%' }]}>
                        <Text style={{ fontSize: '8px', color: '#000' }}></Text>
                    </View>
                    <View style={[{ width: '50%' }]}>
                        <Text style={{ fontSize: '8px', marginLeft: 5, color: '#000' }}>E-Mail : : Customercare.lhi@liebherr.com </Text>

                    </View>

                </View>
                <View style={{ border: "2px solid black" }}>




                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Service Partner</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.child_service_partner}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Liebherr Branch</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.mother_branch}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer Name</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.customer_name}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ticket Number</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ticket_no}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Account ID</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.customer_id}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Model Number</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ModelNumber}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[{ width: '20%' }, { borderRight: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[{ width: '40%' }, { borderRight: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' },]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Serial No</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.serial_no}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[{ width: '20%' }, { borderRight: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Address</Text>
                        </View>
                        <View style={[{ width: '40%' }, { borderRight: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.address}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Invoice Date</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{ data.purchase_date?formatDate(data.purchase_date) : null}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[{ width: '20%' }, { borderRight: '1px' }, { borderBottom: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[{ width: '40%' }, { borderRight: '1px' }, { borderBottom: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' },]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Coverage Status</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>

                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>City</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '13%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.city}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '12%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Phone</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.customer_mobile}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000' }}>Ticket Create Date </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ticket_date ?formatDate(data.ticket_date)  : null}</Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Pincode </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '13%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.pincode}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '12%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000' }}>Alternate No</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.alt_mobile}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Completed Date </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.closed_date ? formatDate(data.closed_date) : null}</Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer Voice : </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '80%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Past Complaints : </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{duplicate && duplicate[0] && duplicate[0].ticket_no}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{duplicate && duplicate[0] && duplicate[1].ticket_no}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{duplicate && duplicate[0] && duplicate[2].ticket_no}</Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '100%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', textDecoration: 'underline' }}>Engineer Visit Details </Text>
                        </View>



                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}>Engineer Name</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600, marginLeft: 10 }}>Date</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600, marginLeft : 10 }}>Time In </Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '27%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Observation</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '22%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}>Repair Done</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '13%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}>Sign</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}>{engineer[0] && engineer[0].title}</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600,marginLeft: 2 }}>{engineer[0] &&  formatDate(engineer[0].created_date)}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}> </Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '27%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '22%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '13%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '27%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '22%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '13%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '27%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '22%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '13%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>

                    </View>


                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Engineer Closing Remarks</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '60%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer Remarks</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '60%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '70%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', textDecoration: 'underline' }}>Spare Parts Consumption Details</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', textDecoration: 'underline' }}>Repair Fault Code</Text>
                        </View>



                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Article Code</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Defect Group</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Description</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}>{spare[0] && spare[0].article_description
                            }</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Defect Type</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Price</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}>{spare[0] && spare[0].price}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Defect Site</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Quantity</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}>{spare[0] && spare[0].quantity}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Fault Activity</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Total</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '50%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 25, color: '#000', textDecoration: 'underline' }}>Call Category (Installation/Visit/Maintenance)</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '50%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 50, color: '#000', textDecoration: 'underline' }}>Visit Call Category</Text>
                        </View>



                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 30, color: '#000' }}>Check Points</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Yes</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>No</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Remarks</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 20, color: '#000' }}>Check Points</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Yes</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>No</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}>Remarks</Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Any Packing Damages</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ventilation -Top(mm)</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Any Product Damages</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000' }}>Ventilation-Bottom(mm)</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ventilation Available</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ventilation - Back(mm)</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Voltage supply OK</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Voltage Proper</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Earthing Proper</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Earthing Proper</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Leg Adjustment Done </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Water Connection</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Any missing parts</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Power Connection</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Any abnormal noise </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Demo Given</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>

                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>If any other pl specify</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '75%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '100%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Note:-This is a record of Service rendered & Kindly ask a VALID TAX INVOICE against any payment made.</Text>
                        </View>



                    </View>



                </View>













            </Page>
        </Document>
    )

};
export default Jobcardpdf
