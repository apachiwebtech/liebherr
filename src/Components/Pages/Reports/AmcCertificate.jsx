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
        minHeight: '10px',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderCollapse: 'collapse',
    },
    tableCol1: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderBottomWidth: 1,
        minHeight: '10px',
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
        minHeight: '10px',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderCollapse: 'collapse',
        backgroundColor: '#D3D3D3'
    },
    tableCol14: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderBottomWidth: 1,
        minHeight: '10px',
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

const AmcCertificate = ({ value }) => {

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
                    <Image src={Liebherrlogo} style={styles.image} />
                    <View style={{ flex: '40' }}>
                        <Text style={{ fontSize: '10px', marginLeft: 70, fontFamily: 'Poppins', fontWeight: 600 }}>CERTIFICATE OF ANNUAL MAINTENANCE CONTRACT  </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: '10px', marginLeft: 50, fontFamily: 'Poppins', fontWeight: 600 }}>FO_1631 LHI</Text>
                    </View>

                </View>


                <View style={[styles.Course, { marginTop: '20px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}></Text>
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
                    <View style={{ width: "60%", flexDirection: 'row', marginTop: 5, marginLeft: 5 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>1) </Text>
                        <Text style={{ fontSize: 9, color: '#000', textDecoration: 'underline', fontFamily: 'Poppins', fontWeight: 600 }}>Definitions</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>a. LHI - Liebherr Appliances India Private Limited </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>b. AMC - Annual Maintenance Contract </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "60%", flexDirection: 'row', marginTop: 15, marginLeft: 5 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>2) </Text>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Customer Details
                        </Text>
                    </View>
                </View>


                <View style={styles.Course}>
                    <View style={{ width: "26%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     Customer ID & Name:</Text>
                    </View>
                    <View style={{ width: "70%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "15%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     Address:</Text>
                    </View>
                    <View style={{ width: "70%" }}>
                        <Text style={{
                            fontSize: 9,
                            marginTop: 5,
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
                    <View style={{ width: "12%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     State:</Text>
                    </View>
                    <View style={{ width: "23%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                        <Text style={{ fontSize: '10px', marginTop: 5, color: '#000' }}>City:</Text>
                    </View>
                    <View style={{ width: "20%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                        <Text style={{ fontSize: '10px', marginTop: 5, color: '#000' }}>PIN Code:</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "22%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     Contact Number:</Text>
                    </View>
                    <View style={{ width: "13%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "16%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, color: '#000' }}>Alternate Number:</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "22%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     E-mail Address:</Text>
                    </View>
                    <View style={{ width: "70%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "60%", flexDirection: 'row', marginTop: 15, marginLeft: 5 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>3) </Text>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Product Details
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "20%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     Model Number:</Text>
                    </View>
                    <View style={{ width: "39%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                        <Text style={{ fontSize: '10px', marginTop: 5, color: '#000' }}>Serial Number:</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "23%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     Invoice No & Date:</Text>
                    </View>
                    <View style={{ width: "17%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "20%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, color: '#000' }}>Service Partner Name :</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 9,
                            marginTop: 5,
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
                    <View style={{ width: "34%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     Name of the Dealer/Distributer:</Text>
                    </View>
                    <View style={{ width: "68%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "60%", flexDirection: 'row', marginTop: 15, marginLeft: 5 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>4) </Text>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            AMC Plan
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "22%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 15, color: '#000' }}>•	     Plan Start Date:</Text>
                    </View>
                    <View style={{ width: "17%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                        <Text style={{ fontSize: '10px', marginTop: 5, color: '#000' }}>Plan End Date:</Text>
                    </View>
                    <View style={{ width: "10%" }}>
                        <Text style={{
                            fontSize: 10,
                            marginTop: 5,
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
                    <View style={{ width: "60%", flexDirection: 'row', marginTop: 15, marginLeft: 5 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>5) </Text>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Terms And Conditions
                        </Text>
                    </View>
                </View>


                <View style={styles.Course}>
                    <View style={{ width: "22%", flexDirection: 'row', marginTop: 10, marginLeft: 15 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>A) </Text>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Inclusion:
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "92%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 25, color: '#000' }}>This AMC plan covers:</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>1.	All PCB’s, Electronics Circuits, Sensor, Compressor, Sealed system, Capillary, Drier, Relay, thermostat, Fan </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>Motor, Timer, Thermal Fuse.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>2.	All breakdown calls with no service charges & transportation for the above parts. However, transportation shall be </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>considered as per Clause 9 of General Terms and Conditions. </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "100%", flexDirection: 'row', marginTop: 10, marginLeft: 15 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>B) </Text>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            Exclusion:
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 4, marginLeft: 25, color: '#000' }}>This AMC plan excludes:</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>1.	Glass materials, Colored Components, Plastic Parts, Door Gasket Assembly, Light bulb, light Switch, Cabinet liner, </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>main liner crack, Doors, Bulbs, rubber pads, consumables, and any aesthetical damage to the refrigerator & </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>components.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%", flexDirection: 'row', marginTop: 10, marginLeft: 15 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>C) </Text>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            AMC is null and void in following cases:-
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>1.	Usage of Refrigerator is not as per instruction manual.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>2.	Defects caused by improper use, modification or substitution, negligence, tampering to parts, use on current or </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>voltage other than those specified by LHI.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>3.	Refrigerator serial number is altered, removed, defaced or is ineligible.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>4.	If Refrigerator is used for commercial purpose.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>5.	Improper ventilation, improper voltage, use of external materials, normal wear and tear.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>6.	Any defects caused by household pets, rats, cockroaches or any other animals or insects. </Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '20px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>In case of any support please call our customer helpline.</Text>
                    </View>
                    <View style={{ width: "40%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>CIN U74120MH2013FTC245571</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>Customer Care: 7038 100 400</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%", flexDirection: 'row', }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>Website:</Text>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5, textDecoration: 'underline' }}>home.liebherr.com</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%", flexDirection: 'row', }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>Email:</Text>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5, textDecoration: 'underline' }}>customercare.lhi@liebherr.com</Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '10px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 5, marginLeft: 5 }}>Edition 01</Text>
                    </View>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>

                <View style={[styles.header]}>
                    <Image src={Liebherrlogo} style={[styles.image]} />
                    <View style={{ flex: '40' }}>
                        <Text style={{ fontSize: '10px', marginLeft: 70, fontFamily: 'Poppins', fontWeight: 600 }}>CERTIFICATE OF ANNUAL MAINTENANCE CONTRACT  </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: '10px', marginLeft: 50, fontFamily: 'Poppins', fontWeight: 600 }}>FO_1631 LHI</Text>
                    </View>

                </View>


                <View style={styles.Course}>
                    <View style={{ width: "100%", marginTop: 17 }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>7.	Exposure to moisture / dampness / extreme thermal or environmental conditions or rapid changes in such conditions </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>/ corrosions / oxidations / spillage of food/liquid/influence of chemical substances.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>8.	AMC is not applicable, if Refrigerator is operated outside of India.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%", flexDirection: 'row', marginTop: 2, marginLeft: 15 }}>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>D) </Text>
                        <Text style={{ fontSize: 9, color: '#000', fontFamily: 'Poppins', fontWeight: 600, textDecoration: 'underline' }}>
                            General terms and conditions:-
                        </Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>1.	Refrigerator purchased from LHI authorized distributor / dealer will only qualify for AMC.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>2.	This plan offers free repairs to appliance within the plan Start & End Date. It is ensured that the repairs has to be </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>carried out through LHI authorized service center.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>3.	On expiry of the Warranty Period, the Customer may enter into an AMC for a period of one year.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>4.	AMC is confined to the first purchase of the AMC plan only & is non-transferable.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>5.	The maximum liability of LHI through this AMC is limited to the repairing of Refrigerators.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>6.	To avail the services under this contract, customer shall register their complaint at LHI Customer Care only and has </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>to produce this certificate at the time of claiming services. Any change in address shall be notified by the customer</Text>
                    </View>
                </View>

                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>in advance.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>7.	In case AMC is taken after expiry of warranty period, the AMC shall be given subject to checking and verification of </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>the Refrigerator and its working conditions by the company representative. In case refrigerator is found defective,</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>then refrigerator shall be repaired on chargeable basis before including under AMC.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>8.	Acceptance / Renewal of AMC after expiry of previous AMC shall be at sole discretion of LHI.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>9.	The AMC is offered only within the municipal limit of the city/town of LHI authorized service centers. However, </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>customers residing beyond the municipal limits of the jurisdiction of LHI authorized service center, in such case </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>customer has to bring the Refrigerator at his own cost to the LHI authorized service center.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>10.	In case the customer wants to cancel the AMC before completion of the period, in that case LHI shall not refund</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>any charges for the balance period. </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>11.	While every effort shall be made to give preferential attention to emergency breakdown of the refrigerator, LHI shall </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>not be held responsible including any such loss but not limited to consequential losses. </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>12.	Any damages to the Refrigerator or any other part due to transportation / shifting is not cover under this contract. </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>13.	All defective components shall be replaced with compatible working parts & defective parts shall be the property of</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>LHI.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>14.	AMC does not cover any kind of installations/Dismantling</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>15.	In the event of any unforeseen circumstance and spares not being available, LHI’s prevailing depreciation rules will </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>be binding on customer, and same shall be considered as commercial solution in lieu of repairs.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>16.	The customer shall not directly or indirectly alter or tamper the refrigerator, which would change the internal operat-</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>ion of the refrigerator. In such case, the LHI and its authorized service center shall not be liable to provide service or</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>repair the refrigerator, and decision of LHI authorized service center shall be final and binding on the customer.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>17.	AMC is non-refundable and non-transferable (resale / gift to any other person, third party claim etc.).</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>18.	The Refrigerator brought to the service center will remain at the service center at customer’s risk and LHI shall not </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>be responsible for any damages caused due to factors beyond its control.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>19.	Any other product bundled with the refrigerator and come with the prevailing agent's warranty, in such case LHI </Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 25, color: '#000' }}>makes no warranty whatsoever on their behalf. Example: Chopper given with the Refrigerator.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>20.	LHI reserve the right to amend price, terms and conditions of this AMC at any time without any notice to the customer.</Text>
                    </View>
                </View>
                <View style={styles.Course}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 2, marginLeft: 15, color: '#000' }}>21.	All Disputes arising out of this contract are subject to the court of Aurangabad Maharashtra Jurisdiction only.</Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '20px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9', marginTop: 5, marginLeft: 5, color: '#000', textDecoration: 'underline', fontFamily: 'Poppins', fontWeight: 600 }}>Declaration</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: '10px', marginTop: 5, marginLeft: 5, color: '#000' }}>I have read & understand the above-mentioned terms & conditions of the LHI AMC plan & agree to accept and abide by the same  </Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ fontSize: 9, marginTop: 5, marginLeft: 5, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>Liebherr Appliances India Private Limited</Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '43px' }]}>
                    <View style={{ width: "70%" }}>
                        <Text style={{ fontSize: 9, marginLeft: 5, color: '#000', fontFamily: 'Poppins', fontWeight: 600 }}>Authorized Signatory </Text>
                    </View>
                    <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: 9, marginLeft: 5, color: '#000', textDecoration: 'underline', fontFamily: 'Poppins', fontWeight: 600 }}>Customer's Signature With Date:</Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '5px' }]}>
                    <View style={{ width: "70%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 3, marginLeft: 5 }}>In case of any support please call our customer helpline.</Text>
                    </View>
                    <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>CIN U74120MH2013FTC245571</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>Customer Care: 7038 100 400</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%", flexDirection: 'row', }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>Website:</Text>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5, textDecoration: 'underline' }}>home.liebherr.com</Text>
                    </View>
                </View>
                <View style={[styles.Course]}>
                    <View style={{ width: "100%", flexDirection: 'row', }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>Email:</Text>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5, textDecoration: 'underline' }}>customercare.lhi@liebherr.com</Text>
                    </View>
                </View>

                <View style={[styles.Course, { marginTop: '10px' }]}>
                    <View style={{ width: "60%" }}>
                        <Text style={{ fontSize: '9px', marginTop: 2, marginLeft: 5 }}>Edition 01</Text>
                    </View>
                </View>






            </Page>
        </Document>
    )

};
export default AmcCertificate
