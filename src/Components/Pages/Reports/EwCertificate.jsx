// DocumentComponent.jsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import Liebherrlogo from '../../../images/Liebherr-logo-768x432.png';

// Create styles

Font.register({
    family: 'Poppins',
    fonts: [
        {
            src: '/fonts/Poppins-Regular.ttf',
            fontWeight: 'normal',
        },
        {
            src: '/fonts/Poppins-SemiBold.ttf',
            fontWeight: 300,
        },
        {
            src: '/fonts/Poppins-Bold.ttf',
            fontWeight: 'bold',
        },
    ],
});

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
        width: 70,
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

const EwCertificate = ({ value }) => {

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
        <Document>
            <Page size="A4" style={styles.page}>

                <View style={styles.header}>
                    <Image src={Liebherrlogo} style={[styles.image, { marginLeft: 35 }]} />
                    <View style={{ flex: '40' }}>
                        <Text style={{ fontSize: '9px', marginLeft: 70, fontFamily: 'Poppins', fontWeight: 600 }}>CERTIFICATE OF ANNUAL MAINTENANCE CONTRACT  </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: '9px', marginLeft: 50, fontFamily: 'Poppins', fontWeight: 600 }}>FO_1631 LHI</Text>
                    </View>

                </View>


                <View style={[styles.Course, { marginTop: '20px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
                    </View>
                    <View style={{ width: "20%" }}>
                        <Text style={{ fontSize: 9, marginTop: 5, marginLeft: 5, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>LiCare Plan Number:</Text>
                    </View>
                    <View style={{ width: "20%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '70px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.contractNumber}
                        </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "60%", flexDirection: 'row', marginTop: 5, marginLeft: 35 }}>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>1) </Text>
                        <Text style={{ fontSize: 10, color: '#000', textDecoration: 'underline', fontFamily: 'Poppins', fontWeight: 600 }}>Definitions</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 42, color: '#000' }}> LHI - Liebherr Appliances India Private Limited </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 42, color: '#000' }}> AMC - Annual Maintenance Contract </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "60%", flexDirection: 'row', marginTop: 15, marginLeft: 35 }}>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>2) </Text>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Customer Details
                        </Text>
                    </View>
                </View>


                <View style={styles.Course}>
                    <View style={{ width: "32%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   Customer ID & Name:</Text>
                    </View>
                    <View style={{ width: "70%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '150px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.customerID} / {value.customerName}
                        </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "20%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   Address:</Text>
                    </View>
                    <View style={{ width: "70%" }}>
                        <Text style={{
                            fontSize: 9,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '450px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.address}
                        </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "17%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   State:</Text>
                    </View>
                    <View style={{ width: "23%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '100px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.geostate_id}
                        </Text>
                    </View>
                    <View style={{ width: "5%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, color: '#000' }}>City:</Text>
                    </View>
                    <View style={{ width: "20%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '100px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.geocity_id}
                        </Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, color: '#000' }}>PIN Code:</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '40px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.pincode_id}
                        </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "27%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   Contact Number:</Text>
                    </View>
                    <View style={{ width: "13%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '55px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.mobileno}
                        </Text>
                    </View>
                    <View style={{ width: "17%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, color: '#000' }}>Alternate Number:</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '55px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.alt_mobileno}
                        </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "26%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   E-mail Address:</Text>
                    </View>
                    <View style={{ width: "70%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '150px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.email}
                        </Text>
                    </View>
                </View>


                <View style={styles.Course}>
                    <View style={{ width: "60%", flexDirection: 'row', marginTop: 15, marginLeft: 35 }}>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>3) </Text>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Product Details
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "25%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   Model Number:</Text>
                    </View>
                    <View style={{ width: "39%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '180px',
                            borderBottomColor: '#000',
                            paddingBottom: 1 // Adjust for spacing between text and line
                        }}>
                            {value.ModelNumber}
                        </Text>
                    </View>
                    <View style={{ width: "14%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, color: '#000' }}>Serial Number:</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '55px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.serialNumber}
                        </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "28%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   Invoice No & Date:</Text>
                    </View>
                    <View style={{ width: "16%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '50px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {formatDate(value.invoice_date)}
                        </Text>
                    </View>
                    <View style={{ width: "21%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, color: '#000' }}>Service Partner Name :</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 9,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            minHeight: '10px',
                            width: '200px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.sevice_partner}
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "42%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   Name of the Dealer/Distributer:</Text>
                    </View>
                    <View style={{ width: "68%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            minHeight: '10px',
                            width: '200px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {value.sales_partner}
                        </Text>
                    </View>
                </View>



                <View style={styles.Course}>
                    <View style={{ width: "100%", flexDirection: 'row', marginTop: 15, marginLeft: 35 }}>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>4) </Text>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Ex-Warranty Plan
                        </Text>
                    </View>
                </View>


                <View style={styles.Course}>
                    <View style={{ width: "26%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•	   Plan Start Date:</Text>
                    </View>
                    <View style={{ width: "17%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '50px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {formatDate(value.startDate)}
                        </Text>
                    </View>
                    <View style={{ width: "14%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, color: '#000' }}>Plan End Date:</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 10,
                            color: '#000',
                            borderBottomWidth: 1,
                            minHeight: '10px',
                            width: '50px',
                            borderBottomColor: '#000',
                            paddingBottom: 1
                        }}>
                            {formatDate(value.endDate)}
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "100%", flexDirection: 'row', marginTop: 15, marginLeft: 35 }}>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>5) </Text>
                        <Text style={{ fontSize: 10, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Ex-Warranty Terms And Conditions
                        </Text>
                    </View>
                </View>


                <View style={styles.Course}>
                    <View style={{ width: "92%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Customer can avail Ex-warranty plan only within six month from the date of purchase of the </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>Refrigerator. </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Refrigerator purchased from LHI authorized distributor / dealer will only qualify for Ex-warranty.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     The terms and conditions of this Ex-warranty are supplement and in addition to the Terms and  </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>Conditions provided on standard warranty supplied with the product. </Text>
                    </View>
                </View>


                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Ex-warranty shall be applicable from the date of expiry of the standard warranty.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Ex-warranty can only be purchased within the standard warranty period of the product.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Usage not as per Instruction Manual shall be beyond the scope of Ex-warranty.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     In Ex-warranty, only mechanical and technical problems are covered.</Text>
                    </View>
                </View>



                <View style={[styles.Course, { marginTop: '20px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 10, }}>In case of any support please call our customer helpline.</Text>
                    </View>
                    <View style={{ width: "40%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 10, marginLeft: 45 }}>CIN U74120MH2013FTC245571</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 4, }}>Customer Care: 7038 100 400</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%", flexDirection: 'row', }}>
                        <Text style={{ fontSize: '9px', marginTop: 4, }}>Website:</Text>
                        <Text style={{ fontSize: '9px', marginTop: 4, textDecoration: 'underline' }}>home.liebherr.com</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%", flexDirection: 'row', }}>
                        <Text style={{ fontSize: '9px', marginTop: 4, }}>Email:</Text>
                        <Text style={{ fontSize: '9px', marginTop: 4, textDecoration: 'underline' }}>customercare.lhi@liebherr.com</Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '10px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 10, }}>Edition 01</Text>
                    </View>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>

                <View style={[styles.header]}>
                    <Image src={Liebherrlogo} style={[styles.image]} />
                    <View style={{ flex: '40' }}>
                        <Text style={{ fontSize: 10, marginLeft: 70, fontFamily: 'Poppins', fontWeight: 600 }}>CERTIFICATE OF ANNUAL MAINTENANCE CONTRACT  </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: 10, marginLeft: 50, fontFamily: 'Poppins', fontWeight: 600 }}>FO_1631 LHI</Text>
                    </View>

                </View>


                <View style={styles.Course}>
                    <View style={{ width: "100%", marginTop: 17 }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Ex-warranty covers all defects that are covered under standard warranty even after expiry of standard </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>warranty.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Ex-warranty offers free repairs to appliance within the plan Start & End Date. It is ensured that the </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>repairs shall be carried out with genuine spare parts only.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Ex-warranty excludes LED, glass, add-on plastic parts and accessories. </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Ex-warranty will be applicable only against defective material & will be effective from date of purchase.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Ex-warranty is applicable on purchase of first product & is non-transferable i.e. In the event of resale </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>/ gift to any other person it will become void and no refund / third party claim shall be entertained.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     In the event of any unforeseen circumstance, and spares not being available, LHI’s prevailing </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>depreciation rules will be binding on the purchaser to accept as a commercial solution in lieu of repairs.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     The maximum liability of LHI through this Ex-warranty is limited to the purchase value of the product </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>or MRP of the product or depreciated value of refrigerator whichever is lower. </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Under ex-warranty and matter incidental thereto, decision of LHI shall be final and binding on the </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>customer. </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 46, color: '#000' }}>•     Ex-warranty is being offered by LHI in its sole discretion and LHI reserve the right to refuse, suspend </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 10, marginLeft: 65, color: '#000' }}>or withdraw the Ex-warranty at any time without prior notice. </Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '20px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 35, color: '#000', textDecoration: 'underline', fontFamily: 'Poppins', fontWeight: 600 }}>Declaration</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 35, color: '#000' }}>I have read & understand the above-mentioned terms & conditions of the LHI Ex-Warranty Protection Plan  & </Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 35, color: '#000' }}>agree to accept and abide by the same  </Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '43px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: 10, marginLeft: 35, color: '#000', textDecoration: 'underline', fontFamily: 'Poppins', fontWeight: 600 }}> Liebherr Authorized Signatory </Text>
                    </View>
                    <View style={{ width: "40%" }}>
                        <Text style={{ fontSize: 10, color: '#000', marginLeft: 25, textDecoration: 'underline', fontFamily: 'Poppins', fontWeight: 600 }}>Customer's Signature With Date:</Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '10px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 10, }}>In case of any support please call our customer helpline.</Text>
                    </View>
                    <View style={{ width: "40%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 10, marginLeft: 70 }}>CIN U74120MH2013FTC245571</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 4, }}>Customer Care: 7038 100 400</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%", flexDirection: 'row', }}>
                        <Text style={{ fontSize: '9px', marginTop: 4, }}>Website:</Text>
                        <Text style={{ fontSize: '9px', marginTop: 4, textDecoration: 'underline' }}>home.liebherr.com</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%", flexDirection: 'row', }}>
                        <Text style={{ fontSize: '9px', marginTop: 4, }}>Email:</Text>
                        <Text style={{ fontSize: '9px', marginTop: 4, textDecoration: 'underline' }}>customercare.lhi@liebherr.com</Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '10px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 10, }}>Edition 01</Text>
                    </View>
                </View>






            </Page>
        </Document>
    )

};
export default EwCertificate
