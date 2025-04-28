// DocumentComponent.jsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import Liebherrlogo from '../../../images/Liebherr-logo-768x432.png';

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

const MyDocument8 = ({ data, spare , csp}) => {

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

    function numberToWords(num) {
        if (num === 0) return "Zero";
    
        const belowTwenty = [
            "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
            "Eighteen", "Nineteen"
        ];
        const tens = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
        ];
        const thousands = ["", "Thousand", "Million", "Billion"];
    
        function helper(n) {
            if (n === 0) return "";
            else if (n < 20) return belowTwenty[n - 1] + " ";
            else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
            else return belowTwenty[Math.floor(n / 100) - 1] + " Hundred " + helper(n % 100);
        }
    
        let result = "";
        let i = 0;
    
        while (num > 0) {
            if (num % 1000 !== 0) {
                result = helper(num % 1000) + thousands[i] + " " + result;
            }
            num = Math.floor(num / 1000);
            i++;
        }
    
        return result.trim();
    }
    

    const grandtotal = spare.reduce((sum, item) => sum + item.price * item.quantity, 0);


    const qfor = spare.map((item) => item.article_description).join(', ')







    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                <View style={styles.header}>
                    <Image src={Liebherrlogo} style={styles.image} />
                    <View style={{flex : '20'}}>
                        <Text style={{ fontSize: '10px', marginTop: 15, marginLeft: 40, fontWeight: '900', color: "#000" }}>QUOTATION_SPARE PART & CONTRACT</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: '10px', marginLeft: 90, marginTop: 20, color: "#000" }}>FO_1631 LHI</Text>
                    </View>

                </View>


                <View >
                    <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer Details</Text>
                </View>
                <View style={{ border: "2px solid black" }}>





                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Customer Name</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.CustomerName}</Text>

                        </View>

                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Service Partner</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{csp.partner_name}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Address</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.address},{data.city} -{data.pincode},{data.state}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Address</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{csp.address}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Phone</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.customer_mobile}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Phone</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{csp.mobile_no}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>E-mail ID </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.customer_email}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>E-mail ID</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{csp.email}</Text>

                        </View>

                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ticket Create Date </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{formatDate(data.ticketdate)}</Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Ticket Number </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '30%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ticketId}</Text>

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
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{qfor}</Text>

                        </View>


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "20px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Model No : </Text>
                        </View>
                        <View style={[styles.tableCol, { width: '80%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{data.ModelNumber}</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '80%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Serial No : {data.serial_no}</Text>


                        </View>
            


                    </View>
                    <View style={styles.Course}>
                        <div style={{ height: "30px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol14, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: 1600 }}>Article No.</Text>
                        </View>
                        <View style={[styles.tableCol14, { width: '35%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: 1600 }}>Description</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: 1600 }}>Price </Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 5, color: '#fff', fontWeight: 1600 }}>Quantity</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '10%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 5, color: '#fff', fontWeight: 1600 }}>Total Amount</Text>

                        </View>
                        <View style={[styles.tableCol14, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: 1600 }}>Remarks</Text>

                        </View>

                    </View>

                    {spare.map((item, index) => {

             
                        return (
                            <View style={styles.Course} key={index}>
                                <div style={{ height: "20px", margin: "0 0 0 0" }}>

                                </div>
                                <View style={[styles.tableCol, { width: '15%' }]}>
                                    <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#000' }}>{item.article_code}</Text>

                                </View>
                                <View style={[styles.tableCol, { width: '35%' }]}>
                                    <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#000',lineHeight: 15 }}>{item.article_description}</Text>

                                </View>
                                 
                                <View style={[styles.tableCol, { width: '10%' }]}>
                                    <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#000' }}>{item.price}</Text>
                                </View>
                                <View style={[styles.tableCol, { width: '10%' }]}>
                                    <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#000' }}>{item.quantity} </Text>

                                </View>
                                <View style={[styles.tableCol, { width: '10%' }]}>
                                    <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 5, color: '#000' }}>{item.price * item.quantity} </Text>

                                </View>
                                <View style={[styles.tableCol, { width: '20%' }]}>
                                    <Text style={{ fontSize: '10px', marginTop: 10, marginLeft: 15, color: '#000' }}></Text>

                                </View>

                            </View>
                        )
                    })}

                    <View style={styles.Course}>
                        <div style={{ height: "30px", margin: "0 0 0 0" }}>

                        </div>
                        <View style={[styles.tableCol, { width: '65%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Total Value in Words :{numberToWords(grandtotal)} {numberToWords(grandtotal) == '' ? null : "Rupees Only."}</Text>
                        </View>
                        <View style={[styles.tableCol, { width: '15%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>Grand Amount</Text>

                        </View>
                        <View style={[styles.tableCol, { width: '20%' }]}>
                            <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>{grandtotal}</Text>
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
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#000' }}>1. Labour Cost & Taxes extra as applicable</Text>


                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol15, { width: '100%', borderLeft: '1px solid black' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#000' }}>2. Quotation vaild till 30 day from the Quotation date</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol15, { width: '100%', borderLeft: '1px solid black' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#000' }}>3. This is tentative estimate, if further spares need to be replace on extra cost</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[styles.tableCol15, { width: '100%', borderLeft: '1px solid black', borderBottom: '1px solid black' }]}>
                        <Text style={{ fontSize: '10px', marginLeft: 5, marginTop: 5, color: '#000' }}>4. Advance Payment will be collected in prior to provision of services/goods described in this quotation</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <div style={{ height: "20px", margin: "0 0 0 0" }}>

                    </div>
                    <View style={[{ width: '100%', }]}>

                        <Text style={{ fontSize: '10px', marginTop: 10, color: '#000', backgroundColor: '#D3D3D3' }}>Should you have any enquiries concerning this quote, please contact 7038 100 400 or write to customercare.lhi@liebherr.com</Text>
                        <Text style={{ fontSize: '10px', marginTop: 0, color: '#000', backgroundColor: '#D3D3D3' }}>This is a record of Quotation & Kindly ask a VALID TAX INVOICE against any payment made.</Text>

                    </View>
                </View>
            </Page>
        </Document>
    )

};
export default MyDocument8
