import * as React from "react";
import { useEffect, useState } from "react";
import CustomLoader from "./Loder/CustomLoder";
import { DefaultButton, Icon, IconButton } from "@fluentui/react";
import { Web } from "@pnp/sp/presets/all";
import * as moment from "moment";
import {
  DetailsList,
  IDetailsListStyles,
  SelectionMode,
} from "@fluentui/react";
import Pagination from "@material-ui/lab/Pagination";
import styles from "./FieldQualityDashboard.module.scss";
import {
  FocusTrapZone,
  Layer,
  mergeStyleSets,
  Overlay,
  Popup,
} from "office-ui-fabric-react";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";

// interfaces
interface IProps {
  spcontext: any;
  DashboardChangeFun: any;
}
interface ITravelExpenseData {
  depatureDate: string;
  departureTime: string;
  arrivalTime: string;
  depaturedayOrBusinessTrip: string;
  purposeOfTravel: string;
  destination: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  depatureorArrivalday: string;
  eightToHours: string;
  twentyfourHours: string;
  deductMeals: string;
  totalDeduction: string;
  totalAmt: string;
  employee: string;
}

// global variables
// let spweb = Web(
//     "https://atclogisticsie.sharepoint.com/sites/PlanningOperations/Field%20Quality"
//   );
let spweb = Web(
  "https://atclogisticsie.sharepoint.com/sites/TechnoRUCS_Dev_Site"
);
const TravelExpense = (props: IProps) => {
  // style variables
  const gridStyles: Partial<IDetailsListStyles> = {
    root: {
      selectors: {
        "& [role=grid]": {
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          ".ms-DetailsRow-cell": {
            display: "flex",
            alignItems: "center",
            height: 50,
            minHeight: 50,
            padding: "5px 10px",
            margin: "auto",
          },
          ".ms-DetailsHeader-cellName": {
            color: "#c56b70",
          },
          ".ms-DetailsHeader-cellTitle": {
            padding: "0px 8px 0px 10px",
          },
        },
        ".root-154": {
          color: "#f0d8d8",
          backgroundColor: "#3635399e",
        },
        ".root-140": {
          borderBottom: "1px solid #b8bbde",
        },
      },
    },
    headerWrapper: {
      flex: "0 0 auto",
    },
    contentWrapper: {
      flex: "1 1 auto",
      overflowY: "auto",
      overflowX: "hidden",
    },
  };
  const popupStyles = mergeStyleSets({
    root: {
      background: "rgba(0, 0, 0, 0.2)",
      bottom: "0",
      left: "0",
      position: "fixed",
      right: "0",
      top: "0",
    },
    content: {
      background: "white",
      left: "50%",
      maxWidth: "700px",
      padding: "20px 30px 30px 30px",
      position: "absolute",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "300px",
      textAlign: "center",
      height: "100px",
    },
  });

  //   variables
  let _col = [
    {
      key: "column1",
      name: "Name",
      fieldName: "employee",
      minWidth: 100,
      maxWidth: 130,
      onRender: (item) => (
        <>
          <div>{item.employee ? item.employee : "-"}</div>
        </>
      ),
    },
    {
      key: "column2",
      name: "Departure Date",
      fieldName: "depatureDate",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.depatureDate ? item.depatureDate : "-"}</div>
        </>
      ),
    },
    {
      key: "column3",
      name: "Start Time",
      fieldName: "departureTime",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.departureTime ? item.departureTime : "-"}</div>
        </>
      ),
    },
    {
      key: "column4",
      name: "End Time",
      fieldName: "arrivalTime",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.arrivalTime ? item.arrivalTime : "-"}</div>
        </>
      ),
    },
    {
      key: "column5",
      name: "Departure Date",
      fieldName: "depaturedayOrBusinessTrip",
      minWidth: 130,
      maxWidth: 150,
      onRender: (item) => (
        <>
          <div>
            {item.depaturedayOrBusinessTrip
              ? item.depaturedayOrBusinessTrip
              : "-"}
          </div>
        </>
      ),
    },
    {
      key: "column6",
      name: "Purpose Of Travel",
      fieldName: "purposeOfTravel",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.purposeOfTravel ? item.purposeOfTravel : "-"}</div>
        </>
      ),
    },
    {
      key: "column7",
      name: "Destination",
      fieldName: "destination",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.destination ? item.destination : "-"}</div>
        </>
      ),
    },
    {
      key: "column8",
      name: "Breakfast",
      fieldName: "breakfast",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.breakfast ? item.breakfast : "-"}</div>
        </>
      ),
    },
    {
      key: "column9",
      name: "Lunch",
      fieldName: "lunch",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.lunch ? item.lunch : "-"}</div>
        </>
      ),
    },
    {
      key: "column10",
      name: "Dinner",
      fieldName: "dinner",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.dinner ? item.dinner : "-"}</div>
        </>
      ),
    },
    {
      key: "column11",
      name: "An/Abreisetag",
      fieldName: "depatureorArrivalday",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>
            {item.depatureorArrivalday ? item.depatureorArrivalday : "-"}
          </div>
        </>
      ),
    },
    {
      key: "column12",
      name: "8-24 Stunden",
      fieldName: "eightToHours",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.eightToHours ? item.eightToHours : "-"}</div>
        </>
      ),
    },
    {
      key: "column13",
      name: "24 Std",
      fieldName: "twentyfourHours",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.twentyfourHours ? item.twentyfourHours : "-"}</div>
        </>
      ),
    },
    {
      key: "column13",
      name: "Deduct Meals",
      fieldName: "deductMeals",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.deductMeals ? item.deductMeals : "-"}</div>
        </>
      ),
    },
    {
      key: "column14",
      name: "Gesamte Abzüge",
      fieldName: "totalDeduction",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.totalDeduction ? item.totalDeduction : "-"}</div>
        </>
      ),
    },
    {
      key: "column15",
      name: "Abzug Mahlzeiten",
      fieldName: "deductMeals",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.deductMeals ? item.deductMeals : "-"}</div>
        </>
      ),
    },
    {
      key: "column16",
      name: "Total Amt.",
      fieldName: "totalAmt",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.totalAmt ? item.totalAmt : "-"}</div>
        </>
      ),
    },
  ];
  let currpage = 1;
  let totalPageItems = 30;

  // state varibles
  const [loader, setloader] = useState<boolean>(true);
  const [travelExpenseData, settravelExpenseData] = useState<
    ITravelExpenseData[]
  >([]);
  const [currentPage, setCurrentPage] = useState(currpage);
  const [displayData, setDisplayData] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  //  functions
  const getTravelExpenses = (): void => {
    let filterQuery: string = ` <View Scope='RecursiveAll'>
    <Query>
      <OrderBy>
        <FieldRef Name='ID' Ascending='FALSE'/>
      </OrderBy>
    </Query>
    <ViewFields>
      <FieldRef Name='ID' />
      <FieldRef Name='DepartureDate' />
      <FieldRef Name='StartTime' />
      <FieldRef Name='EndTime' />
      <FieldRef Name='DepartureDayOrBusinessTrip' />
      <FieldRef Name='PurposeOfTravel' />
      <FieldRef Name='Destination' />
      <FieldRef Name='Breakfast' />
      <FieldRef Name='Lunch' />
      <FieldRef Name='Dinner' />
      <FieldRef Name='DepartureOrArrivalDay' />
      <FieldRef Name='_x0038_to24hours' />
      <FieldRef Name='_x0032_4hours' />
      <FieldRef Name='DeductMeals' />
      <FieldRef Name='TotalDeductions' />
      <FieldRef Name='TotalAmount' />
      <FieldRef Name='Employee' />   
    </ViewFields>
    <RowLimit Paged='TRUE'>5000</RowLimit>
  </View>`;
    let _tempExpenseArr: any[] = [];
    const getData = (): void => {
      spweb.lists
        .getByTitle("TMST_TravelExpense_Details")
        .renderListDataAsStream({
          ViewXml: filterQuery,
        })
        .then((res: any) => {
          _tempExpenseArr.push(...res.Row);
          if (res.NextHref) {
            getThresholdDataLooping(res.NextHref, filterQuery, _tempExpenseArr);
          } else {
            travelExpenseFunc(_tempExpenseArr);
          }
        })
        .catch((err) => errFunction(err, "getTravelExpenses"));
    };
    const getThresholdDataLooping = (
      nextHref: any,
      Filtercondition: string,
      _tempExpenseArr: any[]
    ) => {
      _tempExpenseArr = [..._tempExpenseArr];
      spweb.lists
        .getByTitle("TMST_TravelExpense_Details")
        .renderListDataAsStream({
          ViewXml: Filtercondition,
          Paging: nextHref.substring(1),
        })
        .then(function (data) {
          _tempExpenseArr.push(...data.Row);
          if (data.NextHref) {
            getThresholdDataLooping(
              data.NextHref,
              Filtercondition,
              _tempExpenseArr
            );
          } else {
            travelExpenseFunc(_tempExpenseArr);
          }
        })
        .catch((err) => errFunction(err, "getThresholdDataLooping"));
    };
    const travelExpenseFunc = (_data: any[]): void => {
      if (_data.length) {
        let _tempArr: ITravelExpenseData[] = [];
        _data.forEach((item: any, i: number) => {
          _tempArr.push({
            depatureDate: item.DepartureDate ? item.DepartureDate : "",
            departureTime: item.StartTime ? item.StartTime : "",
            arrivalTime: item.EndTime ? item.EndTime : "",
            depaturedayOrBusinessTrip: item.DepartureDayOrBusinessTrip
              ? item.DepartureDayOrBusinessTrip
              : "",
            purposeOfTravel: item.PurposeOfTravel ? item.PurposeOfTravel : "",
            destination: item.Destination ? item.Destination : "",
            breakfast: item.Breakfast ? item.Breakfast : "",
            lunch: item.Lunch ? item.Lunch : "",
            dinner: item.Dinner ? item.Dinner : "",
            depatureorArrivalday: item.DepartureOrArrivalDay
              ? item.DepartureOrArrivalDay
              : "",
            eightToHours: item._x0038_to24hours ? item._x0038_to24hours : "",
            twentyfourHours: item._x0032_4hours ? item._x0032_4hours : "",
            deductMeals: item.DeductMeals ? item.DeductMeals : "",
            totalDeduction: item.TotalDeductions ? item.TotalDeductions : "",
            totalAmt: item.TotalAmount ? item.TotalAmount : "",
            employee: item.Employee.length ? item.Employee[0].title : "",
          });
          if (_tempArr.length - 1 == i) {
            paginateFunction(1, _tempArr);
            settravelExpenseData([..._tempArr]);
            setloader(false);
          }
        });
      } else {
        settravelExpenseData([]);
      }
    };
    getData();
  };
  const paginateFunction = (pagenumber, data: any[]) => {
    if (data.length > 0) {
      let lastIndex: number = pagenumber * totalPageItems;
      let firstIndex: number = lastIndex - totalPageItems;
      let paginatedItems = data.slice(firstIndex, lastIndex);
      currpage = pagenumber;
      setCurrentPage(pagenumber);
      setDisplayData(paginatedItems);
    } else {
      setCurrentPage(1);
    }
  };
  const generateExcel = async (list) => {
    let borderStyles = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    if (list.length != 0) {
      let arrExport = list;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Travel Expense Sheet");

      worksheet.columns = [
        { header: "Employee", key: "employee", width: 25 },
        { header: "Departure Date", key: "departuredate", width: 25 },
        { header: "Departure Time", key: "departuretime", width: 25 },
        { header: "Arrival Time", key: "arrivaltime", width: 25 },
        {
          header: "Departure Day / Business Trip",
          key: "departurebusiness",
          width: 25,
        },
        { header: "Purpose of Travel", key: "purposeoftravel", width: 25 },
        { header: "Destination", key: "destination", width: 25 },
        { header: "Breakfast", key: "breakfast", width: 25 },
        {
          header: "Lunch",
          key: "lunch",
          width: 25,
        },
        { header: "Dinner", key: "dinner", width: 25 },
        { header: "An/Abreisetag", key: "arrivaldepartureday", width: 25 },
        { header: "8-24 Stunden", key: "eighthrs", width: 25 },
        { header: "24 Std", key: "twentyfourhrs", width: 25 },
        {
          header: "Gesamte Abzüge",
          key: "totaldeductions",
          width: 25,
        },
        { header: "Abzug Mahlzeiten", key: "mealdeduction", width: 25 },
        { header: "Total Amount", key: "totalamount", width: 25 },
      ];

      await arrExport.forEach((item) => {
        worksheet.addRow({
          employee: item.employee ? item.employee : "-",
          departuredate: item.depatureDate ? item.depatureDate : "-",
          departuretime: item.departureTime ? item.departureTime : "-",
          arrivaltime: item.arrivalTime ? item.arrivalTime : "-",
          departurebusiness: item.depaturedayOrBusinessTrip
            ? item.depaturedayOrBusinessTrip
            : "-",
          purposeoftravel: item.purposeOfTravel ? item.purposeOfTravel : "-",
          destination: item.destination ? item.destination : "-",
          breakfast: item.breakfast ? item.breakfast : "-",
          lunch: item.lunch ? item.lunch : "-",
          dinner: item.dinner ? item.dinner : "-",
          arrivaldepartureday: item.depatureorArrivalday
            ? item.depatureorArrivalday
            : "-",
          eighthrs: item.eightToHours ? item.eightToHours : "-",
          twentyfourhrs: item.twentyfourHours ? item.twentyfourHours : "-",
          totaldeductions: item.totalDeduction ? item.totalDeduction : "-",
          mealdeduction: item.deductMeals ? item.deductMeals : "-",
          totalamount: item.totalAmt ? item.totalAmt : "-",
        });
      });
      await [
        "A1",
        "B1",
        "C1",
        "D1",
        "E1",
        "F1",
        "G1",
        "H1",
        "I1",
        "J1",
        "K1",
        "L1",
        "M1",
        "N1",
        "O1",
        "P1",
      ].map((key) => {
        worksheet.getCell(key).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "C5D9F1" },
        };
        worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
          cell.border = borderStyles;
        });
      });
      await [
        "A1",
        "B1",
        "C1",
        "D1",
        "E1",
        "F1",
        "G1",
        "H1",
        "I1",
        "J1",
        "K1",
        "L1",
        "M1",
        "N1",
        "O1",
        "P1",
      ].map((key, index) => {
        worksheet.getCell(key).color = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF" },
        };
        worksheet.getRow(index + 2).eachCell({ includeEmpty: true }, (cell) => {
          cell.border = borderStyles;
        });
      });

      await workbook.xlsx
        .writeBuffer()
        .then((buffer) => {
          FileSaver.saveAs(
            new Blob([buffer]),
            `ATC_Travel_Expense_${moment().format("DDMMYYYY_HH:mm")}.xlsx`
          );
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setIsPopupVisible(true);
    }
  };

  // errfunctions
  const errFunction = (err: any, fName: string): void => {
    console.log(err, fName);
  };

  useEffect(() => {
    getTravelExpenses();
  }, []);

  return (
    <>
      {loader ? (
        <CustomLoader />
      ) : (
        <div>
          {isPopupVisible && (
            <Layer>
              <Popup
                className={popupStyles.root}
                role="dialog"
                aria-modal="true"
                onDismiss={() => {
                  setIsPopupVisible(false);
                }}
              >
                <Overlay
                  onClick={() => {
                    setIsPopupVisible(false);
                  }}
                />
                <FocusTrapZone>
                  <div className={popupStyles.content}>
                    <h4>No data found</h4>
                    <DefaultButton
                      primary
                      text={"Ok"}
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#67c25f",
                        border: "1px solid #67c25f",
                      }}
                      onClick={() => setIsPopupVisible(false)}
                    />
                  </div>
                </FocusTrapZone>
              </Popup>
            </Layer>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <Icon
              style={{
                marginRight: "10px",
                fontSize: "20px",
                color: "#c9081c",
              }}
              iconName="PreviewLink"
            />
            <h2 style={{ margin: "0px", color: "#c9081c" }}>
              Travel Expense Dashboard
            </h2>
          </div>
          <div
            style={{
              margin: "20px 0px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <DefaultButton
                text={"Field Quality"}
                onClick={() =>
                  props.DashboardChangeFun("fieldQualityDashboard")
                }
                style={{
                  backgroundColor: "#dacbcc8c",
                  color: "#a83037",
                  border: "none",
                }}
              />
              <DefaultButton
                text={"Time Sheet"}
                onClick={() => props.DashboardChangeFun("timeSheetDashboard")}
                style={{
                  backgroundColor: "#dacbcc8c",
                  color: "#a83037",
                  border: "none",
                }}
              />
              <DefaultButton
                text={"Travel Expense"}
                style={{
                  backgroundColor: "#a83037",
                  color: "#fff",
                  border: "none",
                }}
              />
            </div>
            <div>
              <IconButton
                iconProps={{ iconName: "Save" }}
                text={"Export"}
                onClick={() => generateExcel(travelExpenseData)}
                style={{
                  backgroundColor: "#a83037",
                  color: "#fff",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* Detailslist start */}
          <DetailsList
            items={displayData}
            columns={_col}
            styles={gridStyles}
            selectionMode={SelectionMode.none}
          />
          {/* Detailslist End */}
          {displayData.length == 0 ? (
            <div className={styles.noRecordsec}>
              <h4>No records found !!!</h4>
            </div>
          ) : (
            <div className={styles.pagination}>
              <Pagination
                page={currentPage}
                onChange={(e, page) => {
                  paginateFunction(page, travelExpenseData);
                }}
                count={
                  travelExpenseData.length > 0
                    ? Math.ceil(travelExpenseData.length / totalPageItems)
                    : 1
                }
                color="primary"
                showFirstButton={currentPage == 1 ? false : true}
                showLastButton={
                  currentPage ==
                  Math.ceil(travelExpenseData.length / totalPageItems)
                    ? false
                    : true
                }
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TravelExpense;
