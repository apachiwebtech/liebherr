import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExporttoProduct = () => {

    const [jsonData, setJsonData] = useState(null);
    function excelSerialToDate(serial) {
        const date = new Date((serial - 25569) * 86400000); // Convert to milliseconds
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    function convertExcelSerialToDateTime(excelSerial) {
        const millisecondsPerDay = 86400000; // 24 * 60 * 60 * 1000
        const jsDate = new Date((excelSerial - 25569) * millisecondsPerDay);
        return jsDate; // Returns full Date object with time
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);


            // Transform data to separate remarks while keeping ticketno common
            const selectedColumns = parsedData.map((row) => ({
                    CustomerID: row.CustomerNumber || "",
                    CustomerName: row.customer_name || "",
                    ModelNumber: row.model_no || "",
                    serial_no : String(row.serial_no ?row.serial_no : "" ) || "",
                    address : row.address || "",
                    pincode : String(row.pincode  ?row.pincode  :"") || "",
                    created_date : row.InvoiceDate ? excelSerialToDate(row.InvoiceDate) : "",
                    purchase_date : row.InvoiceDate ? excelSerialToDate(row.InvoiceDate) : "",
                    warrenty_sdate : row.WarrantyStartDate ? excelSerialToDate(row.WarrantyStartDate) : "",
                    warrenty_edate : row.WarrantyEndDate ? excelSerialToDate(row.WarrantyEndDate) : "",
                    InvoiceDate : row.InvoiceDate ? excelSerialToDate(row.InvoiceDate) : "",
                    InvoiceNumber : row.InvoiceNumber || "",
                    ModelName : row.Name || "",
                    Short_model_no :  "",
                    SerialStatus : row['Serial Status'] || "",
                    Notes : row['Notes'] || "",
                    BranchName : row.BranchName || "",
                    CustomerAccountStatus : row['Customer Account Status'] || "",
                    SalesDealer : row.SalesDealer || "",
                    SubDealer : row.SubDealer || "",
                    customer_classification : row.customer_classification || "",
                    test1 : 'test1',
                    test2 : 'test1',
                    test3 : 'test1',
                    test4 : 'test1',
                    test5 : 'test1',
                    test6 : 'test1',
                    test7 : 'test1',
                    test8 : 'test1',
                    test9 : 'test1',
                    test10 : 'test1',
                    test11 : 'test1',
                    test12 : 'test1',
                    test13 : 'test1',
                    test14 : 'test1',
                    test15 : 'test1',
                    test16 : 'test1',
                    test17 : 'test1',
                    test18 : 'test1',
                    test19 : 'test1',
                    test20 : 'test1',
                    test21 : 'test1',
                    test22 : 'test1',
                    test23 : 'test1',
                    test24 : 'test1',
                    test25 : 'test1',
                    test26 : 'test1',
                    test27 : 'test1',
                    test28 : 'test1',
                    test29 : 'test1',
                    test30 : 'test1',
                    test31 : 'test1',
                    test32 : 'test1',
                    test33 : 'test1',
                    test34 : 'test1',
                    test35 : 'test1',
                    test36 : 'test1',
                    test37 : 'test1',
                    test38 : 'test1',
                    test39 : 'test1',
                    test40 : 'test1',
                    test41 : 'test1',
                    test42 : 'test1',
                    test43 : 'test1',
                    test44 : 'test1',
                    test45 : 'test1',
                    test46 : 'test1',
                    test47 : 'test1',
                    test48 : 'test1',
                    test49 : 'test1',
                    test50 : 'test1',
                    test51: 'test1',
                test52: 'test1',
                test53: 'test1',
                test54: 'test1',
                test55: 'test1',
                test56: 'test1',
                test57: 'test1',
                test58: 'test1',
                test59: 'test1',
                test60: 'test1',
                test61: 'test1',
                test62: 'test1',
                test63: 'test1',
                test64: 'test1',
                test65: 'test1',
                test66: 'test1',
                test67: 'test1',
                test68: 'test1',
                test69: 'test1',
                test70: 'test1',
                test71: 'test1',
                test72: 'test1',
                test73: 'test1',
                test74: 'test1',
                test75: 'test1',
                test76: 'test1',
                test77: 'test1',
                test78: 'test1',
                test79: 'test1',
                test80: 'test1',
                test81: 'test1',
                test82: 'test1',
                test83: 'test1',
                test84: 'test1',
                test85: 'test1',
                test86: 'test1',
                test87: 'test1',
                test88: 'test1',
                test89: 'test1',
                test90: 'test1',
                test91: 'test1',
                test92: 'test1',
                test93: 'test1',
                test94: 'test1',
                test95: 'test1',
                test96: 'test1',
                test97: 'test1',
                test98: 'test1',
                test99: 'test1',
                test100: 'test1',
                test101: 'test1',
                test102: 'test1',
                test103: 'test1',
                test104: 'test1',
                test105: 'test1',
                test106: 'test1',
                test107: 'test1',
                test108: 'test1',
                test109: 'test1',
                test110: 'test1',
                test111: 'test1',
                test112: 'test1',
                test113: 'test1',
                test114: 'test1',
                test115: 'test1',
                test116: 'test1',
                test117: 'test1',
                test118: 'test1',
                test119: 'test1',
                test120: 'test1',
                test121: 'test1',
                test122: 'test1',
                test123: 'test1',
                test124: 'test1',
                test125: 'test1',
                test126: 'test1',
                test127: 'test1',
                test128: 'test1',
                test129: 'test1',
                test130: 'test1',
                test131: 'test1',
                test132: 'test1',
                test133: 'test1',
                test134: 'test1',
                test135: 'test1',
                test136: 'test1',
                test137: 'test1',
                test138: 'test1',
                test139: 'test1',
                test140: 'test1',
                test141: 'test1',
                test142: 'test1',
                test143: 'test1',
                test144: 'test1',
                test145: 'test1',
                test146: 'test1',
                test147: 'test1',
                test148: 'test1',
                test149: 'test1',
                test150: 'test1',
                test151: 'test1',
                test152: 'test1',
                test153: 'test1',
                test154: 'test1',
                test155: 'test1',
                test156: 'test1',
                test157: 'test1',
                test158: 'test1',
                test159: 'test1',
                test160: 'test1',
                test161: 'test1',
                test162: 'test1',
                test163: 'test1',
                test164: 'test1',
                test165: 'test1',
                test166: 'test1',
                test167: 'test1',
                test168: 'test1',
                test169: 'test1',
                test170: 'test1',
                test171: 'test1',
                test172: 'test1',
                test173: 'test1',
                test174: 'test1',
                test175: 'test1',
                test176: 'test1',
                test177: 'test1',
                test178: 'test1',
                test179: 'test1',
                test180: 'test1',
                test181: 'test1',
                test182: 'test1',
                test183: 'test1',
                test184: 'test1',
                test185: 'test1',
                test186: 'test1',
                test187: 'test1',
                test188: 'test1',
                test189: 'test1',
                test190: 'test1',
                test191: 'test1',
                test192: 'test1',
                test193: 'test1',
                test194: 'test1',
                test195: 'test1',
                test196: 'test1',
                test197: 'test1',
                test198: 'test1',
                test199: 'test1',
                test200: 'test1',
                test201: 'test1',
                test202: 'test1',
                test203: 'test1',
                test204: 'test1',
                test205: 'test1',
                test206: 'test1',
                test207: 'test1',
                test208: 'test1',
                test209: 'test1',
                test210: 'test1',
                test211: 'test1',
                test212: 'test1',
                test213: 'test1',
                test214: 'test1',
                test215: 'test1',
                test216: 'test1',
                test217: 'test1',
                test218: 'test1',
                test219: 'test1',
                test220: 'test1',
                test221: 'test1',
                test222: 'test1',
                test223: 'test1',
                test224: 'test1',
                test225: 'test1',
                test226: 'test1',
                test227: 'test1',
                test228: 'test1',
                test229: 'test1',
                test230: 'test1',
                test231: 'test1',
                test232: 'test1',
                test233: 'test1',
                test234: 'test1',
                test235: 'test1',
                test236: 'test1',
                test237: 'test1',
                test238: 'test1',
                test239: 'test1',
                test240: 'test1',
                test241: 'test1',
                test242: 'test1',
                test243: 'test1',
                test244: 'test1',
                test245: 'test1',
                test246: 'test1',
                test247: 'test1',
                test248: 'test1',
                test249: 'test1',
                test250: 'test1',
                test251: 'test1',
                test252: 'test1',
                test253: 'test1',
                test254: 'test1',
                test255: 'test1',
                test256: 'test1',
                test257: 'test1',
                test258: 'test1',
                test259: 'test1',
                test260: 'test1',
                test261: 'test1',
                test262: 'test1',
                test263: 'test1',
                test264: 'test1',
                test265: 'test1',
                test266: 'test1',
                test267: 'test1',
                test268: 'test1',
                test269: 'test1',
                test270: 'test1',
                test271: 'test1',
                test272: 'test1',
                test273: 'test1',
                test274: 'test1',
                test275: 'test1',
                test276: 'test1',
                test277: 'test1',
                test278: 'test1',
                test279: 'test1',
                test280: 'test1',
                test281: 'test1',
                test282: 'test1',
                test283: 'test1',
                test284: 'test1',
                test285: 'test1',
                test286: 'test1',
                test287: 'test1',
                test288: 'test1',
                test289: 'test1',
                test290: 'test1',
                test291: 'test1',
                test292: 'test1',
                test293: 'test1',
                test294: 'test1',
                test295: 'test1',
                test296: 'test1',
                test297: 'test1',
                test298: 'test1',
                test299: 'test1',
                test300: 'test1',
                test301: 'test1',
                test302: 'test1',
                test303: 'test1',
                test304: 'test1',
                test305: 'test1',
                test306: 'test1',
                test307: 'test1',
                test308: 'test1',
                test309: 'test1',
                test310: 'test1',
                test311: 'test1',
                test312: 'test1',
                test313: 'test1',
                test314: 'test1',
                test315: 'test1',
                test316: 'test1',
                test317: 'test1',
                test318: 'test1',
                test319: 'test1',
                test320: 'test1',
                test321: 'test1',
                test322: 'test1',
                test323: 'test1',
                test324: 'test1',
                test325: 'test1',
                test326: 'test1',
                test327: 'test1',
                test328: 'test1',
                test329: 'test1',
                test330: 'test1',
                test331: 'test1',
                test332: 'test1',
                test333: 'test1',
                test334: 'test1',
                test335: 'test1',
                test336: 'test1',
                test337: 'test1',
                test338: 'test1',
                test339: 'test1',
                test340: 'test1',
                test341: 'test1',
                test342: 'test1',
                test343: 'test1',
                test344: 'test1',
                test345: 'test1',
                test346: 'test1',
                test347: 'test1',
                test348: 'test1',
                test349: 'test1',
                test350: 'test1',
                test351: 'test1',
                test352: 'test1',
                test353: 'test1',
                test354: 'test1',
                test355: 'test1',
                test356: 'test1',
                test357: 'test1',
                test358: 'test1',
                test359: 'test1',
                test360: 'test1',
                test361: 'test1',
                test362: 'test1',
                test363: 'test1',
                test364: 'test1',
                test365: 'test1',
                test366: 'test1',
                test367: 'test1',
                test368: 'test1',
                test369: 'test1',
                test370: 'test1',
                test371: 'test1',
                test372: 'test1',
                test373: 'test1',
                test374: 'test1',
                test375: 'test1',
                test376: 'test1',
                test377: 'test1',
                test378: 'test1',
                test379: 'test1',
                test380: 'test1',
                test381: 'test1',
                test382: 'test1',
                test383: 'test1',
                test384: 'test1',
                test385: 'test1',
                test386: 'test1',
                test387: 'test1',
                test388: 'test1',
                test389: 'test1',
                test390: 'test1',
                test391: 'test1',
                test392: 'test1',
                test393: 'test1',
                test394: 'test1',
                test395: 'test1',
                test396: 'test1',
                test397: 'test1',
                test398: 'test1',
                test399: 'test1',
                test400: 'test1',
                test401: 'test1',
                test402: 'test1',
                test403: 'test1',
                test404: 'test1',
                test405: 'test1',
                test406: 'test1',
                test407: 'test1',
                test408: 'test1',
                test409: 'test1',
                test410: 'test1',
                test411: 'test1',
                test412: 'test1',
                test413: 'test1',
                test414: 'test1',
                test415: 'test1',
                test416: 'test1',
                test417: 'test1',
                test418: 'test1',
                test419: 'test1',
                test420: 'test1',
                test421: 'test1',
                test422: 'test1',
                test423: 'test1',
                test424: 'test1',
                test425: 'test1',
                test426: 'test1',
                test427: 'test1',
                test428: 'test1',
                test429: 'test1',
                test430: 'test1',
                test431: 'test1',
                test432: 'test1',
                test433: 'test1',
                test434: 'test1',
                test435: 'test1',
                test436: 'test1',
                test437: 'test1',
                test438: 'test1',
                test439: 'test1',
                test440: 'test1',
                test441: 'test1',
                test442: 'test1',
                test443: 'test1',
                test444: 'test1',
                test445: 'test1',
                test446: 'test1',
                test447: 'test1',
                test448: 'test1',
                test449: 'test1',
                test450: 'test1',
                test451: 'test1',
                test452: 'test1',
                test453: 'test1',
                test454: 'test1',
                test455: 'test1',
                test456: 'test1',
                test457: 'test1',
                test458: 'test1',
                test459: 'test1',
                test460: 'test1',
                test461: 'test1',
                test462: 'test1',
                test463: 'test1',
                test464: 'test1',
                test465: 'test1',
                test466: 'test1',
                test467: 'test1',
                test468: 'test1',
                test469: 'test1',
                test470: 'test1',
                test471: 'test1',
                test472: 'test1',
                test473: 'test1',
                test474: 'test1',
                test475: 'test1',
                test476: 'test1',
                test477: 'test1',
                test478: 'test1',
                test479: 'test1',
                test480: 'test1',
                test481: 'test1',
                test482: 'test1',
                test483: 'test1',
                test484: 'test1',
                test485: 'test1',
                test486: 'test1',
                test487: 'test1',
                test488: 'test1',
                test489: 'test1',
                test490: 'test1',
                test491: 'test1',
                test492: 'test1',
                test493: 'test1',
                test494: 'test1',
                test495: 'test1',
                test496: 'test1',
                test497: 'test1',
                test498: 'test1',
                test499: 'test1',
                test500: 'test1',
                test500: 'test1',
                test501: 'test1',
                test502: 'test1',
                test503: 'test1',
                test504: 'test1',
                test505: 'test1',
                test506: 'test1',
                test507: 'test1',
                test508: 'test1',
                test509: 'test1',
                test510: 'test1',
                test511: 'test1',
                test512: 'test1',
                test513: 'test1',
                test514: 'test1',
                test515: 'test1',
                test516: 'test1',
                test517: 'test1',
                test518: 'test1',
                test519: 'test1',
                test520: 'test1',
                test521: 'test1',
                test522: 'test1',
                test523: 'test1',
                test524: 'test1',
                test525: 'test1',
                test526: 'test1',
                test527: 'test1',
                test528: 'test1',
                test529: 'test1',
                test530: 'test1',
                test531: 'test1',
                test532: 'test1',
                test533: 'test1',
                test534: 'test1',
                test535: 'test1',
                test536: 'test1',
                test537: 'test1',
                test538: 'test1',
                test539: 'test1',
                test540: 'test1',
                test541: 'test1',
                test542: 'test1',
                test543: 'test1',
                test544: 'test1',
                test545: 'test1',
                test546: 'test1',
                test547: 'test1',
                test548: 'test1',
                test549: 'test1',
                test550: 'test1',
                test551: 'test1',
                test552: 'test1',
                test553: 'test1',
                test554: 'test1',
                test555: 'test1',
                test556: 'test1',
                test557: 'test1',
                test558: 'test1',
                test559: 'test1',
                test560: 'test1',
                test561: 'test1',
                test562: 'test1',
                test563: 'test1',
                test564: 'test1',
                test565: 'test1',
                test566: 'test1',
                test567: 'test1',
                test568: 'test1',
                test569: 'test1',
                test570: 'test1',
                test571: 'test1',
                test572: 'test1',
                test573: 'test1',
                test574: 'test1',
                test575: 'test1',
                test576: 'test1',
                test577: 'test1',
                test578: 'test1',
                test579: 'test1',
                test580: 'test1',
                test581: 'test1',
                test582: 'test1',
                test583: 'test1',
                test584: 'test1',
                test585: 'test1',
                test586: 'test1',
                test587: 'test1',
                test588: 'test1',
                test589: 'test1',
                test590: 'test1',
                test591: 'test1',
                test592: 'test1',
                test593: 'test1',
                test594: 'test1',
                test595: 'test1',
                test596: 'test1',
                test597: 'test1',
                test598: 'test1',
                test599: 'test1',
                test600: 'test1',
                test601: 'test1',
                test602: 'test1',
                test603: 'test1',
                test604: 'test1',
                test605: 'test1',
                test606: 'test1',
                test607: 'test1',
                test608: 'test1',
                test609: 'test1',
                test610: 'test1',
                test611: 'test1',
                test612: 'test1',
                test613: 'test1',
                test614: 'test1',
                test615: 'test1',
                test616: 'test1',
                test617: 'test1',
                test618: 'test1',
                test619: 'test1',
                test620: 'test1',
                test621: 'test1',
                test622: 'test1',
                test623: 'test1',
                test624: 'test1',
                test625: 'test1',
                test626: 'test1',
                test627: 'test1',
                test628: 'test1',
                test629: 'test1',
                test630: 'test1',
                test631: 'test1',
                test632: 'test1',
                test633: 'test1',
                test634: 'test1',
                test635: 'test1',
                test636: 'test1',
                test637: 'test1',
                test638: 'test1',
                test639: 'test1',
                test640: 'test1',
                test641: 'test1',
                test642: 'test1',
                test643: 'test1',
                test644: 'test1',
                test645: 'test1',
                test646: 'test1',
                test647: 'test1',
                test648: 'test1',
                test649: 'test1',
                test650: 'test1',
                test651: 'test1',
                test652: 'test1',
                test653: 'test1',
                test654: 'test1',
                test655: 'test1',
                test656: 'test1',
                test657: 'test1',
                test658: 'test1',
                test659: 'test1',
                test660: 'test1',
                test661: 'test1',
                test662: 'test1',
                test663: 'test1',
                test664: 'test1',
                test665: 'test1',
                test666: 'test1',
                test667: 'test1',
                test668: 'test1',
                test669: 'test1',
                test670: 'test1',
                test671: 'test1',
                test672: 'test1',
                test673: 'test1',
                test674: 'test1',
                test675: 'test1',
                test676: 'test1',
                test677: 'test1',
                test678: 'test1',
                test679: 'test1',
                test680: 'test1',
                test681: 'test1',
                test682: 'test1',
                test683: 'test1',
                test684: 'test1',
                test685: 'test1',
                test686: 'test1',
                test687: 'test1',
                test688: 'test1',
                test689: 'test1',
                test690: 'test1',
                test691: 'test1',
                test692: 'test1',
                test693: 'test1',
                test694: 'test1',
                test695: 'test1',
                test696: 'test1',
                test697: 'test1',
                test698: 'test1',
                test699: 'test1',
                test700: 'test1',
                test701: 'test1',
                test702: 'test1',
                test703: 'test1',
                test704: 'test1',
                test705: 'test1',
                test706: 'test1',
                test707: 'test1',
                test708: 'test1',
                test709: 'test1',
                test710: 'test1',
                test711: 'test1',
                test712: 'test1',
                test713: 'test1',
                test714: 'test1',
                test715: 'test1',
                test716: 'test1',
                test717: 'test1',
                test718: 'test1',
                test719: 'test1',
                test720: 'test1',
                test721: 'test1',
                test722: 'test1',
                test723: 'test1',
                test724: 'test1',
                test725: 'test1',
                test726: 'test1',
                test727: 'test1',
                test728: 'test1',
                test729: 'test1',
                test730: 'test1',
                test731: 'test1',
                test732: 'test1',
                test733: 'test1',
                test734: 'test1',
                test735: 'test1',
                test736: 'test1',
                test737: 'test1',
                test738: 'test1',
                test739: 'test1',
                test740: 'test1',
                test741: 'test1',
                test742: 'test1',
                test743: 'test1',
                test744: 'test1',
                test745: 'test1',
                test746: 'test1',
                test747: 'test1',
                test748: 'test1',
                test749: 'test1',
                test750: 'test1',
                test751: 'test1',
                test752: 'test1',
                test753: 'test1',
                test754: 'test1',
                test755: 'test1',
                test756: 'test1',
                test757: 'test1',
                test758: 'test1',
                test759: 'test1',
                test760: 'test1',
                test761: 'test1',
                test762: 'test1',
                test763: 'test1',
                test764: 'test1',
                test765: 'test1',
                test766: 'test1',
                test767: 'test1',
                test768: 'test1',
                test769: 'test1',
                test770: 'test1',
                test771: 'test1',
                test772: 'test1',
                test773: 'test1',
                test774: 'test1',
                test775: 'test1',
                test776: 'test1',
                test777: 'test1',
                test778: 'test1',
                test779: 'test1',
                test780: 'test1',
                test781: 'test1',
                test782: 'test1',
                test783: 'test1',
                test784: 'test1',
                test785: 'test1',
                test786: 'test1',
                test787: 'test1',
                test788: 'test1',
                test789: 'test1',
                test790: 'test1',
                test791: 'test1',
                test792: 'test1',
                test793: 'test1',
                test794: 'test1',
                test795: 'test1',
                test796: 'test1',
                test797: 'test1',
                test798: 'test1',
                test799: 'test1',
                test800: 'test1',
                test801: 'test1',
                test802: 'test1',
                test803: 'test1',
                test804: 'test1',
                test805: 'test1',
                test806: 'test1',
                test807: 'test1',
                test808: 'test1',
                test809: 'test1',
                test810: 'test1',
                test811: 'test1',
                test812: 'test1',
                test813: 'test1',
                test814: 'test1',
                test815: 'test1',
                test816: 'test1',
                test817: 'test1',
                test818: 'test1',
                test819: 'test1',
                test820: 'test1',
                test821: 'test1',
                test822: 'test1',
                test823: 'test1',
                test824: 'test1',
                test825: 'test1',
                test826: 'test1',
                test827: 'test1',
                test828: 'test1',
                test829: 'test1',
                test830: 'test1',
                test831: 'test1',
                test832: 'test1',
                test833: 'test1',
                test834: 'test1',
                test835: 'test1',
                test836: 'test1',
                test837: 'test1',
                test838: 'test1',
                test839: 'test1',
                test840: 'test1',
                test841: 'test1',
                test842: 'test1',
                test843: 'test1',
                test844: 'test1',
                test845: 'test1',
                test846: 'test1',
                test847: 'test1',
                test848: 'test1',
                test849: 'test1',
                test850: 'test1',
                test851: 'test1',
                test852: 'test1',
                test853: 'test1',
                test854: 'test1',
                test855: 'test1',
                test856: 'test1',
                test857: 'test1',
                test858: 'test1',
                test859: 'test1',
                test860: 'test1',
                test861: 'test1',
                test862: 'test1',
                test863: 'test1',
                test864: 'test1',
                test865: 'test1',
                test866: 'test1',
                test867: 'test1',
                test868: 'test1',
                test869: 'test1',
                test870: 'test1',
                test871: 'test1',
                test872: 'test1',
                test873: 'test1',
                test874: 'test1',
                test875: 'test1',
                test876: 'test1',
                test877: 'test1',
                test878: 'test1',
                test879: 'test1',
                test880: 'test1',
                test881: 'test1',
                test882: 'test1',
                test883: 'test1',
                test884: 'test1',
                test885: 'test1',
                test886: 'test1',
                test887: 'test1',
                test888: 'test1',
                test889: 'test1',
                test890: 'test1',
                test891: 'test1',
                test892: 'test1',
                test893: 'test1',
                test894: 'test1',
                test895: 'test1',
                test896: 'test1',
                test897: 'test1',
                test898: 'test1',
                test899: 'test1',
                test900: 'test1',
                test901: 'test1',
                test902: 'test1',
                test903: 'test1',
                test904: 'test1',
                test905: 'test1',
                test906: 'test1',
                test907: 'test1',
                test908: 'test1',
                test909: 'test1',
                test910: 'test1',
                test911: 'test1',
                test912: 'test1',
                test913: 'test1',
                test914: 'test1',
                test915: 'test1',
                test916: 'test1',
                test917: 'test1',
                test918: 'test1',
                test919: 'test1',
                test920: 'test1',
                test921: 'test1',
                test922: 'test1',
                test923: 'test1',
                test924: 'test1',
                test925: 'test1',
                test926: 'test1',
                test927: 'test1',
                test928: 'test1',
                test929: 'test1',
                test930: 'test1',
                test931: 'test1',
                test932: 'test1',
                test933: 'test1',
                test934: 'test1',
                test935: 'test1',
                test936: 'test1',
                test937: 'test1',
                test938: 'test1',
                test939: 'test1',
                test940: 'test1',
                test941: 'test1',
                test942: 'test1',
                test943: 'test1',
                test944: 'test1',
                test945: 'test1',
                test946: 'test1',
                test947: 'test1',
                test948: 'test1',
                test949: 'test1',
                test950: 'test1',
                test951: 'test1',
                test952: 'test1',
                test953: 'test1',
                test954: 'test1',
                test955: 'test1',
                test956: 'test1',
                test957: 'test1',
                test958: 'test1',
                test959: 'test1',
                test960: 'test1',
                test961: 'test1',
                test962: 'test1',
                test963: 'test1',
                test964: 'test1',
                test965: 'test1',
                test966: 'test1',
                test967: 'test1',
                test968: 'test1',
                test969: 'test1',
                test970: 'test1',
                test971: 'test1',
                test972: 'test1',
                test973: 'test1',
                test974: 'test1',
                test975: 'test1',
                test976: 'test1',
                test977: 'test1',
                test978: 'test1',
                test979: 'test1',
                test980: 'test1',
                test981: 'test1',
                test982: 'test1',
                test983: 'test1',
                test984: 'test1',
                test985: 'test1',
                test986: 'test1',
                test987: 'test1',
                test988: 'test1',
                test989: 'test1',
                test990: 'test1',
                test991: 'test1',
                test992: 'test1',
                test993: 'test1',
                test994: 'test1',
                test995: 'test1',
                test996: 'test1',
                test997: 'test1',
                test998: 'test1',
                test999: 'test1',
                test1000: 'test1'
            }));

            setJsonData(selectedColumns);
            exportJson(selectedColumns);
        };
        reader.readAsArrayBuffer(file);
    };


    const exportJson = (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "filtered_data.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h2>Convert Excel to JSON</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            {jsonData && (
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {JSON.stringify(jsonData, null, 2)}
                </pre>
            )}
        </div>
    );
};

export default ExporttoProduct;
