import * as React from "react";
import * as moment from "moment";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import CustomLoader from "../Loder/CustomLoder";
import { Web } from "@pnp/sp/presets/all";
import { Icon } from "@fluentui/react";
import styles from "../FieldQualityDashboard.module.scss";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  DefaultButton,
  IDropdownStyles,
  Dropdown,
  IIconProps,
  IconButton,
  DatePicker,
  FocusTrapZone,
  Layer,
  Overlay,
  Popup,
  mergeStyleSets,
} from "@fluentui/react";
import Pagination from "@material-ui/lab/Pagination";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { camlQueryFunc } from "../Config";
import ExportExcel from "../ExportExcel/ExportExcel";

interface IEmployee {
  Email: string;
  Name: string;
  Mobilization: string;
  reportsToEmail: string;
  reportsToName: string;
  team: string;
  orginCountry: string;
}
interface ICRM {
  PersonName: string;
  Email: string;
  TelNumber: string;
  Comments: string;
  Name: string;
  Date: string;
  Client: string;
  MeetingCon: string;
  ConversationType: string;
}
interface IDirRep {
  Email: string;
}

interface IServiceDetails {
  sitecode: string;
  client: string;
  serCode: string;
  serDescription: string;
  startTime: string;
  finishTime: string;
  serviceID: number;
  otherSitecode: string;
}
interface ICamlRange {
  startDate: string;
  endDate: string;
}

let localArr = [];
let tempCount: number = 0;
let start: number = null;
let spweb = Web(
  "https://atclogisticsie.sharepoint.com/sites/PlanningOperations/Field%20Quality"
  // "https://atclogisticsie.sharepoint.com/sites/TechnoRUCS_Dev_Site"
);

let tsWeb = Web(
  "https://atclogisticsie.sharepoint.com/sites/FieldQualityDashboard"
  // "https://atclogisticsie.sharepoint.com/sites/TechnoRUCS_Dev_Site"
);
let currentUrl = window.location.href;
let EmployeeConfig: IEmployee[] = [];
let directReportsArr: IDirRep[] = [];

const defaultCamlRange: ICamlRange = {
  startDate: moment().subtract(3, "months").startOf("month").toISOString(),
  // .format("YYYY-MM-DD"),
  // endDate: moment().add(23, "hours").format("YYYY-MM-DD"),
  // endDate: moment().add(1, "day").format("YYYY-MM-DD"),
  endDate: moment().add(1, "days").endOf("day").toISOString(),
};

export default function TimeSheetDashboard(props): JSX.Element {
  let loggedinuser: string = props.spcontext.pageContext.user.email;

  let currpage = 1;
  let totalPageItems = 30;

  let drpDownForFilter = {
    year: [{ key: "All", text: "All" }],
    week: [{ key: "All", text: "All" }],
    // supervisor: [{ key: "All", text: "All" }],
    supervisor: [],
    status: [{ key: "All", text: "All" }],
    costCenter: [{ key: "All", text: "All" }],
    city: [{ key: "All", text: "All" }],
    mobilization: [{ key: "All", text: "All" }],
    ifOverTime: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
    ],
    travel: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
    ],
    overTimeReason: [{ key: "All", text: "All" }],
  };

  let FilterItem = {
    year: "All",
    week: "All",
    // supervisor: [{ text: "All", key: "All" }],
    supervisor: [],
    mobilization:
      loggedinuser != "davor.salkanovic@atc-logistics.de" ? "All" : "Yes",
    ifOverTime: "All",
    filterStartDate: "All",
    filterEndDate: "All",
    status: "All",
    costCenter: "All",
    travel: "All",
    city: "All",
    overTimeReason: "All",
  };

  let approvelJSON = [
    {
      Week: "",
      Date: "",
      // Name: "",
      OverTime: "",
      OverTimeComment: "",
      StartTime: "",
      FinishTime: "",
      Travel: "",
      KmWithPrivateCar: null,
      Comments: "",
      SiteCode: "",
      CityOverNight: "",
      OtherSiteCode: "",
      TravelWithCar: "",
      Mobilization: "",
      OvertimecommentsDrp: {},
      OvertimecommentsDrpAll: "",
      OverTimeComments: "",
      Expense: "",
      TotalAtcCredit: "",
      TotalPersonalCard: "",
      ReviewComments: "",
      Status: "",
    },
  ];

  const Save: IIconProps = { iconName: "Save" };
  const Refresh: IIconProps = { iconName: "Refresh" };
  const History: IIconProps = { iconName: "History" };
  const CloudUpload: IIconProps = { iconName: "SkypeCircleCheck" };
  const Close: IIconProps = { iconName: "ChromeClose" };
  const Equalizer: IIconProps = { iconName: "Equalizer" };
  const dropdownStyles: Partial<IDropdownStyles> = {
    root: { width: "9%", marginRight: "22px" },
    dropdown: { width: "100%" },
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
      padding: "2em 4em 4em 4em",
      position: "absolute",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "300px",
      textAlign: "center",
      height: "100px",
    },
  });
  const rejectPopupStyles = mergeStyleSets({
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
      position: "absolute",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "500px",
      textAlign: "center",
    },
  });
  const approvePopupStyles = mergeStyleSets({
    root: {
      background: "rgba(0, 0, 0, 0.2)",
      bottom: "0",
      left: "0",
      position: "fixed",
      right: "0",
      top: "0",
    },
    sec: {
      background: "white",
      left: "50%",
      // maxWidth: "700px",
      // padding: "20px 30px 30px 30px",
      position: "absolute",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "1000px",
      // textAlign: "center",
    },
    content: {
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      padding: "10px 25px 20px 25px",
      input: {
        // padding: "4px !important",
        // border: "1px solid #000",
        // height: "20px !important",
        // outline: "1px solid #000",
      },
      textarea: {
        padding: "4px !important",
        // border: "none",
        // outline: "1px solid #000",
      },
    },
    left: {
      display: "flex",
      alignItems: "center",
      width: "50%",
      padding: "7px 0px",
    },
    right: {
      display: "flex",
      alignItems: "center",
      width: "49%",
      padding: "7px 0px",
    },
  });

  const theme = createTheme({
    overrides: {
      MuiInputLabel: {
        outlined: {
          transform: "translate(14px, 12.5px) scale(1)",
          padding: "25px 0px 0px 0px",
          fontSize: "15px",
        },
      },
      MuiFormControl: {},
      MuiInputBase: {
        root: {
          padding: "7px!important",
          borderRadius: "2px!important",
          fontSize: "14px",
        },
      },
      MuiIconButton: {
        root: {
          display: "none!important",
        },
      },
      MuiOutlinedInput: {
        root: {
          "& $notchedOutline": {
            borderColor: "#605e5c",
          },
          "&:hover $notchedOutline": {
            borderColor: "#605e5c",
          },
          "&$focused $notchedOutline": {
            borderColor: "purple",
          },
          "&&& $input": {
            padding: "0px",
          },
        },
      },
    },
  });

  const workerRef = useRef(null);

  const [masterData, setMasterData] = useState([]);
  const [duplicateData, setDuplicateData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [userPermissionCitys, setUserPermissionCitys] = useState([]);
  const [exportExcel, setExportExcel] = useState([]);
  const [currentPage, setCurrentPage] = useState(currpage);
  const [dropDownOptions, setDropDownOptions] = useState(drpDownForFilter);
  const [FilterKey, setFilterKey] = useState(FilterItem);
  const [supervisor, setSupervisor] = useState<any>("All");
  const [deliveryStartDate, setDeliveryStartDate] = useState(null);
  const [deliveryEndDate, setDeliveryEndDate] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [onlyTimeSheetPermission, setOnlyTimeSheetPermission] = useState([]);
  const [loader, setLoader] = useState(true);
  const [isApprovePopup, setIsApprovePopup] = useState(false);
  const [isRejectPopup, setIsRejectPopup] = useState(false);
  const [approvelJson, setApprovelJson] = useState([...approvelJSON]);
  const [appprovelId, setApprovelID] = useState(null);
  const [otherOptions, setOtherOptions] = useState(false);
  const [expandedRows, setExpandedRows] = useState(null);
  const [isExportExcel, setIsExportExcel] = useState<boolean>(false);

  const dateFormater = (date: Date): string => {
    // return !date ? "" : moment(date).add(5, "hours").format("DD/MM/YYYY");
    return !date ? "" : moment(date).add(7, "hours").format("DD/MM/YYYY");
  };

  const onItemInvoked = useCallback((item) => {
    window.open(currentUrl + "?TsID=" + item);
  }, []);

  const onRenderRow = (row, defaultRender) => {
    return (
      <a
        // className={classNameColor}
        href={currentUrl + "?TsID=" + row.Id}
        target="blank"
        onClick={() => onItemInvoked(row.item.Id)}
      >
        {defaultRender(row)}
      </a>
    );
  };

  // const getEmployeeList = async (allCitys, directReportees): Promise<any[]> => {
  const getEmployeeList = async (directEmployee: string[]): Promise<any[]> => {
    try {
      const allItems: any[] = await fetchAllItems();

      if (allItems.length) {
        tempCount = 0;
        localArr = [];
        let TimesheetData = [];
        // new changes
        if (directEmployee.length) {
          const directEmails = directEmployee;
          TimesheetData = allItems.filter(
            (rep) =>
              Array.isArray(rep.Name) &&
              rep.Name.some((_u) =>
                directEmails.some((e: string) => e == _u.email)
              )
          );
        }
        getTMSTServiceDetails(TimesheetData);
      }
    } catch (error) {
      console.error("Error in getEmployeeList:", error);
      return [];
    }

    async function fetchAllItems(): Promise<any[]> {
      const allItems: any[] = [];
      let nextHref: string | null = null;

      do {
        try {
          const response = await spweb.lists
            .getByTitle("Timesheet")
            .renderListDataAsStream({
              ViewXml: camlQueryFunc(defaultCamlRange).timesheet,
              ...(nextHref ? { Paging: nextHref.substring(1) } : {}),
            });

          allItems.push(...response.Row);
          nextHref = response.NextHref || null;
        } catch (err) {
          console.error("Error fetching items:", err);
          break;
        }
      } while (nextHref);

      return allItems;
    }
  };

  const getAdmin = async (): Promise<void> => {
    await spweb.siteGroups
      .getByName("ATC FQT Owners")
      .users.get()
      .then(async (users) => {
        let tempUser = users.filter((_user) => {
          return _user.Email == loggedinuser;
        });

        let _employeeConfigdata: IEmployee[] = await getEmployeeConfig();
        const curUserCountry: string = _employeeConfigdata.find(
          (_u: IEmployee) => _u.Email == loggedinuser
        )?.orginCountry;

        let _directEmployee: string[] = [];

        if (tempUser.length > 0) {
          _directEmployee = _employeeConfigdata.map(
            (_u: IEmployee) => _u.Email
          );
        } else if (
          loggedinuser == "daniel.zrnic@atc-logistics.com" ||
          loggedinuser == "Daniel.zrnic@atc.arvato.com"
        ) {
          _directEmployee = _employeeConfigdata
            .filter((_u: IEmployee) => _u.team == "DCT Cabling Team")
            .map((_e: IEmployee) => _e.Email);
        } else {
          _directEmployee = _employeeConfigdata
            .filter(
              (_u: IEmployee) =>
                (_u.reportsToEmail == loggedinuser &&
                  _u.team != "DCT Cabling Team") ||
                _u.orginCountry == curUserCountry
            )
            .map((_e: IEmployee) => _e.Email);
        }
        await getEmployeeList(_directEmployee);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getOnlyTimeSheetPermissions = () => {
    tsWeb.siteGroups
      .getByName("Timesheet_HR")
      .users.get()
      .then((Response) => {
        let onlyTSPermission = Response.filter((user) => {
          return user.Email == loggedinuser;
        });
        setOnlyTimeSheetPermission([...onlyTSPermission]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    start = performance.now();
    getAdmin();
    getOnlyTimeSheetPermissions();
  }, []);

  function totalHoursFunction(startTime, EndTime) {
    let t = 0;
    if (startTime && EndTime) {
      let a1 = startTime.split(":");
      let b1 = EndTime.split(":");

      let a2 = parseInt(b1[0]) - parseInt(a1[0]);
      let a3 = parseInt(b1[1]) - parseInt(a1[1]);

      if (a3 < 0) {
        if (a2 > 0) {
          if (a3 < -50) {
            return a2 - 1 + ":0" + (60 + a3);
          } else {
            return a2 - 1 + ":" + (60 + a3);
          }
        } else {
          if (a3 < -50) {
            return 23 + a2 + ":0" + (60 + a3);
          } else {
            return 23 + a2 + ":" + (60 + a3);
          }
        }
      } else if (a3 > 0) {
        if (a2 > 0) {
          if (a3 < 10) {
            return a2 + ":0" + a3;
          } else {
            return a2 + ":" + a3;
          }
        } else {
          if (a3 < 10) {
            return 24 + a2 + ":0" + a3;
          } else {
            return 24 + a2 + ":" + a3;
          }
        }
      } else {
        if (a2 > 0) {
          return a2 + ":0" + a3;
        } else {
          return 24 + a2 + ":0" + a3;
        }
      }
    }
  }
  const allFilterOptions = (data) => {
    data.forEach((_data) => {
      if (
        _data.year &&
        drpDownForFilter.year.findIndex((dd) => {
          return dd.key == _data.year;
        }) == -1
      ) {
        drpDownForFilter.year.push({
          key: _data.year,
          text: _data.year,
        });
      }
      if (
        _data.week &&
        drpDownForFilter.week.findIndex((dd) => {
          return dd.key == _data.week;
        }) == -1
      ) {
        drpDownForFilter.week.push({
          key: _data.week,
          text: _data.week,
        });
      }
      if (
        _data.mobilization &&
        drpDownForFilter.mobilization.findIndex((dd) => {
          return dd.key == _data.mobilization;
        }) == -1
      ) {
        drpDownForFilter.mobilization.push({
          key: _data.mobilization,
          text: _data.mobilization,
        });
      }
      if (
        _data.supervisor &&
        drpDownForFilter.supervisor.findIndex((dd) => {
          return dd.key == _data.supervisor;
        }) == -1
      ) {
        drpDownForFilter.supervisor.push({
          key: _data.supervisor,
          text: _data.supervisor,
        });
        drpDownForFilter.supervisor = drpDownForFilter.supervisor.sort((a, b) =>
          a.key !== b.key ? (a.key < b.key ? -1 : 1) : 0
        );
      }

      if (
        _data.city &&
        drpDownForFilter.city.findIndex((dd) => {
          return dd.key == _data.city;
        }) == -1
      ) {
        drpDownForFilter.city.push({
          key: _data.city,
          text: _data.city,
        });
      }
      if (
        _data.status &&
        drpDownForFilter.status.findIndex((dd) => {
          return dd.key == _data.status;
        }) == -1
      ) {
        drpDownForFilter.status.push({
          key: _data.status,
          text: _data.status,
        });
      }
      if (
        _data.ifOverTime &&
        drpDownForFilter.ifOverTime.findIndex((dd) => {
          return dd.key == _data.ifOverTime;
        }) == -1
      ) {
        drpDownForFilter.ifOverTime.push({
          key: _data.ifOverTime,
          text: _data.ifOverTime,
        });
      }
      if (
        _data.costCenter &&
        drpDownForFilter.costCenter.findIndex((dd) => {
          return dd.key == _data.costCenter;
        }) == -1
      ) {
        drpDownForFilter.costCenter.push({
          key: _data.costCenter,
          text: _data.costCenter,
        });
      }
      if (_data.overtimecommentsDrp) {
        for (let i = 0; i < _data.overtimecommentsDrp.length; i++) {
          if (
            _data.overtimecommentsDrp[i] &&
            drpDownForFilter.overTimeReason.findIndex((dd) => {
              return dd.key == _data.overtimecommentsDrp[i];
            }) == -1
          ) {
            drpDownForFilter.overTimeReason.push({
              key: _data.overtimecommentsDrp[i],
              text: _data.overtimecommentsDrp[i],
            });
          }
        }
      }
    });
  };
  const filterHandleFunction = (key, text): void => {
    let tempArr = [...duplicateData];
    let tempKey = FilterKey;
    tempKey[key] = text;

    if (tempKey.week != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.week == tempKey.week;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.mobilization != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.mobilization == tempKey.mobilization;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.supervisor.length) {
      tempArr = tempArr.filter((arr) => {
        return tempKey.supervisor.some((val) => arr.supervisor == val.key);
        // return arr.supervisor == tempKey.supervisor;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.city != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.city == tempKey.city || arr.originCity == tempKey.city;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.status != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.status == tempKey.status;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.ifOverTime != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.ifOverTime == tempKey.ifOverTime;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.travel != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.travel == tempKey.travel;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.costCenter != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.costCenter == tempKey.costCenter;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.filterStartDate != "All") {
      setDeliveryStartDate(tempKey.filterStartDate);
      if (tempKey.filterStartDate) {
        tempArr = tempArr.filter((arr) => {
          // return new Date(arr.date) >= new Date(tempKey.filterStartDate);
          return (
            // moment(arr.date).add(5, "hours").format() >=
            moment(arr.date).add(7, "hours").format() >=
            moment(tempKey.filterStartDate).format()
          );
        });
        setDuplicateData(tempArr);
      }
    }
    if (tempKey.filterEndDate != "All") {
      setDeliveryEndDate(tempKey.filterEndDate);
      if (tempKey.filterEndDate) {
        let modifydate: Date = new Date(tempKey.filterEndDate);
        modifydate.setHours(23);
        modifydate.setMinutes(59);

        tempArr = tempArr.filter((arr) => {
          // return moment(tempKey.filterEndDate).add("d", 1) >= moment(arr.date)
          // return new Date(arr.date) <= new Date(modifydate);
          return (
            // moment(arr.date).add(5, "hours").format() <=
            moment(arr.date).add(7, "hours").format() <=
            moment(modifydate).format()
          );
        });
        setDuplicateData(tempArr);
      }
    }
    if (tempKey.overTimeReason != "All") {
      tempArr = tempArr.filter((arr) => {
        if (arr.overtimecommentsDrp) {
          for (let i = 0; i < arr.overtimecommentsDrp.length; i++) {
            return tempKey.overTimeReason == arr.overtimecommentsDrp[i];
          }
        }
        // return arr.overTimeReason == tempKey.overTimeReason;
      });
      setDuplicateData(tempArr);
    }
    setFilterKey({ ...tempKey });
    setDisplayData([...tempArr]);
    setExportExcel([...tempArr]);
    setDuplicateData([...masterData]);
    timeSheetPaginateFunction(currpage, tempArr);
  };
  const resetFilterOptions = () => {
    setDisplayData(masterData);
    timeSheetPaginateFunction(currpage, masterData);
    setExportExcel(masterData);
    setDuplicateData(masterData);
    setDeliveryStartDate(null);

    setDeliveryEndDate(null);
    setFilterKey({
      year: "All",
      status: "All",
      supervisor: [{ text: "All", key: "All" }],
      mobilization:
        loggedinuser != "davor.salkanovic@atc-logistics.de" ? "All" : "Yes",
      ifOverTime: "All",
      filterStartDate: "All",
      filterEndDate: "All",
      week: "All",
      costCenter: "All",
      travel: "All",
      city: "All",
      overTimeReason: "All",
    });
  };
  const timeSheetPaginateFunction = (pagenumber, data: any[]) => {
    if (data.length > 0) {
      let lastIndex: number = pagenumber * totalPageItems;
      let firstIndex: number = lastIndex - totalPageItems;
      let paginatedItems = data.slice(firstIndex, lastIndex);
      currpage = pagenumber;
      setCurrentPage(pagenumber);
      setDisplayData(paginatedItems);
    } else {
      //   setAtpDisplayData([]);
      setCurrentPage(1);
    }
  };

  // const generateTimeSheetExcel = async (list) => {
  //   if (list.length != 0) {
  //     let arrExport = list;
  //     let excelCount = 2;
  //     const getAllWeeks = arrExport.map((data) => data.week);

  //     let getUniqeWeek = getAllWeeks.filter(
  //       (item, index) => getAllWeeks.indexOf(item) === index
  //     );

  //     // let crmFlag: boolean = false;
  //     const crmFlag = list.some((value) => value.CRMId !== "-");

  //     // list.forEach((value) => {
  //     //   if (value.CRMId != "-") {
  //     //     crmFlag = true;
  //     //   }
  //     // });
  //     const workbook = new Excel.Workbook();
  //     const worksheet = workbook.addWorksheet("My Sheet");
  //     let CRMworksheet: any;
  //     if (crmFlag) {
  //       CRMworksheet = workbook.addWorksheet("CRM_Activity");
  //     }
  //     worksheet.columns = [
  //       { header: "Week", key: "week", width: 25 },
  //       { header: "Date", key: "date", width: 25 },
  //       { header: "Supervisor", key: "supervisor", width: 25 },
  //       {
  //         header: "Sitecode",
  //         key: "siteCode",
  //         width: 25,
  //       },
  //       { header: "Client", key: "client", width: 25 },
  //       { header: "Service Code", key: "serCode", width: 25 },
  //       { header: "Service Description", key: "serDescription", width: 25 },
  //       { header: "Start time", key: "startTime", width: 25 },
  //       { header: "Finish time", key: "finishTime", width: 25 },
  //       { header: "Total hours", key: "totalHours", width: 25 },
  //       { header: "Over time", key: "ifOverTime", width: 25 },
  //       { header: "Over time", key: "overTime", width: 25 },
  //       { header: "Status", key: "status", width: 25 },
  //       { header: "Cost center", key: "costCenter", width: 25 },

  //       { header: "MobilizationJob", key: "mobilization", width: 25 },
  //       { header: "Travel", key: "travel", width: 25 },
  //       { header: "City", key: "city", width: 25 },
  //       { header: "Other sitecode", key: "otherSiteCode", width: 25 },
  //       {
  //         header: "Comments",
  //         key: "comments",
  //         width: 25,
  //       },
  //       { header: "Review comments", key: "reviewComments", width: 25 },
  //       { header: "Km with private car", key: "kmWithPrivateCar", width: 25 },
  //       { header: "Travel with car", key: "travelWithCar", width: 25 },
  //       {
  //         header: "City over night",
  //         key: "cityOverNight",
  //         width: 25,
  //       },
  //       {
  //         header: "Over time comments",
  //         key: "overTimeComments",
  //         width: 25,
  //       },
  //       {
  //         header: "Over time reason",
  //         key: "overtimecommentsDrp",
  //         width: 25,
  //       },
  //       { header: "Expense", key: "expense", width: 25 },
  //       { header: "ATCCreditCardAmount", key: "AtcCreditAmount", width: 25 },
  //       {
  //         header: "PersonalCreditCardAmount",
  //         key: "personalCardAmount",
  //         width: 25,
  //       },
  //       { header: "ReFundApproved", key: "isRefund", width: 25 },
  //       { header: "Country", key: "country", width: 25 },
  //       { header: "OrginCity", key: "orgCity", width: 25 },
  //       { header: "OrginCountry", key: "orgCountry", width: 25 },
  //       { header: "CRM Activity", key: "CRMActivity", width: 25 },
  //       { header: "One To One Meeting", key: "oneToOneMeeting", width: 25 },
  //       {
  //         header: "One To One Meeting Participants",
  //         key: "meetingPerson",
  //         width: 25,
  //       },
  //       { header: "OnCall", key: "onCall", width: 25 },
  //     ];
  //     if (crmFlag) {
  //       CRMworksheet.columns = [
  //         { header: "Person Name", key: "perName", width: 25 },
  //         { header: "Email Address", key: "email", width: 50 },
  //         { header: "Tel Number", key: "telNo", width: 25 },
  //         { header: "Comments", key: "cmts", width: 25 },
  //         { header: "Name", key: "name", width: 25 },
  //         { header: "Date", key: "date", width: 25 },
  //         { header: "Client", key: "client", width: 25 },
  //         { header: "Meeting Conducted", key: "meetingConducted", width: 25 },
  //         { header: "Conversation Type", key: "conversationType", width: 25 },
  //       ];
  //     }

  //     for (let i = 0; i < getUniqeWeek.length; i++) {
  //       let TotalHour: number = 0;
  //       let TotalMin: number = 0;
  //       let week = getUniqeWeek[i];

  //       let filterWeeklyData = arrExport.filter((item) => item.week == week);

  //       for (let index = 0; index < filterWeeklyData.length; index++) {
  //         let _tempOneToOneMeetingPerson: string = "";
  //         let item = filterWeeklyData[index];
  //         if (item.oneToOneMeetingPerson.length > 1) {
  //           // await item.oneToOneMeetingPerson.map((_per: any, i: number) => {
  //           for (const _per of item.oneToOneMeetingPerson) {
  //             if (i == item.oneToOneMeetingPerson.length - 1) {
  //               _tempOneToOneMeetingPerson = _tempOneToOneMeetingPerson + _per;
  //             } else {
  //               _tempOneToOneMeetingPerson =
  //                 _tempOneToOneMeetingPerson + _per + ",";
  //             }
  //           }
  //           // });
  //         } else {
  //           _tempOneToOneMeetingPerson = item.oneToOneMeetingPerson[0];
  //         }

  //         // if (item.totalHours != "") {
  //         //   let timeSplit = item.totalHours.split(":");
  //         //   TotalHour += parseInt(timeSplit[0]);
  //         //   if (TotalMin < 60) {
  //         //     TotalMin += parseInt(timeSplit[1]);
  //         //   } else {
  //         //     TotalHour += 1;
  //         //     TotalMin = 0;
  //         //   }
  //         // }

  //         if (item.totalHours) {
  //           const [hours, minutes] = item.totalHours.split(":").map(Number);
  //           TotalHour += hours;
  //           TotalMin += minutes;
  //         }
  //         if (TotalMin >= 60) {
  //           TotalHour += Math.floor(TotalMin / 60);
  //           TotalMin %= 60;
  //         }

  //         if (crmFlag && item.CRMActivity == "Yes") {
  //           CRMworksheet.addRow({
  //             perName: item.PersonName,
  //             email: item.Email,
  //             telNo: item.TelNumber,
  //             cmts: item.Comments,
  //             name: item.Name,
  //             date: item.Date,
  //             client: item.Client,
  //             meetingConducted: item.MeetingCon,
  //             conversationType: item.ConversationType,
  //           });
  //         }

  //         if (item.serviceDetails && item.serviceDetails.length) {
  //           let firstIndex = worksheet._rows.length + 1;
  //           let lastIndex = worksheet._rows.length + item.serviceDetails.length;

  //           for (let k = 0; k < item.serviceDetails.length; k++) {
  //             let _i = item.serviceDetails[k];
  //             worksheet.addRow({
  //               week: item.week ? item.week : "-",
  //               date: item.date ? dateFormater(item.date) : "-",
  //               city: item.city ? item.city : "-",
  //               supervisor: item.supervisor ? item.supervisor : "-",
  //               siteCode: _i.sitecode
  //                 ? _i.otherSiteCode
  //                 : _i.sitecode
  //                 ? _i.sitecode
  //                 : "-",
  //               client: _i.client ? _i.client : "-",
  //               serCode: _i.serCode ? _i.serCode : "-",
  //               serDescription: _i.serDescription ? _i.serDescription : "-",
  //               startTime: _i.startTime ? _i.startTime : "-",
  //               finishTime: _i.finishTime ? _i.finishTime : "-",
  //               costCenter: item.costCenter ? item.costCenter : "-",
  //               totalHours: item.totalHours ? item.totalHours : "-",
  //               ifOverTime: item.overTime ? "Yes" : "No",
  //               overTime:
  //                 item.overTime && item.overtimeSts == "Approved"
  //                   ? item.overTime
  //                   : "-",
  //               status: item.status ? item.status : "-",
  //               mobilization: item.mobilization ? item.mobilization : "-",
  //               travel: item.travel ? item.travel : "-",
  //               otherSiteCode: item.otherSiteCode ? item.otherSiteCode : "-",
  //               comments: item.comments ? item.comments.toString() : "-",
  //               reviewComments: item.reviewComments ? item.reviewComments : "-",
  //               kmWithPrivateCar: item.kmWithPrivateCar
  //                 ? item.kmWithPrivateCar
  //                 : "-",
  //               cityOverNight: item.cityOverNight ? item.cityOverNight : "-",
  //               travelWithCar: item.travelWithCar ? item.travelWithCar : "-",
  //               overTimeComments: item.overTimeComments
  //                 ? item.overTimeComments
  //                 : "-",
  //               expense: item.expense ? item.expense : "-",
  //               AtcCreditAmount: item.AtcCreditAmount
  //                 ? item.AtcCreditAmount
  //                 : "-",
  //               personalCardAmount: item.personalCardAmount
  //                 ? item.personalCardAmount
  //                 : "-",
  //               isRefund: item.isRefund,
  //               overtimecommentsDrp: item.overtimecommentsDrp
  //                 ? item.overtimecommentsDrp.join(",")
  //                 : "-",
  //               country: item.Country ? item.Country : "-",
  //               orgCity: item.originCity ? item.originCity : "-",
  //               orgCountry: item.originCountry ? item.originCountry : "-",
  //               CRMActivity: item.CRMActivity ? item.CRMActivity : "-",
  //               oneToOneMeeting: item.oneTOoneMeeting ? "Yes" : "No",
  //               meetingPerson: _tempOneToOneMeetingPerson
  //                 ? _tempOneToOneMeetingPerson
  //                 : "-",
  //               onCall: item.onCallVisible ? "Yes" : "No",
  //             });
  //           }
  //           // worksheet._rows[0]._cells.forEach((cell) => {
  //           for (const cell of worksheet._rows[0]._cells) {
  //             let cellName: any = "";
  //             if (cell._address.split("").length == 2) {
  //               cellName = cell._address.split("")[0];
  //             } else {
  //               cellName =
  //                 cell._address.split("")[0] + cell._address.split("")[1];
  //             }
  //             // if (
  //             //   cellName == "C" ||
  //             //   cellName == "D" ||
  //             //   cellName == "E" ||
  //             //   cellName == "F" ||
  //             //   cellName == "G" ||
  //             //   cellName == "H" ||
  //             //   cellName == "I"
  //             // )
  //             //  {
  //             //   worksheet.mergeCells(
  //             //     `${cellName}${firstIndex}:${cellName}${firstIndex}`
  //             //   );
  //             // }
  //             if (["C", "D", "E", "F", "G", "H", "I"].includes(cellName)) {
  //               worksheet.mergeCells(
  //                 `${cellName}${firstIndex}:${cellName}${lastIndex}`
  //               );
  //             } else {
  //               worksheet.mergeCells(
  //                 `${cellName}${firstIndex}:${cellName}${lastIndex}`
  //               );
  //             }
  //             // });
  //           }
  //         } else {
  //           worksheet.addRow({
  //             week: item.week ? item.week : "-",
  //             date: item.date ? dateFormater(item.date) : "-",
  //             city: item.city ? item.city : "-",
  //             supervisor: item.supervisor ? item.supervisor : "-",
  //             siteCode: item.siteCode ? item.siteCode : "-",
  //             client: item.client ? item.client : "-",
  //             serCode: item.serCode ? item.serCode : "-",
  //             serDescription: item.serDescription ? item.serDescription : "-",
  //             startTime: item.startTime ? item.startTime : "-",
  //             finishTime: item.finishTime ? item.finishTime : "-",
  //             costCenter: item.costCenter ? item.costCenter : "-",
  //             totalHours: item.totalHours ? item.totalHours : "-",
  //             ifOverTime: item.overTime ? "Yes" : "No",
  //             overTime:
  //               item.overTime && item.overtimeSts == "Approved"
  //                 ? item.overTime
  //                 : "-",
  //             status: item.status ? item.status : "-",
  //             mobilization: item.mobilization ? item.mobilization : "-",
  //             travel: item.travel ? item.travel : "-",
  //             otherSiteCode: item.otherSiteCode ? item.otherSiteCode : "-",
  //             comments: item.comments ? item.comments.toString() : "-",
  //             reviewComments: item.reviewComments ? item.reviewComments : "-",
  //             kmWithPrivateCar: item.kmWithPrivateCar
  //               ? item.kmWithPrivateCar
  //               : "-",
  //             cityOverNight: item.cityOverNight ? item.cityOverNight : "-",
  //             travelWithCar: item.travelWithCar ? item.travelWithCar : "-",
  //             overTimeComments: item.overTimeComments
  //               ? item.overTimeComments
  //               : "-",
  //             expense: item.expense ? item.expense : "-",
  //             AtcCreditAmount: item.AtcCreditAmount
  //               ? item.AtcCreditAmount
  //               : "-",
  //             personalCardAmount: item.personalCardAmount
  //               ? item.personalCardAmount
  //               : "-",
  //             isRefund: item.isRefund,
  //             overtimecommentsDrp: item.overtimecommentsDrp
  //               ? item.overtimecommentsDrp.join(",")
  //               : "-",
  //             country: item.Country ? item.Country : "-",
  //             orgCity: item.originCity ? item.originCity : "-",
  //             orgCountry: item.originCountry ? item.originCountry : "-",
  //             CRMActivity: item.CRMActivity ? item.CRMActivity : "-",
  //             oneToOneMeeting: item.oneTOoneMeeting ? "Yes" : "No",
  //             meetingPerson: _tempOneToOneMeetingPerson
  //               ? _tempOneToOneMeetingPerson
  //               : "-",
  //             onCall: item.onCallVisible ? "Yes" : "No",
  //           });
  //         }

  //         if (filterWeeklyData.length - 1 == index) {
  //           worksheet.addRow({
  //             totalHours: `Total = ${TotalHour}:${TotalMin}`,
  //           });
  //           worksheet.getCell(`J + ${worksheet._rows.length}`).fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: "f8696b" },
  //           };
  //         }
  //       }

  //       for (let l = 0; l < filterWeeklyData.length; l++) {
  //         let date = new Date(filterWeeklyData[l].date);
  //         let isMobilization = EmployeeConfig.some(
  //           (a) => a.Name == filterWeeklyData[l].supervisor && a.Mobilization
  //         );
  //         let day = date.toLocaleString("en-us", { weekday: "long" });
  //         if (day == "Saturday" || day == "Sunday") {
  //           worksheet.getCell("B" + (l + excelCount)).fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: "f8696b" },
  //           };
  //         }

  //         if (isMobilization) {
  //           worksheet.getCell("C" + (l + excelCount)).fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: "f8696b" },
  //           };
  //         }

  //         if (filterWeeklyData[l].overTime) {
  //           worksheet.getCell("K" + (l + excelCount)).fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: "f8696b" },
  //           };
  //         }
  //         if (filterWeeklyData[l].status == "Submitted") {
  //           worksheet.getCell("M" + (l + excelCount)).fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: "90EE90" },
  //           };
  //         } else if (filterWeeklyData[l].status == "Draft") {
  //           worksheet.getCell("M" + (l + excelCount)).fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: "d3d3d3" },
  //           };
  //         } else if (filterWeeklyData[l].status == "Pending Approval") {
  //           worksheet.getCell("M" + (l + excelCount)).fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: "f4f2bf" },
  //           };
  //         } else if (filterWeeklyData[l].status == "InReview") {
  //           worksheet.getCell("M" + (l + excelCount)).fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: "f4f2bf" },
  //           };
  //         }
  //       }
  //       excelCount += filterWeeklyData.length + 1;
  //     }

  //     await [
  //       "A1",
  //       "B1",
  //       "C1",
  //       "D1",
  //       "E1",
  //       "F1",
  //       "G1",
  //       "H1",
  //       "I1",
  //       "J1",
  //       "K1",
  //       "L1",
  //       "M1",
  //       "N1",
  //       "O1",
  //       "P1",
  //       "Q1",
  //       "R1",
  //       "S1",
  //       "T1",
  //       "U1",
  //       "V1",
  //       "W1",
  //       "X1",
  //       "Y1",
  //       "Z1",
  //       "AA1",
  //       "AB1",
  //       "AC1",
  //       "AD1",
  //       "AE1",
  //       "AF1",
  //       "AG1",
  //       "AH1",
  //       "AI1",
  //       "AJ1",
  //       "AK1",
  //     ].map((key) => {
  //       worksheet.getCell(key).fill = {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: "C5D9F1" },
  //       };
  //     });
  //     await [
  //       "A1",
  //       "B1",
  //       "C1",
  //       "D1",
  //       "E1",
  //       "F1",
  //       "G1",
  //       "H1",
  //       "I1",
  //       "J1",
  //       "K1",
  //       "L1",
  //       "M1",
  //       "N1",
  //       "O1",
  //       "P1",
  //       "Q1",
  //       "R1",
  //       "S1",
  //       "T1",
  //       "U1",
  //       "V1",
  //       "W1",
  //       "X1",
  //       "Y1",
  //       "Z1",
  //       "AA1",
  //       "AB1",
  //       "AC1",
  //       "AD1",
  //       "AE1",
  //       "AF1",
  //       "AG1",
  //       "AH1",
  //       "AI1",
  //       "AJ1",
  //       "AK1",
  //     ].map((key) => {
  //       worksheet.getCell(key).color = {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: "FFFFFF" },
  //       };
  //     });

  //     worksheet.eachRow((row) => {
  //       row.eachCell((cell) => {
  //         cell.alignment = {
  //           vertical: "middle",
  //           horizontal: "center",
  //         };
  //       });
  //     });

  //     // new changes
  //     if (crmFlag) {
  //       ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1"].map((key) => {
  //         CRMworksheet.getCell(key).fill = {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "C5D9F1" },
  //         };
  //         CRMworksheet.getCell(key).color = {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFFFFF" },
  //         };
  //       });
  //     }

  //     await workbook.xlsx
  //       .writeBuffer()
  //       .then((buffer) => {
  //         FileSaver.saveAs(
  //           new Blob([buffer]),
  //           `ATC_Time_Sheet_${moment().format("DDMMYYYY_HH:mm")}.xlsx`
  //         );
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   } else {
  //     setIsPopupVisible(true);
  //   }
  // };

  const generateTimeSheetExcel = async (list) => {
    if (!list.length) {
      setIsPopupVisible(true);
      return;
    }

    // if (!workerRef.current) {
    //   workerRef.current = new Worker("./ExcelExportWorker.js", {
    //     type: "module",
    //   });

    //   workerRef.current.onmessage = ({ data: { buffer, fileName } }) => {
    //     FileSaver.saveAs(new Blob([buffer]), fileName);
    //   };
    // }

    // // send raw data
    // workerRef.current.postMessage({ list });

    // return;

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("TimeSheet");

    const crmFlag = list.some((item) => item.CRMId !== "-");
    const CRMworksheet = crmFlag ? workbook.addWorksheet("CRM_Activity") : null;

    // Define worksheet columns
    worksheet.columns = [
      { header: "Week", key: "week", width: 25 },
      { header: "Date", key: "date", width: 25 },
      { header: "Supervisor", key: "supervisor", width: 25 },
      { header: "Sitecode", key: "siteCode", width: 25 },
      { header: "Client", key: "client", width: 25 },
      { header: "Service Code", key: "serCode", width: 25 },
      { header: "Service Description", key: "serDescription", width: 25 },
      { header: "Start time", key: "startTime", width: 25 },
      { header: "Finish time", key: "finishTime", width: 25 },
      { header: "Total hours", key: "totalHours", width: 25 },
      { header: "Over time", key: "ifOverTime", width: 25 },
      { header: "Over time", key: "overTime", width: 25 },
      { header: "Status", key: "status", width: 25 },
      { header: "Cost center", key: "costCenter", width: 25 },
      { header: "MobilizationJob", key: "mobilization", width: 25 },
      { header: "Travel", key: "travel", width: 25 },
      { header: "City", key: "city", width: 25 },
      { header: "Other sitecode", key: "otherSiteCode", width: 25 },
      {
        header: "Comments",
        key: "comments",
        width: 25,
      },
      { header: "Review comments", key: "reviewComments", width: 25 },
      { header: "Km with private car", key: "kmWithPrivateCar", width: 25 },
      { header: "Travel with car", key: "travelWithCar", width: 25 },
      {
        header: "City over night",
        key: "cityOverNight",
        width: 25,
      },
      {
        header: "Over time comments",
        key: "overTimeComments",
        width: 25,
      },
      {
        header: "Over time reason",
        key: "overtimecommentsDrp",
        width: 25,
      },
      { header: "Expense", key: "expense", width: 25 },
      { header: "ATCCreditCardAmount", key: "AtcCreditAmount", width: 25 },
      {
        header: "PersonalCreditCardAmount",
        key: "personalCardAmount",
        width: 25,
      },
      { header: "ReFundApproved", key: "isRefund", width: 25 },
      { header: "Country", key: "country", width: 25 },
      { header: "OrginCity", key: "orgCity", width: 25 },
      { header: "OrginCountry", key: "orgCountry", width: 25 },
      { header: "CRM Activity", key: "CRMActivity", width: 25 },
      { header: "One To One Meeting", key: "oneToOneMeeting", width: 25 },
      {
        header: "One To One Meeting Participants",
        key: "meetingPerson",
        width: 25,
      },
      { header: "OnCall", key: "onCall", width: 25 },
    ];

    if (crmFlag) {
      CRMworksheet.columns = [
        { header: "Person Name", key: "perName", width: 25 },
        { header: "Email Address", key: "email", width: 50 },
        { header: "Tel Number", key: "telNo", width: 25 },
        { header: "Comments", key: "cmts", width: 25 },
        { header: "Name", key: "name", width: 25 },
        { header: "Date", key: "date", width: 25 },
        { header: "Client", key: "client", width: 25 },
        { header: "Meeting Conducted", key: "meetingConducted", width: 25 },
      ];
    }

    list.sort((a, b) => {
      // const numA = parseInt(a.week.replace("W", ""));
      // const numB = parseInt(b.week.replace("W", ""));
      // return numB - numA;
      return b.date - a.date;
    });

    let rowCounter = 2;
    let totalHours = 0;
    let totalMinutes = 0;

    for (let i = 0; i < list.length; i++) {
      const item = list[i];

      // Time calculations
      if (item.totalHours) {
        const [hrs, mins] = item.totalHours.split(":").map(Number);
        totalHours += hrs;
        totalMinutes += mins;
      }

      const meetingPersons = item.oneToOneMeetingPerson?.join(",") || "-";

      // CRM Data
      if (crmFlag && item.CRMActivity === "Yes") {
        CRMworksheet.addRow({
          perName: item.PersonName || "-",
          email: item.Email || "-",
          telNo: item.TelNumber || "-",
          cmts: item.Comments || "-",
          name: item.Name || "-",
          date: item.Date || "-",
          client: item.Client || "-",
          meetingConducted: item.MeetingCon || "-",
        });
      }

      if (item.serviceDetails?.length) {
        const startRow = worksheet._rows.length + 1;
        const endRow = startRow + item.serviceDetails.length - 1;
        for (const service of item.serviceDetails) {
          worksheet.addRow({
            week: item.week || "-",
            date: item.date ? dateFormater(item.date) : "-",
            city: item.city || "-",
            supervisor: item.supervisor || "-",
            siteCode:
              service.sitecode == "Others"
                ? service.otherSitecode
                : service.sitecode || "-",
            client: service.client || "-",
            serCode: service.serCode || "-",
            serDescription: service.serDescription || "-",
            startTime: service.startTime || "-",
            finishTime: service.finishTime || "-",
            costCenter: item.costCenter || "-",
            totalHours: item.totalHours || "-",
            ifOverTime: item.overTime ? "Yes" : "No",
            overTime:
              item.overTime && item.overtimeSts === "Approved"
                ? item.overTime
                : "-",
            status: item.status || "-",
            mobilization: item.mobilization || "-",
            travel: item.travel || "-",
            otherSiteCode: item.otherSiteCode || "-",
            comments: item.comments?.toString() || "-",
            reviewComments: item.reviewComments || "-",
            kmWithPrivateCar: item.kmWithPrivateCar || "-",
            cityOverNight: item.cityOverNight || "-",
            travelWithCar: item.travelWithCar || "-",
            overTimeComments: item.overTimeComments || "-",
            expense: item.expense || "-",
            AtcCreditAmount: item.AtcCreditAmount || "-",
            personalCardAmount: item.personalCardAmount || "-",
            isRefund: item.isRefund,
            overtimecommentsDrp: item.overtimecommentsDrp
              ? item.overtimecommentsDrp.join(",")
              : "-",
            country: item.Country || "-",
            orgCity: item.originCity || "-",
            orgCountry: item.originCountry || "-",
            CRMActivity: item.CRMActivity || "-",
            oneToOneMeeting: item.oneTOoneMeeting ? "Yes" : "No",
            meetingPerson: meetingPersons,
            onCall: item.onCallVisible == "Yes" ? "Yes" : "No",
          });
        }
        // ["C", "D", "E", "F", "G", "H", "I"].forEach((col) => {
        //           worksheet.mergeCells(`${col}${startRow}:${col}${endRow}`);
        //         });
        worksheet.mergeCells(`L${startRow}:L${endRow}`);
      } else {
        worksheet.addRow({
          week: item.week || "-",
          date: item.date ? dateFormater(item.date) : "-",
          city: item.city || "-",
          supervisor: item.supervisor || "-",
          siteCode: item.siteCode || "-",
          client: item.client || "-",
          serCode: item.serCode || "-",
          serDescription: item.serDescription || "-",
          startTime: item.startTime || "-",
          finishTime: item.finishTime || "-",
          costCenter: item.costCenter || "-",
          totalHours: item.totalHours || "-",
          ifOverTime: item.overTime ? "Yes" : "No",
          overTime:
            item.overTime && item.overtimeSts === "Approved"
              ? item.overTime
              : "-",
          status: item.status || "-",
          mobilization: item.mobilization || "-",
          travel: item.travel || "-",
          otherSiteCode: item.otherSiteCode || "-",
          comments: item.comments?.toString() || "-",
          reviewComments: item.reviewComments || "-",
          kmWithPrivateCar: item.kmWithPrivateCar || "-",
          cityOverNight: item.cityOverNight || "-",
          travelWithCar: item.travelWithCar || "-",
          overTimeComments: item.overTimeComments || "-",
          expense: item.expense || "-",
          AtcCreditAmount: item.AtcCreditAmount || "-",
          personalCardAmount: item.personalCardAmount || "-",
          isRefund: item.isRefund,
          overtimecommentsDrp: item.overtimecommentsDrp
            ? item.overtimecommentsDrp.join(",")
            : "-",
          country: item.Country || "-",
          orgCity: item.originCity || "-",
          orgCountry: item.originCountry || "-",
          CRMActivity: item.CRMActivity || "-",
          oneToOneMeeting: item.oneTOoneMeeting ? "Yes" : "No",
          meetingPerson: meetingPersons,
          onCall: item.onCallVisible == "Yes" ? "Yes" : "No",
        });
      }

      // Color coding
      const rowIndex = worksheet._rows.length;
      const date = new Date(item.date);
      const day = date.toLocaleString("en-us", { weekday: "long" });
      const isMobilization = EmployeeConfig.some(
        (a) => a.Name === item.supervisor && a.Mobilization
      );

      if (day === "Saturday" || day === "Sunday") {
        worksheet.getCell(`B${rowIndex}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f8696b" },
        };
      }

      if (isMobilization) {
        worksheet.getCell(`C${rowIndex}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f8696b" },
        };
      }

      if (item.overTime) {
        worksheet.getCell(`K${rowIndex}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f8696b" },
        };
      }

      const statusColorMap = {
        Submitted: "90EE90",
        Draft: "d3d3d3",
        "Pending Approval": "f4f2bf",
        InReview: "f4f2bf",
      };

      if (item.status && statusColorMap[item.status]) {
        worksheet.getCell(`M${rowIndex}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusColorMap[item.status] },
        };
      }

      // Total for week
      const isLastOfWeek =
        i === list.findLastIndex((_item) => _item.week === item.week);

      if (isLastOfWeek) {
        // Convert minutes to hours if needed
        if (totalMinutes >= 60) {
          totalHours += Math.floor(totalMinutes / 60);
          totalMinutes %= 60;
        }

        worksheet.addRow({
          totalHours: `Total = ${totalHours}:${totalMinutes}`,
        });

        const lastRowIndex = worksheet._rows.length;
        worksheet.getCell(`J${lastRowIndex}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f8696b" },
        };

        rowCounter +=
          list.filter((_item) => _item.week === item.week).length + 1;

        // Reset total counters for the next week
        totalHours = 0;
        totalMinutes = 0;
      }
    }

    const headerCells = [
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
      "Q1",
      "R1",
      "S1",
      "T1",
      "U1",
      "V1",
      "W1",
      "X1",
      "Y1",
      "Z1",
      "AA1",
      "AB1",
      "AC1",
      "AD1",
      "AE1",
      "AF1",
      "AG1",
      "AH1",
      "AI1",
      "AJ1",
      "AK1",
    ];
    headerCells.forEach((cell) => {
      const c = worksheet.getCell(cell);
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "C5D9F1" },
      };
      c.color = { argb: "FFFFFF" };
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      });
    });

    if (crmFlag) {
      ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1"].map((key) => {
        CRMworksheet.getCell(key).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "C5D9F1" },
        };
        CRMworksheet.getCell(key).color = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF" },
        };
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buffer]),
      `Time_Sheet_${moment().format("DDMMYYYY_HH:mm")}.xlsx`
    );
  };

  const uploadApprove = (id, json) => {
    if (json != "") {
      let splitJson = json.split("|");
      approvelJson[0].Week = splitJson[0];
      approvelJson[0].Date = splitJson[1];
      // approvelJson[0].Name = splitJson[2];
      approvelJson[0].OverTime = splitJson[3];
      approvelJson[0].OverTimeComments = splitJson[4];
      approvelJson[0].StartTime = splitJson[5] + ":" + splitJson[6];
      approvelJson[0].FinishTime = splitJson[7] + ":" + splitJson[8];
      approvelJson[0].Travel = splitJson[9];
      approvelJson[0].KmWithPrivateCar = splitJson[10];
      approvelJson[0].Comments = splitJson[11];
      approvelJson[0].SiteCode = splitJson[12];
      approvelJson[0].CityOverNight = splitJson[13];
      approvelJson[0].OtherSiteCode = splitJson[14];
      approvelJson[0].TravelWithCar = splitJson[15];
      approvelJson[0].Mobilization = splitJson[16];
      // approvelJson[0].OverTimeComments = splitJson[17];
      approvelJson[0].OvertimecommentsDrp = splitJson[18];
      approvelJson[0].OvertimecommentsDrpAll = splitJson[18];
      approvelJson[0].Expense = splitJson[20];
      approvelJson[0].TotalAtcCredit = splitJson[21];
      approvelJson[0].TotalPersonalCard = splitJson[22];
    } else {
      setApprovelJson([]);
    }
    if (approvelJson[0].Date.includes("/")) {
      const [day, month, year] = approvelJson[0].Date.split("/");
      const dateObject = new Date(`${year}-${month}-${day}`);
      approvelJson[0].Date = dateObject.toISOString();
    }
    displayData.forEach((data) => {
      if (data.Id == id) {
        for (let key in approvelJson[0]) {
          if (key == "Week" && data.week == approvelJson[0][key]) {
            delete approvelJson[0][key];
          }
          if (
            key == "Date" &&
            moment(data.date).format("DD/MM/YYYY") ==
              moment(approvelJson[0][key]).format("DD/MM/YYYY")
          ) {
            delete approvelJson[0][key];
          }
          if (key == "OverTime" && data.overTime == approvelJson[0][key]) {
            delete approvelJson[0][key];
          }
          if (
            key == "OverTimeComments" &&
            data.overTimeComments == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
          }
          if (key == "StartTime" && data.startTime == approvelJson[0][key]) {
            delete approvelJson[0][key];
          }
          if (key == "FinishTime" && data.finishTime == approvelJson[0][key]) {
            delete approvelJson[0][key];
          }
          if (key == "Travel" && data.travel == approvelJson[0][key]) {
            delete approvelJson[0][key];
          }
          if (
            key == "KmWithPrivateCar" &&
            data.kmWithPrivateCar == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
          }
          if (key == "Comments" && data.comments == approvelJson[0][key]) {
            delete approvelJson[0][key];
          }
          if (key == "SiteCode" && data.siteCode == approvelJson[0][key]) {
            delete approvelJson[0][key];
          }
          if (
            key == "CityOverNight" &&
            data.cityOverNight == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
          }
          if (
            key == "OtherSiteCode" &&
            data.otherSiteCode == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
          }
          if (
            key == "TravelWithCar" &&
            data.travelWithCar == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
          }
          if (
            key == "Mobilization" &&
            data.mobilization == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
          }
          if (key == "Expense" && data.expense == approvelJson[0][key]) {
            delete approvelJson[0][key];
          }
          if (
            key == "TotalAtcCredit" &&
            data.AtcCreditAmount == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
          }
          if (
            key == "TotalPersonalCard" &&
            data.personalCardAmount == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
          }
          if (
            key == "OvertimecommentsDrpAll" &&
            data.overtimecommentsDrp == approvelJson[0][key]
          ) {
            delete approvelJson[0][key];
            delete approvelJson[0]["OvertimecommentsDrp"];
          }
        }
      }
    });
    setApprovelID(id);
    setApprovelJson(approvelJson);
  };

  const approvelFunction = () => {
    console.log(appprovelId, approvelJson);

    approvelJson[0].Status = "Submitted";

    if (approvelJson[0].OvertimecommentsDrpAll) {
      if (approvelJson[0].OvertimecommentsDrpAll == "") {
        delete approvelJson[0].OvertimecommentsDrp;
        delete approvelJson[0].OvertimecommentsDrpAll;
      } else if (approvelJson[0].OvertimecommentsDrpAll.includes(",")) {
        let splitMultiChoice =
          approvelJson[0].OvertimecommentsDrpAll.split(",");
        approvelJson[0].OvertimecommentsDrp = { results: splitMultiChoice };
        delete approvelJson[0].OvertimecommentsDrpAll;
      } else {
        approvelJson[0].OvertimecommentsDrp = {
          results: [approvelJson[0].OvertimecommentsDrpAll],
        };
        delete approvelJson[0].OvertimecommentsDrpAll;
      }
    }

    for (let key in approvelJson[0]) {
      if (approvelJson[0][key] == "" || approvelJson[0][key] == undefined) {
        delete approvelJson[0][key];
      }
    }
    let updateObj = { ...approvelJson[0] };

    if (updateObj.Status == "Submitted") {
      spweb.lists
        .getByTitle(`Timesheet`)
        .items.getById(appprovelId)
        .update(updateObj)
        .then((Response) => {
          console.log(Response);
          let compareTwoTime = "";

          masterData.forEach((data) => {
            if (data.Id == appprovelId) {
              if (updateObj.StartTime && updateObj.FinishTime) {
                compareTwoTime = totalHoursFunction(
                  updateObj.StartTime,
                  updateObj.FinishTime
                );
              }
              if (updateObj.StartTime) {
                compareTwoTime = totalHoursFunction(
                  updateObj.StartTime,
                  data.finishTime
                );
              } else if (updateObj.FinishTime) {
                compareTwoTime = totalHoursFunction(
                  data.startTime,
                  updateObj.FinishTime
                );
              }
              if (compareTwoTime != "") {
                data.totalHours = compareTwoTime;
              }
              for (let key in updateObj) {
                let keyName = key.charAt(0).toLowerCase() + key.slice(1);
                if (keyName == "overtimecommentsDrp") {
                  data[keyName] = updateObj[key].results.join();
                } else {
                  data[keyName] = updateObj[key];
                }
              }
            }
          });
          duplicateData.forEach((data) => {
            if (data.Id == appprovelId) {
              for (let key in updateObj) {
                let keyName = key.charAt(0).toLowerCase() + key.slice(1);
                if (keyName == "overtimecommentsDrp") {
                  data[keyName] = updateObj[key].results.join();
                } else {
                  data[keyName] = updateObj[key];
                }
              }
            }
          });
          displayData.forEach((data) => {
            if (data.Id == appprovelId) {
              for (let key in updateObj) {
                let keyName = key.charAt(0).toLowerCase() + key.slice(1);
                if (keyName == "overtimecommentsDrp") {
                  data[keyName] = updateObj[key].results.join();
                } else {
                  data[keyName] = updateObj[key];
                }
              }
            }
          });
          exportExcel.forEach((data) => {
            if (data.Id == appprovelId) {
              for (let key in updateObj) {
                let keyName = key.charAt(0).toLowerCase() + key.slice(1);
                if (keyName == "overtimecommentsDrp") {
                  data[keyName] = updateObj[key].results.join();
                } else {
                  data[keyName] = updateObj[key];
                }
              }
            }
          });
          allFilterOptions(duplicateData);
          filterHandleFunction("status", FilterKey.status);
          setIsApprovePopup(false);
          setApprovelJson([...approvelJSON]);
        })
        .catch((err) => console.log(err));
    }
  };
  const rejectFunction = () => {
    if (approvelJson[0].ReviewComments != "") {
      console.log(approvelJson[0], appprovelId);
      spweb.lists
        .getByTitle(`Timesheet`)
        .items.getById(appprovelId)
        .update({
          ReviewComments: approvelJson[0].ReviewComments,
          Status: "InReview",
        })
        .then((Response) => {
          masterData.forEach((data) => {
            if (data.Id == appprovelId) {
              data.status = "InReview";
              data.reviewComments = approvelJson[0].ReviewComments;
            }
          });
          displayData.forEach((data) => {
            if (data.Id == appprovelId) {
              data.status = "InReview";
              data.reviewComments = approvelJson[0].ReviewComments;
            }
          });
          duplicateData.forEach((data) => {
            if (data.Id == appprovelId) {
              data.status = "InReview";
              data.reviewComments = approvelJson[0].ReviewComments;
            }
          });
          exportExcel.forEach((data) => {
            if (data.Id == appprovelId) {
              data.status = "InReview";
              data.reviewComments = approvelJson[0].ReviewComments;
            }
          });
          allFilterOptions(duplicateData);
          filterHandleFunction("status", FilterKey.status);
          setIsRejectPopup(false);
          setIsApprovePopup(false);
          setApprovelJson([...approvelJSON]);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      let approvelComment = document.getElementById("approvelComment");
      approvelComment.style.color = "red";
    }
  };
  const getEmployeeConfig = async (): // TimesheetData,
  // dirReportersArr
  Promise<IEmployee[]> => {
    try {
      const res = await spweb.lists
        .getByTitle("EmployeeConfig")
        .items.select(
          "*,Employee/Title,Employee/EMail,ReportsTo/EMail,ReportsTo/Title"
        )
        .expand("Employee", "ReportsTo")
        .orderBy("Modified", false)
        .top(5000)
        .get();

      EmployeeConfig = [];
      for (const users of res) {
        EmployeeConfig.push({
          Email: users.Employee ? users.Employee.EMail : "",
          Name: users.Employee ? users.Employee.Title : "",
          Mobilization: users.IsMobilization,
          reportsToEmail: users.ReportsTo ? users.ReportsTo.EMail : "",
          reportsToName: users.ReportsTo ? users.ReportsTo.Title : "",
          team: users.Team ? users.Team : "",
          orginCountry: users.OrginCountry ? users.OrginCountry : "",
        });
      }
      // new changes params
      return EmployeeConfig;
    } catch (err) {
      console.log(err, "getEmployeeConfig");
      return [];
    }
  };

  const getTMSTServiceDetails = async (
    TimesheetData
    // directEmployeeArr
  ): Promise<any[]> => {
    try {
      const allItems: any[] = await fetchAllItems();

      if (allItems.length) {
        let tmstServiceDetails = allItems;

        getCRMActivityData(TimesheetData, tmstServiceDetails);
      } else {
        getCRMActivityData(TimesheetData, []);
      }
    } catch (error) {
      console.error("Error in getTMSTServiceDetails:", error);
      return [];
    }

    async function fetchAllItems(): Promise<any[]> {
      const allItems: any[] = [];
      let nextHref: string | null = null;

      do {
        try {
          const response = await spweb.lists
            .getByTitle("TMST_ServiceDetails")
            .renderListDataAsStream({
              ViewXml: camlQueryFunc(defaultCamlRange).serviceDetails,
              ...(nextHref ? { Paging: nextHref.substring(1) } : {}),
            });

          allItems.push(...response.Row);
          nextHref = response.NextHref || null;
        } catch (err) {
          console.error("Error fetching items:", err);
          break;
        }
      } while (nextHref);

      return allItems;
    }
  };

  const getCRMActivityData = async (
    TimesheetData,
    tmstServiceDetails
  ): Promise<any[]> => {
    try {
      const allItems: any[] = await fetchAllItems();
      let masterTimesheetArr = [];

      TimesheetData = [...TimesheetData];

      if (TimesheetData.length) {
        masterTimesheetArr = TimesheetData.filter(
          (item, index) => TimesheetData.indexOf(item) === index
        );
      } else {
        masterTimesheetArr = [];
      }
      // else {
      //   masterTimesheetArr = dirReportersArr;
      // }

      let tempLocalArr = masterTimesheetArr;
      start = performance.now();
      const allItemsMap = new Map<number, any>();
      for (const item of allItems) {
        if (item.TMST_CRM_IDId !== 0) {
          allItemsMap.set(item.TMST_CRM_IDId, item);
        }
      }

      for (const localItem of tempLocalArr) {
        const crmId = parseInt(localItem.Id);
        const matchedItem = allItemsMap.get(crmId);

        if (localItem.CRM_Activity === "Yes" && matchedItem) {
          arrCreator(localItem, matchedItem, tempLocalArr, tmstServiceDetails);
        } else {
          arrCreator(localItem, "", tempLocalArr, tmstServiceDetails);
        }
      }
    } catch (error) {
      console.error("Error in getCRMActivityData:", error);
      return [];
    }

    async function fetchAllItems(): Promise<any[]> {
      const allItems: any[] = [];
      let nextHref: string | null = null;

      do {
        try {
          const response = await spweb.lists
            .getByTitle("TMST_CRM_ActivityDetails")
            .renderListDataAsStream({
              ViewXml: camlQueryFunc(defaultCamlRange).crmActivity,
              ...(nextHref ? { Paging: nextHref.substring(1) } : {}),
            });

          allItems.push(...response.Row);
          nextHref = response.NextHref || null;
        } catch (err) {
          console.error("Error fetching items:", err);
          break;
        }
      } while (nextHref);

      return allItems;
    }
  };

  const findServiceDetails = (
    tmstServiceDetails,
    tmstId
  ): IServiceDetails[] => {
    let _tempTMSTSServiceDetails: IServiceDetails[] = [];

    let findServices = tmstServiceDetails.filter(
      (item: any) => item.TMST_ID != "" && item.TMST_ID[0].lookupId == tmstId
    );

    if (findServices.length) {
      findServices.forEach((ser: any) => {
        _tempTMSTSServiceDetails.push({
          sitecode: ser.SiteCode ? ser.SiteCode : "",
          client: ser.Client ? ser.Client : "",
          serCode: ser.ServiceCode ? ser.ServiceCode[0].lookupValue : "",
          serDescription: ser.ServiceDescription
            ? ser.ServiceDescription[0].lookupValue
            : "",
          startTime: ser.StartTime ? ser.StartTime : "",
          finishTime: ser.FinishTime ? ser.FinishTime : "",
          serviceID: ser.TMST_IDId,
          otherSitecode: ser.OtherSiteCode ? ser.OtherSiteCode : "",
        });
      });
    }

    return _tempTMSTSServiceDetails;
  };

  const arrCreator = (
    timesheetData,
    CRMData,
    masterData,
    tmstServiceDetails
  ) => {
    let compareTime = totalHoursFunction(
      timesheetData.StartTime,
      timesheetData.FinishTime
    );

    let tmstServices = findServiceDetails(
      tmstServiceDetails,
      parseInt(timesheetData.ID)
    );

    if (CRMData) {
      tempCount++;
      localArr.push({
        Id: timesheetData.ID,
        week: timesheetData.Week ? timesheetData.Week : "",
        // date: timesheetData.Date ? moment(timesheetData.Date).format() : "",
        date: timesheetData["Date."] ? timesheetData["Date."] : "",
        supervisor: timesheetData.Name ? timesheetData.Name[0].title : "",
        startTime: timesheetData.StartTime ? timesheetData.StartTime : "",
        finishTime: timesheetData.FinishTime ? timesheetData.FinishTime : "",
        overTime: timesheetData.OverTime ? timesheetData.OverTime : "",
        ifOverTime: timesheetData.OverTime ? "Yes" : "No",
        status: timesheetData.Status ? timesheetData.Status : "",
        siteCode: timesheetData.SiteCode ? timesheetData.SiteCode : "",
        mobilization: timesheetData.Mobilization
          ? timesheetData.Mobilization
          : "",
        travel: timesheetData.Travel ? timesheetData.Travel : "",
        city: timesheetData.City ? timesheetData.City : "",
        costCenter: timesheetData.CostCenter ? timesheetData.CostCenter : "",
        otherSiteCode: timesheetData.OtherSiteCode
          ? timesheetData.OtherSiteCode
          : "",
        comments: timesheetData.Comments ? timesheetData.Comments : "",
        reviewComments: timesheetData.ReviewComments
          ? timesheetData.ReviewComments
          : "",
        kmWithPrivateCar: timesheetData.KmWithPrivateCar
          ? timesheetData.KmWithPrivateCar
          : "",
        cityOverNight: timesheetData.CityOverNight
          ? timesheetData.CityOverNight
          : "",
        travelWithCar: timesheetData.TravelWithCar
          ? timesheetData.TravelWithCar
          : "",
        overTimeComments: timesheetData.OverTimeComments
          ? timesheetData.OverTimeComments
          : "",
        expense: timesheetData.Expense ? timesheetData.Expense : "",
        // totalHours: compareTime ? compareTime : "",
        totalHours: timesheetData.TotalWHrs
          ? timesheetData.TotalWHrs
          : compareTime,
        AtcCreditAmount: timesheetData.TotalAtcCredit,
        personalCardAmount: timesheetData.TotalPersonalCard,
        ison: timesheetData.ison,
        isRefund: timesheetData.IsRefundApproved ? "Yes" : "No",
        overtimecommentsDrp: timesheetData.OvertimecommentsDrp
          ? timesheetData.OvertimecommentsDrp
          : "",
        Country: timesheetData.Country ? timesheetData.Country : "",
        originCity: timesheetData.originCity ? timesheetData.originCity : "",
        originCountry: timesheetData.OrginCountry
          ? timesheetData.OrginCountry
          : "",
        CRMActivity: timesheetData.CRM_Activity
          ? timesheetData.CRM_Activity
          : "",
        ProjectType:
          timesheetData.ProjectType && timesheetData.ProjectType.length > 0
            ? timesheetData.ProjectType[0]
            : "",
        ProjectType_2:
          timesheetData.ProjectType && timesheetData.ProjectType.length >= 1
            ? timesheetData.ProjectType[1]
            : "",
        ProjectType_3:
          timesheetData.ProjectType && timesheetData.ProjectType.length >= 2
            ? timesheetData.ProjectType[2]
            : "",
        ProjectTypeOthers: timesheetData.ProjectTypeOthers
          ? timesheetData.ProjectTypeOthers
          : "",
        PersonName: CRMData.PersonName ? CRMData.PersonName : "-",
        Email: CRMData.EmailAddress ? CRMData.EmailAddress : "-",
        TelNumber: CRMData.TelNumber ? CRMData.TelNumber : "-",
        Comments: CRMData.Comments ? CRMData.Comments : "-",
        Name: CRMData.Name ? CRMData.Name[0].title : "-",
        Date: CRMData.Date ? moment(CRMData.Date).format("DD/MM/YYYY") : "-",
        Client: CRMData.Client ? CRMData.Client : "-",
        MeetingCon: CRMData.MeetingConducted ? CRMData.MeetingConducted : "-",
        ConversationType: CRMData.ConversationType
          ? CRMData.ConversationType
          : "-",
        CRMId: CRMData.TMST_CRM_IDId ? CRMData.TMST_CRM_IDId : "-",
        oneTOoneMeeting: timesheetData.OneToOneMeeting,
        oneToOneMeetingPerson: timesheetData.OneToOneMeetingParticipants
          ? timesheetData.OneToOneMeetingParticipants.map(
              (_person: any) => _person.Title
            )
          : [],
        onCallVisible: timesheetData.OnCallVisible,
        overtimeSts: timesheetData.OverTimeStatus
          ? timesheetData.OverTimeStatus
          : "",
        serviceDetails: tmstServices,
      });
    } else {
      tempCount++;
      localArr.push({
        Id: timesheetData.ID,
        week: timesheetData.Week ? timesheetData.Week : "",
        // date: timesheetData.Date ? moment(timesheetData.Date).format() : "",
        date: timesheetData["Date."] ? timesheetData["Date."] : "",
        supervisor: timesheetData.Name ? timesheetData.Name[0].title : "",
        startTime: timesheetData.StartTime ? timesheetData.StartTime : "",
        finishTime: timesheetData.FinishTime ? timesheetData.FinishTime : "",
        overTime: timesheetData.OverTime ? timesheetData.OverTime : "",
        ifOverTime: timesheetData.OverTime ? "Yes" : "No",
        status: timesheetData.Status ? timesheetData.Status : "",
        siteCode: timesheetData.SiteCode ? timesheetData.SiteCode : "",
        mobilization: timesheetData.Mobilization
          ? timesheetData.Mobilization
          : "",
        travel: timesheetData.Travel ? timesheetData.Travel : "",
        city: timesheetData.City ? timesheetData.City : "",
        costCenter: timesheetData.CostCenter ? timesheetData.CostCenter : "",
        otherSiteCode: timesheetData.OtherSiteCode
          ? timesheetData.OtherSiteCode
          : "",
        comments: timesheetData.Comments ? timesheetData.Comments : "",
        reviewComments: timesheetData.ReviewComments
          ? timesheetData.ReviewComments
          : "",
        kmWithPrivateCar: timesheetData.KmWithPrivateCar
          ? timesheetData.KmWithPrivateCar
          : "",
        cityOverNight: timesheetData.CityOverNight
          ? timesheetData.CityOverNight
          : "",
        travelWithCar: timesheetData.TravelWithCar
          ? timesheetData.TravelWithCar
          : "",
        overTimeComments: timesheetData.OverTimeComments
          ? timesheetData.OverTimeComments
          : "",
        expense: timesheetData.Expense ? timesheetData.Expense : "",
        // totalHours: compareTime ? compareTime : "",
        totalHours: timesheetData.TotalWHrs
          ? timesheetData.TotalWHrs
          : compareTime,
        AtcCreditAmount: timesheetData.TotalAtcCredit,
        personalCardAmount: timesheetData.TotalPersonalCard,
        ison: timesheetData.ison,
        isRefund: timesheetData.IsRefundApproved ? "Yes" : "No",
        overtimecommentsDrp: timesheetData.OvertimecommentsDrp
          ? timesheetData.OvertimecommentsDrp
          : "",
        Country: timesheetData.Country ? timesheetData.Country : "",
        originCity: timesheetData.OrginCity ? timesheetData.OrginCity : "",
        originCountry: timesheetData.OrginCountry
          ? timesheetData.OrginCountry
          : "",
        CRMActivity: timesheetData.CRM_Activity
          ? timesheetData.CRM_Activity
          : "",
        ProjectType:
          timesheetData.ProjectType && timesheetData.ProjectType.length > 0
            ? timesheetData.ProjectType[0]
            : "",
        ProjectType_2:
          timesheetData.ProjectType && timesheetData.ProjectType.length >= 1
            ? timesheetData.ProjectType[1]
            : "",
        ProjectType_3:
          timesheetData.ProjectType && timesheetData.ProjectType.length >= 2
            ? timesheetData.ProjectType[2]
            : "",
        ProjectTypeOthers: timesheetData.ProjectTypeOthers
          ? timesheetData.ProjectTypeOthers
          : "",
        PersonName: "-",
        Email: "-",
        TelNumber: "-",
        Comments: "-",
        Name: "-",
        Date: "-",
        Client: "-",
        MeetingCon: "-",
        ConversationType: "-",
        CRMId: "-",
        oneTOoneMeeting: timesheetData.OneToOneMeeting,
        oneToOneMeetingPerson: timesheetData.OneToOneMeetingParticipants
          ? timesheetData.OneToOneMeetingParticipants.map(
              (_person: any) => _person.Title
            )
          : [],
        onCallVisible: timesheetData.OnCallVisible,
        overtimeSts: timesheetData.OverTimeStatus
          ? timesheetData.OverTimeStatus
          : "",
        serviceDetails: tmstServices,
      });
    }

    if (tempCount == masterData.length) {
      localArr = localArr.sort(function (a, b) {
        return moment(a.date) > moment(b.date)
          ? -1
          : moment(a.date) < moment(b.date)
          ? 1
          : 0;
      });

      // if (loggedinuser == "admin.sharepoint@atc-logistics.ie") {
      if (loggedinuser == "davor.salkanovic@atc-logistics.de") {
        let onlyMobilizationYes = [];
        localArr.forEach((data) => {
          if (
            data.city == "Paris" ||
            data.city == "Gavle" ||
            data.city == "Warsaw" ||
            data.city == "Milan"
          ) {
            onlyMobilizationYes.push(data);
          } else if (
            data.supervisor == "Mateusz Wielechowski" ||
            data.supervisor == "Massimiliano Lorenzo Vantini" ||
            data.supervisor == "Kemal Sijah" ||
            data.supervisor == "Vinod Kumar Gopala" ||
            data.supervisor == "Carlos Martin Mazuelos Bravo"
          ) {
            if (data.mobilization == "Yes" || data.mobilization == "No") {
              onlyMobilizationYes.push(data);
            }
          } else {
            if (data.mobilization == "Yes") {
              onlyMobilizationYes.push(data);
            }
          }
        });

        console.log(
          ((performance.now() - start) / 1000).toFixed(2) + " seconds"
        );
        allFilterOptions([...onlyMobilizationYes]);
        setMasterData([...onlyMobilizationYes]);
        setDuplicateData([...onlyMobilizationYes]);
        setDisplayData([...onlyMobilizationYes]);
        setExportExcel([...onlyMobilizationYes]);
        timeSheetPaginateFunction(1, [...onlyMobilizationYes]);
        setLoader(false);
      } else {
        console.log(
          ((performance.now() - start) / 1000).toFixed(2) + " seconds"
        );
        allFilterOptions([...localArr]);
        setMasterData([...localArr]);
        setDuplicateData([...localArr]);
        setDisplayData([...localArr]);
        setExportExcel([...localArr]);
        timeSheetPaginateFunction(1, [...localArr]);
        setLoader(false);
      }
    }
  };

  // datatable functions
  const allowExpansion = (rowData) => {
    return rowData.serviceDetails.length > 0;
  };
  const overTimePillTemplate = (rowData) => {
    return (
      <div
        style={{
          width: "100%",
          textAlign: "center",
          backgroundColor: rowData.overTime != "" ? "#6aad6ac7" : "#be3535ed",
          padding: "3px 5px 5px 5px",
          borderRadius: "50px",
          color: rowData.overTime != "" ? "#000" : "#fff",
        }}
      >
        {rowData.overTime ? "Yes" : "No"}
      </div>
    );
  };
  const dateTemplate = (rowData) => {
    return (
      <div>
        {rowData.date
          ? moment(rowData.date).add(7, "hours").format("DD/MM/YYYY")
          : // ? moment(rowData.date).add(5, "hours").format("DD/MM/YYYY")
            "-"}
      </div>
    );
  };
  const overTimeTemplate = (rowData) => {
    return (
      <div>
        {rowData.overTime && rowData.overtimeSts == "Approved"
          ? rowData.overTime
          : "-"}
      </div>
    );
  };
  const overTimeCmtsTemplate = (rowData) => {
    return (
      <div>
        {rowData.overtimecommentsDrp
          ? rowData.overtimecommentsDrp.map((data) => {
              return data + ",";
            })
          : "-"}
      </div>
    );
  };
  const stsTemplate = (rowData) => {
    return (
      <div
        style={{
          width: "100%",
          textAlign: "center",
          fontSize: "11px",
          backgroundColor:
            rowData.status == "Submitted"
              ? "#c3ff68cf"
              : rowData.status == "Draft"
              ? "#d3d3d3"
              : rowData.status == "Pending Approval"
              ? "#f3d78a"
              : rowData.status == "InReview"
              ? "#f3d78a"
              : "",
          padding: "3px 5px 5px 5px",
          borderRadius: "50px",
          color:
            rowData.status == "Completed"
              ? "#000"
              : rowData.status == "Draft"
              ? "#5960a3"
              : rowData.status == "Pending approval" ||
                rowData.status == "InReview"
              ? "#000"
              : "",
        }}
      >
        {rowData.status}
      </div>
    );
  };
  const costCenterTemplate = (rowData) => {
    return <div>{rowData.costCenter ? rowData.costCenter : "-"}</div>;
  };

  const mobilizationTemplate = (rowData) => {
    return <div>{rowData.mobilization ? rowData.mobilization : "-"}</div>;
  };
  const travelTemplate = (rowData) => {
    return <div>{rowData.travel ? rowData.travel : "-"}</div>;
  };
  const cityTemplate = (rowData) => {
    let cityName: string = "";
    if (rowData.city) {
      cityName = rowData.city;
    } else if (rowData.originCity) {
      cityName = rowData.originCity;
    }
    return <div>{cityName}</div>;
  };
  const approveTemplate = (rowData) => {
    return (
      <div>
        {rowData.status == "Pending Approval" ? (
          <IconButton
            iconProps={CloudUpload}
            style={{ cursor: "pointer" }}
            title="Approve"
            ariaLabel="Approve"
            onClick={(ev) => (
              ev.stopPropagation(),
              uploadApprove(rowData.Id, rowData.json),
              setIsApprovePopup(true)
            )}
          />
        ) : (
          ""
        )}
      </div>
    );
  };
  const serviceSitecodeTemplate = (rowData) => {
    let _tempSiteCode: string = rowData.sitecode;
    if (rowData.sitecode == "Others") {
      _tempSiteCode = rowData.otherSitecode;
    }
    return <div>{_tempSiteCode}</div>;
  };

  const rowExpansionTemplate = (data) => {
    return (
      <div>
        <DataTable value={data.serviceDetails}>
          <Column
            field="sitecode"
            header="Site Code"
            body={serviceSitecodeTemplate}
          ></Column>
          <Column field="client" header="Client"></Column>
          <Column field="serCode" header="Service Code"></Column>
          <Column field="serDescription" header="Service Description"></Column>
          <Column field="startTime" header="Start Time"></Column>
          <Column field="finishTime" header="Finish Time"></Column>
        </DataTable>
      </div>
    );
  };

  const onRowClicked = (event) => {
    window.open(currentUrl + "?TsID=" + event.data.Id);
  };

  return loader ? (
    <CustomLoader />
  ) : (
    <div style={{ margin: "10px" }}>
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
      {isApprovePopup && (
        <Layer>
          <Popup
            className={approvePopupStyles.root}
            role="dialog"
            aria-modal="true"
            onDismiss={() => {
              setIsApprovePopup(false), setApprovelJson([...approvelJSON]);
            }}
          >
            <Overlay
              onClick={() => {
                setIsApprovePopup(false);
              }}
            />
            <FocusTrapZone>
              <div className={approvePopupStyles.sec}>
                <div className={styles.closeicon} style={{ textAlign: "end" }}>
                  <IconButton
                    iconProps={Close}
                    style={{
                      fontSize: 72,
                      cursor: "pointer",
                    }}
                    title="Close"
                    ariaLabel="Close"
                    onClick={() => {
                      setIsApprovePopup(false),
                        setApprovelJson([...approvelJSON]);
                    }}
                  />
                </div>
                {approvelJson.length != 0 ? (
                  <div className={approvePopupStyles.content}>
                    {approvelJson[0].Week ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Week :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].Week}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].Date ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Date :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={moment(approvelJson[0].Date).format(
                            "DD/MM/YYYY"
                          )}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {/* {approvelJson[0].Name != "" ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Supervisor :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].Name}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )} */}
                    {approvelJson[0].OverTime ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Over time :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].OverTime}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].OverTimeComment ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Overtime Comments :
                        </label>
                        <textarea
                          style={{ width: "50%" }}
                          value={approvelJson[0].OverTimeComment}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].StartTime ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Start time :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].StartTime}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].FinishTime ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          End time :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].FinishTime}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].Travel ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Travel :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].Travel}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].KmWithPrivateCar ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Private car km :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].KmWithPrivateCar}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].Comments ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Comments :
                        </label>
                        <textarea
                          style={{ width: "50%" }}
                          value={approvelJson[0].Comments}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].SiteCode ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Sitecode :
                        </label>
                        <textarea
                          style={{ width: "50%" }}
                          value={approvelJson[0].SiteCode}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].CityOverNight ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Over night city :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].CityOverNight}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].OtherSiteCode ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Other sitecode :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].OtherSiteCode}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].TravelWithCar ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Car travel :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].TravelWithCar}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].Mobilization ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Mobilization :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].Mobilization}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].OvertimecommentsDrpAll ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Over time reason :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].OvertimecommentsDrpAll}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].OverTimeComments ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Over time reason comments :
                        </label>
                        <textarea
                          style={{ width: "50%" }}
                          value={approvelJson[0].OverTimeComments}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].Expense ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Expense :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].Expense}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].TotalAtcCredit ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Total ATCcard :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].TotalAtcCredit}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {approvelJson[0].TotalPersonalCard ? (
                      <div className={approvePopupStyles.right}>
                        <label style={{ width: "40%", fontWeight: "700" }}>
                          Total personalCard :
                        </label>
                        <input
                          style={{ width: "50%" }}
                          type="text"
                          value={approvelJson[0].TotalPersonalCard}
                          disabled
                        />
                      </div>
                    ) : (
                      ""
                    )}

                    <div
                      style={{
                        width: "95%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20px",
                      }}
                    >
                      <DefaultButton
                        primary
                        text={"Approve"}
                        style={{
                          cursor: "pointer",
                          backgroundColor: "#67c25f",
                          border: "1px solid #67c25f",
                          marginRight: "20px",
                        }}
                        onClick={() => approvelFunction()}
                      />
                      <DefaultButton
                        primary
                        text={"Reject"}
                        style={{
                          cursor: "pointer",
                          backgroundColor: "#be3535ed",
                          border: "1px solid #be3535ed",
                        }}
                        onClick={() => {
                          setIsRejectPopup(true);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={approvePopupStyles.content}></div>
                )}
              </div>
            </FocusTrapZone>
          </Popup>
        </Layer>
      )}
      {isRejectPopup && (
        <Layer>
          <Popup
            className={rejectPopupStyles.root}
            role="dialog"
            aria-modal="true"
            onDismiss={() => {
              setIsRejectPopup(false);
            }}
          >
            <Overlay
              onClick={() => {
                setIsRejectPopup(false);
              }}
            />
            <FocusTrapZone>
              <div className={rejectPopupStyles.content}>
                <div className={styles.closeicon} style={{ textAlign: "end" }}>
                  <IconButton
                    iconProps={Close}
                    style={{
                      fontSize: 72,
                      cursor: "pointer",
                    }}
                    title="Close"
                    ariaLabel="Close"
                    onClick={() => setIsRejectPopup(false)}
                  />
                </div>
                <div style={{ padding: "0px 40px" }}>
                  <label
                    style={{
                      display: "flex",
                      width: "100%",
                      fontWeight: "700",
                      marginBottom: "10px",
                    }}
                    id="approvelComment"
                  >
                    Review comments <sup>*</sup>
                  </label>
                  <textarea
                    style={{
                      display: "flex",
                      width: "100%",
                      border: "none",
                      outline: "1px solid #000",
                    }}
                    onChange={(ev) =>
                      (approvelJson[0].ReviewComments = ev.target.value)
                    }
                  />
                </div>
                <DefaultButton
                  primary
                  text={"Ok"}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#67c25f",
                    border: "1px solid #67c25f",
                    margin: "20px 0px",
                  }}
                  onClick={() => rejectFunction()}
                />
              </div>
            </FocusTrapZone>
          </Popup>
        </Layer>
      )}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
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
          Time Sheet Dashboard
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
            disabled={onlyTimeSheetPermission.length > 0 ? true : false}
            text={"Field Quality"}
            onClick={() => props.DashboardChangeFun("fieldQualityDashboard")}
            // onClick={() => props.DashboardChangeFun(true)}
            style={{
              backgroundColor: "#dacbcc8c",
              color: "#a83037",
              border: "none",
            }}
          />
          <DefaultButton
            text={"Time Sheet"}
            style={{
              backgroundColor: "#a83037",
              color: "#fff",
              border: "none",
            }}
          />
          {/* <DefaultButton
            text={"Travel Expense"}
            onClick={() => props.DashboardChangeFun("Travel Expense")}
            style={{
              backgroundColor: "#dacbcc8c",
              color: "#a83037",
              border: "none",
            }}
          /> */}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* <DefaultButton
            iconProps={History}
            text={"History"}
            onClick={() => getHistoryData()}
            style={{
              backgroundColor: "#fff",
              color: "#a83037",
              marginRight: "10px",
              border: "1px solid #a83037",
            }}
          /> */}
          <DefaultButton
            iconProps={Save}
            text={"Export more data"}
            onClick={() => {
              setIsExportExcel(true);
            }}
            style={{
              backgroundColor: "#a83037",
              color: "#fff",
              border: "none",
            }}
          />
          <DefaultButton
            iconProps={Save}
            text={"Export"}
            onClick={() => {
              generateTimeSheetExcel(exportExcel);
            }}
            style={{
              backgroundColor: "#a83037",
              color: "#fff",
              border: "none",
            }}
          />
        </div>
      </div>
      <div>
        <div className={styles.filtersection}>
          <Dropdown
            label="Week"
            selectedKey={FilterKey.week}
            onChange={(e, option) => {
              filterHandleFunction("week", option["text"]);
            }}
            placeholder="Select an option"
            options={dropDownOptions.week}
            styles={dropdownStyles}
          />
          <div style={{ margin: "5px 22px 0px 0px", width: "30%" }}>
            <span style={{ fontWeight: 500 }}>Supervisor</span>
            <Autocomplete
              id="combo-box-demo"
              options={dropDownOptions.supervisor}
              className={"comboBox"}
              ListboxProps={{ style: { fontSize: 12 } }}
              value={FilterKey.supervisor}
              getOptionLabel={(option) => option.text}
              style={{ width: "100%", padding: "5px 20px 0px 0px" }}
              multiple={true}
              onChange={(e, value) => {
                filterHandleFunction("supervisor", value);
              }}
              inputValue={supervisor}
              onInputChange={(event, newInputValue: any) => {
                setSupervisor(newInputValue);
              }}
              renderInput={(params) => (
                <ThemeProvider theme={theme}>
                  <TextField {...params} variant="outlined" />
                </ThemeProvider>
              )}
            />
          </div>
          <Dropdown
            label="Status"
            selectedKey={FilterKey.status}
            onChange={(e, option) => {
              filterHandleFunction("status", option["text"]);
            }}
            placeholder="Select an option"
            options={dropDownOptions.status}
            styles={dropdownStyles}
          />
          <Dropdown
            label="City"
            selectedKey={FilterKey.city}
            onChange={(e, option) => {
              filterHandleFunction("city", option["text"]);
            }}
            placeholder="Select an option"
            options={dropDownOptions.city}
            styles={dropdownStyles}
          />
          <DatePicker
            label="Start date"
            placeholder="Select"
            formatDate={dateFormater}
            styles={dropdownStyles}
            value={deliveryStartDate ? deliveryStartDate : null}
            onSelectDate={(value: any) => {
              filterHandleFunction("filterStartDate", value);
            }}
          />
          <DatePicker
            label="End date"
            placeholder="Select"
            formatDate={dateFormater}
            styles={dropdownStyles}
            value={deliveryEndDate ? deliveryEndDate : null}
            onSelectDate={(value: any) => {
              filterHandleFunction("filterEndDate", value);
            }}
          />
          <Dropdown
            label="Mobilization"
            selectedKey={FilterKey.mobilization}
            onChange={(e, option) => {
              filterHandleFunction("mobilization", option["text"]);
            }}
            placeholder="Select an option"
            options={dropDownOptions.mobilization}
            styles={dropdownStyles}
          />
          <IconButton
            style={{ margin: "27px 10px 0px 0px" }}
            iconProps={Equalizer}
            title="More Options"
            ariaLabel="More Options"
            onClick={() => setOtherOptions(!otherOptions)}
          />
          {/* <IconButton
            className={styles.resetbtn}
            style={{ marginTop: "27px" }}
            iconProps={Refresh}
            title="Filter reset"
            ariaLabel="Filter reset"
            onClick={() => resetFilterOptions()}
          /> */}
          {!otherOptions && (
            <IconButton
              className={styles.resetbtn}
              style={{ marginTop: "27px" }}
              iconProps={Refresh}
              title="Filter reset"
              ariaLabel="Filter reset"
              onClick={() => resetFilterOptions()}
            />
          )}
        </div>
        {otherOptions ? (
          <div className={styles.filtersection}>
            <Dropdown
              label="Over time"
              selectedKey={FilterKey.ifOverTime}
              onChange={(e, option) => {
                filterHandleFunction("ifOverTime", option["text"]);
              }}
              placeholder="Select an option"
              options={dropDownOptions.ifOverTime}
              styles={dropdownStyles}
            />
            <Dropdown
              label="Over time reason"
              selectedKey={FilterKey.overTimeReason}
              onChange={(e, option) => {
                filterHandleFunction("overTimeReason", option["text"]);
              }}
              placeholder="Select an option"
              options={dropDownOptions.overTimeReason}
              styles={dropdownStyles}
            />
            {/* <Dropdown
              label="Tracking"
              selectedKey={FilterKey.overTimeReason}
              onChange={(e, option) => {
                filterHandleFunction("overTimeReason", option["text"]);
              }}
              placeholder="Select an option"
              options={dropDownOptions.overTimeReason}
              styles={dropdownStyles}
            /> */}
            {otherOptions ? (
              <IconButton
                className={styles.resetbtn}
                style={{ marginTop: "27px" }}
                iconProps={Refresh}
                title="Refresh"
                ariaLabel="Refresh"
                onClick={() => resetFilterOptions()}
              />
            ) : (
              ""
            )}
          </div>
        ) : (
          ""
        )}
      </div>
      <div>
        <DataTable
          value={displayData}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
          onRowClick={onRowClicked}
        >
          <Column expander={allowExpansion} style={{ width: "5rem" }} />
          <Column field="week" header="Week" />
          <Column field="date" header="Date" body={dateTemplate} />
          <Column field="supervisor" header="Supervisor" />
          <Column field="totalHours" header="Total hours" />
          <Column
            field="overTime"
            header="Over Time"
            body={overTimePillTemplate}
          />
          <Column field="overTime" header="Over Time" body={overTimeTemplate} />
          <Column
            field="overtimecommentsDrp"
            header="Over time reason"
            body={overTimeCmtsTemplate}
          />
          <Column field="status" header="Status" body={stsTemplate} />
          <Column
            field="costCenter"
            header="Cost Center"
            body={costCenterTemplate}
          />
          <Column
            field="mobilization"
            header="Mobilization"
            body={mobilizationTemplate}
          />
          <Column field="travel" header="Travel" body={travelTemplate} />
          <Column field="city" header="City" body={cityTemplate} />
          <Column field="city" header="Approve/Review" body={approveTemplate} />
        </DataTable>
        <div className={styles.pagination}></div>
        {displayData.length == 0 ? (
          <div className={styles.noRecordsec}>
            <h4>No records found !!!</h4>
          </div>
        ) : (
          <div className={styles.pagination}>
            <Pagination
              page={currentPage}
              onChange={(e, page) => {
                timeSheetPaginateFunction(page, exportExcel);
              }}
              count={
                exportExcel.length > 0
                  ? Math.ceil(exportExcel.length / totalPageItems)
                  : 1
              }
              color="primary"
              showFirstButton={currentPage == 1 ? false : true}
              showLastButton={
                currentPage == Math.ceil(exportExcel.length / totalPageItems)
                  ? false
                  : true
              }
            />
          </div>
        )}
      </div>

      {isExportExcel && (
        <ExportExcel
          loggedinuser={loggedinuser}
          context={props.spcontext}
          spweb={spweb}
          exportExcelFlag={setIsExportExcel}
        />
      )}
    </div>
  );
}
