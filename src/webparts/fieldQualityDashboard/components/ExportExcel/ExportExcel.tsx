import * as React from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import * as moment from "moment";
import styles from "./ExportExcel.module.scss";
import { useEffect, useState } from "react";
import { camlQueryFunc } from "../Config";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import { ProgressSpinner } from "primereact/progressspinner";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";

interface IProps {
  loggedinuser: string;
  context: any;
  spweb: any;
  exportExcelFlag: any;
}
interface IDirRep {
  Email: string;
}
interface IEmployee {
  Email: string;
  Name: string;
  Mobilization: string;
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
interface IFilterkeys {
  startDate: string;
  endDate: string;
  startDateOriginalFormat: Date;
  endDateOriginalFormat: Date;
}

// gloabl variables
let localArr = [];
let tempCount: number = 0;
let EmployeeConfig: IEmployee[] = [];
let directReportsArr: IDirRep[] = [];
let start: number = null;

const ExportExcel = (props: IProps) => {
  let loggedinuser = props.loggedinuser;

  let _tempFilterKeys: IFilterkeys = {
    startDate: "",
    endDate: "",
    startDateOriginalFormat: new Date(),
    endDateOriginalFormat: new Date(),
  };

  const spweb = props.spweb;
  let _alertMsg = "Please wait, exporting data...";

  // state variables
  const [userPermissionCitys, setUserPermissionCitys] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [filterKeys, setFilterKeys] = useState(_tempFilterKeys);
  const [alertMsg, setalertMsg] = useState<string>(_alertMsg);

  const getAdmin = () => {
    spweb.siteGroups
      .getByName("ATC FQT Owners")
      .users.get()
      .then((users) => {
        let tempUser = users.filter((_user) => {
          return _user.Email == loggedinuser;
        });
        if (tempUser.length > 0) {
          spweb.lists
            .getByTitle(`TimesheetConfig`)
            .items.top(5000)
            .get()
            .then((Response) => {
              let allCitys = [];
              if (Response.length > 0) {
                Response.forEach((data) => {
                  if (
                    allCitys.findIndex((dd) => {
                      return dd.City == data.Title;
                    }) == -1
                  ) {
                    allCitys.push({ City: data.Title });
                  }
                });
              }
              // new changes
              getDirReports(allCitys);
            })

            .catch((err) => {
              console.log(err);
            });
        } else {
          spweb.lists
            .getByTitle(`TimesheetConfig`)
            .items.filter("Manager/EMail eq '" + loggedinuser + "' ")
            .top(5000)
            .get()
            .then((Response) => {
              let allCitys = [];
              if (Response.length > 0) {
                Response.forEach((data) => {
                  if (
                    allCitys.findIndex((dd) => {
                      return dd.City == data.Title;
                    }) == -1
                  ) {
                    allCitys.push({ City: data.Title });
                  }
                });
              }
              getDirReports(allCitys);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getDirReports = async (allCitys) => {
    await props.context._msGraphClientFactory
      .getClient()
      .then(async (client: any) => {
        await client
          .api("/me/directReports")
          .top(999)
          .get()
          .then(async (member) => {
            if (member.value.length) {
              await member.value.forEach(async (per) => {
                directReportsArr.push({
                  Email: per.mail,
                });
              });
            }
            // new changes params
            await getTimesheetData(allCitys, directReportsArr);
          });
      })
      .catch((err) => {
        console.log(err, "getATCTransportMembers");
      });
  };
  const getTimesheetData = async (
    allCitys,
    directReportees
  ): Promise<any[]> => {
    try {
      const allItems: any[] = await fetchAllItems();

      if (allItems.length) {
        tempCount = 0;
        localArr = [];
        let timeFilterData = [];
        let DirRepData = [];
        // new changes
        if (directReportees.length) {
          DirRepData = allItems.filter((rep) => {
            return directReportees.some((per) => {
              return per.Email == rep && rep.Name.EMail;
            });
          });
        }
        // console.log(DirRepData);
        for (const city of allCitys) {
          const filterCitys = allItems.filter((filres) => {
            return filres.City === city.City || filres.OrginCity === city.City;
          });

          if (filterCitys.length > 0) {
            for (const citys of filterCitys) {
              if (
                userPermissionCitys.findIndex(
                  (dd) => dd.city === citys.City
                ) === -1
              ) {
                userPermissionCitys.push({
                  city: citys.City,
                });
              }
            }

            for (const data of filterCitys) {
              timeFilterData.push(data);
            }
          }
        }

        getTimeSheetHistory(
          allCitys,
          timeFilterData,
          DirRepData,
          directReportees
        );
      } else {
        setalertMsg("No data found");
        setLoader(false);
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
              ViewXml: camlQueryFunc(filterKeys).timesheet,
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
  const getTimeSheetHistory = async (
    allCitys,
    oldData,
    DirRepData,
    directReportees
  ): Promise<any[]> => {
    try {
      const allItems: any[] = await fetchAllItems();

      if (allItems.length) {
        let dirReportersArr = [];
        if (directReportees.length) {
          dirReportersArr = allItems.filter((rep) => {
            return directReportees.some((per) => {
              return per.Email == rep.Name.EMail;
            });
          });
          dirReportersArr = [...dirReportersArr, ...DirRepData];
          for (const city of allCitys) {
            const filterCitys = allItems.filter((res) => {
              return res.City === city.City || res.OrginCity === city.City;
            });

            if (filterCitys.length > 0) {
              for (const citys of filterCitys) {
                if (
                  userPermissionCitys.findIndex(
                    (dd) => dd.city === citys.City
                  ) === -1
                ) {
                  userPermissionCitys.push({
                    city: citys.City,
                  });
                }
              }

              for (const data of filterCitys) {
                oldData.push(data);
              }
            }
            getEmployeeConfig(oldData, dirReportersArr);
          }
        } else {
          dirReportersArr = DirRepData;

          getEmployeeConfig(oldData, dirReportersArr);
        }
      } else {
        getEmployeeConfig(oldData, directReportees);
      }
    } catch (error) {
      console.error("Error in getTimeSheetHistory:", error);
      return [];
    }

    async function fetchAllItems(): Promise<any[]> {
      const allItems: any[] = [];
      let nextHref: string | null = null;

      do {
        try {
          const response = await spweb.lists
            .getByTitle("Timesheet_History")
            .renderListDataAsStream({
              ViewXml: camlQueryFunc(filterKeys).timesheet,
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
  const getEmployeeConfig = (TimesheetData, dirReportersArr) => {
    spweb.lists
      .getByTitle("EmployeeConfig")
      .items.select("*,Employee/Title,Employee/EMail")
      .expand("Employee")
      .orderBy("Modified", false)
      .top(5000)
      .get()
      .then((res) => {
        for (const users of res) {
          EmployeeConfig.push({
            Email: users.Employee ? users.Employee.EMail : "",
            Name: users.Employee ? users.Employee.Title : null,
            Mobilization: users.IsMobilization,
          });
        }
        getTMSTServiceDetails(TimesheetData, dirReportersArr);
      })
      .catch((err) => {
        console.log(err, "getEmployeeConfig");
      });
  };
  const getTMSTServiceDetails = async (
    TimesheetData,
    dirReportersArr
  ): Promise<any[]> => {
    try {
      const allItems: any[] = await fetchAllItems();

      if (allItems.length) {
        let tmstServiceDetails = allItems;

        getCRMActivityData(TimesheetData, dirReportersArr, tmstServiceDetails);
      } else {
        getCRMActivityData(TimesheetData, dirReportersArr, []);
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
              ViewXml: camlQueryFunc(filterKeys).serviceDetails,
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
    dirReportersArr,
    tmstServiceDetails
  ): Promise<any[]> => {
    try {
      const allItems: any[] = await fetchAllItems();
      let masterTimesheetArr = [];

      if (TimesheetData.length) {
        masterTimesheetArr = TimesheetData.filter(
          (item, index) => TimesheetData.indexOf(item) === index
        );
      } else {
        masterTimesheetArr = dirReportersArr;
      }

      let tempLocalArr = masterTimesheetArr;

      // new changes end
      start = performance.now();
      for (let i = 0; i < tempLocalArr.length; i++) {
        let _isValueId: boolean = false;
        for (let j = 0; j < allItems.length; j++) {
          if (
            tempLocalArr[i].CRM_Activity == "Yes" &&
            allItems[j].TMST_CRM_IDId != 0 &&
            allItems[j].TMST_CRM_IDId == parseInt(tempLocalArr[i].Id)
          ) {
            _isValueId = true;
            arrCreator(
              tempLocalArr[i],
              allItems[j],
              tempLocalArr,
              tmstServiceDetails
            );
          }
        }
        if (!_isValueId) {
          arrCreator(tempLocalArr[i], "", tempLocalArr, tmstServiceDetails);
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
              ViewXml: camlQueryFunc(filterKeys).crmActivity,
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
  const totalHoursFunction = (startTime, EndTime) => {
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
  };
  const arrCreator = (
    timesheetData,
    CRMData,
    masterData,
    tmstServiceDetails
  ): void => {
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
        date: timesheetData["Date."]
          ? timesheetData["Date."]
          : // moment(
            //     timesheetData.FieldValuesAsText.Date,
            //     "DD/MM/YYYY"
            //   ).toISOString()
            "",
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

        setMasterData([...localArr]);
        generateTimeSheetExcel([...localArr]);
      } else {
        console.log(
          ((performance.now() - start) / 1000).toFixed(2) + " seconds"
        );
        setMasterData([...localArr]);
        generateTimeSheetExcel([...localArr]);
      }
    }
  };
  const onChanger = (key: string, val: any): void => {
    let _tempFilterKeys: IFilterkeys = { ...filterKeys };
    setalertMsg("Please wait, exporting data...");
    if (key == "startDate") {
      _tempFilterKeys[key] = moment(val).format("YYYY-MM-DD");
      _tempFilterKeys.startDateOriginalFormat = val;
    } else {
      _tempFilterKeys[key] = moment(val).format("YYYY-MM-DD");
      _tempFilterKeys.endDateOriginalFormat = val;
    }
    setFilterKeys(_tempFilterKeys);
  };

  const generateTimeSheetExcel = async (list) => {
    if (!list.length) {
      setalertMsg("No data found");
      return;
    }

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
            onCall: item.onCallVisible ? "Yes" : "No",
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
          onCall: item.onCallVisible ? "Yes" : "No",
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
    alertify.set("notifier", "position", "top-right");
    alertify.success("Data exported successfully.");
    setLoader(false);
    props.exportExcelFlag(false);
  };

  const dateFormater = (date: Date): string => {
    return !date ? "" : moment(date).add(5, "hours").format("DD/MM/YYYY");
  };

  const init = (): void => {
    getAdmin();
  };

  return (
    <div>
      <Dialog
        visible={true}
        modal
        header={"Export Data"}
        style={{ width: "50rem" }}
        onHide={() => {
          props.exportExcelFlag(false);
        }}
      >
        {loader ? (
          <>
            <div style={{ textAlign: "center" }}>
              <ProgressSpinner
                style={{ width: "40px", height: "40px" }}
                strokeWidth="8"
                fill="var(--surface-ground)"
                animationDuration=".5s"
              />
              <div>
                <b>{alertMsg}</b>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.exportContainer}>
              <div className={styles.fieldsFlex}>
                <div>Start Date</div>
                <Calendar
                  style={{ width: "100%" }}
                  minDate={moment()
                    .subtract(12, "months")
                    .startOf("month")
                    .toDate()}
                  maxDate={new Date()}
                  value={
                    filterKeys.startDate ? new Date(filterKeys.startDate) : null
                  }
                  onChange={(e) => onChanger("startDate", e.value)}
                  showIcon
                  icon={() => <i className="pi pi-calendar" />}
                />
              </div>

              <div className={styles.fieldsFlex}>
                <div>End Date</div>
                <Calendar
                  style={{ width: "100%" }}
                  minDate={
                    filterKeys.startDateOriginalFormat
                      ? new Date(filterKeys.startDateOriginalFormat)
                      : null
                  }
                  maxDate={new Date()}
                  value={
                    filterKeys.endDate ? new Date(filterKeys.endDate) : null
                  }
                  onChange={(e) => onChanger("endDate", e.value)}
                  showIcon
                  icon={() => <i className="pi pi-calendar" />}
                />
              </div>
            </div>

            <div className={styles.exportbtnContainer}>
              {alertMsg == "No data found" ? (
                <div>{alertMsg}</div>
              ) : (
                <div>
                  <Button
                    label="Export"
                    icon="pi pi-file-export"
                    onClick={() => {
                      setLoader(true);
                      init();
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default ExportExcel;
