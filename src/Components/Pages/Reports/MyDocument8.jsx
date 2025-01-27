// DocumentComponent.jsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
// import Liebherrlogo from '../assets/images/Liebherrlogo.png'

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
        height: 20,
        width: 150,
        marginTop: 15,
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
        backgroundColor: '#000080'
    },
    tableCol15: {
        borderStyle: 'solid',
        borderRightWidth: 1,


        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderCollapse: 'collapse',

    },
});

const MyDocument8 = ({ data }) => {


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {/* <Image src={Liebherrlogo} style={styles.image} /> */}
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: '16px', marginTop: 15, marginLeft: 40, fontWeight: '800', color: "#000" }}>Quotation Contract</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: '10px', marginLeft: 130, marginTop: 20, color: "#000" }}>FO_1632 LHI</Text>
                    </View>

                </View>

                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol12, { width: '50%' }]}>
                        <Text style={{ fontSize: '10px', marginTop: 5, color: '#000' }}></Text>
                    </View>
                    <View style={[styles.tableCol11, { width: '50%' }]}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Quotation Number : </Text>

                    </View>

                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol12, { width: '50%' }]}>
                        <Text style={{ fontSize: '10px', marginTop: 5, color: '#000' }}></Text>
                    </View>
                    <View style={[styles.tableCol11, { width: '50%' }]}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Quotation Date : </Text>

                    </View>

                </View>
                <View style={{ border: "2px solid black" }}>



                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol13, { width: '50%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Customer Details</Text>
                        </View>
                        <View style={[styles.tableCol13, { width: '50%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Authorized Service Partner </Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer ID</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Service Partner Code</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer Name</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Service Partner</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Address</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Address</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Phone</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Phone</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>E-mail ID </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>E-mail ID</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ticket Create Date </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ticket Number </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '50%', borderStyle: 'solid', borderBottomWidth: '1px' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Quotation for : </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '80%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Duration for Contract : </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '80%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "30px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: 1600 }}>Model Number</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: 1600 }}>Serial Number</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: 1600 }}>Price </Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 5, color: '#fff', fontWeight: 1600 }}>Total Amount</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: 1600 }}>Remarks</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "30px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '65%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Total Value in Words :</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Grand Amount</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "25px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol13, { width: '20%', borderLeft: '1px solid black', borderTop: '1px solid black', marginTop: '5px' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, color: '#000' }}>Additional Remarks:</Text>

                    </View>
                    <View style={[styles.tableCol, { width: '80%', borderTop: '1px solid black', marginTop: '5px' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, color: '#000' }}>   </Text>

                    </View>
                </View>

                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol14, { width: '15%', borderLeft: '1px solid black' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#ffffff' }}>Note:</Text>


                    </View>
                    <View style={[styles.tableCol14, { width: '85%' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 50, color: '#000' }}>  </Text>


                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol15, { width: '100%', borderLeft: '1px solid black' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#000' }}>Taxes Extra as Applicable</Text>


                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol15, { width: '100%', borderLeft: '1px solid black' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#000' }}>Quotation valid till 15 day from the Quotation date</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol15, { width: '100%', borderLeft: '1px solid black' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#000' }}>This is tentative estimate, if further spares need to be replace on extra cost</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol15, { width: '100%', borderLeft: '1px solid black', borderBottom: '1px solid black' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#000' }}>Advance Payment will be collected in prior to provision of services/goods described in this quotation</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[{ width: '100%', }]}>

                        <Text style={{ fontSize: '10px', marginTop: 10, color: '#000', backgroundColor: '#D3D3D3' }}>For any Enquiries regarding this quote, feel free to reach out to us at 7038 100 400 or email us at customercare.lhi@liebherr.com</Text>

                    </View>
                </View>
            </Page>
        </Document>
    )

};
export default MyDocument8
