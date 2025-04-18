import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExceltoAddress = () => {

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
                    customer_id: row.CustomerNumber || "",
                    address: row.address || "",
                    pincode_id: String(row.pincode ?row.pincode : "" ) || "",
                    geocity_id : row.City || "",
                    geostate_id : row.State || "",
                    district_id : row.BranchName || "",
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

export default ExceltoAddress;
