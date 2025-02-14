// DocumentComponent.jsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import Liebherrlogo from '../../../images/Liebherr-logo-768x432.png';

import axios from 'axios';
import { Base_Url } from '../../Utils/Base_Url';
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
        width: 160,
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,

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

const Jobcardpdf = ({ data, duplicate, spare, engineer, attachments ,engremark }) => {


    console.log(engremark.checkremark.remark,"%%")
    console.log(engremark.remark.remark,"%%")



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    console.log(attachments, "EERR")


    function numberToWords(num) {
        if (num === 0) return "";

        const belowTwenty = [
            "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
            "Eighteen", "Nineteen"
        ];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        const thousands = ["", "Thousand", "Million", "Billion"];

        function helper(n) {
            if (n === 0) return "";
            else if (n < 20) return belowTwenty[n - 1] + " ";
            else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
            else if (n < 1000) return belowTwenty[Math.floor(n / 100) - 1] + " hundred " + helper(n % 100);
            else {
                for (let i = 0, unit = 1000; unit <= Math.pow(10, 12); unit *= 1000, i++) {
                    if (n < unit * 1000) {
                        return helper(Math.floor(n / unit)) + thousands[i] + " " + helper(n % unit);
                    }
                }
            }
        }

        return helper(num).trim();
    }

    const totalPrice = spare.reduce((total, item) => {
        return total + Number(item.quantity) * Number(item.price);
    }, 0);






    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={{ border: "2px solid black" }}>

                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[{ width: '60%' }]}>
                            <Image src={Liebherrlogo} style={styles.image} />
                        </View>

                        <View style={[{ width: '40%' }, { borderLeft: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer Care : 7038100400   </Text>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}> E-Mail : : Customercare.lhi@liebherr.com  </Text>
                        </View>
                    </View>

                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }, { backgroundColor: '#9EA0A1' }, { borderTop: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Service Partner</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '40%' }, { borderTop: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.child_service_partner}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }, { backgroundColor: '#9EA0A1' }, { borderTop: '1px' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Liebherr Branch</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }, { borderTop: '1px' }]}>
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
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.purchase_date ? formatDate(data.purchase_date) : null}</Text>

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
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Warranty Status</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.warranty_status}</Text>

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
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>State</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.state}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', marginLeft: 5 }}>Ticket Create Date </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ticket_date ? formatDate(data.ticket_date) : null}</Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Pin Code </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '13%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.pincode}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '12%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000' }}> Phone</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.customer_mobile}</Text>

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
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Email-id</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.customer_email}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Otp Received</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.state_id}</Text>
                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "30px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Fault Description : </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.specification}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>DealerName</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.sales_partner} {data.sales_partner2}</Text>

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
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000', fontWeight: 1600 }}>Engineer Name</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600, marginLeft: 10 }}>Date</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '9%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600, marginLeft: 10 }}>Time In </Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Out Time</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '35%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000', fontWeight: 1600 }}>Repair Done</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '17%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000', fontWeight: 1600 }}>Customer Sign</Text>

                        </View>

                    </View>
                    {engineer.map((item) => {
                        return (
                            <View style={styles.Course}>
                                <div style={{ height: "35px", margin: "0 0 0 0" }}>

                                </div>
                                <View style={[styles.tableCol14, { width: '20%' }]}>
                                    <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}>{item.title}</Text>
                                </View>
                                <View style={[styles.tableCol14, { width: '9%' }]}>
                                    <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600, marginLeft: 2 }}>{item.created_date && formatDate(item.created_date)}</Text>

                                </View>
                                <View style={[styles.tableCol14, { width: '9%' }]}>
                                    <Text style={{ fontSize: '8px', marginTop: 10, color: '#000', fontWeight: 1600 }}> </Text>

                                </View>
                                <View style={[styles.tableCol14, { width: '10%' }]}>
                                    <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 5, color: '#000', fontWeight: 1600 }}></Text>

                                </View>
                                <View style={[styles.tableCol14, { width: '35%' }]}>
                                    <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                                </View>
                                <View style={[styles.tableCol14, { width: '17%' }]}>
                                    <Text style={{ fontSize: '8px', marginTop: 10, marginLeft: 15, color: '#000', fontWeight: 1600 }}></Text>

                                </View>

                            </View>
                        )
                    })}


                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '80%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', textDecoration: 'underline' }}>Spare Parts Consumption Details</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', textDecoration: 'underline' }}>Repair Fault Code</Text>
                        </View>



                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000', fontWeight: 1600 }}>Article Code</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600, marginLeft: 15, }}>Article Description</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '6%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600, marginLeft: 5, }}>Qty</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '7%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Cost</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '7%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 10, color: '#000', fontWeight: 1600 }}>Total</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 2, color: '#000', fontWeight: 1600 }}>Defect Group</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{data.group_code}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[0] && spare[0].article_code}</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[0] && spare[0].article_description
                            }</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '6%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600 }}>{spare[0] && spare[0].quantity}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '7%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[0] && spare[0].price}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '7%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[0] && Number(spare[0].price) * Number(spare[0] && spare[0].quantity)}</Text>

                        </View>

                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Defect Type</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{data.defect_type}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[1] && spare[1].article_code}</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600 }}>{spare[1] && spare[1].article_description
                            }</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '6%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600 }}>{spare[1] && spare[1].quantity}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '7%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[1] && spare[1].price}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '7%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[1] && Number(spare[1].price) * Number(spare[1] && spare[1].quantity)}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Defect Site</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{data.site_defect}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "25px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[2] && spare[2].article_code}</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '40%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600 }}>{spare[2] && spare[2].article_description
                            }</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '6%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600 }}>{spare[2] && spare[2].quantity}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '7%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[2] && spare[2].price}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '7%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{spare[2] && Number(spare[2].price) * Number(spare[2] && spare[2].quantity)}</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Fault Activity</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>{data.activity_code}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "25px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000', fontWeight: 1600 }}>Total(in Words)</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '80%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', fontWeight: 1600, paddingLeft: "5px" }}>{numberToWords(totalPrice)} {numberToWords(totalPrice) == '' ? null : "Rupees Only."}</Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '100%' }, { backgroundColor: '#9EA0A1' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 25, color: '#000', textDecoration: 'underline' }}>Check List (as applicable)</Text>
                        </View>
                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 30, color: '#000' }}>Check Points</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 10, color: '#000' }}>Yes</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 10, color: '#000' }}>No</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 20, color: '#000' }}>Check Points</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 10, color: '#000' }}>Yes</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 10, color: '#000' }}>No</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}>Check List Remarks</Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Any Packing Damages</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.picking_damages == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.picking_damages == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ventilation Top</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ventilation_top == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ventilation_top == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[{ width: '25%' }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}>{engremark.checkremark.remark}</Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Any Product Damages</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.product_damages == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.product_damages == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, color: '#000', marginLeft: 5 }}>Ventilation Bottom</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ventilation_bottom == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ventilation_bottom == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[{ width: '25%' }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Any Missing Parts</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.missing_part == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.missing_part == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ventilation Back</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ventilation_back == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ventilation_back == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[{ width: '25%' }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Leg Adjustment Done</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.leg_adjustment == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.leg_adjustment == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Voltage Supply OK</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.voltage_supply == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.voltage_supply == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[{ width: '25%' }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 15, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Water Connection</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.water_connection == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.water_connection == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Earthing Proper</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.earthing == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.earthing == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[{ width: '25%' }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "25px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Any abnormal noise </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.abnormal_noise == 'Yes'? 'Yes' : null }</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '7.5%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.abnormal_noise == 'No'? 'No' : null }</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '35%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>
                        <View style={[styles.tableCol, { width: '25%' }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                        </View>


                    </View>

                    <View style={styles.Course}>
                        <div style={{ height: "50px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[{ width: '30%' }, { borderBottom: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer Feedback / Suggestions</Text>
                        </View>
                        <View style={[{ width: '70%' }, { borderBottom: "1px" }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "50px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[{ width: '30%' }, { borderBottom: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Engineer Remarks / Recommendations</Text>
                        </View>
                        <View style={[{ width: '70%' }, { borderBottom: "1px" }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>{engremark.remark.remark}</Text>
                        </View>


                    </View>

                    <View style={styles.Course}>
                        <div style={{ height: "18px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[{ width: '100%' }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>This is a system generated job sheet & is record of Service rendered. Kindly ask a VALID TAX INVOICE against any payment made.</Text>
                        </View>



                    </View>



                </View>
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={{ border: "2px solid black" }}>
                    <View style={styles.Course}>
                        <div style={{ height: "700px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[{ width: '100%' }, { borderRight: "1px" }]}>
                            <Text style={{ fontSize: '8px', marginTop: 5, marginLeft: 5, color: '#000' }}>Images, If any:</Text>
                        </View>

                        {attachments.map((item) => {
                                return (
                                    <Image
                                        key={item.attachment} // Add a unique key to each image
                                        style={{ width: "400px" }}
                                        src={`${Base_Url}/uploads/${item.attachment}`}
                                        alt={item.attachment} // Optional alt text
                                    />
                                );
                            })}


                    </View>



                </View>

                <View>
                    <Text style={{ fontSize: '10px', marginLeft: 450, marginTop: 15 }}>FO_1632 LHI</Text>
                </View>
            </Page>
        </Document>
    )

};
export default Jobcardpdf
