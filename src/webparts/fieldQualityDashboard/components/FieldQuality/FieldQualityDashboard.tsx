import * as React from "react";
import * as moment from "moment";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import styles from ".././FieldQualityDashboard.module.scss";
import CustomLoader from "../Loder/CustomLoder";
import { Web } from "@pnp/sp/presets/all";
import { useEffect, useState, useCallback, cloneElement } from "react";
import {
  Dropdown,
  IDropdownStyles,
  DetailsList,
  DetailsListLayoutMode,
  IDetailsListStyles,
  IIconProps,
  SelectionMode,
  DefaultButton,
  mergeStyleSets,
  FocusTrapZone,
  Layer,
  Overlay,
  Popup,
  ISearchBoxStyles,
  IconButton,
  Icon,
  Selection,
  DatePicker,
} from "@fluentui/react";
import Pagination from "@material-ui/lab/Pagination";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { log } from "sp-pnp-js";

let spweb = Web(
  "https://atclogisticsie.sharepoint.com/sites/PlanningOperations/Field%20Quality"
);
let currentUrl = window.location.href;

const theme = createTheme({
  overrides: {
    MuiInputLabel: {
      outlined: {
        transform: "translate(14px, 12.5px) scale(1)",
        padding: "25px 0px 0px 0px",
        fontSize: "15px",
      },
    },
    MuiFormControl: {
      // root: {
      //   padding: "28px 0px 0px 0px",
      // },
    },
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
          padding: "0px!important",
        },
      },
    },
  },
});

const selection = new Selection();

export default function FieldQualityDashboard(props: any): JSX.Element {
  let loggedinuser = props.spcontext.pageContext.user.email;
  let currpage = 1;
  let totalPageItems = 30;

  let drpDownForFilter = {
    country: [{ key: "All", text: "All" }],
    status: [{ key: "All", text: "All" }],
    supervisor: [{ key: "All", text: "All" }],
    client: [{ key: "All", text: "All" }],
    joptype: [{ key: "All", text: "All" }],
    siteCode: [{ key: "All", text: "All" }],
    week: [
      { key: "All", text: "All" },
      { key: "Last Week", text: "Last Week" },
      { key: "This Week", text: "This Week" },
      { key: "Last Month", text: "Last Month" },
    ],
    // mobilization:
    //   loggedinuser != "davor.salkanovic@atc-logistics.de"
    //     ? [
    //         { key: "All", text: "All" },
    //         { key: "Yes", text: "Yes" },
    //         { key: "No", text: "No" },
    //       ]
    //     : [{ key: "Yes", text: "Yes" }],
    mobilization: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
    ],
    siteAccessdelay: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
    ],
    securityOrOtherdelays: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
    ],
    accidentInformation: [{ key: "All", text: "All" }],
    full5PPE: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
    ],
    escalated: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
    ],
    goodSave: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
      { key: "N/A", text: "N/A" },
    ],
    DrivingforwSuggestion: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
      { key: "N/A", text: "N/A" },
    ],
    safetyInitiative: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
      { key: "N/A", text: "N/A" },
    ],
    wgcrew: [{ key: "All", text: "All" }],
    handSBriefingConductedby: [{ key: "All", text: "All" }],
    edgeregion: [
      { key: "Italy", text: "Italy" },
      { key: "Italy", text: "Italy" },
      { key: "Italy", text: "Italy" },
      { key: "Italy", text: "Italy" },
    ],
  };
  let FilterItem = {
    country: "All",
    status: "All",
    supervisor: { text: "All", key: "All" },
    client: "All",
    joptype: "All",
    week: "All",
    // mobilization:
    //   loggedinuser != "davor.salkanovic@atc-logistics.de" ? "All" : "Yes",
    mobilization: "All",
    siteAccessdelay: "All",
    securityOrOtherdelays: "All",
    full5PPE: "All",
    escalated: "All",
    wgcrew: { text: "All", key: "All" },
    accidentInformation: "All",
    search: "",
    filterStartDate: "All",
    filterEndDate: "All",
    goodSave: "All",
    DrivingforwSuggestion: "All",
    safetyInitiative: "All",
    handSBriefingConductedby: { text: "All", key: "All" },
    edgeregion: "All",
    siteCode: { text: "All", key: "All" },
  };

  // import icons

  const Equalizer: IIconProps = { iconName: "Equalizer" };
  const Refresh: IIconProps = { iconName: "Refresh" };
  const Save: IIconProps = { iconName: "Save" };
  const Delete: IIconProps = { iconName: "Delete" };
  const Close: IIconProps = { iconName: "ChromeClose" };

  // fluent Ui style

  const searchBoxStyles: Partial<ISearchBoxStyles> = {
    root: { width: 200, margin: "27px 10px 0px 10px" },
  };
  const dropdownStyles: Partial<IDropdownStyles> = {
    root: { width: "9%", marginRight: "22px" },
    dropdown: { width: "100%" },
  };
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
  const deletePopupStyles = mergeStyleSets({
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
      maxWidth: "700px",
      // padding: "20px 30px 30px 30px",
      position: "absolute",
      top: "50%",
      transform: "translate(-50%, -50%)",
      // width: "300px",
      textAlign: "center",
    },
    content: {
      padding: "10px 50px 30px 50px",
    },
  });

  let columns = [
    {
      key: "columns1",
      name: "Tracking No",
      fieldName: "trackingNo",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.trackingNo}</div>
        </>
      ),
    },
    {
      key: "columns2",
      name: "Supervisor",
      fieldName: "supervisor",
      minWidth: 70,
      maxWidth: 100,
      onRender: (item) => (
        <>
          <div>{item.supervisor}</div>
        </>
      ),
    },
    {
      key: "columns3",
      name: "Del date",
      fieldName: "deleteDate",
      minWidth: 60,
      maxWidth: 80,
      onRender: (item) => (
        <>
          <div>{dateFormater(item.deleteDate)}</div>
        </>
      ),
    },
    {
      key: "columns4",
      name: "Rack qty",
      fieldName: "rackQuantity",
      minWidth: 60,
      maxWidth: 70,
      onRender: (item) => (
        <>
          <div>{item.rackQuantity ? item.rackQuantity : "-"}</div>
        </>
      ),
    },
    {
      key: "columns5",
      name: "Site code",
      fieldName: "siteCode",
      minWidth: 70,
      maxWidth: 80,
      onRender: (item) => (
        <>
          <div>{item.siteCode}</div>
        </>
      ),
    },
    {
      key: "columns6",
      name: "Status",
      fieldName: "status",
      minWidth: 100,
      maxWidth: 120,
      onRender: (item) => (
        <>
          <div
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "11px",
              backgroundColor:
                item.status == "Completed"
                  ? "#c3ff68cf"
                  : item.status == "Draft"
                  ? "#d3d3d3"
                  : item.status == "Pending approval"
                  ? "#f3d78a"
                  : item.status == "InReview"
                  ? "#f3d78a"
                  : "",
              padding: "3px 5px 5px 5px",
              borderRadius: "50px",
              color:
                item.status == "Completed"
                  ? "#000"
                  : item.status == "Draft"
                  ? "#5960a3"
                  : item.status == "Pending approval" ||
                    item.status == "InReview"
                  ? "#000"
                  : "",
            }}
          >
            {item.status}
          </div>
        </>
      ),
    },
    {
      key: "columns7",
      name: "Country",
      fieldName: "country",
      minWidth: 90,
      maxWidth: 120,
      onRender: (item) => (
        <>
          <div>{item.country}</div>
        </>
      ),
    },
    {
      key: "columns8",
      name: "Client",
      fieldName: "client",
      minWidth: 50,
      maxWidth: 60,
      onRender: (item) => (
        <>
          <div>{item.client}</div>
        </>
      ),
    },
    {
      key: "columns9",
      name: "Mobilization",
      fieldName: "mobilization",
      minWidth: 80,
      maxWidth: 120,
      onRender: (item) => (
        <>
          <div>{item.mobilization ? item.mobilization : "-"}</div>
        </>
      ),
    },
    {
      key: "columns10",
      name: "Site access delays",
      fieldName: "siteAccessdelay",
      minWidth: 80,
      maxWidth: 120,
      onRender: (item) => (
        <>
          <div>{item.siteAccessdelay ? item.siteAccessdelay : "-"}</div>
        </>
      ),
    },
    {
      key: "columns11",
      name: "Security or other delays",
      fieldName: "securityOrOtherdelays",
      minWidth: 80,
      maxWidth: 120,
      onRender: (item) => (
        <>
          <div>
            {item.securityOrOtherdelays ? item.securityOrOtherdelays : "-"}
          </div>
        </>
      ),
    },
    {
      key: "columns12",
      name: "Full5PPE",
      fieldName: "full5PPE",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div>{item.full5PPE ? item.full5PPE : "-"}</div>
        </>
      ),
    },
    {
      key: "columns13",
      name: "Timeless score",
      fieldName: "escalated",
      minWidth: 70,
      maxWidth: 90,
      onRender: (item) => (
        <>
          <div
            style={{
              width: "100%",
              textAlign: "center",
              backgroundColor:
                item.escalated == "Yes"
                  ? "#6aad6ac7"
                  : item.escalated == "No"
                  ? "#be3535ed"
                  : "",
              padding: "3px 5px 5px 5px",
              borderRadius: "50px",
              color:
                item.escalated == "Yes"
                  ? "#000"
                  : item.escalated == "No"
                  ? "#fff"
                  : "",
            }}
          >
            {item.escalated ? item.escalated : "-"}
          </div>
        </>
      ),
    },
    {
      key: "columns13",
      name: "Delete",
      fieldName: "isDelete",
      minWidth: 50,
      maxWidth: 60,
      isResizable: true,
      onRender: (item) => (
        <>
          <IconButton
            iconProps={Delete}
            style={{ cursor: "pointer" }}
            title="Delete"
            ariaLabel="Delete"
            onClick={(ev) => (
              setIsDelPopupVisible(true),
              setDeleteItemID(item.Id),
              ev.stopPropagation()
            )}
          />
        </>
      ),
    },
  ];

  const [masterData, setMasterData] = useState([]);
  const [duplicateData, setDuplicateData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [dropDownOptions, setDropDownOptions] = useState(drpDownForFilter);
  const [FilterKey, setFilterKey] = useState(FilterItem);
  const [exportExcel, setExportExcel] = useState([]);
  const [usercoutrypermission, setUserCountryPermission] = useState([]);
  const [supervisor, setSupervisor] = useState<any>("All");
  const [wgcrew, setWgcrew] = useState<any>("All");
  const [handSBriefingConductby, setHandSBriefingConductedby] =
    useState<any>("All");
  const [siteCode, setSiteCode] = useState<any>("All");
  const [currentPage, setCurrentPage] = useState(currpage);
  const [deliveryStartDate, setDeliveryStartDate] = useState(null);
  const [deliveryEndDate, setDeliveryEndDate] = useState(null);
  const [deleteItemID, setDeleteItemID] = useState(null);
  const [otherOptions, setOtherOptions] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isDelPopupVisible, setIsDelPopupVisible] = useState(false);
  const [loader, setLoader] = useState(true);
  console.log(deleteItemID);

  // all Functions

  const dateFormater = (date: Date): string => {
    return !date ? "" : moment(date).format("DD/MM/YYYY");
  };

  const onItemInvoked = useCallback((item) => {
    window.open(currentUrl + "?FqID=" + item);
  }, []);

  const onRenderRow = useCallback(
    (row, defaultRender) => {
      return cloneElement(defaultRender(row), {
        onClick: () => onItemInvoked(row.item.Id),
      });
    },
    [onItemInvoked]
  );

  const getResponsibitydata = (planningData) => {
    let onlyMobilizationYes = [];
    spweb.lists
      .getByTitle(`Operational Responsibilities`)
      .items.top(5000)
      .select(
        "*,TrackingNumberReference/trackingNumber,TrackingNumberReference/delDate,TrackingNumberReference/racks,TrackingNumberReference/SiteCode,TrackingNumberReference/Country,TrackingNumberReference/Client,HandSBriefingConductedby/Title"
      )
      .expand("TrackingNumberReference,HandSBriefingConductedby")
      .get()
      .then((Response) => {
        let responsibilityData: any[] = [];
        if (Response.length > 0) {
          planningData.forEach((plan) => {
            let operationalData = Response.filter(
              (data) => plan.Id == data.TrackingNumberReferenceId
            );
            let operationalListObject =
              operationalData.length > 0 ? operationalData[0] : {};

            let handSBriefingConductedbyList = operationalListObject
              ? operationalListObject.HandSBriefingConductedby?.map((e) => {
                  return { Title: e.Title ? e.Title : "" };
                })
              : [];
            if (plan.trackingNumber) {
              responsibilityData.push({
                Id: plan.Id,
                trackingNo: plan.trackingNumber,
                rackQuantity: plan.racks,
                siteCode: plan.siteCode,
                country: plan.country,
                client: plan.client,
                supervisor: plan.supervisor,
                deleteDate: plan.deleteDate ? plan.deleteDate : null,
                deployementSupervisor: plan.deployementSupervisor,
                mobilization: plan.mobilization,
                driverName: plan.driverName,
                isDriver: plan.isDriver,
                status: plan.status,
                healthSafetyPerformance: plan.healthSafetyPerformance,
                driverNameYes: plan.driverNameYes,
                siteAddress: plan.siteAddress,
                additionalDeliveryComments: plan.additionalDeliveryComments,
                wgcrew: plan.wgcrew ? plan.wgcrew : [],
                notes: plan.notes,
                isActionPlanCompleted: plan.isActionPlanCompleted,
                escalated: plan.escalated,
                city: plan.city,
                joptype: plan.joptype,
                accidentInformation: plan.accidentInformation,
                accidentInformationComments: plan.accidentInformationComments,
                goodSave: plan.goodSave,
                safetyInitiative: plan.safetyInitiative,
                DrivingforwSuggestion: plan.DrivingforwSuggestion,
                goodSaveComments: plan.goodSaveComments,
                safetyInitiativeComments: plan.safetyInitiativeComments,
                drivingforwSuggestionComments:
                  plan.drivingforwSuggestionComments,
                goodSaveName: plan.goodSaveName,
                safetyInitiativeName: plan.safetyInitiativeName,
                drivingforwSuggestionName: plan.drivingforwSuggestionName,
                wGCrewMemberData: plan.wGCrewMemberData,
                isDelete: plan.isDelete,

                siteAccessdelay: operationalListObject.SiteAccessDelays
                  ? operationalListObject.SiteAccessDelays
                  : "",
                siteAccessDelaysTime: operationalListObject.SiteAccessDelaysTime
                  ? operationalListObject.SiteAccessDelaysTime
                  : "",
                securityOrOtherdelays:
                  operationalListObject.SecurityOrOtherDelays
                    ? operationalListObject.SecurityOrOtherDelays
                    : "",
                securityorotherdelaysTime:
                  operationalListObject.SecurityorotherdelaysTime
                    ? operationalListObject.SecurityorotherdelaysTime
                    : "",
                full5PPE: operationalListObject.Full5PPE
                  ? operationalListObject.Full5PPE
                  : "",
                siteAccessDelaysComments:
                  operationalListObject.SiteAccessDelaysComments
                    ? operationalListObject.SiteAccessDelaysComments
                    : "",
                securityOrOtherDelaysComments:
                  operationalListObject.SecurityOrOtherDelaysComments
                    ? operationalListObject.SecurityOrOtherDelaysComments
                    : "",
                full5PPEComments: operationalListObject.Full5PPEComments
                  ? operationalListObject.Full5PPEComments
                  : "",
                crewNameAuditCheckConductedByCom:
                  operationalListObject.CrewNameAuditCheckConductedByCom
                    ? operationalListObject.CrewNameAuditCheckConductedByCom
                    : "",
                handSBriefingConductedby: handSBriefingConductedbyList
                  ? handSBriefingConductedbyList
                  : [],
              });
            }
          });
          responsibilityData = responsibilityData.sort(function (a, b) {
            return moment(a.deleteDate) > moment(b.deleteDate)
              ? -1
              : moment(a.deleteDate) < moment(b.deleteDate)
              ? 1
              : 0;
          });
        }
        if (loggedinuser == "davor.salkanovic@atc-logistics.de") {
          // let onlyMobilizationYes = responsibilityData.filter(
          //   (yes) => yes.mobilization == "Yes"
          // );

          responsibilityData.forEach(async (data) => {
            if (
              data.country == "France" ||
              data.country == "Poland" ||
              data.country == "Sweden" ||
              data.country == "Italy"
            ) {
              onlyMobilizationYes.push(data);
            } else {
              if (data.mobilization == "Yes") {
                onlyMobilizationYes.push(data);
              }
            }
          });
          allFilterOptions(onlyMobilizationYes);
          setMasterData([...onlyMobilizationYes]);
          setDuplicateData([...onlyMobilizationYes]);
          setDisplayData([...onlyMobilizationYes]);
          setExportExcel([...onlyMobilizationYes]);
          paginateFunction(1, [...onlyMobilizationYes]);
          setLoader(false);
        } else {
          setMasterData([...responsibilityData]);
          setDuplicateData([...responsibilityData]);
          setDisplayData([...responsibilityData]);
          setExportExcel([...responsibilityData]);
          paginateFunction(1, [...responsibilityData]);
          allFilterOptions(responsibilityData);
          setLoader(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getQualityPlanningData = (wrappingData, country) => {
    spweb.lists
      .getByTitle(`ATC Field Quality Planning`)
      .items.top(5000)
      .select(
        "*,Supervisor/Title,DeploymentSupervisor/Title,DriverNameYes/Title,wgcrew/Title"
      )
      .expand("Supervisor,DeploymentSupervisor,DriverNameYes,wgcrew")
      .get()
      .then((Response) => {
        let planningData: any[] = [];
        country.forEach((con) => {
          let filterCountrys = Response.filter(
            (item) => item.Country == con.country && item.isDelete != true
          );

          if (filterCountrys.length) {
            filterCountrys.forEach((data) => {
              let curTracRef = wrappingData.filter((arr) => {
                return arr.Id == data.Id;
              });
              let refWrappingDataObject =
                curTracRef.length > 0 ? curTracRef[0] : {};

              let wgcrewList = data.wgcrewId
                ? data.wgcrew.map((e) => {
                    return { Title: e.Title ? e.Title : "" };
                  })
                : [];

              if (
                usercoutrypermission.findIndex((dd) => {
                  return dd.country == data.Country;
                }) == -1
              ) {
                usercoutrypermission.push({
                  country: data.Country,
                });
              }

              planningData.push({
                Id: data.ID,
                trackingNumber: data.trackingNumber ? data.trackingNumber : "",
                client: data.Client ? data.Client : "",
                racks: data.racks ? data.racks : "",
                siteCode: data.SiteCode ? data.SiteCode : "",
                deleteDate: data.delDate ? data.delDate : "",
                city: data.City ? data.City : "",
                supervisor: data.Supervisor ? data.Supervisor.Title : "",
                status: data.Status ? data.Status : "",
                mobilization: data.MobilizationJob ? data.MobilizationJob : "",
                escalated: data.isEscalated ? data.isEscalated : "",
                accidentInformation: refWrappingDataObject.accidentInformation,
                joptype: data.JobType ? data.JobType : "",
                deployementSupervisor: data.DeploymentSupervisorId
                  ? data.DeploymentSupervisor.Title
                  : "",
                country: data.Country,
                driverName: data.DriverName ? data.DriverName : "",
                isDriver: data.isDriver ? data.isDriver : "",
                healthSafetyPerformance: data.HealthSafetyPerformance
                  ? data.HealthSafetyPerformance
                  : null,
                driverNameYes: data.DriverNameYesId
                  ? data.DriverNameYes.Title
                  : "",
                siteAddress: data.Address ? data.Address : "",
                additionalDeliveryComments: data.AdditionalDeliveryComments
                  ? data.AdditionalDeliveryComments
                  : "",
                notes: data.Notes ? data.Notes : "",
                isActionPlanCompleted: data.IsActionPlanCompleted
                  ? "yes"
                  : "No",
                accidentInformationComments: data.AccidentInformationComments
                  ? data.AccidentInformationComments
                  : "",
                wGCrewMemberData: data.WGCrewMemberData
                  ? data.WGCrewMemberData
                  : "",
                wgcrew: wgcrewList ? wgcrewList : [],

                goodSave: refWrappingDataObject.goodSave,
                safetyInitiative: refWrappingDataObject.safetyInitiative,
                DrivingforwSuggestion:
                  refWrappingDataObject.DrivingforwSuggestion,

                goodSaveComments: refWrappingDataObject.goodSaveComments,
                safetyInitiativeComments:
                  refWrappingDataObject.safetyInitiativeComments,
                drivingforwSuggestionComments:
                  refWrappingDataObject.drivingforwSuggestionComments,
                goodSaveName: refWrappingDataObject.goodSaveName,
                safetyInitiativeName:
                  refWrappingDataObject.safetyInitiativeName,
                drivingforwSuggestionName:
                  refWrappingDataObject.drivingforwSuggestionName,
                isDelete: data.isDelete,
              });
            });
          }
        });

        getResponsibitydata(planningData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getWrappingData = (country) => {
    spweb.lists
      .getByTitle(`Wrapping Up`)
      .items.top(5000)
      .select(
        "*,GoodSaveName/Title,SafetyinitiativeName/Title,Drivingforw/Title"
      )
      .expand("GoodSaveName,SafetyinitiativeName,Drivingforw")
      .get()
      .then((Response) => {
        let wrappingData: any[] = [];
        if (Response.length > 0) {
          Response.forEach((data) => {
            wrappingData.push({
              Id: data.TrackingNumberReferenceId,
              accidentInformation: data.AccidentInformation
                ? data.AccidentInformation
                : "",
              goodSave: data.GoodSave ? data.GoodSave : "",
              safetyInitiative: data.Safetyinitiative
                ? data.Safetyinitiative
                : "",
              DrivingforwSuggestion: data.Drivingforwsuggestion
                ? data.Drivingforwsuggestion
                : "",
              goodSaveComments: data.GoodSaveComments
                ? data.GoodSaveComments
                : "",
              safetyInitiativeComments: data.SafetyinitiativeComments
                ? data.SafetyinitiativeComments
                : "",
              drivingforwSuggestionComments: data.DrivingforwsuggestionComments
                ? data.DrivingforwsuggestionComments
                : "",
              goodSaveName: data.GoodSaveName ? data.GoodSaveName.Title : "",
              safetyInitiativeName: data.SafetyinitiativeName
                ? data.SafetyinitiativeName.Title
                : "",
              drivingforwSuggestionName: data.Drivingforw
                ? data.Drivingforw.Title
                : "",
            });
          });
        }
        getQualityPlanningData(wrappingData, country);
      });
  };
  const getAdmins = () => {
    spweb.siteGroups
      .getByName("ATC FQT Owners")
      .users.get()
      .then((users) => {
        let tempUser = users.filter((_user) => {
          return _user.Email == loggedinuser;
        });
        if (tempUser.length > 0) {
          spweb.lists
            .getByTitle(`Field Quality Config`)
            .items.top(5000)
            .get()
            .then((Response) => {
              let allCountry = [];
              if (Response.length > 0) {
                Response.forEach((data) => {
                  if (
                    allCountry.findIndex((dd) => {
                      return dd.country == data.Country;
                    }) == -1
                  ) {
                    allCountry.push({ country: data.Country });
                  }
                });
              }
              getWrappingData(allCountry);
            })

            .catch((err) => {
              console.log(err);
            });
        } else {
          spweb.lists
            .getByTitle(`Field Quality Config`)
            .items.top(5000)
            .filter("Manager/EMail eq '" + loggedinuser + "' ")
            .get()
            .then((Response) => {
              let allCountry = [];
              if (Response.length > 0) {
                Response.forEach((data) => {
                  if (
                    allCountry.findIndex((dd) => {
                      return dd.country == data.Country;
                    }) == -1
                  ) {
                    allCountry.push({ country: data.Country });
                  }
                });
              }
              getWrappingData(allCountry);
            })

            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  useEffect(() => {
    getAdmins();
  }, []);

  const allFilterOptions = (data) => {
    data.forEach((_data) => {
      if (
        _data.country &&
        drpDownForFilter.country.findIndex((dd) => {
          return dd.key == _data.country;
        }) == -1
      ) {
        drpDownForFilter.country.push({
          key: _data.country,
          text: _data.country,
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
        _data.client &&
        drpDownForFilter.client.findIndex((dd) => {
          return dd.key == _data.client;
        }) == -1
      ) {
        drpDownForFilter.client.push({
          key: _data.client,
          text: _data.client,
        });
      }
      if (
        _data.accidentInformation &&
        drpDownForFilter.accidentInformation.findIndex((dd) => {
          return dd.key == _data.accidentInformation;
        }) == -1
      ) {
        drpDownForFilter.accidentInformation.push({
          key: _data.accidentInformation,
          text: _data.accidentInformation,
        });
      }
      if (
        _data.joptype &&
        drpDownForFilter.joptype.findIndex((dd) => {
          return dd.key == _data.joptype;
        }) == -1
      ) {
        drpDownForFilter.joptype.push({
          key: _data.joptype,
          text: _data.joptype,
        });
      }
      if (_data.handSBriefingConductedby.length > 0) {
        _data.handSBriefingConductedby.map((item) => {
          if (
            item.Title &&
            drpDownForFilter.handSBriefingConductedby.findIndex((dd) => {
              return dd.key == item.Title;
            }) == -1
          ) {
            drpDownForFilter.handSBriefingConductedby.push({
              key: item.Title,
              text: item.Title,
            });
          }
        });
      }
      if (
        _data.siteCode &&
        drpDownForFilter.siteCode.findIndex((dd) => {
          return dd.key == _data.siteCode;
        }) == -1
      ) {
        drpDownForFilter.siteCode.push({
          key: _data.siteCode,
          text: _data.siteCode,
        });
        drpDownForFilter.siteCode = drpDownForFilter.siteCode.sort((a, b) =>
          a.key !== b.key ? (a.key < b.key ? -1 : 1) : 0
        );
      }
      if (_data.wgcrew.length > 0) {
        _data.wgcrew.map((item) => {
          if (
            item.Title &&
            drpDownForFilter.wgcrew.findIndex((dd) => {
              return dd.key == item.Title;
            }) == -1
          ) {
            drpDownForFilter.wgcrew.push({
              key: item.Title,
              text: item.Title,
            });
            drpDownForFilter.wgcrew = drpDownForFilter.wgcrew.sort((a, b) =>
              a.key !== b.key ? (a.key < b.key ? -1 : 1) : 0
            );
          }
        });
      }
    });
    setDropDownOptions({ ...drpDownForFilter });
  };

  const filterHandleFunction = (key, text): void => {
    let tempArr = [...duplicateData];
    let tempKey = FilterKey;
    tempKey[key] = text;

    if (tempKey.country != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.country == tempKey.country;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.status != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.status == tempKey.status;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.supervisor.key != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.supervisor == tempKey.supervisor.key;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.siteCode.key != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.siteCode == tempKey.siteCode.key;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.client != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.client == tempKey.client;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.joptype != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.joptype == tempKey.joptype;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.week != "All") {
      if (tempKey.week == "Last Week") {
        let lastweek = moment().subtract(1, "week").isoWeek();
        tempArr = tempArr.filter((arr) => {
          return moment(arr.deleteDate).isoWeek() == lastweek;
        });
        setDuplicateData(tempArr);
      } else if (tempKey.week == "This Week") {
        let thisweek = moment().isoWeek();
        tempArr = tempArr.filter((arr) => {
          return moment(arr.deleteDate).isoWeek() == thisweek;
        });
        setDuplicateData(tempArr);
      } else if (tempKey.week == "Last Month") {
        let lastMonth = moment().subtract(1, "month").month();
        tempArr = tempArr.filter((arr) => {
          return moment(arr.deleteDate).month() == lastMonth;
        });
        setDuplicateData(tempArr);
      }
    }
    if (tempKey.mobilization != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.mobilization == tempKey.mobilization;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.siteAccessdelay != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.siteAccessdelay == tempKey.siteAccessdelay;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.securityOrOtherdelays != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.securityOrOtherdelays == tempKey.securityOrOtherdelays;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.accidentInformation != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.accidentInformation == tempKey.accidentInformation;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.full5PPE != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.full5PPE == tempKey.full5PPE;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.escalated != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.escalated == tempKey.escalated;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.wgcrew.key != "All") {
      tempArr = tempArr.filter((arr) => {
        let filterCrew = arr.wgcrew.some(
          (ex) => ex.Title == tempKey.wgcrew.key
        );
        return filterCrew ? arr : "";
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.filterStartDate != "All") {
      setDeliveryStartDate(tempKey.filterStartDate);
      if (tempKey.filterStartDate) {
        tempArr = tempArr.filter((arr) => {
          return moment(tempKey.filterStartDate) <= moment(arr.deleteDate);
        });
        setDuplicateData(tempArr);
      }
    }
    if (tempKey.filterEndDate != "All") {
      setDeliveryEndDate(tempKey.filterEndDate);
      if (tempKey.filterEndDate) {
        tempArr = tempArr.filter((arr) => {
          return (
            moment(tempKey.filterEndDate).add("d", 1) >= moment(arr.deleteDate)
          );
        });
        setDuplicateData(tempArr);
      }
    }
    if (tempKey.goodSave != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.goodSave == tempKey.goodSave;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.safetyInitiative != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.safetyInitiative == tempKey.safetyInitiative;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.DrivingforwSuggestion != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.DrivingforwSuggestion == tempKey.DrivingforwSuggestion;
      });
      setDuplicateData(tempArr);
    }
    if (tempKey.handSBriefingConductedby.key != "All") {
      tempArr = tempArr.filter((arr) => {
        let filterHandS = arr.handSBriefingConductedby.some(
          (ex) => ex.Title == tempKey.handSBriefingConductedby.key
        );
        return filterHandS ? arr : "";
      });
      setDuplicateData(tempArr);
    }

    if (tempKey.search) {
      tempArr = tempArr.filter(
        (item) =>
          item.supervisor.toLowerCase().match(tempKey.search.toLowerCase()) ||
          item.trackingNo.toString().match(tempKey.search) ||
          dateFormater(item.deleteDate).match(tempKey.search.toLowerCase()) ||
          item.rackQuantity.toString().match(tempKey.search) ||
          item.siteCode
            .toString()
            .toLowerCase()
            .match(tempKey.search.toLowerCase()) ||
          item.status.toLowerCase().match(tempKey.search.toLowerCase()) ||
          item.country.toLowerCase().match(tempKey.search.toLowerCase()) ||
          item.client.toLowerCase().match(tempKey.search.toLowerCase())
      );
    }
    setFilterKey({ ...tempKey });
    setDisplayData([...tempArr]);
    setExportExcel([...tempArr]);
    setDuplicateData([...masterData]);
    paginateFunction(currpage, tempArr);
  };

  const resetFilterOptions = () => {
    setDisplayData(masterData);
    paginateFunction(currpage, masterData);
    setExportExcel(masterData);
    setDuplicateData(masterData);
    setDeliveryStartDate(null);
    setDeliveryEndDate(null);
    setFilterKey({
      country: "All",
      status: "All",
      supervisor: { text: "All", key: "All" },
      client: "All",
      joptype: "All",
      week: "All",
      // mobilization:
      //   loggedinuser != "davor.salkanovic@atc-logistics.de" ? "All" : "Yes",
      mobilization: "All",
      siteAccessdelay: "All",
      securityOrOtherdelays: "All",
      full5PPE: "All",
      escalated: "All",
      wgcrew: { text: "All", key: "All" },
      accidentInformation: "All",
      search: "",
      filterStartDate: "All",
      filterEndDate: "All",
      goodSave: "All",
      DrivingforwSuggestion: "All",
      safetyInitiative: "All",
      handSBriefingConductedby: { text: "All", key: "All" },
      edgeregion: "All",
      siteCode: { text: "All", key: "All" },
    });
    setOtherOptions(false);
  };

  const DeleteItem = (id) => {
    console.log(id);
    spweb.lists
      .getByTitle(`ATC Field Quality Planning`)
      .items.getById(id)
      .update({ isDelete: true })
      .then((Response) => {
        console.log(Response);
        let masterDelItems = masterData.filter((item) => item.Id != id);
        setMasterData([...masterDelItems]);
        setDuplicateData([...masterDelItems]);
        let DisplayDelItems = displayData.filter((item) => item.Id != id);
        setDisplayData([...DisplayDelItems]);
        setExportExcel([...DisplayDelItems]);
        paginateFunction(1, [...DisplayDelItems]);
        setIsDelPopupVisible(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const generateExcel = async (list) => {
    if (list.length != 0) {
      let arrExport = list;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("My Sheet");
      worksheet.columns = [
        { header: "Country", key: "country", width: 25 },
        { header: "Jop Type", key: "joptype", width: 25 },
        { header: "City", key: "city", width: 25 },
        { header: "Client", key: "client", width: 25 },
        { header: "Tracking No", key: "trackingNo", width: 25 },
        { header: "Supervisor", key: "supervisor", width: 25 },
        { header: "DeleteDate", key: "deleteDate", width: 25 },
        { header: "RackQuantity", key: "rackQuantity", width: 25 },
        {
          header: "DeployementSupervisor",
          key: "deployementSupervisor",
          width: 25,
        },
        { header: "MobilizationJob", key: "mobilization", width: 25 },
        { header: "DriverName", key: "driverName", width: 25 },
        { header: "isDriver", key: "isDriver", width: 25 },
        { header: "Status", key: "status", width: 25 },
        {
          header: "HealthSafetyPerformance",
          key: "healthSafetyPerformance",
          width: 25,
        },
        { header: "SiteCode", key: "siteCode", width: 25 },
        { header: "DriverNameYes", key: "driverNameYes", width: 25 },
        { header: "SiteAddress", key: "siteAddress", width: 25 },
        {
          header: "AdditionalDeliveryComments",
          key: "additionalDeliveryComments",
          width: 25,
        },
        { header: "White Glove Crew on Delivery", key: "wgcrew", width: 25 },
        { header: "Notes", key: "notes", width: 25 },
        {
          header: "isActionPlanCompleted",
          key: "isActionPlanCompleted",
          width: 25,
        },
        { header: "SiteAccessdelay", key: "siteAccessdelay", width: 25 },
        {
          header: "SiteAccessDelaysTime",
          key: "siteAccessDelaysTime",
          width: 25,
        },
        {
          header: "SiteAccessDelaysComments",
          key: "siteAccessDelaysComments",
          width: 25,
        },
        {
          header: "SecurityOrOtherdelays",
          key: "securityOrOtherdelays",
          width: 25,
        },
        {
          header: "SecurityorotherdelaysTime",
          key: "securityorotherdelaysTime",
          width: 25,
        },
        {
          header: "SecurityOrOtherDelaysComments",
          key: "securityOrOtherDelaysComments",
          width: 25,
        },
        { header: "Full5PPE", key: "full5PPE", width: 25 },
        { header: "Full5PPEComments", key: "full5PPEComments", width: 25 },
        {
          header: "AccidentInformation",
          key: "accidentInformation",
          width: 25,
        },
        {
          header: "AccidentInformationComments",
          key: "accidentInformationComments",
          width: 25,
        },
        {
          header: "CrewNameAuditCheckConductedByCom",
          key: "crewNameAuditCheckConductedByCom",
          width: 25,
        },
        {
          header: "Good Save",
          key: "goodSave",
          width: 25,
        },
        {
          header: "Good Save name",
          key: "goodSaveName",
          width: 25,
        },
        {
          header: "Good save comments",
          key: "goodSaveComments",
          width: 25,
        },
        {
          header: "Safety initiative",
          key: "safetyInitiative",
          width: 25,
        },
        {
          header: "Safety initiative name",
          key: "safetyInitiativeName",
          width: 25,
        },
        {
          header: "Safety initiative comments",
          key: "safetyInitiativeComments",
          width: 25,
        },
        {
          header: "Driving forward suggestion",
          key: "DrivingforwSuggestion",
          width: 25,
        },
        {
          header: "Driving forward suggestion name",
          key: "drivingforwSuggestionName",
          width: 25,
        },
        {
          header: "Driving forward suggestion comments",
          key: "drivingforwSuggestionComments",
          width: 25,
        },
        {
          header: "WGCrew member data",
          key: "wGCrewMemberData",
          width: 25,
        },
      ];
      // arrExport.wgcrew.forEach((ev, index) => {
      //   worksheet.columns.push({
      //     header: "White Glove Crew on Delivery",
      //     key: "wgcrew" + index + 1,
      //     width: 25,
      //   });
      // });
      // await arrExport.forEach((item) => {
      //   item.wgcrew ? item.wgcrew.forEach((data, index) => {}) : "";
      // });

      await arrExport.forEach((item) => {
        // if (item.wgcrew) {
        //   item.wgcrew.forEach((data, index) => {
        //     worksheet.addRow({
        //       [`wgcrew${index + 1}`]: data,
        //     });
        //   });
        // }
        worksheet.addRow({
          country: item.country ? item.country : "-",
          joptype: item.joptype ? item.joptype : "-",
          city: item.city ? item.city : "-",
          client: item.client ? item.client : "-",
          trackingNo: item.trackingNo ? item.trackingNo.toString() : "-",
          supervisor: item.supervisor ? item.supervisor : "-",
          deleteDate: item.deleteDate ? dateFormater(item.deleteDate) : "-",
          rackQuantity: item.rackQuantity ? item.rackQuantity.toString() : "-",
          deployementSupervisor: item.deployementSupervisor
            ? item.deployementSupervisor
            : "-",
          mobilization: item.mobilization ? item.mobilization : "-",
          driverName: item.driverName ? item.driverName : "-",
          isDriver: item.isDriver ? item.isDriver : "-",
          status: item.status ? item.status : "-",
          healthSafetyPerformance: item.healthSafetyPerformance
            ? item.healthSafetyPerformance.toString()
            : "-",
          siteCode: item.siteCode ? item.siteCode : "-",
          driverNameYes: item.driverNameYes ? item.driverNameYes : "-",
          siteAddress: item.siteAddress ? item.siteAddress : "-",
          additionalDeliveryComments: item.additionalDeliveryComments
            ? item.additionalDeliveryComments
            : "-",
          wgcrew: item.wgcrew
            ? item.wgcrew.map((data) => data.Title).toString()
            : "-",
          notes: item.notes ? item.notes : "-",
          isActionPlanCompleted: item.isActionPlanCompleted
            ? item.isActionPlanCompleted
            : "-",
          siteAccessdelay: item.siteAccessdelay ? item.siteAccessdelay : "-",
          siteAccessDelaysTime: item.siteAccessDelaysTime
            ? item.siteAccessDelaysTime
            : "-",
          siteAccessDelaysComments: item.siteAccessDelaysComments
            ? item.siteAccessDelaysComments
            : "-",
          securityOrOtherdelays: item.securityOrOtherdelays
            ? item.securityOrOtherdelays
            : "-",
          securityorotherdelaysTime: item.securityorotherdelaysTime
            ? item.securityorotherdelaysTime
            : "-",
          securityOrOtherDelaysComments: item.securityOrOtherDelaysComments
            ? item.securityOrOtherDelaysComments
            : "-",
          full5PPE: item.full5PPE ? item.full5PPE : "-",
          full5PPEComments: item.full5PPEComments ? item.full5PPEComments : "-",
          accidentInformation: item.accidentInformation
            ? item.accidentInformation
            : "-",
          accidentInformationComments: item.accidentInformationComments
            ? item.accidentInformationComments
            : "-",
          crewNameAuditCheckConductedByCom:
            item.crewNameAuditCheckConductedByCom
              ? item.crewNameAuditCheckConductedByCom
              : "-",
          goodSave: item.goodSave,
          safetyInitiative: item.safetyInitiative,
          DrivingforwSuggestion: item.DrivingforwSuggestion,
          goodSaveComments: item.goodSaveComments,
          safetyInitiativeComments: item.safetyInitiativeComments,
          drivingforwSuggestionComments: item.drivingforwSuggestionComments,
          goodSaveName: item.goodSaveName,
          safetyInitiativeName: item.safetyInitiativeName,
          drivingforwSuggestionName: item.drivingforwSuggestionName,
          wGCrewMemberData: item.wGCrewMemberData,
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
        "AL1",
        "AM1",
        "AN1",
        "AO1",
        "AP1",
      ].map((key) => {
        worksheet.getCell(key).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "C5D9F1" },
        };
      });
      for (let i = 0; i < arrExport.length; i++) {
        if (arrExport[i].status == "Completed") {
          worksheet.getCell("M" + (i + 2)).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "90EE90" },
          };
        } else if (arrExport[i].status == "Draft") {
          worksheet.getCell("M" + (i + 2)).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "d3d3d3" },
          };
        } else if (arrExport[i].status == "Pending approval") {
          worksheet.getCell("M" + (i + 2)).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "f4f2bf" },
          };
        }
      }
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
        "AL1",
        "AM1",
        "AN1",
        "AO1",
        "AP1",
      ].map((key) => {
        worksheet.getCell(key).color = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF" },
        };
      });
      await workbook.xlsx
        .writeBuffer()
        .then((buffer) => {
          FileSaver.saveAs(
            new Blob([buffer]),
            `ATC_Field_Quality_${moment().format("DDMMYYYY_HH:mm")}.xlsx`
          );
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setIsPopupVisible(true);
    }
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
      //   setAtpDisplayData([]);
      setCurrentPage(1);
    }
  };

  return loader ? (
    <CustomLoader />
  ) : (
    <div>
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
        {isDelPopupVisible && (
          <Layer>
            <Popup
              className={deletePopupStyles.root}
              role="dialog"
              aria-modal="true"
              onDismiss={() => {
                setIsDelPopupVisible(false);
              }}
            >
              <Overlay
                onClick={() => {
                  setIsDelPopupVisible(false);
                }}
              />
              <FocusTrapZone>
                <div className={deletePopupStyles.sec}>
                  <div
                    className={styles.closeicon}
                    style={{ textAlign: "end" }}
                  >
                    <IconButton
                      iconProps={Close}
                      style={{
                        fontSize: 72,
                        cursor: "pointer",
                      }}
                      title="Close"
                      ariaLabel="Close"
                      onClick={() => setIsDelPopupVisible(false)}
                    />
                  </div>
                  <div className={deletePopupStyles.content}>
                    <h4 style={{ marginTop: "0px" }}>
                      Are you sure, you want to delete this record?
                    </h4>
                    <DefaultButton
                      primary
                      text={"Yes"}
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#be3535ed",
                        border: "1px solid #be3535ed",
                        marginRight: "20px",
                      }}
                      onClick={() => DeleteItem(deleteItemID)}
                    />
                    <DefaultButton
                      primary
                      text={"No"}
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#67c25f",
                        // color: "#000",
                        border: "1px solid #67c25f",
                      }}
                      onClick={() => setIsDelPopupVisible(false)}
                    />
                  </div>
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
            Field Quality Dashboard
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
              //   onClick={() => generateExcel(exportExcel)}
              style={{
                backgroundColor: "#a83037",
                color: "#fff",
                border: "none",
              }}
            />
            <DefaultButton
              text={"Time Sheet"}
              onClick={() => props.DashboardChangeFun(false)}
              style={{
                backgroundColor: "#dacbcc8c",
                color: "#a83037",
                border: "none",
              }}
            />
          </div>
          <DefaultButton
            iconProps={Save}
            text={"Export"}
            onClick={() => generateExcel(exportExcel)}
            style={{
              backgroundColor: "#a83037",
              color: "#fff",
              border: "none",
            }}
          />
        </div>
        <div>
          <div className={styles.filtersection}>
            {usercoutrypermission.length != 1 ? (
              <Dropdown
                label="Country"
                selectedKey={FilterKey.country}
                onChange={(e, option) => {
                  filterHandleFunction("country", option["text"]);
                }}
                placeholder="All"
                options={dropDownOptions.country}
                styles={dropdownStyles}
              />
            ) : (
              <Dropdown
                label="Country"
                selectedKey={usercoutrypermission[0].country}
                onChange={(e, option) => {
                  filterHandleFunction("country", option["text"]);
                }}
                placeholder="All"
                options={[
                  {
                    key: usercoutrypermission[0].country,
                    text: usercoutrypermission[0].country,
                  },
                ]}
                styles={dropdownStyles}
              />
            )}
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
            <div style={{ margin: "5px 22px 0px 0px", width: "9%" }}>
              <span style={{ fontWeight: "500" }}>Supervisor</span>
              <Autocomplete
                id="combo-box-demo"
                ListboxProps={{ style: { fontSize: 12 } }}
                options={dropDownOptions.supervisor}
                value={FilterKey.supervisor}
                getOptionLabel={(option) => option.text}
                style={{ width: "100%", padding: "5px 20px 0px 0px" }}
                onChange={(e, value) => {
                  filterHandleFunction("supervisor", value);
                }}
                onBlur={() => {
                  FilterKey.supervisor
                    ? null
                    : filterHandleFunction("supervisor", {
                        text: "All",
                        key: "All",
                      });
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
              label="Client"
              selectedKey={FilterKey.client}
              onChange={(e, option) => {
                filterHandleFunction("client", option["text"]);
              }}
              placeholder="Select an option"
              options={dropDownOptions.client}
              styles={dropdownStyles}
            />
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
            <Dropdown
              label="Job type"
              selectedKey={FilterKey.joptype}
              onChange={(e, option) => {
                filterHandleFunction("joptype", option["text"]);
              }}
              placeholder="Select an option"
              options={dropDownOptions.joptype}
              styles={dropdownStyles}
            />

            <DatePicker
              label="Delivery start date"
              placeholder="Select"
              formatDate={dateFormater}
              styles={dropdownStyles}
              value={deliveryStartDate ? deliveryStartDate : null}
              onSelectDate={(value: any) => {
                filterHandleFunction("filterStartDate", value);
              }}
            />
            <DatePicker
              label="Delivery end date"
              placeholder="Select"
              formatDate={dateFormater}
              styles={dropdownStyles}
              value={deliveryEndDate ? deliveryEndDate : null}
              onSelectDate={(value: any) => {
                filterHandleFunction("filterEndDate", value);
              }}
            />
            <IconButton
              style={{ margin: "27px 10px 0px 0px" }}
              iconProps={Equalizer}
              title="More Options"
              ariaLabel="More Options"
              onClick={() => setOtherOptions(!otherOptions)}
            />
            {/* <SearchBox
                styles={searchBoxStyles}
                placeholder="Search"
                onChange={(e, newValue) =>
                  filterHandleFunction("search", newValue)
                }
              /> */}
            {!otherOptions ? (
              <IconButton
                className={styles.resetbtn}
                style={{ marginTop: "27px" }}
                iconProps={Refresh}
                title="Filter reset"
                ariaLabel="Filter reset"
                onClick={() => resetFilterOptions()}
              />
            ) : (
              ""
            )}
          </div>
          {otherOptions ? (
            <div className={styles.filtersection}>
              <Dropdown
                label="Site delay"
                selectedKey={FilterKey.siteAccessdelay}
                onChange={(e, option) => {
                  filterHandleFunction("siteAccessdelay", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.siteAccessdelay}
                styles={dropdownStyles}
              />
              <Dropdown
                label="Security delay"
                selectedKey={FilterKey.securityOrOtherdelays}
                onChange={(e, option) => {
                  filterHandleFunction("securityOrOtherdelays", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.securityOrOtherdelays}
                styles={dropdownStyles}
              />
              <Dropdown
                label="Accident inform"
                selectedKey={FilterKey.accidentInformation}
                onChange={(e, option) => {
                  filterHandleFunction("accidentInformation", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.accidentInformation}
                styles={dropdownStyles}
              />
              <Dropdown
                label="Full5PPE"
                selectedKey={FilterKey.full5PPE}
                onChange={(e, option) => {
                  filterHandleFunction("full5PPE", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.full5PPE}
                styles={dropdownStyles}
              />
              <Dropdown
                label="Timeless score"
                selectedKey={FilterKey.escalated}
                onChange={(e, option) => {
                  filterHandleFunction("escalated", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.escalated}
                styles={dropdownStyles}
              />
              <div style={{ margin: "5px 22px 0px 0px", width: "9%" }}>
                <span style={{ fontWeight: "500" }}>Wg crew</span>
                <Autocomplete
                  id="combo-box-demo"
                  ListboxProps={{ style: { fontSize: 12 } }}
                  options={dropDownOptions.wgcrew}
                  value={FilterKey.wgcrew}
                  getOptionLabel={(option) => option.text}
                  style={{ width: "100%", padding: "5px 20px 0px 0px" }}
                  onChange={(e, value) => {
                    filterHandleFunction("wgcrew", value);
                  }}
                  onBlur={() => {
                    FilterKey.wgcrew
                      ? null
                      : filterHandleFunction("wgcrew", {
                          text: "All",
                          key: "All",
                        });
                  }}
                  inputValue={wgcrew}
                  onInputChange={(event, newInputValue: any) => {
                    setWgcrew(newInputValue);
                  }}
                  renderInput={(params) => (
                    <ThemeProvider theme={theme}>
                      <TextField {...params} variant="outlined" />
                    </ThemeProvider>
                  )}
                />
              </div>

              <Dropdown
                label="Good save"
                selectedKey={FilterKey.goodSave}
                onChange={(e, option) => {
                  filterHandleFunction("goodSave", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.goodSave}
                styles={dropdownStyles}
              />
              <Dropdown
                label="Safety initiative"
                selectedKey={FilterKey.safetyInitiative}
                onChange={(e, option) => {
                  filterHandleFunction("safetyInitiative", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.safetyInitiative}
                styles={dropdownStyles}
              />
              <Dropdown
                label="Driving sugges"
                selectedKey={FilterKey.DrivingforwSuggestion}
                onChange={(e, option) => {
                  filterHandleFunction("DrivingforwSuggestion", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.DrivingforwSuggestion}
                styles={dropdownStyles}
              />

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
              <div style={{ margin: "5px 22px 0px 0px", width: "9%" }}>
                <span style={{ fontWeight: "500" }}>H and S briefing</span>
                <Autocomplete
                  id="combo-box-demo"
                  ListboxProps={{ style: { fontSize: 12 } }}
                  options={dropDownOptions.handSBriefingConductedby}
                  value={FilterKey.handSBriefingConductedby}
                  getOptionLabel={(option) => option.text}
                  style={{ width: "100%", padding: "5px 20px 0px 0px" }}
                  onChange={(e, value) => {
                    filterHandleFunction("handSBriefingConductedby", value);
                  }}
                  onBlur={() => {
                    FilterKey.handSBriefingConductedby
                      ? null
                      : filterHandleFunction("handSBriefingConductedby", {
                          text: "All",
                          key: "All",
                        });
                  }}
                  inputValue={handSBriefingConductby}
                  onInputChange={(event, newInputValue: any) => {
                    setHandSBriefingConductedby(newInputValue);
                  }}
                  renderInput={(params) => (
                    <ThemeProvider theme={theme}>
                      <TextField {...params} variant="outlined" />
                    </ThemeProvider>
                  )}
                />
              </div>
              <div style={{ margin: "5px 22px 0px 0px", width: "9%" }}>
                <span style={{ fontWeight: "500" }}>Sitecode</span>
                <Autocomplete
                  id="combo-box-demo"
                  ListboxProps={{ style: { fontSize: 12 } }}
                  options={dropDownOptions.siteCode}
                  value={FilterKey.siteCode}
                  getOptionLabel={(option) => option.text}
                  style={{ width: "100%", padding: "5px 20px 0px 0px" }}
                  onChange={(e, value) => {
                    filterHandleFunction("siteCode", value);
                  }}
                  onBlur={() => {
                    FilterKey.siteCode
                      ? null
                      : filterHandleFunction("siteCode", {
                          text: "All",
                          key: "All",
                        });
                  }}
                  inputValue={siteCode}
                  onInputChange={(event, newInputValue: any) => {
                    setSiteCode(newInputValue);
                  }}
                  renderInput={(params) => (
                    <ThemeProvider theme={theme}>
                      <TextField {...params} variant="outlined" />
                    </ThemeProvider>
                  )}
                />
              </div>
              {/* <Dropdown
                label="Driving sugges"
                selectedKey={FilterKey.DrivingforwSuggestion}
                onChange={(e, option) => {
                  filterHandleFunction("DrivingforwSuggestion", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.DrivingforwSuggestion}
                styles={dropdownStyles}
              /> */}
            </div>
          ) : (
            ""
          )}
          <div>
            <DetailsList
              items={displayData}
              columns={columns}
              setKey="set"
              styles={gridStyles}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
              onRenderRow={onRenderRow}
            />
            {displayData.length == 0 ? (
              <div className={styles.noRecordsec}>
                <h4>No records found !!!</h4>
              </div>
            ) : (
              <div className={styles.pagination}>
                <Pagination
                  page={currentPage}
                  onChange={(e, page) => {
                    paginateFunction(page, exportExcel);
                  }}
                  count={
                    exportExcel.length > 0
                      ? Math.ceil(exportExcel.length / totalPageItems)
                      : 1
                  }
                  color="primary"
                  showFirstButton={currentPage == 1 ? false : true}
                  showLastButton={
                    currentPage ==
                    Math.ceil(exportExcel.length / totalPageItems)
                      ? false
                      : true
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* )} */}
    </div>
  );
}
