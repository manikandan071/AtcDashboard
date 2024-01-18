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

let spweb = Web(
  "https://atclogisticsie.sharepoint.com/sites/PlanningOperations/Field%20Quality"
);
// let spweb = Web(
//   "https://atclogisticsie.sharepoint.com/sites/TechnoRUCS_Dev_Site"
// );
let currentUrl = window.location.href;
let globalPlanArr: any[] = [];
let responsibilityData: any[] = [];
let onlyMobilizationYes = [];
let count: number = 0;

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
    isCabled: [
      { key: "All", text: "All" },
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
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
    isCabled: "All",
  };

  //Action plan json
  let actionjson = [
    {
      Generalprecheck: "",
      GeneralprecheckComments: "",
      Crewdetailsprecheck: "",
      CrewdetailsprecheckComments: "",
      RealtimecontactATCoffice: "",
      RealtimecontactATCofficeComments: "",
      Equipment_x2019_scheck_x002d_Too: "",
      Equipment_x2019_scheck_x002d_Too0: "",
      AdditionalJobs: "",
      AdditionalJobsComments: "",
      InReviewComments: "",
    },
  ];

  //Effective communication json

  let effectivejson = [
    {
      InformTeamleadOfIssuesOnSite: "",
      InformTeamleadOfIssuesOnSiteComm: "",
      CommunicationIssuesTeamOrVendor: "",
      CommunicationIssuesTeamOrVendorC: "",
      Driversrating_x0028_Vendorsonly_: "",
      NotesToReportOnDailyMeeting: "",
      NotesToReportOnDailyMeetingComme: "",
    },
  ];

  //wrappingup json
  let wrappingjson = [
    {
      ToolsOnChargeForNextDay: "",
      ToolsOnChargeForNextDayComments: "",
      VehicleIsCleanAndNotOnReserveFor: "",
      VehicleIsCleanAndNotOnReserveFor0: "",
      PaperWorkCompletePlanningTeamUpd: "",
      PaperWorkCompletePlanningTeamUpd0: "",
      Cablingspreadsheetupdate: "",
      CablingspreadsheetupdateComments: "",
      AccidentInformation: "",
      AccidentInformationComments: "",
      empty: "",
      GoodSave: "",
      GoodSaveComments: "",
      Safetyinitiative: "",
      SafetyinitiativeComments: "",
      Drivingforwsuggestion: "",
      DrivingforwsuggestionComments: "",
    },
  ];

  //wrappingTwojson

  let _wrappingnext = [
    {
      AdditionalDeliveryComments: "",
      CustomerFeedback: "",
      CustomerFeedbackComments: "",
      ATCSupervvisorFeedback: "",
      ATCSupervisorFeedbackComments: "",
    },
  ];

  //OperationalResponsibilities

  let operationalresJson = [
    {
      TruckSealBreak: "",
      TruckSealBreakComments: "",
      Truckdeparturedelays: "",
      TruckdeparturedelaysTime: "",
      TruckdeparturedelaysComments: "",
      DCATsDelays: "",
      DCATsDelaysTime: "",
      DCATsDelaysComments: "",
      VendorWGCrewdelays: "",
      VendorWGCrewdelaysTime: "",
      VendorWGCrewdelaysComments: "",
      BANKSMANPresent: "",
      BANKSMANPresentComments: "",
      SecurityOrOtherDelays: "",
      SecurityorotherdelaysTime: "",
      SecurityOrOtherDelaysComments: "",
      Full5PPE: "",
      Full5PPEComments: "",
      PhoneMediaUsage: "",
      PhoneMediaUsageComments: "",
      RestingOnFloor: "",
      RestingOnFloorComments: "",
      TruckArrival: "",
      TruckArrivalLoadingbayComments: "",
      TruckDeparture: "",
      TruckDepartureLoadingbayComments: "",
      RealtimeETAs: "",
      RealtimeETAComments: "",
      COLLOaccessissues: "",
      COLLOaccessissuesTime: "",
      COLLOaccessissuesComments: "",
      Induction: "",
      InductionComments: "",
      HandSBriefingConductedby: "",
      STARTofoperationMSFTstaff: "",
      STARTofoperationMSFTstaffComment: "",
      SmartTeamdelegating: "",
      SmartTeamdelegatingComments: "",
      Rampsetup: "",
      RampsetupComments: "",
      LoadingBayPreparationofworkareae0: "",
      LoadingBayPreparationofworkareae: "",
      FINALcheckasperSOP_x2013_WGorDep0: "",
      FINALcheckasperSOP_x2013_WGorDep: "",
      DebrisSeparationOfPlasticMetal: "",
      DebrisSeparationOfPlasticMetalCo: "",
      DebrisCleanUpLoadingbay: "",
      DebrisCleanUpLoadingbayComments: "",
      JobCompletionConfirmation: "",
      JobCompletionConfirmationComment: "",
      SecondTruck: "",
      SecondTruckArrivalDateTime: "",
      SecondTruckArrivalDateTimeCommen: "",
      SecondTruckDepartureDateTime: "",
      SecondTruckDepartureDateTimeComm: "",
      Team1LoadingBay: null,
      Team2Rackpushing0toCOLLO: null,
      ThirdTruck: "",
      ThirdTruckArrivalDateTime: "",
      ThirdTruckArrivalDateTimeComment: "",
      ThirdTruckDepartureDateTime: "",
      ThirdTruckDepartureDateTimeComme: "",
    },
  ];

  //AWS

  //AWS Effective communication
  let AWSeffectivejson = [
    {
      InformTeamleadOfIssuesOnSite: "",
      InformTeamleadOfIssuesOnSiteComm: "",
      SolveProblemWithSiteRepresentati: "",
      SolveProblemWithSiteRepresentati0: "",
      CommunicationIssuesTeamOrVendor: "",
      CommunicationIssuesTeamOrVendorC: "",
      NotesToReportOnDailyMeeting: "",
      NotesToReportOnDailyMeetingComme: "",
      Driversrating_x0028_Vendorsonly_: "",
    },
  ];

  //AWS wrappingup

  let AWSwrappingjson = [
    {
      ToolsOnChargeForNextDay: "",
      ToolsOnChargeForNextDayComments: "",
      VehicleIsCleanAndNotOnReserveFor: "",
      VehicleIsCleanAndNotOnReserveFor0: "",
      PaperWorkCompletePlanningTeamUpd: "",
      PaperWorkCompletePlanningTeamUpd0: "",
      Cablingspreadsheetupdate: "",
      CablingspreadsheetupdateComments: "",
      AccidentInformation: "",
      AccidentInformationComments: "",
      GoodSave: "",
      GoodSaveComments: "",
      Safetyinitiative: "",
      SafetyinitiativeComments: "",
      Drivingforwsuggestion: "",
      DrivingforwsuggestionComments: "",
      venderFeedback: "",
    },
  ];

  //AWS ATC planning
  let AWSatcplanning = [
    {
      AdditionalDeliveryComments: "",
      HealthSafetyPerformance: "",
    },
  ];

  //AWSOperational

  let AWSOperationalres = [
    {
      SiteAccessDelays: "",
      SiteAccessDelaysTime: "",
      SiteAccessDelaysComments: "",
      BANKSMANPresent: "",
      BANKSMANPresentComments: "",
      SecurityOrOtherDelays: "",
      SecurityorotherdelaysTime: "",
      SecurityOrOtherDelaysComments: "",
      Full5PPE: "",
      Full5PPEComments: "",
      PhoneMediaUsage: "",
      PhoneMediaUsageComments: "",
      RestingOnFloor: "",
      RestingOnFloorComments: "",
      TruckArrival: "",
      TruckArrivalLoadingbayComments: "",
      TruckDeparture: "",
      TruckDepartureLoadingbayComments: "",
      FinalPositionCheckRacksFibres: "",
      FinalPositionCheckRacksFibresCom: "",
      Finalrackpositioncheckedby: "",
      FinalrackpositioncheckedbyCommen: "",
      RackScanningbyAWSBBonSite: "",
      RackScanningbyAWSBBonSiteComment: "",
      AssetMismatch: "",
      AssetMismatchComments: "",
      RackInspectionwgteamleadOnly: "",
      RackInspectionwgteamleadOnlyComm: "",
      ConfirmIRISHCheckWithSiteReprese: "",
      ConfirmIRISHCheckWithSiteReprese0: "",
      MatchRackStickerPosition: "",
      MatchRackStickerPositionComments: "",
      CompleteStriderPosition: "",
      CompleteStriderPositionComments: "",
      FinishCabling: "",
      FinishCablingComments: "",
      FinalAuditCheckAsPerSOP: "",
      FinalAuditCheckAsPerSOPComments: "",
      DebrisSeparationOfPlasticMetal: "",
      DebrisSeparationOfPlasticMetalCo: "",
      DebrisCleanUpLoadingbay: "",
      DebrisCleanUpLoadingbayComments: "",
      JobCompletionConfirmation: "",
      JobCompletionConfirmationComment: "",
      CrewNameAuditCheckConductedBy: "",
      CrewNameAuditCheckConductedByCom: "",
      WalkthroughSUPERVISOROnly: "",
      WalkthroughSUPERVISOROnlyComment: "",
      SecondTruck: "",
      SecondTruckArrivalDateTime: "",
      SecondTruckArrivalDateTimeCommen: "",
      SecondTruckDepartureDateTime: "",
      SecondTruckDepartureDateTimeComm: "",
      Briefingconductedby: "",
      STARTofoperationoperationToCheck: "",
      STARTofoperationoperationToCheck0: "",
      Preparationofequipment: "",
      Preparationofequipmentomments: "",
      EnsureSafeEnvironment: "",
      EnsureSafeEnvironmentComments: "",
      RemovingRacksfromDH: "",
      RemovingRacksfromDHComments: "",
      ContactwithAWSDecomTeam: "",
      AssetandsealNocheck: "",
      DCSMConfirmBFRackMovement: "",
      Teamsplitting: "",
      TeamsplittingComments: "",
      TeamTask: "",
      TeamTaskComments: "",
      TruckSealingAndLocking: "",
      TruckSealingAndLockingComments: "",
      RealtimepostingonJob: "",
      RealtimepostingonJobComments: "",
      TruckparkingonLoadingbay: "",
      TruckparkingonLoadingbayComments: "",
      BriefingAndTaskbifurcation: "",
      BriefingAndTaskbifurcationCommen: "",
      Team1: "",
      Team2: "",
      Team3: "",
      TruckLoadAuditconductedby: "",
    },
  ];

  //AWS Action plan

  let AWSactionplan = [
    {
      ConfirmETA: "",
      ConfirmETAComments: "",
      LabelPrinted: "",
      LabelPrintedComments: "",
      ToolsPaperWork: "",
      ToolsPaperWorkComments: "",
      AdditionalJobs: "",
      AdditionalJobsComments: "",
      Trackercheck: "",
      TrackercheckComments: "",
      RoambeeNumber: "",
      CardNumber: "",
      TrackerNumber: "",
      SealNumber: "",
      DocumentsPrinting: "",
      DocumentsPrintingComments: "",
      DecomManifest: "",
      CMR: "",
      Crewdetailssharing: "",
      CrewdetailssharingComments: "",
      ContactDCSM: "",
      ContactDCSMComments: "",
      PrepareEquipment: "",
      PrepareEquipmentComments: "",
    },
  ];

  // import icons

  const Equalizer: IIconProps = { iconName: "Equalizer" };
  const Refresh: IIconProps = { iconName: "Refresh" };
  const Save: IIconProps = { iconName: "Save" };
  const Delete: IIconProps = { iconName: "Delete" };
  const Close: IIconProps = { iconName: "ChromeClose" };
  const CloudUpload: IIconProps = { iconName: "SkypeCircleCheck" };

  // fluent Ui style

  const searchBoxStyles: Partial<ISearchBoxStyles> = {
    root: { width: 200, margin: "27px 10px 0px 10px" },
  };
  const dropdownStyles: Partial<IDropdownStyles> = {
    root: { width: "9%", marginRight: "22px" },
    dropdown: { width: "100%" },
  };

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
      width: "90%",
      // textAlign: "center",
      padding: "10px",
    },
    content: {
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      //padding: "10px 25px 20px 25px",
      height: "400px",
      overflow: "auto",
      input: {
        // padding: "4px !important",
        // border: "1px solid #000",
        // height: "20px !important",
        // outline: "1px solid #000",
      },
      textarea: {
        resize: "none !important",
        // padding: "4px !important",
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
      padding: "10px 0px",
    },
  });

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
      name: "Action",
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
          <div>
            {item.status == "Pending approval" ? (
              <IconButton
                iconProps={CloudUpload}
                style={{ cursor: "pointer" }}
                title="Approve"
                ariaLabel="Approve"
                onClick={(ev) => {
                  if (item.client == "MSFT") {
                    setIsClient(true);

                    // master Data
                    uploadwrappingnext(item.Id, item.WrappingUp);

                    // action plan
                    uploadActionplan(item.Id, item.ActionPlan);

                    // effective
                    uploadEffective(item.Id, item.EffectiveCommunication);

                    // wrapping up
                    uploadwrappingup(item.Id, item.WrappingUp);

                    // operational
                    uploadoperationRes(item.Id, item.OperationalRes);
                  } else {
                    setIsClient(false);

                    // master Data
                    awsATCplan(item.Id, item.OperationalRes, item.WrappingUp);

                    // wrapping up
                    uploadAWSWrapping(item.Id, item.WrappingUp);

                    // effective
                    uploadAWSeffective(item.Id, item.EffectiveCommunication);

                    // action plan
                    uploadAWSactionplan(
                      item.Id,
                      item.ActionPlan,
                      item.jobtype,
                      item.client
                    );

                    // operational
                    uploadAWSoperationalres(item.Id, item.OperationalRes);
                  }
                  setRejectId(item.Id);
                  setIsMSFT(item.client);
                  setTrackingNum(item.trackingNo);
                  setIsApprovePopup(true);
                  ev.stopPropagation();
                }}
              />
            ) : (
              ""
            )}
          </div>
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

  const [loader, setLoader] = useState(false);
  const [isApprovePopup, setIsApprovePopup] = useState(false);

  const [actionplan, setActionPlan] = useState([...actionjson]);
  const [effectivecom, setEffectiveCom] = useState([...effectivejson]);
  const [wrappingup, setWrappingup] = useState([...wrappingjson]);
  const [wrappingnext, setWrappingNext] = useState([..._wrappingnext]);
  const [operationalres, setOperationalRes] = useState([...operationalresJson]);

  // const [approvelJson, setApprovelJson] = useState([...approvelJSON]);
  const [isRejectPopup, setIsRejectPopup] = useState(false);

  const [isMSFT, setIsMSFT] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const [effectivedata, setEffectivedata] = useState([]);
  const [actiondata, setActiondata] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [awsEffective, setAWSeffective] = useState([...AWSeffectivejson]);
  const [awsWrapping, setAWSwrapping] = useState([...AWSwrappingjson]);
  const [awsOperationalres, setAWSoperationalRes] = useState([
    ...AWSOperationalres,
  ]);
  const [rejectId, setRejectId] = useState(null);
  const [awsATCplanning, setawsATCplanning] = useState([...AWSatcplanning]);
  const [awsactionplan, setAWSactionplan] = useState([...AWSactionplan]);

  const [actionappprovelId, setactionApprovelID] = useState(null);
  const [effectiveapproveId, setEffectiveapproveId] = useState(null);
  const [wrappingupId, setWrappingupId] = useState(null);
  const [wrappingnextId, setWrappingnextId] = useState(null);
  const [operationRedId, setOperationalResId] = useState(null);

  const [awswrappingId, setAWSwrappingId] = useState(null);
  const [awsEffectiveId, setAWSeffectiveId] = useState(null);
  const [awsOperationalId, setAWSoperationalId] = useState(null);
  const [awsATCplanId, setAWSatcPlanId] = useState(null);
  const [awsactionplanId, setAWSactionplanId] = useState(null);
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

  //Rejectfunction
  const rejectFunction = () => {
    if (actionplan[0].InReviewComments != "") {
      spweb.lists
        .getByTitle("ATC Field Quality Planning")
        .items.getById(rejectId)
        .update({
          InReviewComments: actionplan[0].InReviewComments,
          Status: "InReview",
        })
        .then((Response) => {
          setIsRejectPopup(false);
          setIsApprovePopup(false);
          setActionPlan([...actionjson]);
          init();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      let approvelComment = document.getElementById("approvelComment");
      approvelComment.style.color = "red";
    }
  };

  //uploadActionplan

  const uploadActionplan = (id, actionjson) => {
    let ActionID = null;
    if (actionjson != "") {
      let splitactionjson = actionjson.split("|");
      actionplan[0].Generalprecheck = splitactionjson[0];
      actionplan[0].GeneralprecheckComments = splitactionjson[1];
      actionplan[0].Crewdetailsprecheck = splitactionjson[2];
      actionplan[0].CrewdetailsprecheckComments = splitactionjson[3];
      actionplan[0].RealtimecontactATCoffice = splitactionjson[4];
      actionplan[0].RealtimecontactATCofficeComments = splitactionjson[5];
      actionplan[0].Equipment_x2019_scheck_x002d_Too = splitactionjson[6];
      actionplan[0].Equipment_x2019_scheck_x002d_Too0 = splitactionjson[7];
      actionplan[0].AdditionalJobs = splitactionjson[8];
      actionplan[0].AdditionalJobsComments = splitactionjson[9];
    } else {
      setActionPlan([]);
    }
    actiondata.forEach((data) => {
      if (data.TrackingNumberReferenceId == id) {
        ActionID = data.Id;
        for (let key in actionplan[0]) {
          if (
            key == "Generalprecheck" &&
            data.Generalprecheck == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "GeneralprecheckComments" &&
            data.GeneralprecheckComments == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "Crewdetailsprecheck" &&
            data.Crewdetailsprecheck == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "CrewdetailsprecheckComments" &&
            data.CrewdetailsprecheckComments == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "RealtimecontactATCoffice" &&
            data.RealtimecontactATCoffice == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "RealtimecontactATCofficeComments" &&
            data.RealtimecontactATCofficeComments == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "Equipment_x2019_scheck_x002d_Too" &&
            data.Equipment_x2019_scheck_x002d_Too == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "Equipment_x2019_scheck_x002d_Too0" &&
            data.Equipment_x2019_scheck_x002d_Too0 == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "AdditionalJobs" &&
            data.AdditionalJobs == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
          if (
            key == "AdditionalJobsComments" &&
            data.AdditionalJobsComments == actionplan[0][key]
          ) {
            delete actionplan[0][key];
          }
        }
      }
    });

    setactionApprovelID(ActionID);
    setActionPlan(actionplan);
  };

  //uploadEffective function

  const uploadEffective = (id, effectivejson) => {
    let EffectiveID = null;

    if (effectivejson != "") {
      let spliteffectivecom = effectivejson.split("|");
      effectivecom[0].InformTeamleadOfIssuesOnSite = spliteffectivecom[0];
      effectivecom[0].InformTeamleadOfIssuesOnSiteComm = spliteffectivecom[1];
      effectivecom[0].CommunicationIssuesTeamOrVendor = spliteffectivecom[2];
      effectivecom[0].CommunicationIssuesTeamOrVendorC = spliteffectivecom[3];
      effectivecom[0].Driversrating_x0028_Vendorsonly_ = spliteffectivecom[4];
      effectivecom[0].NotesToReportOnDailyMeeting = spliteffectivecom[5];
      effectivecom[0].NotesToReportOnDailyMeetingComme = spliteffectivecom[6];
    } else {
      setEffectiveCom([]);
    }
    effectivedata.forEach((data) => {
      if (data.TrackingNumberReferenceId == id) {
        EffectiveID = data.Id;
        for (let key in effectivecom[0]) {
          if (
            key == "InformTeamleadOfIssuesOnSite" &&
            data.InformTeamleadOfIssuesOnSite == effectivecom[0][key]
          ) {
            delete effectivecom[0][key];
          }
          if (
            key == "InformTeamleadOfIssuesOnSiteComm" &&
            data.InformTeamleadOfIssuesOnSiteComm == effectivecom[0][key]
          ) {
            delete effectivecom[0][key];
          }
          if (
            key == "CommunicationIssuesTeamOrVendor" &&
            data.CommunicationIssuesTeamOrVendor == effectivecom[0][key]
          ) {
            delete effectivecom[0][key];
          }
          if (
            key == "CommunicationIssuesTeamOrVendorC" &&
            data.CommunicationIssuesTeamOrVendorC == effectivecom[0][key]
          ) {
            delete effectivecom[0][key];
          }
          if (
            key == "Driversrating_x0028_Vendorsonly_" &&
            data.Driversrating_x0028_Vendorsonly_ == effectivecom[0][key]
          ) {
            delete effectivecom[0][key];
          }
          if (
            key == "NotesToReportOnDailyMeeting" &&
            data.NotesToReportOnDailyMeeting == effectivecom[0][key]
          ) {
            delete effectivecom[0][key];
          }
          if (
            key == "NotesToReportOnDailyMeetingComme" &&
            data.NotesToReportOnDailyMeetingComme == effectivecom[0][key]
          ) {
            delete effectivecom[0][key];
          }
        }
      }
    });
    setEffectiveapproveId(EffectiveID);
    setEffectiveCom(effectivecom);
  };

  //uploadwrappingup

  const uploadwrappingup = (id, wrappingjson) => {
    let WrappingUpID = null;
    if (wrappingjson != "") {
      let splitwrappingup = wrappingjson.split("|");
      wrappingup[0].ToolsOnChargeForNextDay = splitwrappingup[0];
      wrappingup[0].ToolsOnChargeForNextDayComments = splitwrappingup[1];
      wrappingup[0].VehicleIsCleanAndNotOnReserveFor = splitwrappingup[2];
      wrappingup[0].VehicleIsCleanAndNotOnReserveFor0 = splitwrappingup[3];
      wrappingup[0].PaperWorkCompletePlanningTeamUpd = splitwrappingup[4];
      wrappingup[0].PaperWorkCompletePlanningTeamUpd0 = splitwrappingup[5];
      wrappingup[0].Cablingspreadsheetupdate = splitwrappingup[7];
      wrappingup[0].CablingspreadsheetupdateComments = splitwrappingup[8];
      wrappingup[0].AccidentInformation = splitwrappingup[9];
      wrappingup[0].AccidentInformationComments = splitwrappingup[10];
      // wrappingup[0].Ratingvalue = splitwrappingup[11];
      wrappingup[0].GoodSave = splitwrappingup[12];
      wrappingup[0].GoodSaveComments = splitwrappingup[13];
      wrappingup[0].Safetyinitiative = splitwrappingup[14];
      wrappingup[0].SafetyinitiativeComments = splitwrappingup[15];
      wrappingup[0].Drivingforwsuggestion = splitwrappingup[16];
      wrappingup[0].DrivingforwsuggestionComments = splitwrappingup[17];
    } else {
      setWrappingup([]);
    }
    displayData.forEach((data) => {
      if (data.Id == id) {
        WrappingUpID = data.WrappingUpID;
        for (let key in wrappingup[0]) {
          if (
            key == "ToolsOnChargeForNextDay" &&
            data.ToolsOnChargeForNextDay == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "ToolsOnChargeForNextDayComments" &&
            data.ToolsOnChargeForNextDayComments == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "VehicleIsCleanAndNotOnReserveFor" &&
            data.VehicleIsCleanAndNotOnReserveFor == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "VehicleIsCleanAndNotOnReserveFor0" &&
            data.VehicleIsCleanAndNotOnReserveFor0 == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "PaperWorkCompletePlanningTeamUpd" &&
            data.PaperWorkCompletePlanningTeamUpd == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "PaperWorkCompletePlanningTeamUpd0" &&
            data.PaperWorkCompletePlanningTeamUpd0 == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }

          if (
            key == "Cablingspreadsheetupdate" &&
            data.Cablingspreadsheetupdate == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "CablingspreadsheetupdateComments" &&
            data.CablingspreadsheetupdateComments == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "AccidentInformation" &&
            data.AccidentInformation == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "AccidentInformationComments" &&
            data.AccidentInformationComments == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (key == "empty" && data.empty == wrappingup[0][key]) {
            delete wrappingup[0][key];
          }
          if (key == "GoodSave" && data.goodSave == wrappingup[0][key]) {
            delete wrappingup[0][key];
          }
          if (
            key == "GoodSaveComments" &&
            data.goodSaveComments == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "Safetyinitiative" &&
            data.safetyInitiative == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "SafetyinitiativeComments" &&
            data.safetyInitiativeComments == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "Drivingforwsuggestion" &&
            data.Drivingforwsuggestion == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
          if (
            key == "DrivingforwsuggestionComments" &&
            data.drivingforwSuggestionComments == wrappingup[0][key]
          ) {
            delete wrappingup[0][key];
          }
        }
      }
    });
    setWrappingupId(WrappingUpID);
    setWrappingup(wrappingup);
  };

  const uploadwrappingnext = (id, wrappingjson) => {
    if (wrappingjson != "") {
      let splitwrapnextjosn = wrappingjson.split("|");
      wrappingnext[0].AdditionalDeliveryComments = splitwrapnextjosn[6];
      wrappingnext[0].CustomerFeedback = splitwrapnextjosn[19];
      wrappingnext[0].CustomerFeedbackComments = splitwrapnextjosn[20];
      wrappingnext[0].ATCSupervvisorFeedback = splitwrapnextjosn[21];
      wrappingnext[0].ATCSupervvisorFeedback = splitwrapnextjosn[22];
    } else {
      setWrappingNext([]);
    }
    displayData.forEach((data) => {
      if (data.Id == id) {
        for (let key in wrappingnext[0]) {
          if (
            key == "AdditionalDeliveryComments" &&
            data.additionalDeliveryComments == wrappingnext[0][key]
          ) {
            delete wrappingnext[0][key];
          }
          if (
            key == "CustomerFeedback" &&
            data.CustomerFeedback == wrappingnext[0][key]
          ) {
            delete wrappingnext[0][key];
          }
          if (
            key == "CustomerFeedbackComments" &&
            data.CustomerFeedbackComments == wrappingnext[0][key]
          ) {
            delete wrappingnext[0][key];
          }
          if (
            key == "ATCSupervvisorFeedback" &&
            data.ATCSupervvisorFeedback == wrappingnext[0][key]
          ) {
            delete wrappingnext[0][key];
          }
          if (
            key == "ATCSupervisorFeedbackComments" &&
            data.ATCSupervisorFeedbackComments == wrappingnext[0][key]
          ) {
            delete wrappingnext[0][key];
          }
        }
      }
    });
    setWrappingnextId(id);
    setWrappingNext(wrappingnext);
  };

  //operationalRes
  const uploadoperationRes = (id, operationalresJson) => {
    let OperationResID = null;
    if (operationalresJson != "") {
      let splitoperationalRes = operationalresJson.split("|");
      operationalres[0].TruckSealBreak = splitoperationalRes[0];
      operationalres[0].TruckSealBreakComments = splitoperationalRes[1];
      operationalres[0].Truckdeparturedelays = splitoperationalRes[2];
      operationalres[0].TruckdeparturedelaysTime = splitoperationalRes[3];
      operationalres[0].TruckdeparturedelaysComments = splitoperationalRes[4];
      operationalres[0].DCATsDelays = splitoperationalRes[5];
      operationalres[0].DCATsDelaysTime = splitoperationalRes[6];
      operationalres[0].DCATsDelaysComments = splitoperationalRes[7];
      operationalres[0].VendorWGCrewdelays = splitoperationalRes[8];
      operationalres[0].VendorWGCrewdelaysTime = splitoperationalRes[9];
      operationalres[0].VendorWGCrewdelaysComments = splitoperationalRes[10];
      operationalres[0].BANKSMANPresent = splitoperationalRes[11];
      operationalres[0].BANKSMANPresentComments = splitoperationalRes[12];
      operationalres[0].SecurityOrOtherDelays = splitoperationalRes[13];
      operationalres[0].SecurityorotherdelaysTime = splitoperationalRes[14];
      operationalres[0].SecurityOrOtherDelaysComments = splitoperationalRes[15];
      operationalres[0].Full5PPE = splitoperationalRes[16];
      operationalres[0].Full5PPEComments = splitoperationalRes[17];
      operationalres[0].PhoneMediaUsage = splitoperationalRes[18];
      operationalres[0].PhoneMediaUsageComments = splitoperationalRes[19];
      operationalres[0].RestingOnFloor = splitoperationalRes[20];
      operationalres[0].RestingOnFloorComments = splitoperationalRes[21];
      operationalres[0].TruckDeparture = splitoperationalRes[22];
      operationalres[0].TruckArrivalLoadingbayComments =
        splitoperationalRes[23];
      //operationalres[0].TruckdeparturedelaysTime = splitoperationalRes[24];
      //operationalres[0].TruckdeparturedelaysTime = splitoperationalRes[25];
      operationalres[0].RealtimeETAs = splitoperationalRes[26];
      operationalres[0].RealtimeETAComments = splitoperationalRes[27];
      operationalres[0].COLLOaccessissues = splitoperationalRes[28];
      operationalres[0].COLLOaccessissuesTime = splitoperationalRes[29];
      operationalres[0].COLLOaccessissuesComments = splitoperationalRes[30];
      operationalres[0].Induction = splitoperationalRes[31];
      operationalres[0].InductionComments = splitoperationalRes[32];
      operationalres[0].HandSBriefingConductedby = splitoperationalRes[33];
      operationalres[0].STARTofoperationMSFTstaff = splitoperationalRes[34];
      operationalres[0].STARTofoperationMSFTstaffComment =
        splitoperationalRes[35];
      operationalres[0].SmartTeamdelegating = splitoperationalRes[36];
      operationalres[0].SmartTeamdelegatingComments = splitoperationalRes[37];
      operationalres[0].Rampsetup = splitoperationalRes[38];
      operationalres[0].RampsetupComments = splitoperationalRes[39];
      operationalres[0].LoadingBayPreparationofworkareae0 =
        splitoperationalRes[40];
      operationalres[0].LoadingBayPreparationofworkareae =
        splitoperationalRes[41];
      operationalres[0].FINALcheckasperSOP_x2013_WGorDep0 =
        splitoperationalRes[42];
      operationalres[0].FINALcheckasperSOP_x2013_WGorDep =
        splitoperationalRes[43];
      operationalres[0].DebrisSeparationOfPlasticMetal =
        splitoperationalRes[44];
      operationalres[0].DebrisSeparationOfPlasticMetalCo =
        splitoperationalRes[45];
      operationalres[0].DebrisCleanUpLoadingbay = splitoperationalRes[46];
      operationalres[0].DebrisCleanUpLoadingbayComments =
        splitoperationalRes[47];
      operationalres[0].JobCompletionConfirmation = splitoperationalRes[48];
      operationalres[0].JobCompletionConfirmationComment =
        splitoperationalRes[49];
      operationalres[0].SecondTruck = splitoperationalRes[50];
      operationalres[0].SecondTruckArrivalDateTime = splitoperationalRes[51];
      operationalres[0].SecondTruckArrivalDateTimeCommen =
        splitoperationalRes[52];
      operationalres[0].SecondTruckDepartureDateTime = splitoperationalRes[53];
      operationalres[0].SecondTruckDepartureDateTimeComm =
        splitoperationalRes[54];
      operationalres[0].Team1LoadingBay =
        splitoperationalRes[55] == "true" ? true : false;
      operationalres[0].Team2Rackpushing0toCOLLO =
        splitoperationalRes[56] == "true" ? true : false;
      operationalres[0].ThirdTruck = splitoperationalRes[57];
      operationalres[0].ThirdTruckArrivalDateTime = splitoperationalRes[58];
      operationalres[0].ThirdTruckArrivalDateTimeComment =
        splitoperationalRes[59];
      operationalres[0].ThirdTruckDepartureDateTime = splitoperationalRes[60];
      operationalres[0].ThirdTruckDepartureDateTimeComme =
        splitoperationalRes[61];
    } else {
      setOperationalRes([]);
    }
    displayData.forEach((data) => {
      if (data.Id == id) {
        OperationResID = data.OperationalResponsId;
        let string = [];
        if (
          data.handSBriefingConductedby != null &&
          data.handSBriefingConductedby != undefined
        ) {
          data.handSBriefingConductedby.length &&
            data.handSBriefingConductedby.map((val) => {
              string.push(val.EMail);
            });
        }

        let HandbreifEMail = string.join(";");
        for (let key in operationalres[0]) {
          if (
            key == "TruckSealBreak" &&
            data.TruckSealBreak == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "TruckSealBreakComments" &&
            data.TruckSealBreakComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "Truckdeparturedelays" &&
            data.Truckdeparturedelays == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "TruckdeparturedelaysTime" &&
            data.TruckdeparturedelaysTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "TruckdeparturedelaysComments" &&
            data.TruckdeparturedelaysComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "DCATsDelays" &&
            data.DCATsDelays == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "DCATsDelaysTime" &&
            data.DCATsDelaysTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "DCATsDelaysComments" &&
            data.DCATsDelaysComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "VendorWGCrewdelays" &&
            data.VendorWGCrewdelays == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "VendorWGCrewdelaysTime" &&
            data.VendorWGCrewdelaysTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "VendorWGCrewdelaysComments" &&
            data.VendorWGCrewdelaysComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "BANKSMANPresent" &&
            data.BANKSMANPresent == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "BANKSMANPresentComments" &&
            data.BANKSMANPresentComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SecurityOrOtherDelays" &&
            data.securityOrOtherdelays == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SecurityorotherdelaysTime" &&
            data.securityorotherdelaysTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SecurityOrOtherDelaysComments" &&
            data.securityOrOtherDelaysComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (key == "Full5PPE" && data.full5PPE == operationalres[0][key]) {
            delete operationalres[0][key];
          }
          if (
            key == "Full5PPEComments" &&
            data.full5PPEComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "PhoneMediaUsage" &&
            data.PhoneMediaUsage == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "PhoneMediaUsageComments" &&
            data.PhoneMediaUsageComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "RestingOnFloor" &&
            data.RestingOnFloor == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "RestingOnFloorComments" &&
            data.RestingOnFloorComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          // if (
          //   key == "TruckArrival" &&
          //   data.TruckArrival == operationalres[0][key]
          // ) {
          //   delete operationalres[0][key];
          // }
          if (
            key == "TruckArrivalLoadingbayComments" &&
            data.TruckArrivalLoadingbayComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "TruckDeparture" &&
            data.TruckDeparture == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "TruckDepartureLoadingbayComments" &&
            data.TruckdepartureLoadingbayComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "RealtimeETAs" &&
            data.RealtimeETAs == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "RealtimeETAComments" &&
            data.RealtimeETAComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "COLLOaccessissues" &&
            data.COLLOaccessissues == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "COLLOaccessissuesTime" &&
            data.COLLOaccessissuesTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "COLLOaccessissuesComments" &&
            data.COLLOaccessissuesComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (key == "Induction" && data.Induction == operationalres[0][key]) {
            delete operationalres[0][key];
          }
          if (
            key == "InductionComments" &&
            data.InductionComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "HandSBriefingConductedby" &&
            HandbreifEMail == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "STARTofoperationMSFTstaff" &&
            data.STARTofoperationMSFTstaff == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "STARTofoperationMSFTstaffComment" &&
            data.STARTofoperationMSFTstaffComment == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SmartTeamdelegating" &&
            data.SmartTeamdelegating == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SmartTeamdelegatingComments" &&
            data.SmartTeamdelegatingComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (key == "Rampsetup" && data.Rampsetup == operationalres[0][key]) {
            delete operationalres[0][key];
          }
          if (
            key == "RampsetupComments" &&
            data.RampsetupComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "LoadingBayPreparationofworkareae0" &&
            data.LoadingBayPreparationofworkareae0 == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "LoadingBayPreparationofworkareae" &&
            data.LoadingBayPreparationofworkareae == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "FINALcheckasperSOP_x2013_WGorDep0" &&
            data.FINALcheckasperSOP_x2013_WGorDep0 == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "FINALcheckasperSOP_x2013_WGorDep" &&
            data.FINALcheckasperSOP_x2013_WGorDep == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "DebrisSeparationOfPlasticMetal" &&
            data.DebrisSeparationOfPlasticMetal == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "DebrisSeparationOfPlasticMetalCo" &&
            data.DebrisSeparationOfPlasticMetalCo == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "DebrisCleanUpLoadingbay" &&
            data.DebrisCleanUpLoadingbay == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "DebrisCleanUpLoadingbayComments" &&
            data.DebrisCleanUpLoadingbayComments == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "JobCompletionConfirmation" &&
            data.JobCompletionConfirmation == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "JobCompletionConfirmationComment" &&
            data.JobCompletionConfirmationComment == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SecondTruck" &&
            data.SecondTruck == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SecondTruckArrivalDateTime" &&
            data.SecondTruckArrivalDateTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SecondTruckArrivalDateTimeCommen" &&
            data.SecondTruckArrivalDateTimeCommen == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SecondTruckDepartureDateTime" &&
            data.SecondTruckDepartureDateTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "SecondTruckDepartureDateTimeComm" &&
            data.SecondTruckDepartureDateTimeComm == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "Team1LoadingBay" &&
            data.Team1LoadingBay == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "Team2Rackpushing0toCOLLO" &&
            data.Team2Rackpushing0toCOLLO == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "ThirdTruck" &&
            data.ThirdTruck == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "ThirdTruckArrivalDateTime" &&
            data.ThirdTruckArrivalDateTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "ThirdTruckArrivalDateTimeComment" &&
            data.ThirdTruckArrivalDateTimeComment == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "ThirdTruckDepartureDateTime" &&
            data.ThirdTruckDepartureDateTime == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
          if (
            key == "ThirdTruckDepartureDateTimeComme" &&
            data.ThirdTruckDepartureDateTimeComme == operationalres[0][key]
          ) {
            delete operationalres[0][key];
          }
        }
      }
    });

    debugger;
    setOperationalResId(OperationResID);
    setOperationalRes(operationalres);
  };

  //AWS
  //Effective
  const uploadAWSeffective = (id, AWSeffectivejson) => {
    let EffectiveID = null;
    if (AWSeffectivejson != "") {
      let AWSspliteffectivecom = AWSeffectivejson.split("|");
      awsEffective[0].InformTeamleadOfIssuesOnSite = AWSspliteffectivecom[0];
      awsEffective[0].InformTeamleadOfIssuesOnSiteComm =
        AWSspliteffectivecom[1];
      awsEffective[0].SolveProblemWithSiteRepresentati =
        AWSspliteffectivecom[2];
      awsEffective[0].SolveProblemWithSiteRepresentati0 =
        AWSspliteffectivecom[3];
      awsEffective[0].CommunicationIssuesTeamOrVendor = AWSspliteffectivecom[4];
      awsEffective[0].CommunicationIssuesTeamOrVendorC =
        AWSspliteffectivecom[5];
      awsEffective[0].NotesToReportOnDailyMeeting = AWSspliteffectivecom[6];
      awsEffective[0].NotesToReportOnDailyMeetingComme =
        AWSspliteffectivecom[7];
      awsEffective[0].Driversrating_x0028_Vendorsonly_ =
        AWSspliteffectivecom[8];
    } else {
      setAWSeffective([]);
    }
    effectivedata.forEach((data) => {
      if (data.TrackingNumberReferenceId == id) {
        EffectiveID = data.Id;
        for (let key in awsEffective[0]) {
          if (
            key == "InformTeamleadOfIssuesOnSite" &&
            data.InformTeamleadOfIssuesOnSite == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
          if (
            key == "InformTeamleadOfIssuesOnSiteComm" &&
            data.InformTeamleadOfIssuesOnSiteComm == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
          if (
            key == "SolveProblemWithSiteRepresentati" &&
            data.SolveProblemWithSiteRepresentati == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
          if (
            key == "SolveProblemWithSiteRepresentati0" &&
            data.SolveProblemWithSiteRepresentati0 == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
          if (
            key == "CommunicationIssuesTeamOrVendor" &&
            data.CommunicationIssuesTeamOrVendor == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
          if (
            key == "CommunicationIssuesTeamOrVendorC" &&
            data.CommunicationIssuesTeamOrVendorC == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
          if (
            key == "Driversrating_x0028_Vendorsonly_" &&
            data.Driversrating_x0028_Vendorsonly_ == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
          if (
            key == "NotesToReportOnDailyMeeting" &&
            data.NotesToReportOnDailyMeeting == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
          if (
            key == "NotesToReportOnDailyMeetingComme" &&
            data.NotesToReportOnDailyMeetingComme == awsEffective[0][key]
          ) {
            delete awsEffective[0][key];
          }
        }
      }
    });
    setAWSeffectiveId(EffectiveID);
    setAWSeffective(awsEffective);
  };

  //AWSwrapping
  const uploadAWSWrapping = (id, AWSwrappingjson) => {
    let WrappingUpID = null;
    if (AWSwrappingjson != "") {
      let SplitAWSwrappingup = AWSwrappingjson.split("|");
      awsWrapping[0].ToolsOnChargeForNextDay = SplitAWSwrappingup[0];
      awsWrapping[0].ToolsOnChargeForNextDayComments = SplitAWSwrappingup[1];
      awsWrapping[0].VehicleIsCleanAndNotOnReserveFor = SplitAWSwrappingup[2];
      awsWrapping[0].VehicleIsCleanAndNotOnReserveFor0 = SplitAWSwrappingup[3];
      awsWrapping[0].PaperWorkCompletePlanningTeamUpd = SplitAWSwrappingup[4];
      awsWrapping[0].PaperWorkCompletePlanningTeamUpd0 = SplitAWSwrappingup[5];
      //awsWrapping[0].additionalDeliveryComments = SplitAWSwrappingup[6];
      awsWrapping[0].Cablingspreadsheetupdate = SplitAWSwrappingup[7];
      awsWrapping[0].CablingspreadsheetupdateComments = SplitAWSwrappingup[8];
      awsWrapping[0].AccidentInformation = SplitAWSwrappingup[9];
      awsWrapping[0].AccidentInformationComments = SplitAWSwrappingup[10];
      //awsWrapping[0].RatingValue = SplitAWSwrappingup[11];
      awsWrapping[0].GoodSave = SplitAWSwrappingup[12];
      awsWrapping[0].GoodSaveComments = SplitAWSwrappingup[13];
      awsWrapping[0].Safetyinitiative = SplitAWSwrappingup[14];
      awsWrapping[0].SafetyinitiativeComments = SplitAWSwrappingup[15];
      awsWrapping[0].Drivingforwsuggestion = SplitAWSwrappingup[16];
      awsWrapping[0].DrivingforwsuggestionComments = SplitAWSwrappingup[17];
      awsWrapping[0].venderFeedback = SplitAWSwrappingup[18];
    } else {
      setAWSwrapping([]);
    }
    displayData.forEach((data) => {
      if (data.Id == id) {
        WrappingUpID = data.WrappingUpID;
        for (let key in awsWrapping[0]) {
          if (
            key == "ToolsOnChargeForNextDay" &&
            data.ToolsOnChargeForNextDay == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "ToolsOnChargeForNextDayComments" &&
            data.ToolsOnChargeForNextDayComments == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "VehicleIsCleanAndNotOnReserveFor" &&
            data.VehicleIsCleanAndNotOnReserveFor == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "VehicleIsCleanAndNotOnReserveFor0" &&
            data.VehicleIsCleanAndNotOnReserveFor0 == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "PaperWorkCompletePlanningTeamUpd" &&
            data.PaperWorkCompletePlanningTeamUpd == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "PaperWorkCompletePlanningTeamUpd0" &&
            data.PaperWorkCompletePlanningTeamUpd0 == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }

          if (
            key == "Cablingspreadsheetupdate" &&
            data.Cablingspreadsheetupdate == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "CablingspreadsheetupdateComments" &&
            data.CablingspreadsheetupdateComments == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "AccidentInformation" &&
            data.AccidentInformation == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "AccidentInformationComments" &&
            data.AccidentInformationComments == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          // if (key == "RatingValue" && data.empty == awsWrapping[0][key]) {
          //   delete awsWrapping[0][key];
          // }
          if (key == "GoodSave" && data.goodSave == awsWrapping[0][key]) {
            delete awsWrapping[0][key];
          }
          if (
            key == "GoodSaveComments" &&
            data.goodSaveComments == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "Safetyinitiative" &&
            data.safetyInitiative == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "SafetyinitiativeComments" &&
            data.safetyInitiativeComments == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "Drivingforwsuggestion" &&
            data.Drivingforwsuggestion == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
          if (
            key == "DrivingforwsuggestionComments" &&
            data.drivingforwSuggestionComments == awsWrapping[0][key]
          ) {
            delete awsWrapping[0][key];
          }
        }
      }
    });
    setAWSwrappingId(WrappingUpID);
    setAWSwrapping(awsWrapping);
  };

  //AWSatcplanning
  const awsATCplan = (id, awsATCplanjson, awswrappingjson) => {
    if (awsATCplanjson != "") {
      let splitATCplan = awswrappingjson.split("|");
      awsATCplanning[0].AdditionalDeliveryComments = splitATCplan[6];
      awsATCplanning[0].HealthSafetyPerformance = splitATCplan[11];
    } else {
      setawsATCplanning([]);
    }
    displayData.forEach((data) => {
      if (data.Id == id) {
        for (let key in awsATCplanning[0]) {
          if (
            key == "AdditionalDeliveryComments" &&
            data.additionalDeliveryComments == awsATCplanning[0][key]
          ) {
            delete awsATCplanning[0][key];
          }
          if (
            key == "HealthSafetyPerformance" &&
            data.healthSafetyPerformance == awsATCplanning[0][key]
          ) {
            delete awsATCplanning[0][key];
          }
        }
      }
    });
    setAWSatcPlanId(id);
    setawsATCplanning(awsATCplanning);
  };

  //AWSOperationalres
  const uploadAWSoperationalres = (id, AWSoperationalResjson) => {
    let OperationResID = null;
    if (AWSoperationalResjson != "") {
      let splitAWSOperationalres = AWSoperationalResjson.split("|");
      awsOperationalres[0].SiteAccessDelays = splitAWSOperationalres[0];
      awsOperationalres[0].SiteAccessDelaysTime = splitAWSOperationalres[1];
      awsOperationalres[0].SiteAccessDelaysComments = splitAWSOperationalres[2];
      awsOperationalres[0].BANKSMANPresent = splitAWSOperationalres[3];
      awsOperationalres[0].BANKSMANPresentComments = splitAWSOperationalres[4];
      awsOperationalres[0].SecurityOrOtherDelays = splitAWSOperationalres[5];
      awsOperationalres[0].SecurityorotherdelaysTime =
        splitAWSOperationalres[6];
      awsOperationalres[0].SecurityOrOtherDelaysComments =
        splitAWSOperationalres[7];
      awsOperationalres[0].Full5PPE = splitAWSOperationalres[8];
      awsOperationalres[0].Full5PPEComments = splitAWSOperationalres[9];
      awsOperationalres[0].PhoneMediaUsage = splitAWSOperationalres[10];
      awsOperationalres[0].PhoneMediaUsageComments = splitAWSOperationalres[11];
      awsOperationalres[0].RestingOnFloor = splitAWSOperationalres[12];
      awsOperationalres[0].RestingOnFloorComments = splitAWSOperationalres[13];
      awsOperationalres[0].TruckArrival = splitAWSOperationalres[14];
      awsOperationalres[0].TruckArrivalLoadingbayComments =
        splitAWSOperationalres[15];
      awsOperationalres[0].TruckDeparture = splitAWSOperationalres[16];
      awsOperationalres[0].TruckDepartureLoadingbayComments =
        splitAWSOperationalres[17];
      awsOperationalres[0].FinalPositionCheckRacksFibres =
        splitAWSOperationalres[18];
      awsOperationalres[0].FinalPositionCheckRacksFibresCom =
        splitAWSOperationalres[19];
      awsOperationalres[0].Finalrackpositioncheckedby =
        splitAWSOperationalres[20];
      awsOperationalres[0].FinalrackpositioncheckedbyCommen =
        splitAWSOperationalres[21];
      awsOperationalres[0].RackScanningbyAWSBBonSite =
        splitAWSOperationalres[22];
      awsOperationalres[0].RackScanningbyAWSBBonSiteComment =
        splitAWSOperationalres[23];
      awsOperationalres[0].AssetMismatch = splitAWSOperationalres[24];
      awsOperationalres[0].AssetMismatchComments = splitAWSOperationalres[25];
      awsOperationalres[0].RackInspectionwgteamleadOnly =
        splitAWSOperationalres[26];
      awsOperationalres[0].RackInspectionwgteamleadOnlyComm =
        splitAWSOperationalres[27];
      awsOperationalres[0].ConfirmIRISHCheckWithSiteReprese =
        splitAWSOperationalres[28];
      awsOperationalres[0].ConfirmIRISHCheckWithSiteReprese0 =
        splitAWSOperationalres[29];
      awsOperationalres[0].MatchRackStickerPosition =
        splitAWSOperationalres[30];
      awsOperationalres[0].MatchRackStickerPositionComments =
        splitAWSOperationalres[31];
      awsOperationalres[0].CompleteStriderPosition = splitAWSOperationalres[32];
      awsOperationalres[0].CompleteStriderPositionComments =
        splitAWSOperationalres[33];
      awsOperationalres[0].FinishCabling = splitAWSOperationalres[34];
      awsOperationalres[0].FinishCablingComments = splitAWSOperationalres[35];
      awsOperationalres[0].FinalAuditCheckAsPerSOP = splitAWSOperationalres[36];
      awsOperationalres[0].FinalAuditCheckAsPerSOPComments =
        splitAWSOperationalres[37];
      awsOperationalres[0].DebrisSeparationOfPlasticMetal =
        splitAWSOperationalres[38];
      awsOperationalres[0].DebrisSeparationOfPlasticMetalCo =
        splitAWSOperationalres[39];
      awsOperationalres[0].DebrisCleanUpLoadingbay = splitAWSOperationalres[40];
      awsOperationalres[0].DebrisCleanUpLoadingbayComments =
        splitAWSOperationalres[41];
      awsOperationalres[0].JobCompletionConfirmation =
        splitAWSOperationalres[42];
      awsOperationalres[0].JobCompletionConfirmationComment =
        splitAWSOperationalres[43];
      awsOperationalres[0].CrewNameAuditCheckConductedBy =
        splitAWSOperationalres[44];
      awsOperationalres[0].CrewNameAuditCheckConductedByCom =
        splitAWSOperationalres[45];
      awsOperationalres[0].WalkthroughSUPERVISOROnly =
        splitAWSOperationalres[46];
      awsOperationalres[0].WalkthroughSUPERVISOROnlyComment =
        splitAWSOperationalres[47];
      awsOperationalres[0].SecondTruck = splitAWSOperationalres[48];
      awsOperationalres[0].SecondTruckArrivalDateTime =
        splitAWSOperationalres[49];
      awsOperationalres[0].SecondTruckArrivalDateTimeCommen =
        splitAWSOperationalres[50];
      awsOperationalres[0].SecondTruckDepartureDateTime =
        splitAWSOperationalres[51];
      awsOperationalres[0].SecondTruckDepartureDateTimeComm =
        splitAWSOperationalres[52];
      awsOperationalres[0].Briefingconductedby = splitAWSOperationalres[53];
      awsOperationalres[0].STARTofoperationoperationToCheck =
        splitAWSOperationalres[54];
      awsOperationalres[0].STARTofoperationoperationToCheck0 =
        splitAWSOperationalres[55];
      awsOperationalres[0].Preparationofequipment = splitAWSOperationalres[56];
      awsOperationalres[0].Preparationofequipmentomments =
        splitAWSOperationalres[57];
      awsOperationalres[0].EnsureSafeEnvironment = splitAWSOperationalres[58];
      awsOperationalres[0].EnsureSafeEnvironmentComments =
        splitAWSOperationalres[59];
      awsOperationalres[0].RemovingRacksfromDH = splitAWSOperationalres[60];
      awsOperationalres[0].RemovingRacksfromDHComments =
        splitAWSOperationalres[61];
      awsOperationalres[0].ContactwithAWSDecomTeam = splitAWSOperationalres[62];
      awsOperationalres[0].AssetandsealNocheck = splitAWSOperationalres[63];
      awsOperationalres[0].DCSMConfirmBFRackMovement =
        splitAWSOperationalres[64];
      awsOperationalres[0].Teamsplitting = splitAWSOperationalres[65];
      awsOperationalres[0].TeamsplittingComments = splitAWSOperationalres[66];
      awsOperationalres[0].TeamTask = splitAWSOperationalres[67];
      awsOperationalres[0].TeamTaskComments = splitAWSOperationalres[68];
      awsOperationalres[0].TruckSealingAndLocking = splitAWSOperationalres[69];
      awsOperationalres[0].TruckSealingAndLockingComments =
        splitAWSOperationalres[70];
      awsOperationalres[0].RealtimepostingonJob = splitAWSOperationalres[71];
      awsOperationalres[0].RealtimepostingonJobComments =
        splitAWSOperationalres[72];
      awsOperationalres[0].TruckparkingonLoadingbay =
        splitAWSOperationalres[73];
      awsOperationalres[0].TruckparkingonLoadingbayComments =
        splitAWSOperationalres[74];
      awsOperationalres[0].BriefingAndTaskbifurcation =
        splitAWSOperationalres[75];
      awsOperationalres[0].BriefingAndTaskbifurcationCommen =
        splitAWSOperationalres[76];
      awsOperationalres[0].Team1 = splitAWSOperationalres[77];
      awsOperationalres[0].Team2 = splitAWSOperationalres[78];
      awsOperationalres[0].Team3 = splitAWSOperationalres[79];
      awsOperationalres[0].TruckLoadAuditconductedby =
        splitAWSOperationalres[80];
    } else {
      setAWSoperationalRes([]);
    }
    displayData.forEach((data) => {
      if (data.Id == id) {
        OperationResID = data.OperationalResponsId;
        let finalArr = [];
        if (
          data.Finalrackpositioncheckedby != null &&
          data.Finalrackpositioncheckedby != undefined
        ) {
          data.Finalrackpositioncheckedby.length &&
            data.Finalrackpositioncheckedby.map((val) => {
              finalArr.push(val.EMail);
            });
        }

        let finalrackEMail = finalArr.join(";");

        let crewArr = [];
        if (
          data.CrewNameAuditCheckConductedBy != null &&
          data.CrewNameAuditCheckConductedBy != undefined
        ) {
          data.CrewNameAuditCheckConductedBy.length &&
            data.CrewNameAuditCheckConductedBy.map((val) => {
              crewArr.push(val.EMail);
            });
        }
        let CrewEmail = crewArr.join(";");

        let truckauditArr = [];
        if (
          data.TruckLoadAuditconductedby != null &&
          data.TruckLoadAuditconductedby != undefined
        ) {
          data.TruckLoadAuditconductedby.length &&
            data.TruckLoadAuditconductedby.map((val) => {
              truckauditArr.push(val.EMail);
            });
        }

        let truckAduitEMail = truckauditArr.join(";");

        let briefingArr = [];
        if (
          data.Briefingconductedby != null &&
          data.Briefingconductedby != undefined
        ) {
          data.Briefingconductedby.length &&
            data.Briefingconductedby.map((val) => {
              briefingArr.push(val.EMail);
            });
        }

        let briefingEMail = briefingArr.join(";");
        for (let key in awsOperationalres[0]) {
          if (
            key == "SiteAccessDelays" &&
            data.SiteAccessDelays == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SiteAccessDelaysTime" &&
            data.SiteAccessDelaysTime == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SiteAccessDelaysComments" &&
            data.SiteAccessDelaysComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "BANKSMANPresent" &&
            data.BANKSMANPresent == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "BANKSMANPresentComments" &&
            data.BANKSMANPresentComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SecurityOrOtherDelays" &&
            data.SecurityOrOtherDelays == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SecurityorotherdelaysTime" &&
            data.SecurityorotherdelaysTime == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SecurityOrOtherDelaysComments" &&
            data.SecurityOrOtherDelaysComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (key == "Full5PPE" && data.full5PPE == awsOperationalres[0][key]) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "Full5PPEComments" &&
            data.full5PPEComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "PhoneMediaUsage" &&
            data.PhoneMediaUsage == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "PhoneMediaUsageComments" &&
            data.PhoneMediaUsageComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RestingOnFloor" &&
            data.RestingOnFloor == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RestingOnFloorComments" &&
            data.RestingOnFloorComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckArrival" &&
            data.TruckArrival == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckArrivalLoadingbayComments" &&
            data.TruckArrivalLoadingbayComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckDeparture" &&
            data.TruckDeparture == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckDepartureLoadingbayComments" &&
            data.TruckdepartureLoadingbayComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "FinalPositionCheckRacksFibres" &&
            data.FinalPositionCheckRacksFibres == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "FinalPositionCheckRacksFibresCom" &&
            data.FinalPositionCheckRacksFibresCom == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "Finalrackpositioncheckedby" &&
            finalrackEMail == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "FinalrackpositioncheckedbyCommen" &&
            data.FinalrackpositioncheckedbyCommen == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RackScanningbyAWSBBonSite" &&
            data.RackScanningbyAWSBBonSite == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RackScanningbyAWSBBonSiteComment" &&
            data.RackScanningbyAWSBBonSiteComment == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "AssetMismatch" &&
            data.AssetMismatch == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "AssetMismatchComments" &&
            data.AssetMismatchComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RackInspectionwgteamleadOnly" &&
            data.RackInspectionwgteamleadOnly == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RackInspectionwgteamleadOnlyComm" &&
            data.RackInspectionwgteamleadOnlyComm == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "ConfirmIRISHCheckWithSiteReprese" &&
            data.ConfirmIRISHCheckWithSiteReprese == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "ConfirmIRISHCheckWithSiteReprese0" &&
            data.ConfirmIRISHCheckWithSiteReprese0 == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "MatchRackStickerPosition" &&
            data.MatchRackStickerPosition == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "MatchRackStickerPositionComments" &&
            data.MatchRackStickerPositionComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "CompleteStriderPosition" &&
            data.CompleteStriderPosition == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "CompleteStriderPositionComments" &&
            data.CompleteStriderPositionComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "FinishCabling" &&
            data.FinishCabling == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "FinishCablingComments" &&
            data.FinishCablingComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "FinalAuditCheckAsPerSOP" &&
            data.FinalAuditCheckAsPerSOP == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "FinalAuditCheckAsPerSOPComments" &&
            data.FinalAuditCheckAsPerSOPComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "DebrisSeparationOfPlasticMetal" &&
            data.DebrisSeparationOfPlasticMetal == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "DebrisSeparationOfPlasticMetalCo" &&
            data.DebrisSeparationOfPlasticMetalCo == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "DebrisCleanUpLoadingbay" &&
            data.DebrisCleanUpLoadingbay == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "DebrisCleanUpLoadingbayComments" &&
            data.DebrisCleanUpLoadingbayComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "JobCompletionConfirmation" &&
            data.JobCompletionConfirmation == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "JobCompletionConfirmationComment" &&
            data.JobCompletionConfirmationComment == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "CrewNameAuditCheckConductedBy" &&
            CrewEmail == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "CrewNameAuditCheckConductedByCom" &&
            data.CrewNameAuditCheckConductedByCom == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "WalkthroughSUPERVISOROnly" &&
            data.WalkthroughSUPERVISOROnly == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "WalkthroughSUPERVISOROnlyComment" &&
            data.WalkthroughSUPERVISOROnlyComment == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SecondTruck" &&
            data.SecondTruck == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SecondTruckArrivalDateTime" &&
            data.SecondTruckArrivalDateTime == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SecondTruckArrivalDateTimeCommen" &&
            data.SecondTruckArrivalDateTimeCommen == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SecondTruckDepartureDateTime" &&
            data.SecondTruckDepartureDateTime == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "SecondTruckDepartureDateTimeComm" &&
            data.SecondTruckDepartureDateTimeComm == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "Briefingconductedby" &&
            briefingEMail == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "STARTofoperationoperationToCheck" &&
            data.STARTofoperationoperationToCheck == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "STARTofoperationoperationToCheck0" &&
            data.STARTofoperationoperationToCheck0 == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "Preparationofequipment" &&
            data.Preparationofequipment == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "Preparationofequipmentomments" &&
            data.Preparationofequipmentomments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "EnsureSafeEnvironment" &&
            data.EnsureSafeEnvironment == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "EnsureSafeEnvironmentComments" &&
            data.EnsureSafeEnvironmentComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RemovingRacksfromDH" &&
            data.RemovingRacksfromDH == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RemovingRacksfromDHComments" &&
            data.RemovingRacksfromDHComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "ContactwithAWSDecomTeam" &&
            data.ContactwithAWSDecomTeam == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "AssetandsealNocheck" &&
            data.AssetandsealNocheck == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "DCSMConfirmBFRackMovement" &&
            data.DCSMConfirmBFRackMovement == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "Teamsplitting" &&
            data.Teamsplitting == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TeamsplittingComments" &&
            data.TeamsplittingComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (key == "TeamTask" && data.TeamTask == awsOperationalres[0][key]) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TeamTaskComments" &&
            data.TeamTaskComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckSealingAndLocking" &&
            data.TruckSealingAndLocking == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckSealingAndLockingComments" &&
            data.TruckSealingAndLockingComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RealtimepostingonJob" &&
            data.RealtimepostingonJob == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "RealtimepostingonJobComments" &&
            data.RealtimepostingonJobComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckparkingonLoadingbay" &&
            data.TruckparkingonLoadingbay == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckparkingonLoadingbayComments" &&
            data.TruckparkingonLoadingbayComments == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "BriefingAndTaskbifurcation" &&
            data.BriefingAndTaskbifurcation == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "BriefingAndTaskbifurcationCommen" &&
            data.BriefingAndTaskbifurcationCommen == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
          if (key == "Team1" && data.Team1 == awsOperationalres[0][key]) {
            delete awsOperationalres[0][key];
          }
          if (key == "Team2" && data.Team2 == awsOperationalres[0][key]) {
            delete awsOperationalres[0][key];
          }
          if (key == "Team3" && data.Team3 == awsOperationalres[0][key]) {
            delete awsOperationalres[0][key];
          }
          if (
            key == "TruckLoadAuditconductedby" &&
            truckAduitEMail == awsOperationalres[0][key]
          ) {
            delete awsOperationalres[0][key];
          }
        }
      }
    });
    setAWSoperationalId(OperationResID);
    setAWSoperationalRes(awsOperationalres);
  };

  const uploadAWSactionplan = (id, AWSaction, jobType, client) => {
    let ActionID = null;
    if (AWSaction != "") {
      let splitAWSactionplan = AWSaction.split("|");
      awsactionplan[0].ConfirmETA = splitAWSactionplan[0];
      awsactionplan[0].ConfirmETAComments = splitAWSactionplan[1];
      if (client == "AWS" && jobType == "Rack Decom") {
        awsactionplan[0].Crewdetailssharing = splitAWSactionplan[2];
      } else {
        awsactionplan[0].LabelPrinted = splitAWSactionplan[2];
      }
      if (client == "AWS" && jobType == "Rack Decom") {
        awsactionplan[0].CrewdetailssharingComments = splitAWSactionplan[3];
      } else {
        awsactionplan[0].LabelPrintedComments = splitAWSactionplan[3];
      }
      if (client == "AWS" && jobType == "Rack Decom") {
        awsactionplan[0].ContactDCSM = splitAWSactionplan[4];
      } else {
        awsactionplan[0].ToolsPaperWork = splitAWSactionplan[4];
      }
      if (client == "AWS" && jobType == "Rack Decom") {
        awsactionplan[0].ContactDCSMComments = splitAWSactionplan[5];
      } else {
        awsactionplan[0].ToolsPaperWorkComments = splitAWSactionplan[5];
      }
      if (client == "AWS" && jobType == "Rack Decom") {
        awsactionplan[0].PrepareEquipment = splitAWSactionplan[6];
      } else {
        awsactionplan[0].AdditionalJobs = splitAWSactionplan[6];
      }
      if (client == "AWS" && jobType == "Rack Decom") {
        awsactionplan[0].PrepareEquipmentComments = splitAWSactionplan[7];
      } else {
        awsactionplan[0].AdditionalJobsComments = splitAWSactionplan[7];
      }
      awsactionplan[0].Trackercheck = splitAWSactionplan[8];
      awsactionplan[0].TrackercheckComments = splitAWSactionplan[9];
      awsactionplan[0].RoambeeNumber = splitAWSactionplan[10];
      awsactionplan[0].CardNumber = splitAWSactionplan[11];
      awsactionplan[0].TrackerNumber = splitAWSactionplan[12];
      awsactionplan[0].SealNumber = splitAWSactionplan[13];
      awsactionplan[0].DocumentsPrinting = splitAWSactionplan[14];
      awsactionplan[0].DocumentsPrintingComments = splitAWSactionplan[15];
      awsactionplan[0].DecomManifest = splitAWSactionplan[16];
      awsactionplan[0].CMR = splitAWSactionplan[17];
    } else {
      setAWSactionplan([]);
    }
    actiondata.forEach((data) => {
      if (data.TrackingNumberReferenceId == id) {
        ActionID = data.Id;
        for (let key in awsactionplan[0]) {
          if (key == "ConfirmETA" && data.ConfirmETA == awsactionplan[0][key]) {
            delete awsactionplan[0][key];
          }
          if (
            key == "ConfirmETAComments" &&
            data.ConfirmETAComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "LabelPrinted" &&
            data.LabelPrinted == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "LabelPrintedComments" &&
            data.LabelPrintedComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "ToolsPaperWork" &&
            data.ToolsPaperWork == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "ToolsPaperWorkComments" &&
            data.ToolsPaperWorkComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "AdditionalJobs" &&
            data.AdditionalJobs == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "AdditionalJobsComments" &&
            data.AdditionalJobsComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "Trackercheck" &&
            data.Trackercheck == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "TrackercheckComments" &&
            data.TrackercheckComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "RoambeeNumber" &&
            data.RoambeeNumber == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (key == "CardNumber" && data.CardNumber == awsactionplan[0][key]) {
            delete awsactionplan[0][key];
          }
          if (
            key == "TrackerNumber" &&
            data.TrackerNumber == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (key == "SealNumber" && data.SealNumber == awsactionplan[0][key]) {
            delete awsactionplan[0][key];
          }
          if (
            key == "DocumentsPrinting" &&
            data.DocumentsPrinting == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "DocumentsPrintingComments" &&
            data.DocumentsPrintingComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "DecomManifest" &&
            data.DecomManifest == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (key == "CMR" && data.CMR == awsactionplan[0][key]) {
            delete awsactionplan[0][key];
          }
          if (
            key == "Crewdetailssharing" &&
            data.Crewdetailssharing == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "CrewdetailssharingComments" &&
            data.CrewdetailssharingComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "ContactDCSM" &&
            data.ContactDCSM == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "ContactDCSMComments" &&
            data.ContactDCSMComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "PrepareEquipment" &&
            data.PrepareEquipment == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
          if (
            key == "PrepareEquipmentComments" &&
            data.PrepareEquipmentComments == awsactionplan[0][key]
          ) {
            delete awsactionplan[0][key];
          }
        }
      }
    });
    setAWSactionplanId(ActionID);
    setAWSactionplan(awsactionplan);
  };

  //ApprovelFunction
  const approvelFunction = async () => {
    if (isMSFT == "MSFT") {
      //For action plan
      for (let key in actionplan[0]) {
        if (actionplan[0][key] == "" || actionplan[0][key] == undefined) {
          delete actionplan[0][key];
        }
      }

      let updateactionjson = { ...actionplan[0] };

      await spweb.lists
        .getByTitle("Action Plan")
        .items.getById(actionappprovelId)
        .update(updateactionjson)
        .then(async (Response) => {
          setActionPlan([...actionjson]);

          //For Effective

          for (let key in effectivecom[0]) {
            if (
              effectivecom[0][key] == "" ||
              effectivecom[0][key] == undefined
            ) {
              delete effectivecom[0][key];
            }
          }

          let updateeffectivecomm = { ...effectivecom[0] };

          await spweb.lists
            .getByTitle("Effective Communication")
            .items.getById(effectiveapproveId)
            .update(updateeffectivecomm)
            .then(async (Response) => {
              setEffectiveCom([...effectivejson]);

              //wrappingUp
              for (let key in wrappingup[0]) {
                if (
                  wrappingup[0][key] == "" ||
                  wrappingup[0][key] == undefined
                ) {
                  delete wrappingup[0][key];
                }
              }
              let updatewrappingup = { ...wrappingup[0] };
              await spweb.lists
                .getByTitle("Wrapping Up")
                .items.getById(wrappingupId)
                .update(updatewrappingup)
                .then(async (Response) => {
                  setWrappingup([...wrappingjson]);

                  //wrappingnext fieldquality
                  for (let key in wrappingnext[0]) {
                    if (
                      wrappingnext[0][key] == "" ||
                      wrappingnext[0][key] == undefined
                    ) {
                      delete wrappingnext[0][key];
                    }
                  }
                  let updatewrappingnext = {
                    ...wrappingnext[0],
                    Status: "Completed",
                  };
                  await spweb.lists
                    .getByTitle("ATC Field Quality Planning")
                    .items.getById(wrappingnextId)
                    .update(updatewrappingnext)
                    .then(async (Response) => {
                      setWrappingNext([..._wrappingnext]);

                      for (let key in operationalres[0]) {
                        if (
                          operationalres[0][key] == "" ||
                          operationalres[0][key] == undefined
                        ) {
                          delete operationalres[0][key];
                        }
                      }

                      let updateOperationalRes = { ...operationalres[0] };
                      await spweb.lists
                        .getByTitle("Operational Responsibilities")
                        .items.getById(operationRedId)
                        .update(updateOperationalRes)
                        .then(async (Response) => {
                          setOperationalRes([...operationalresJson]);
                          setIsApprovePopup(false);
                          await init();
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      for (let key in awsEffective[0]) {
        if (awsEffective[0][key] == "" || awsEffective[0][key] == undefined) {
          delete awsEffective[0][key];
        }
      }
      let updateAWSeffective = { ...awsEffective[0] };
      await spweb.lists
        .getByTitle("Effective Communication")
        .items.getById(awsEffectiveId)
        .update(updateAWSeffective)
        .then(async (Response) => {
          setAWSeffective([...AWSeffectivejson]);
          for (let key in awsWrapping[0]) {
            if (awsWrapping[0][key] == "" || awsWrapping[0][key] == undefined) {
              delete awsWrapping[0][key];
            }
          }
          let updateAWSwrapping = { ...awsWrapping[0] };
          await spweb.lists
            .getByTitle("Wrapping Up")
            .items.getById(awswrappingId)
            .update(updateAWSwrapping)
            .then(async (Response) => {
              setAWSwrapping([...AWSwrappingjson]);
              for (let key in awsOperationalres[0]) {
                if (
                  awsOperationalres[0][key] == "" ||
                  awsOperationalres[0][key] == undefined
                ) {
                  delete awsOperationalres[0][key];
                }
              }
              let updateAWSoperational = { ...awsOperationalres[0] };
              await spweb.lists
                .getByTitle("Operational Responsibilities")
                .items.getById(awsOperationalId)
                .update(updateAWSoperational)
                .then(async (Response) => {
                  setAWSwrapping([...AWSwrappingjson]);
                  for (let key in awsATCplanning[0]) {
                    if (
                      awsATCplanning[0][key] == "" ||
                      awsATCplanning[0][key] == undefined
                    ) {
                      delete awsATCplanning[0][key];
                    }
                  }
                  let updateAWSatcplanning = {
                    ...awsATCplanning[0],
                    Status: "Completed",
                  };
                  await spweb.lists
                    .getByTitle("ATC Field Quality Planning")
                    .items.getById(awsATCplanId)
                    .update(updateAWSatcplanning)
                    .then(async (Response) => {
                      setawsATCplanning([...AWSatcplanning]);
                      for (let key in awsactionplan[0]) {
                        if (
                          awsactionplan[0][key] == "" ||
                          awsactionplan[0][key] == undefined
                        ) {
                          delete awsactionplan[0][key];
                        }
                      }
                      let updateAWSactionplan = { ...awsactionplan[0] };
                      await spweb.lists
                        .getByTitle("Action Plan")
                        .items.getById(awsactionplanId)
                        .update(updateAWSactionplan)
                        .then(async (Response) => {
                          setAWSwrapping([...AWSwrappingjson]);
                          setIsApprovePopup(false);
                          await init();
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const getResponsibitydata = (planningData) => {
    // let onlyMobilizationYes = [];
    spweb.lists
      .getByTitle(`Operational Responsibilities`)
      .items.top(5000)
      .select(
        "*,TrackingNumberReference/trackingNumber,TrackingNumberReference/delDate,TrackingNumberReference/racks,TrackingNumberReference/SiteCode,TrackingNumberReference/Country,TrackingNumberReference/Client,HandSBriefingConductedby/Title,HandSBriefingConductedby/EMail,HandSBriefingConductedby/Id,Finalrackpositioncheckedby/EMail,Finalrackpositioncheckedby/Id,CrewNameAuditCheckConductedBy/EMail,TruckLoadAuditconductedby/EMail,TruckLoadAuditconductedby/Id,Briefingconductedby/EMail,Briefingconductedby/Id"
      )
      .expand(
        "TrackingNumberReference,HandSBriefingConductedby,Finalrackpositioncheckedby,CrewNameAuditCheckConductedBy,TruckLoadAuditconductedby,Briefingconductedby"
      )
      .get()
      .then((Response) => {
        // console.log(Response, "Response");
        // let responsibilityData: any[] = [];
        let totalPlanningItem: any[] = [];
        if (Response.length > 0) {
          planningData.forEach((plan) => {
            // let operationalData = Response.filter(
            //   (data) => plan.Id == data.TrackingNumberReferenceId
            // );

            // let operationalListObject =
            //   operationalData.length > 0 ? operationalData[0] : {};
            // let handSBriefingConductedbyList = [];

            // try {
            //   handSBriefingConductedbyList = operationalListObject
            //     ? operationalListObject.HandSBriefingConductedby?.map((e) => {
            //         return {
            //           Title: e.Title ? e.Title : "",
            //           EMail: e.EMail ? e.EMail : "",
            //           Id: e.Id,
            //         };
            //       })
            //     : [];
            // } catch (e) {
            //   handSBriefingConductedbyList = [];
            // }

            // let Finalrackpositioncheckedby = [];
            // try {
            //   Finalrackpositioncheckedby = operationalListObject
            //     ? operationalListObject.Finalrackpositioncheckedby?.map((e) => {
            //         return { EMail: e.EMail ? e.EMail : "", Id: e.Id };
            //       })
            //     : [];
            // } catch (e) {
            //   Finalrackpositioncheckedby = [];
            // }
            // let CrewNameAuditCheckConductedBy = [];
            // try {
            //   CrewNameAuditCheckConductedBy = operationalListObject
            //     ? operationalListObject.CrewNameAuditCheckConductedBy?.map(
            //         (e) => {
            //           return { EMail: e.EMail ? e.EMail : "", Id: e.Id };
            //         }
            //       )
            //     : [];
            // } catch (e) {
            //   CrewNameAuditCheckConductedBy = [];
            // }
            // let TruckLoadAuditconductedby = [];
            // try {
            //   TruckLoadAuditconductedby = operationalListObject
            //     ? operationalListObject.TruckLoadAuditconductedby?.map((e) => {
            //         return { EMail: e.Email ? e.Email : "", Id: e.Id };
            //       })
            //     : [];
            // } catch (e) {
            //   TruckLoadAuditconductedby = [];
            // }
            // let Briefingconductedby = [];
            // try {
            //   Briefingconductedby = operationalListObject
            //     ? operationalListObject.Briefingconductedby?.map((e) => {
            //         return { EMail: e.EMail ? e.EMail : "", Id: e.Id };
            //       })
            //     : [];
            // } catch (e) {
            //   Briefingconductedby = [];
            // }

            if (plan.trackingNumber) {
              totalPlanningItem.push(plan);
              // responsibilityData.push({
              //   Id: plan.Id,
              //   OperationalResponsId: operationalListObject.ID,
              //   trackingNo: plan.trackingNumber,
              //   rackQuantity: plan.racks,
              //   siteCode: plan.siteCode,
              //   country: plan.country,
              //   client: plan.client,
              //   supervisor: plan.supervisor,
              //   deleteDate: plan.deleteDate ? plan.deleteDate : null,
              //   deployementSupervisor: plan.deployementSupervisor,
              //   mobilization: plan.mobilization,
              //   driverName: plan.driverName,
              //   isDriver: plan.isDriver,
              //   status: plan.status,
              //   healthSafetyPerformance: plan.healthSafetyPerformance,
              //   driverNameYes: plan.driverNameYes,
              //   siteAddress: plan.siteAddress,
              //   additionalDeliveryComments: plan.additionalDeliveryComments,
              //   wgcrew: plan.wgcrew ? plan.wgcrew : [],
              //   notes: plan.notes,
              //   isActionPlanCompleted: plan.isActionPlanCompleted,
              //   escalated: plan.escalated,
              //   city: plan.city,
              //   joptype: plan.joptype,
              //   accidentInformation: plan.accidentInformation,
              //   accidentInformationComments: plan.accidentInformationComments,
              //   goodSave: plan.goodSave,
              //   safetyInitiative: plan.safetyInitiative,
              //   DrivingforwSuggestion: plan.DrivingforwSuggestion,
              //   goodSaveComments: plan.goodSaveComments,
              //   safetyInitiativeComments: plan.safetyInitiativeComments,
              //   drivingforwSuggestionComments:
              //     plan.drivingforwSuggestionComments,
              //   goodSaveName: plan.goodSaveName,
              //   safetyInitiativeName: plan.safetyInitiativeName,
              //   drivingforwSuggestionName: plan.drivingforwSuggestionName,
              //   wGCrewMemberData: plan.wGCrewMemberData,
              //   isDelete: plan.isDelete,
              //   CustomerFeedback: plan.CustomerFeedback,
              //   CustomerFeedbackComments: plan.CustomerFeedbackComments,
              //   ATCSupervvisorFeedback: plan.ATCSupervvisorFeedback,
              //   ATCSupervisorFeedbackComments:
              //     plan.ATCSupervisorFeedbackComments,
              //   ToolsOnChargeForNextDay: plan.ToolsOnChargeForNextDay,
              //   ToolsOnChargeForNextDayComments:
              //     plan.ToolsOnChargeForNextDayComments,
              //   VehicleIsCleanAndNotOnReserveFor:
              //     plan.VehicleIsCleanAndNotOnReserveFor,
              //   VehicleIsCleanAndNotOnReserveFor0:
              //     plan.VehicleIsCleanAndNotOnReserveFor0,
              //   PaperWorkCompletePlanningTeamUpd:
              //     plan.PaperWorkCompletePlanningTeamUpd,
              //   PaperWorkCompletePlanningTeamUpd0:
              //     plan.PaperWorkCompletePlanningTeamUpd0,
              //   Cablingspreadsheetupdate: plan.Cablingspreadsheetupdate,
              //   CablingspreadsheetupdateComments:
              //     plan.CablingspreadsheetupdateComments,
              //   AccidentInformation: plan.AccidentInformation,
              //   AccidentInformationComments: plan.AccidentInformationComments,
              //   Drivingforwsuggestion: plan.Drivingforwsuggestion,
              //   siteAccessdelay: operationalListObject.SiteAccessDelays
              //     ? operationalListObject.SiteAccessDelays
              //     : "",
              //   CrewNameAuditCheckConductedBy: CrewNameAuditCheckConductedBy
              //     ? CrewNameAuditCheckConductedBy
              //     : [],
              //   Finalrackpositioncheckedby: Finalrackpositioncheckedby
              //     ? Finalrackpositioncheckedby
              //     : [],
              //   siteAccessDelaysTime: operationalListObject.SiteAccessDelaysTime
              //     ? operationalListObject.SiteAccessDelaysTime
              //     : "",
              //   securityOrOtherdelays:
              //     operationalListObject.SecurityOrOtherDelays
              //       ? operationalListObject.SecurityOrOtherDelays
              //       : "",
              //   securityorotherdelaysTime:
              //     operationalListObject.SecurityorotherdelaysTime
              //       ? operationalListObject.SecurityorotherdelaysTime
              //       : "",
              //   full5PPE: operationalListObject.Full5PPE
              //     ? operationalListObject.Full5PPE
              //     : "",
              //   siteAccessDelaysComments:
              //     operationalListObject.SiteAccessDelaysComments
              //       ? operationalListObject.SiteAccessDelaysComments
              //       : "",
              //   securityOrOtherDelaysComments:
              //     operationalListObject.SecurityOrOtherDelaysComments
              //       ? operationalListObject.SecurityOrOtherDelaysComments
              //       : "",
              //   full5PPEComments: operationalListObject.Full5PPEComments
              //     ? operationalListObject.Full5PPEComments
              //     : "",
              //   crewNameAuditCheckConductedByCom:
              //     operationalListObject.CrewNameAuditCheckConductedByCom
              //       ? operationalListObject.CrewNameAuditCheckConductedByCom
              //       : "",
              //   TruckSealBreak: operationalListObject.TruckSealBreak
              //     ? operationalListObject.TruckSealBreak
              //     : "",
              //   TruckSealBreakComments:
              //     operationalListObject.TruckSealBreakComments
              //       ? operationalListObject.TruckSealBreakComments
              //       : "",
              //   Truckdeparturedelays: operationalListObject.Truckdeparturedelays
              //     ? operationalListObject.Truckdeparturedelays
              //     : "",
              //   TruckdeparturedelaysTime:
              //     operationalListObject.TruckdeparturedelaysTime
              //       ? operationalListObject.TruckdeparturedelaysTime
              //       : "",
              //   TruckdeparturedelaysComments:
              //     operationalListObject.TruckdeparturedelaysComments
              //       ? operationalListObject.TruckdeparturedelaysComments
              //       : "",
              //   DCATsDelays: operationalListObject.DCATsDelays
              //     ? operationalListObject.DCATsDelays
              //     : "",
              //   DCATsDelaysTime: operationalListObject.DCATsDelaysTime
              //     ? operationalListObject.DCATsDelaysTime
              //     : "",
              //   DCATsDelaysComments: operationalListObject.DCATsDelaysComments
              //     ? operationalListObject.DCATsDelaysComments
              //     : "",
              //   VendorWGCrewdelays: operationalListObject.VendorWGCrewdelays
              //     ? operationalListObject.VendorWGCrewdelays
              //     : "",
              //   VendorWGCrewdelaysTime:
              //     operationalListObject.VendorWGCrewdelaysTime
              //       ? operationalListObject.VendorWGCrewdelaysTime
              //       : "",
              //   VendorWGCrewdelaysComments:
              //     operationalListObject.VendorWGCrewdelaysComments
              //       ? operationalListObject.VendorWGCrewdelaysComments
              //       : "",
              //   BANKSMANPresent: operationalListObject.BANKSMANPresent
              //     ? operationalListObject.BANKSMANPresent
              //     : "",
              //   BANKSMANPresentComments:
              //     operationalListObject.BANKSMANPresentComments
              //       ? operationalListObject.BANKSMANPresentComments
              //       : "",
              //   PhoneMediaUsage: operationalListObject.PhoneMediaUsage
              //     ? operationalListObject.PhoneMediaUsage
              //     : "",
              //   PhoneMediaUsageComments:
              //     operationalListObject.PhoneMediaUsageComments
              //       ? operationalListObject.PhoneMediaUsageComments
              //       : "",
              //   RestingOnFloor: operationalListObject.RestingOnFloor
              //     ? operationalListObject.RestingOnFloor
              //     : "",
              //   RestingOnFloorComments:
              //     operationalListObject.RestingOnFloorComments
              //       ? operationalListObject.RestingOnFloorComments
              //       : "",
              //   TruckArrival: operationalListObject.TruckArrival
              //     ? operationalListObject.TruckArrival
              //     : "",
              //   TruckArrivalLoadingbayComments:
              //     operationalListObject.TruckArrivalLoadingbayComments
              //       ? operationalListObject.TruckArrivalLoadingbayComments
              //       : "",
              //   TruckDeparture: operationalListObject.TruckDeparture
              //     ? operationalListObject.TruckDeparture
              //     : "",
              //   TruckdepartureLoadingbayComments:
              //     operationalListObject.TruckdepartureLoadingbayComments
              //       ? operationalListObject.TruckdepartureLoadingbayComments
              //       : "",
              //   RealtimeETAs: operationalListObject.RealtimeETAs
              //     ? operationalListObject.RealtimeETAs
              //     : "",
              //   RealtimeETAComments: operationalListObject.RealtimeETAComments
              //     ? operationalListObject.RealtimeETAComments
              //     : "",
              //   COLLOaccessissues: operationalListObject.COLLOaccessissues
              //     ? operationalListObject.COLLOaccessissues
              //     : "",
              //   COLLOaccessissuesTime:
              //     operationalListObject.COLLOaccessissuesTime
              //       ? operationalListObject.COLLOaccessissuesTime
              //       : "",
              //   COLLOaccessissuesComments:
              //     operationalListObject.COLLOaccessissuesComments
              //       ? operationalListObject.COLLOaccessissuesComments
              //       : "",
              //   Induction: operationalListObject.Induction
              //     ? operationalListObject.Induction
              //     : "",
              //   InductionComments: operationalListObject.InductionComments
              //     ? operationalListObject.InductionComments
              //     : "",
              //   STARTofoperationMSFTstaff:
              //     operationalListObject.STARTofoperationMSFTstaff
              //       ? operationalListObject.STARTofoperationMSFTstaff
              //       : "",
              //   STARTofoperationMSFTstaffComment:
              //     operationalListObject.STARTofoperationMSFTstaffComment
              //       ? operationalListObject.STARTofoperationMSFTstaffComment
              //       : "",
              //   SmartTeamdelegating: operationalListObject.SmartTeamdelegating
              //     ? operationalListObject.SmartTeamdelegating
              //     : "",
              //   SmartTeamdelegatingComments:
              //     operationalListObject.SmartTeamdelegatingComments
              //       ? operationalListObject.SmartTeamdelegatingComments
              //       : "",
              //   Rampsetup: operationalListObject.Rampsetup
              //     ? operationalListObject.Rampsetup
              //     : "",
              //   RampsetupComments: operationalListObject.RampsetupComments
              //     ? operationalListObject.RampsetupComments
              //     : "",
              //   LoadingBayPreparationofworkareae0:
              //     operationalListObject.LoadingBayPreparationofworkareae0
              //       ? operationalListObject.LoadingBayPreparationofworkareae0
              //       : "",
              //   LoadingBayPreparationofworkareae:
              //     operationalListObject.LoadingBayPreparationofworkareae
              //       ? operationalListObject.LoadingBayPreparationofworkareae
              //       : "",
              //   FINALcheckasperSOP_x2013_WGorDep0:
              //     operationalListObject.FINALcheckasperSOP_x2013_WGorDep0
              //       ? operationalListObject.FINALcheckasperSOP_x2013_WGorDep0
              //       : "",
              //   FINALcheckasperSOP_x2013_WGorDep:
              //     operationalListObject.FINALcheckasperSOP_x2013_WGorDep
              //       ? operationalListObject.FINALcheckasperSOP_x2013_WGorDep
              //       : "",
              //   DebrisSeparationOfPlasticMetal:
              //     operationalListObject.DebrisSeparationOfPlasticMetal
              //       ? operationalListObject.DebrisSeparationOfPlasticMetal
              //       : "",
              //   DebrisSeparationOfPlasticMetalCo:
              //     operationalListObject.DebrisSeparationOfPlasticMetalCo
              //       ? operationalListObject.DebrisSeparationOfPlasticMetalCo
              //       : "",
              //   DebrisCleanUpLoadingbay:
              //     operationalListObject.DebrisCleanUpLoadingbay
              //       ? operationalListObject.DebrisCleanUpLoadingbay
              //       : "",
              //   DebrisCleanUpLoadingbayComments:
              //     operationalListObject.DebrisCleanUpLoadingbayComments
              //       ? operationalListObject.DebrisCleanUpLoadingbayComments
              //       : "",
              //   JobCompletionConfirmation:
              //     operationalListObject.JobCompletionConfirmation
              //       ? operationalListObject.JobCompletionConfirmation
              //       : "",
              //   JobCompletionConfirmationComment:
              //     operationalListObject.JobCompletionConfirmationComment
              //       ? operationalListObject.JobCompletionConfirmationComment
              //       : "",
              //   SecondTruck: operationalListObject.SecondTruck
              //     ? operationalListObject.SecondTruck
              //     : "",
              //   SecondTruckArrivalDateTime:
              //     operationalListObject.SecondTruckArrivalDateTime
              //       ? operationalListObject.SecondTruckArrivalDateTime
              //       : "",
              //   SecondTruckArrivalDateTimeCommen:
              //     operationalListObject.SecondTruckArrivalDateTimeCommen
              //       ? operationalListObject.SecondTruckArrivalDateTimeCommen
              //       : "",
              //   SecondTruckDepartureDateTime:
              //     operationalListObject.SecondTruckDepartureDateTime
              //       ? operationalListObject.SecondTruckDepartureDateTime
              //       : "",
              //   SecondTruckDepartureDateTimeComm:
              //     operationalListObject.SecondTruckDepartureDateTimeComm
              //       ? operationalListObject.SecondTruckDepartureDateTimeComm
              //       : "",
              //   Team1LoadingBay: operationalListObject.Team1LoadingBay
              //     ? operationalListObject.Team1LoadingBay
              //     : false,
              //   Team2Rackpushing0toCOLLO:
              //     operationalListObject.Team2Rackpushing0toCOLLO
              //       ? operationalListObject.Team2Rackpushing0toCOLLO
              //       : false,
              //   ThirdTruck: operationalListObject.ThirdTruck
              //     ? operationalListObject.ThirdTruck
              //     : "",
              //   ThirdTruckArrivalDateTime:
              //     operationalListObject.ThirdTruckArrivalDateTime
              //       ? operationalListObject.ThirdTruckArrivalDateTime
              //       : "",
              //   ThirdTruckArrivalDateTimeComment:
              //     operationalListObject.ThirdTruckArrivalDateTimeComment
              //       ? operationalListObject.ThirdTruckArrivalDateTimeComment
              //       : "",
              //   ThirdTruckDepartureDateTime:
              //     operationalListObject.ThirdTruckDepartureDateTime
              //       ? operationalListObject.ThirdTruckDepartureDateTime
              //       : "",
              //   ThirdTruckDepartureDateTimeComme:
              //     operationalListObject.ThirdTruckDepartureDateTimeComme
              //       ? operationalListObject.ThirdTruckDepartureDateTimeComme
              //       : "",
              //   SiteAccessDelays: operationalListObject.SiteAccessDelays
              //     ? operationalListObject.SiteAccessDelays
              //     : "",
              //   SiteAccessDelaysTime: operationalListObject.SiteAccessDelaysTime
              //     ? operationalListObject.SiteAccessDelaysTime
              //     : "",
              //   SiteAccessDelaysComments:
              //     operationalListObject.SiteAccessDelaysComments
              //       ? operationalListObject.SiteAccessDelaysComments
              //       : "",
              //   SecurityOrOtherDelays:
              //     operationalListObject.SecurityOrOtherDelays
              //       ? operationalListObject.SecurityOrOtherDelays
              //       : "",
              //   SecurityorotherdelaysTime:
              //     operationalListObject.SecurityorotherdelaysTime
              //       ? operationalListObject.SecurityorotherdelaysTime
              //       : "",
              //   SecurityOrOtherDelaysComments:
              //     operationalListObject.SecurityOrOtherDelaysComments
              //       ? operationalListObject.SecurityOrOtherDelaysComments
              //       : "",
              //   FinalPositionCheckRacksFibres:
              //     operationalListObject.FinalPositionCheckRacksFibres
              //       ? operationalListObject.FinalPositionCheckRacksFibres
              //       : "",
              //   FinalPositionCheckRacksFibresCom:
              //     operationalListObject.FinalPositionCheckRacksFibresCom
              //       ? operationalListObject.FinalPositionCheckRacksFibresCom
              //       : "",
              //   // Finalrackpositioncheckedby:
              //   //   operationalListObject.Finalrackpositioncheckedby
              //   //     ? operationalListObject.Finalrackpositioncheckedby
              //   //     : "",
              //   FinalrackpositioncheckedbyCommen:
              //     operationalListObject.FinalrackpositioncheckedbyCommen
              //       ? operationalListObject.FinalrackpositioncheckedbyCommen
              //       : "",
              //   RackScanningbyAWSBBonSite:
              //     operationalListObject.RackScanningbyAWSBBonSite
              //       ? operationalListObject.RackScanningbyAWSBBonSite
              //       : "",
              //   RackScanningbyAWSBBonSiteComment:
              //     operationalListObject.RackScanningbyAWSBBonSiteComment
              //       ? operationalListObject.RackScanningbyAWSBBonSiteComment
              //       : "",
              //   AssetMismatch: operationalListObject.AssetMismatch
              //     ? operationalListObject.AssetMismatch
              //     : "",
              //   AssetMismatchComments:
              //     operationalListObject.AssetMismatchComments
              //       ? operationalListObject.AssetMismatchComments
              //       : "",
              //   RackInspectionwgteamleadOnly:
              //     operationalListObject.RackInspectionwgteamleadOnly
              //       ? operationalListObject.RackInspectionwgteamleadOnly
              //       : "",
              //   RackInspectionwgteamleadOnlyComm:
              //     operationalListObject.RackInspectionwgteamleadOnlyComm
              //       ? operationalListObject.RackInspectionwgteamleadOnlyComm
              //       : "",
              //   ConfirmIRISHCheckWithSiteReprese:
              //     operationalListObject.ConfirmIRISHCheckWithSiteReprese
              //       ? operationalListObject.ConfirmIRISHCheckWithSiteReprese
              //       : "",
              //   ConfirmIRISHCheckWithSiteReprese0:
              //     operationalListObject.ConfirmIRISHCheckWithSiteReprese0
              //       ? operationalListObject.ConfirmIRISHCheckWithSiteReprese0
              //       : "",
              //   MatchRackStickerPosition:
              //     operationalListObject.MatchRackStickerPosition
              //       ? operationalListObject.MatchRackStickerPosition
              //       : "",
              //   MatchRackStickerPositionComments:
              //     operationalListObject.MatchRackStickerPositionComments
              //       ? operationalListObject.MatchRackStickerPositionComments
              //       : "",
              //   CompleteStriderPosition:
              //     operationalListObject.CompleteStriderPosition
              //       ? operationalListObject.CompleteStriderPosition
              //       : "",
              //   CompleteStriderPositionComments:
              //     operationalListObject.CompleteStriderPositionComments
              //       ? operationalListObject.CompleteStriderPositionComments
              //       : "",
              //   FinishCabling: operationalListObject.FinishCabling
              //     ? operationalListObject.FinishCabling
              //     : "",
              //   FinishCablingComments:
              //     operationalListObject.FinishCablingComments
              //       ? operationalListObject.FinishCablingComments
              //       : "",
              //   FinalAuditCheckAsPerSOP:
              //     operationalListObject.FinalAuditCheckAsPerSOP
              //       ? operationalListObject.FinalAuditCheckAsPerSOP
              //       : "",
              //   FinalAuditCheckAsPerSOPComments:
              //     operationalListObject.FinalAuditCheckAsPerSOPComments
              //       ? operationalListObject.FinalAuditCheckAsPerSOPComments
              //       : "",
              //   CrewNameAuditCheckConductedByCom:
              //     operationalListObject.CrewNameAuditCheckConductedByCom
              //       ? operationalListObject.CrewNameAuditCheckConductedByCom
              //       : "",
              //   WalkthroughSUPERVISOROnly:
              //     operationalListObject.WalkthroughSUPERVISOROnly
              //       ? operationalListObject.WalkthroughSUPERVISOROnly
              //       : "",
              //   WalkthroughSUPERVISOROnlyComment:
              //     operationalListObject.WalkthroughSUPERVISOROnlyComment
              //       ? operationalListObject.WalkthroughSUPERVISOROnlyComment
              //       : "",
              //   Briefingconductedby: Briefingconductedby,
              //   STARTofoperationoperationToCheck:
              //     operationalListObject.STARTofoperationoperationToCheck
              //       ? operationalListObject.STARTofoperationoperationToCheck
              //       : "",
              //   STARTofoperationoperationToCheck0:
              //     operationalListObject.STARTofoperationoperationToCheck0
              //       ? operationalListObject.STARTofoperationoperationToCheck0
              //       : "",
              //   Preparationofequipment:
              //     operationalListObject.Preparationofequipment
              //       ? operationalListObject.Preparationofequipment
              //       : "",
              //   Preparationofequipmentomments:
              //     operationalListObject.Preparationofequipmentomments
              //       ? operationalListObject.Preparationofequipmentomments
              //       : "",
              //   EnsureSafeEnvironment:
              //     operationalListObject.EnsureSafeEnvironment
              //       ? operationalListObject.EnsureSafeEnvironment
              //       : "",
              //   EnsureSafeEnvironmentComments:
              //     operationalListObject.EnsureSafeEnvironmentComments
              //       ? operationalListObject.EnsureSafeEnvironmentComments
              //       : "",
              //   RemovingRacksfromDH: operationalListObject.RemovingRacksfromDH
              //     ? operationalListObject.RemovingRacksfromDH
              //     : "",
              //   RemovingRacksfromDHComments:
              //     operationalListObject.RemovingRacksfromDHComments
              //       ? operationalListObject.RemovingRacksfromDHComments
              //       : "",
              //   ContactwithAWSDecomTeam:
              //     operationalListObject.ContactwithAWSDecomTeam
              //       ? operationalListObject.ContactwithAWSDecomTeam
              //       : "",
              //   AssetandsealNocheck: operationalListObject.AssetandsealNocheck
              //     ? operationalListObject.AssetandsealNocheck
              //     : "",
              //   DCSMConfirmBFRackMovement:
              //     operationalListObject.DCSMConfirmBFRackMovement
              //       ? operationalListObject.DCSMConfirmBFRackMovement
              //       : "",
              //   Teamsplitting: operationalListObject.Teamsplitting
              //     ? operationalListObject.Teamsplitting
              //     : "",
              //   TeamsplittingComments:
              //     operationalListObject.TeamsplittingComments
              //       ? operationalListObject.TeamsplittingComments
              //       : "",
              //   TeamTask: operationalListObject.TeamTask
              //     ? operationalListObject.TeamTask
              //     : "",
              //   TeamTaskComments: operationalListObject.TeamTaskComments
              //     ? operationalListObject.TeamTaskComments
              //     : "",
              //   TruckSealingAndLocking:
              //     operationalListObject.TruckSealingAndLocking
              //       ? operationalListObject.TruckSealingAndLocking
              //       : "",
              //   TruckSealingAndLockingComments:
              //     operationalListObject.TruckSealingAndLockingComments
              //       ? operationalListObject.TruckSealingAndLockingComments
              //       : "",
              //   RealtimepostingonJob: operationalListObject.RealtimepostingonJob
              //     ? operationalListObject.RealtimepostingonJob
              //     : "",
              //   RealtimepostingonJobComments:
              //     operationalListObject.RealtimepostingonJobComments
              //       ? operationalListObject.RealtimepostingonJobComments
              //       : "",
              //   TruckparkingonLoadingbay:
              //     operationalListObject.TruckparkingonLoadingbay
              //       ? operationalListObject.TruckparkingonLoadingbay
              //       : "",
              //   TruckparkingonLoadingbayComments:
              //     operationalListObject.TruckparkingonLoadingbayComments
              //       ? operationalListObject.TruckparkingonLoadingbayComments
              //       : "",
              //   BriefingAndTaskbifurcation:
              //     operationalListObject.BriefingAndTaskbifurcation
              //       ? operationalListObject.BriefingAndTaskbifurcation
              //       : "",
              //   BriefingAndTaskbifurcationCommen:
              //     operationalListObject.BriefingAndTaskbifurcationCommen
              //       ? operationalListObject.BriefingAndTaskbifurcationCommen
              //       : "",
              //   Team1: operationalListObject.Team1
              //     ? operationalListObject.Team1
              //     : "",
              //   Team2: operationalListObject.Team2
              //     ? operationalListObject.Team2
              //     : "",
              //   Team3: operationalListObject.Team3
              //     ? operationalListObject.Team3
              //     : "",
              //   TruckLoadAuditconductedby: TruckLoadAuditconductedby,

              //   handSBriefingConductedby: handSBriefingConductedbyList
              //     ? handSBriefingConductedbyList
              //     : [],
              //   OperationalRes: plan.OperationalRes,
              //   ReviewComments: plan.InReviewComments,
              //   ActionPlan: plan.ActionPlan,
              //   EffectiveCommunication: plan.EffectiveCommunication,
              //   WrappingUp: plan.WrappingUp,
              //   WrappingUpID: plan.WrappingUpID,
              // });
            }
          });
          // getEffectivedata();
          // getactionplan();
          // responsibilityData = responsibilityData.sort(function (a, b) {
          //   return moment(a.deleteDate) > moment(b.deleteDate)
          //     ? -1
          //     : moment(a.deleteDate) < moment(b.deleteDate)
          //     ? 1
          //     : 0;
          // });
        }
        // if (loggedinuser == "davor.salkanovic@atc-logistics.de") {
        //   // let onlyMobilizationYes = responsibilityData.filter(
        //   //   (yes) => yes.mobilization == "Yes"
        //   // );

        //   responsibilityData.forEach(async (data) => {
        //     if (
        //       data.country == "France" ||
        //       data.country == "Poland" ||
        //       data.country == "Sweden" ||
        //       data.country == "Italy"
        //     ) {
        //       onlyMobilizationYes.push(data);
        //     } else {
        //       if (data.mobilization == "Yes") {
        //         onlyMobilizationYes.push(data);
        //       }
        //     }
        //   });
        //   allFilterOptions(onlyMobilizationYes);
        //   setMasterData([...onlyMobilizationYes]);
        //   setDuplicateData([...onlyMobilizationYes]);
        //   filterFunction(FilterKey, onlyMobilizationYes);

        //   // setDisplayData([...onlyMobilizationYes]);
        //   // setExportExcel([...onlyMobilizationYes]);
        //   // paginateFunction(1, [...onlyMobilizationYes]);

        //   setLoader(false);
        // }
        // else {
        //   setMasterData([...responsibilityData]);
        //   setDuplicateData([...responsibilityData]);
        //   filterFunction(FilterKey, responsibilityData);

        //   // setDisplayData([...responsibilityData]);
        //   // setExportExcel([...responsibilityData]);
        //   // paginateFunction(1, [...responsibilityData]);

        //   allFilterOptions(responsibilityData);
        //   setLoader(false);
        // }
        getMileStoneData(totalPlanningItem, Response);
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
        globalPlanArr = [];
        count = 0;
        // let totalPlanningItem: any[] = [];
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
                CustomerFeedback: data.CustomerFeedback
                  ? data.CustomerFeedback
                  : "",
                CustomerFeedbackComments: data.CustomerFeedbackComments
                  ? data.CustomerFeedbackComments
                  : "",
                ATCSupervvisorFeedback: data.ATCSupervvisorFeedback
                  ? data.ATCSupervvisorFeedback
                  : "",
                ATCSupervisorFeedbackComments:
                  data.ATCSupervisorFeedbackComments
                    ? data.ATCSupervisorFeedbackComments
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
                ToolsOnChargeForNextDay:
                  refWrappingDataObject.ToolsOnChargeForNextDay,
                ToolsOnChargeForNextDayComments:
                  refWrappingDataObject.ToolsOnChargeForNextDayComments,
                VehicleIsCleanAndNotOnReserveFor:
                  refWrappingDataObject.VehicleIsCleanAndNotOnReserveFor,
                VehicleIsCleanAndNotOnReserveFor0:
                  refWrappingDataObject.VehicleIsCleanAndNotOnReserveFor0,
                PaperWorkCompletePlanningTeamUpd:
                  refWrappingDataObject.PaperWorkCompletePlanningTeamUpd,
                PaperWorkCompletePlanningTeamUpd0:
                  refWrappingDataObject.PaperWorkCompletePlanningTeamUpd0,
                Cablingspreadsheetupdate:
                  refWrappingDataObject.Cablingspreadsheetupdate,
                CablingspreadsheetupdateComments:
                  refWrappingDataObject.CablingspreadsheetupdateComments,
                AccidentInformation: refWrappingDataObject.AccidentInformation,
                AccidentInformationComments:
                  refWrappingDataObject.AccidentInformationComments,
                Drivingforwsuggestion:
                  refWrappingDataObject.Drivingforwsuggestion,

                isDelete: data.isDelete,
                OperationalRes: data.OperationalResponsibilities
                  ? data.OperationalResponsibilities
                  : "",
                ReviewComments: data.InReviewComments,
                ActionPlan: data.ActionPlan,
                EffectiveCommunication: data.EffectiveCommunication,
                WrappingUp: data.WrappingUp,
                WrappingUpID: refWrappingDataObject.WrappingUpID,
                PlannerName: data.PlannerName,
                PlannerTime: data.PlannerSubmissionDateTime,
                SupervisorAssign: data.SupervisorAssign,
                PreCheckTime: data.PreCheckTime,
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

  // get Milestone item function
  const getMileStoneData = (responsibilityItem, responsibilityResponse) => {
    spweb.lists
      .getByTitle(`FQT_MileStone`)
      .items.top(5000)
      // .select("*","Title")
      // .expand("Title")
      .get()
      .then((Response: any[]) => {
        for (let i = 0; i < responsibilityItem.length; i++) {
          let tempArr = [];
          for (let j = 0; j < Response.length; j++) {
            if (responsibilityItem[i].Id == parseInt(Response[j].Title)) {
              tempArr.push(Response[j]);
            }
          }
          arrGenrator(
            responsibilityItem[i],
            tempArr,
            responsibilityResponse,
            i,
            responsibilityItem
          );
        }
      })
      .catch((err) => {
        console.log(err, "getMileStoneData");
      });
  };
  // arrgenrator function
  const arrGenrator = (
    plan,
    MilestoneItem,
    Response,
    index,
    responsibilityItem
  ) => {
    // console.log(plan);
    count++;
    let operationalData = Response.filter(
      (data) => plan.Id == data.TrackingNumberReferenceId
    );
    let operationalListObject =
      operationalData.length > 0 ? operationalData[0] : {};
    let handSBriefingConductedbyList = [];
    try {
      handSBriefingConductedbyList = operationalListObject
        ? operationalListObject.HandSBriefingConductedby?.map((e) => {
            return {
              Title: e.Title ? e.Title : "",
              EMail: e.EMail ? e.EMail : "",
              Id: e.Id,
            };
          })
        : [];
    } catch (e) {
      handSBriefingConductedbyList = [];
    }
    let Finalrackpositioncheckedby = [];
    try {
      Finalrackpositioncheckedby = operationalListObject
        ? operationalListObject.Finalrackpositioncheckedby?.map((e) => {
            return { EMail: e.EMail ? e.EMail : "", Id: e.Id };
          })
        : [];
    } catch (e) {
      Finalrackpositioncheckedby = [];
    }
    let CrewNameAuditCheckConductedBy = [];
    try {
      CrewNameAuditCheckConductedBy = operationalListObject
        ? operationalListObject.CrewNameAuditCheckConductedBy?.map((e) => {
            return { EMail: e.EMail ? e.EMail : "", Id: e.Id };
          })
        : [];
    } catch (e) {
      CrewNameAuditCheckConductedBy = [];
    }
    let TruckLoadAuditconductedby = [];
    try {
      TruckLoadAuditconductedby = operationalListObject
        ? operationalListObject.TruckLoadAuditconductedby?.map((e) => {
            return { EMail: e.Email ? e.Email : "", Id: e.Id };
          })
        : [];
    } catch (e) {
      TruckLoadAuditconductedby = [];
    }
    let Briefingconductedby = [];
    try {
      Briefingconductedby = operationalListObject
        ? operationalListObject.Briefingconductedby?.map((e) => {
            return { EMail: e.EMail ? e.EMail : "", Id: e.Id };
          })
        : [];
    } catch (e) {
      Briefingconductedby = [];
    }

    if (MilestoneItem.length > 0) {
      // console.log(MilestoneItem);
      MilestoneItem.forEach((item) => {
        globalPlanArr.push({
          Id: plan.Id,
          OperationalResponsId: operationalListObject.ID,
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
          drivingforwSuggestionComments: plan.drivingforwSuggestionComments,
          goodSaveName: plan.goodSaveName,
          safetyInitiativeName: plan.safetyInitiativeName,
          drivingforwSuggestionName: plan.drivingforwSuggestionName,
          wGCrewMemberData: plan.wGCrewMemberData,
          isDelete: plan.isDelete,
          CustomerFeedback: plan.CustomerFeedback,
          CustomerFeedbackComments: plan.CustomerFeedbackComments,
          ATCSupervvisorFeedback: plan.ATCSupervvisorFeedback,
          ATCSupervisorFeedbackComments: plan.ATCSupervisorFeedbackComments,
          ToolsOnChargeForNextDay: plan.ToolsOnChargeForNextDay,
          ToolsOnChargeForNextDayComments: plan.ToolsOnChargeForNextDayComments,
          VehicleIsCleanAndNotOnReserveFor:
            plan.VehicleIsCleanAndNotOnReserveFor,
          VehicleIsCleanAndNotOnReserveFor0:
            plan.VehicleIsCleanAndNotOnReserveFor0,
          PaperWorkCompletePlanningTeamUpd:
            plan.PaperWorkCompletePlanningTeamUpd,
          PaperWorkCompletePlanningTeamUpd0:
            plan.PaperWorkCompletePlanningTeamUpd0,
          Cablingspreadsheetupdate: plan.Cablingspreadsheetupdate,
          CablingspreadsheetupdateComments:
            plan.CablingspreadsheetupdateComments,
          AccidentInformation: plan.AccidentInformation,
          AccidentInformationComments: plan.AccidentInformationComments,
          Drivingforwsuggestion: plan.Drivingforwsuggestion,
          siteAccessdelay: operationalListObject.SiteAccessDelays
            ? operationalListObject.SiteAccessDelays
            : "",
          CrewNameAuditCheckConductedBy: CrewNameAuditCheckConductedBy
            ? CrewNameAuditCheckConductedBy
            : [],
          Finalrackpositioncheckedby: Finalrackpositioncheckedby
            ? Finalrackpositioncheckedby
            : [],
          siteAccessDelaysTime: operationalListObject.SiteAccessDelaysTime
            ? operationalListObject.SiteAccessDelaysTime
            : "",
          securityOrOtherdelays: operationalListObject.SecurityOrOtherDelays
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
          TruckSealBreak: operationalListObject.TruckSealBreak
            ? operationalListObject.TruckSealBreak
            : "",
          TruckSealBreakComments: operationalListObject.TruckSealBreakComments
            ? operationalListObject.TruckSealBreakComments
            : "",
          Truckdeparturedelays: operationalListObject.Truckdeparturedelays
            ? operationalListObject.Truckdeparturedelays
            : "",
          TruckdeparturedelaysTime:
            operationalListObject.TruckdeparturedelaysTime
              ? operationalListObject.TruckdeparturedelaysTime
              : "",
          TruckdeparturedelaysComments:
            operationalListObject.TruckdeparturedelaysComments
              ? operationalListObject.TruckdeparturedelaysComments
              : "",
          DCATsDelays: operationalListObject.DCATsDelays
            ? operationalListObject.DCATsDelays
            : "",
          DCATsDelaysTime: operationalListObject.DCATsDelaysTime
            ? operationalListObject.DCATsDelaysTime
            : "",
          DCATsDelaysComments: operationalListObject.DCATsDelaysComments
            ? operationalListObject.DCATsDelaysComments
            : "",
          VendorWGCrewdelays: operationalListObject.VendorWGCrewdelays
            ? operationalListObject.VendorWGCrewdelays
            : "",
          VendorWGCrewdelaysTime: operationalListObject.VendorWGCrewdelaysTime
            ? operationalListObject.VendorWGCrewdelaysTime
            : "",
          VendorWGCrewdelaysComments:
            operationalListObject.VendorWGCrewdelaysComments
              ? operationalListObject.VendorWGCrewdelaysComments
              : "",
          BANKSMANPresent: operationalListObject.BANKSMANPresent
            ? operationalListObject.BANKSMANPresent
            : "",
          BANKSMANPresentComments: operationalListObject.BANKSMANPresentComments
            ? operationalListObject.BANKSMANPresentComments
            : "",
          PhoneMediaUsage: operationalListObject.PhoneMediaUsage
            ? operationalListObject.PhoneMediaUsage
            : "",
          PhoneMediaUsageComments: operationalListObject.PhoneMediaUsageComments
            ? operationalListObject.PhoneMediaUsageComments
            : "",
          RestingOnFloor: operationalListObject.RestingOnFloor
            ? operationalListObject.RestingOnFloor
            : "",
          RestingOnFloorComments: operationalListObject.RestingOnFloorComments
            ? operationalListObject.RestingOnFloorComments
            : "",
          TruckArrival: operationalListObject.TruckArrival
            ? operationalListObject.TruckArrival
            : "",
          TruckArrivalLoadingbayComments:
            operationalListObject.TruckArrivalLoadingbayComments
              ? operationalListObject.TruckArrivalLoadingbayComments
              : "",
          TruckDeparture: operationalListObject.TruckDeparture
            ? operationalListObject.TruckDeparture
            : "",
          TruckdepartureLoadingbayComments:
            operationalListObject.TruckdepartureLoadingbayComments
              ? operationalListObject.TruckdepartureLoadingbayComments
              : "",
          RealtimeETAs: operationalListObject.RealtimeETAs
            ? operationalListObject.RealtimeETAs
            : "",
          RealtimeETAComments: operationalListObject.RealtimeETAComments
            ? operationalListObject.RealtimeETAComments
            : "",
          COLLOaccessissues: operationalListObject.COLLOaccessissues
            ? operationalListObject.COLLOaccessissues
            : "",
          COLLOaccessissuesTime: operationalListObject.COLLOaccessissuesTime
            ? operationalListObject.COLLOaccessissuesTime
            : "",
          COLLOaccessissuesComments:
            operationalListObject.COLLOaccessissuesComments
              ? operationalListObject.COLLOaccessissuesComments
              : "",
          Induction: operationalListObject.Induction
            ? operationalListObject.Induction
            : "",
          InductionComments: operationalListObject.InductionComments
            ? operationalListObject.InductionComments
            : "",
          STARTofoperationMSFTstaff:
            operationalListObject.STARTofoperationMSFTstaff
              ? operationalListObject.STARTofoperationMSFTstaff
              : "",
          STARTofoperationMSFTstaffComment:
            operationalListObject.STARTofoperationMSFTstaffComment
              ? operationalListObject.STARTofoperationMSFTstaffComment
              : "",
          SmartTeamdelegating: operationalListObject.SmartTeamdelegating
            ? operationalListObject.SmartTeamdelegating
            : "",
          SmartTeamdelegatingComments:
            operationalListObject.SmartTeamdelegatingComments
              ? operationalListObject.SmartTeamdelegatingComments
              : "",
          Rampsetup: operationalListObject.Rampsetup
            ? operationalListObject.Rampsetup
            : "",
          RampsetupComments: operationalListObject.RampsetupComments
            ? operationalListObject.RampsetupComments
            : "",
          LoadingBayPreparationofworkareae0:
            operationalListObject.LoadingBayPreparationofworkareae0
              ? operationalListObject.LoadingBayPreparationofworkareae0
              : "",
          LoadingBayPreparationofworkareae:
            operationalListObject.LoadingBayPreparationofworkareae
              ? operationalListObject.LoadingBayPreparationofworkareae
              : "",
          FINALcheckasperSOP_x2013_WGorDep0:
            operationalListObject.FINALcheckasperSOP_x2013_WGorDep0
              ? operationalListObject.FINALcheckasperSOP_x2013_WGorDep0
              : "",
          FINALcheckasperSOP_x2013_WGorDep:
            operationalListObject.FINALcheckasperSOP_x2013_WGorDep
              ? operationalListObject.FINALcheckasperSOP_x2013_WGorDep
              : "",
          DebrisSeparationOfPlasticMetal:
            operationalListObject.DebrisSeparationOfPlasticMetal
              ? operationalListObject.DebrisSeparationOfPlasticMetal
              : "",
          DebrisSeparationOfPlasticMetalCo:
            operationalListObject.DebrisSeparationOfPlasticMetalCo
              ? operationalListObject.DebrisSeparationOfPlasticMetalCo
              : "",
          DebrisCleanUpLoadingbay: operationalListObject.DebrisCleanUpLoadingbay
            ? operationalListObject.DebrisCleanUpLoadingbay
            : "",
          DebrisCleanUpLoadingbayComments:
            operationalListObject.DebrisCleanUpLoadingbayComments
              ? operationalListObject.DebrisCleanUpLoadingbayComments
              : "",
          JobCompletionConfirmation:
            operationalListObject.JobCompletionConfirmation
              ? operationalListObject.JobCompletionConfirmation
              : "",
          JobCompletionConfirmationComment:
            operationalListObject.JobCompletionConfirmationComment
              ? operationalListObject.JobCompletionConfirmationComment
              : "",
          SecondTruck: operationalListObject.SecondTruck
            ? operationalListObject.SecondTruck
            : "",
          SecondTruckArrivalDateTime:
            operationalListObject.SecondTruckArrivalDateTime
              ? operationalListObject.SecondTruckArrivalDateTime
              : "",
          SecondTruckArrivalDateTimeCommen:
            operationalListObject.SecondTruckArrivalDateTimeCommen
              ? operationalListObject.SecondTruckArrivalDateTimeCommen
              : "",
          SecondTruckDepartureDateTime:
            operationalListObject.SecondTruckDepartureDateTime
              ? operationalListObject.SecondTruckDepartureDateTime
              : "",
          SecondTruckDepartureDateTimeComm:
            operationalListObject.SecondTruckDepartureDateTimeComm
              ? operationalListObject.SecondTruckDepartureDateTimeComm
              : "",
          Team1LoadingBay: operationalListObject.Team1LoadingBay
            ? operationalListObject.Team1LoadingBay
            : false,
          Team2Rackpushing0toCOLLO:
            operationalListObject.Team2Rackpushing0toCOLLO
              ? operationalListObject.Team2Rackpushing0toCOLLO
              : false,
          ThirdTruck: operationalListObject.ThirdTruck
            ? operationalListObject.ThirdTruck
            : "",
          ThirdTruckArrivalDateTime:
            operationalListObject.ThirdTruckArrivalDateTime
              ? operationalListObject.ThirdTruckArrivalDateTime
              : "",
          ThirdTruckArrivalDateTimeComment:
            operationalListObject.ThirdTruckArrivalDateTimeComment
              ? operationalListObject.ThirdTruckArrivalDateTimeComment
              : "",
          ThirdTruckDepartureDateTime:
            operationalListObject.ThirdTruckDepartureDateTime
              ? operationalListObject.ThirdTruckDepartureDateTime
              : "",
          ThirdTruckDepartureDateTimeComme:
            operationalListObject.ThirdTruckDepartureDateTimeComme
              ? operationalListObject.ThirdTruckDepartureDateTimeComme
              : "",
          SiteAccessDelays: operationalListObject.SiteAccessDelays
            ? operationalListObject.SiteAccessDelays
            : "",
          SiteAccessDelaysTime: operationalListObject.SiteAccessDelaysTime
            ? operationalListObject.SiteAccessDelaysTime
            : "",
          SiteAccessDelaysComments:
            operationalListObject.SiteAccessDelaysComments
              ? operationalListObject.SiteAccessDelaysComments
              : "",
          SecurityOrOtherDelays: operationalListObject.SecurityOrOtherDelays
            ? operationalListObject.SecurityOrOtherDelays
            : "",
          SecurityorotherdelaysTime:
            operationalListObject.SecurityorotherdelaysTime
              ? operationalListObject.SecurityorotherdelaysTime
              : "",
          SecurityOrOtherDelaysComments:
            operationalListObject.SecurityOrOtherDelaysComments
              ? operationalListObject.SecurityOrOtherDelaysComments
              : "",
          FinalPositionCheckRacksFibres:
            operationalListObject.FinalPositionCheckRacksFibres
              ? operationalListObject.FinalPositionCheckRacksFibres
              : "",
          FinalPositionCheckRacksFibresCom:
            operationalListObject.FinalPositionCheckRacksFibresCom
              ? operationalListObject.FinalPositionCheckRacksFibresCom
              : "",
          // Finalrackpositioncheckedby:
          //   operationalListObject.Finalrackpositioncheckedby
          //     ? operationalListObject.Finalrackpositioncheckedby
          //     : "",
          FinalrackpositioncheckedbyCommen:
            operationalListObject.FinalrackpositioncheckedbyCommen
              ? operationalListObject.FinalrackpositioncheckedbyCommen
              : "",
          RackScanningbyAWSBBonSite:
            operationalListObject.RackScanningbyAWSBBonSite
              ? operationalListObject.RackScanningbyAWSBBonSite
              : "",
          RackScanningbyAWSBBonSiteComment:
            operationalListObject.RackScanningbyAWSBBonSiteComment
              ? operationalListObject.RackScanningbyAWSBBonSiteComment
              : "",
          AssetMismatch: operationalListObject.AssetMismatch
            ? operationalListObject.AssetMismatch
            : "",
          AssetMismatchComments: operationalListObject.AssetMismatchComments
            ? operationalListObject.AssetMismatchComments
            : "",
          RackInspectionwgteamleadOnly:
            operationalListObject.RackInspectionwgteamleadOnly
              ? operationalListObject.RackInspectionwgteamleadOnly
              : "",
          RackInspectionwgteamleadOnlyComm:
            operationalListObject.RackInspectionwgteamleadOnlyComm
              ? operationalListObject.RackInspectionwgteamleadOnlyComm
              : "",
          ConfirmIRISHCheckWithSiteReprese:
            operationalListObject.ConfirmIRISHCheckWithSiteReprese
              ? operationalListObject.ConfirmIRISHCheckWithSiteReprese
              : "",
          ConfirmIRISHCheckWithSiteReprese0:
            operationalListObject.ConfirmIRISHCheckWithSiteReprese0
              ? operationalListObject.ConfirmIRISHCheckWithSiteReprese0
              : "",
          MatchRackStickerPosition:
            operationalListObject.MatchRackStickerPosition
              ? operationalListObject.MatchRackStickerPosition
              : "",
          MatchRackStickerPositionComments:
            operationalListObject.MatchRackStickerPositionComments
              ? operationalListObject.MatchRackStickerPositionComments
              : "",
          CompleteStriderPosition: operationalListObject.CompleteStriderPosition
            ? operationalListObject.CompleteStriderPosition
            : "",
          CompleteStriderPositionComments:
            operationalListObject.CompleteStriderPositionComments
              ? operationalListObject.CompleteStriderPositionComments
              : "",
          FinishCabling: operationalListObject.FinishCabling
            ? operationalListObject.FinishCabling
            : "",
          FinishCablingComments: operationalListObject.FinishCablingComments
            ? operationalListObject.FinishCablingComments
            : "",
          FinalAuditCheckAsPerSOP: operationalListObject.FinalAuditCheckAsPerSOP
            ? operationalListObject.FinalAuditCheckAsPerSOP
            : "",
          FinalAuditCheckAsPerSOPComments:
            operationalListObject.FinalAuditCheckAsPerSOPComments
              ? operationalListObject.FinalAuditCheckAsPerSOPComments
              : "",
          CrewNameAuditCheckConductedByCom:
            operationalListObject.CrewNameAuditCheckConductedByCom
              ? operationalListObject.CrewNameAuditCheckConductedByCom
              : "",
          WalkthroughSUPERVISOROnly:
            operationalListObject.WalkthroughSUPERVISOROnly
              ? operationalListObject.WalkthroughSUPERVISOROnly
              : "",
          WalkthroughSUPERVISOROnlyComment:
            operationalListObject.WalkthroughSUPERVISOROnlyComment
              ? operationalListObject.WalkthroughSUPERVISOROnlyComment
              : "",
          Briefingconductedby: Briefingconductedby,
          STARTofoperationoperationToCheck:
            operationalListObject.STARTofoperationoperationToCheck
              ? operationalListObject.STARTofoperationoperationToCheck
              : "",
          STARTofoperationoperationToCheck0:
            operationalListObject.STARTofoperationoperationToCheck0
              ? operationalListObject.STARTofoperationoperationToCheck0
              : "",
          Preparationofequipment: operationalListObject.Preparationofequipment
            ? operationalListObject.Preparationofequipment
            : "",
          Preparationofequipmentomments:
            operationalListObject.Preparationofequipmentomments
              ? operationalListObject.Preparationofequipmentomments
              : "",
          EnsureSafeEnvironment: operationalListObject.EnsureSafeEnvironment
            ? operationalListObject.EnsureSafeEnvironment
            : "",
          EnsureSafeEnvironmentComments:
            operationalListObject.EnsureSafeEnvironmentComments
              ? operationalListObject.EnsureSafeEnvironmentComments
              : "",
          RemovingRacksfromDH: operationalListObject.RemovingRacksfromDH
            ? operationalListObject.RemovingRacksfromDH
            : "",
          RemovingRacksfromDHComments:
            operationalListObject.RemovingRacksfromDHComments
              ? operationalListObject.RemovingRacksfromDHComments
              : "",
          ContactwithAWSDecomTeam: operationalListObject.ContactwithAWSDecomTeam
            ? operationalListObject.ContactwithAWSDecomTeam
            : "",
          AssetandsealNocheck: operationalListObject.AssetandsealNocheck
            ? operationalListObject.AssetandsealNocheck
            : "",
          DCSMConfirmBFRackMovement:
            operationalListObject.DCSMConfirmBFRackMovement
              ? operationalListObject.DCSMConfirmBFRackMovement
              : "",
          Teamsplitting: operationalListObject.Teamsplitting
            ? operationalListObject.Teamsplitting
            : "",
          TeamsplittingComments: operationalListObject.TeamsplittingComments
            ? operationalListObject.TeamsplittingComments
            : "",
          TeamTask: operationalListObject.TeamTask
            ? operationalListObject.TeamTask
            : "",
          TeamTaskComments: operationalListObject.TeamTaskComments
            ? operationalListObject.TeamTaskComments
            : "",
          TruckSealingAndLocking: operationalListObject.TruckSealingAndLocking
            ? operationalListObject.TruckSealingAndLocking
            : "",
          TruckSealingAndLockingComments:
            operationalListObject.TruckSealingAndLockingComments
              ? operationalListObject.TruckSealingAndLockingComments
              : "",
          RealtimepostingonJob: operationalListObject.RealtimepostingonJob
            ? operationalListObject.RealtimepostingonJob
            : "",
          RealtimepostingonJobComments:
            operationalListObject.RealtimepostingonJobComments
              ? operationalListObject.RealtimepostingonJobComments
              : "",
          TruckparkingonLoadingbay:
            operationalListObject.TruckparkingonLoadingbay
              ? operationalListObject.TruckparkingonLoadingbay
              : "",
          TruckparkingonLoadingbayComments:
            operationalListObject.TruckparkingonLoadingbayComments
              ? operationalListObject.TruckparkingonLoadingbayComments
              : "",
          BriefingAndTaskbifurcation:
            operationalListObject.BriefingAndTaskbifurcation
              ? operationalListObject.BriefingAndTaskbifurcation
              : "",
          BriefingAndTaskbifurcationCommen:
            operationalListObject.BriefingAndTaskbifurcationCommen
              ? operationalListObject.BriefingAndTaskbifurcationCommen
              : "",
          Team1: operationalListObject.Team1 ? operationalListObject.Team1 : "",
          Team2: operationalListObject.Team2 ? operationalListObject.Team2 : "",
          Team3: operationalListObject.Team3 ? operationalListObject.Team3 : "",
          TruckLoadAuditconductedby: TruckLoadAuditconductedby,

          handSBriefingConductedby: handSBriefingConductedbyList
            ? handSBriefingConductedbyList
            : [],
          OperationalRes: plan.OperationalRes,
          ReviewComments: plan.InReviewComments,
          ActionPlan: plan.ActionPlan,
          EffectiveCommunication: plan.EffectiveCommunication,
          WrappingUp: plan.WrappingUp,
          WrappingUpID: plan.WrappingUpID,
          // Milestone datas
          MilestoneSiteCode: item.SiteCode ? item.SiteCode : "-",
          Escalation: item.Mile_Escalation ? "Yes" : "No",
          EscalationType: item.EscalationType ? item.EscalationType : "-",
          EscalationTime: item.isMile_EscalationTime
            ? item.isMile_EscalationTime
            : "-",
          MileStatus: item.StatusMileStone ? item.StatusMileStone : "-",
          MileStatusTime: item.StatusMileStoneTime
            ? item.StatusMileStoneTime.split(" ")[1]
            : "-",
          EscalationDescription: item.OthersEscalationType
            ? item.OthersEscalationType
            : "-",
          incompleteType: item.IncompletionJobType
            ? item.IncompletionJobType
            : "-",
          jobCancelType: item.JobCancelType ? item.JobCancelType : "-",
          SupervisorSts: item.Mile_Supervisor ? item.Mile_Supervisor : "-",
          SupervisorTiem: item.Mile_SupervisorDateTime
            ? item.Mile_SupervisorDateTime
            : "-",
          WGCrewSts: item.Mile_Wgcrew ? item.Mile_Wgcrew : "-",
          WGCrewTime: item.Mile_WgcrewDateTime ? item.Mile_WgcrewDateTime : "-",
          Truck1Sts: item.Mile_Truck1 ? item.Mile_Truck1 : "-",
          Truck1Time: item.Mile_Truck1Json ? item.Mile_Truck1Json : "-",
          Truck2Sts: item.Mile_Truck2 ? item.Mile_Truck2 : "-",
          Truck2Time: item.Mile_Truck2Json ? item.Mile_Truck2Json : "-",
          Truck3Sts: item.Mile_Truck3 ? item.Mile_Truck3 : "-",
          Truck3Time: item.Mile_Truck3Json ? item.Mile_Truck3Json : "-",
          SafetyWalkSts: item.Mile_MicrosoftRms ? item.Mile_MicrosoftRms : "-",
          SafetyWalkTime: item.Mile_MicrosoftRmsJson
            ? item.Mile_MicrosoftRmsJson
            : "-",
          EscalationOwner: item.EscalationOwner ? item.EscalationOwner : "-",
          AccessTracker: item.AccessTracker ? item.AccessTracker : "-",
          PlannerName: plan.PlannerName,
          PlannerTime: plan.PlannerTime,
          SupervisorAssign: plan.SupervisorAssign,
          PreCheckTime: plan.PreCheckTime,
        });
      });
    } else {
      // console.log(MilestoneItem);
      globalPlanArr.push({
        Id: plan.Id,
        OperationalResponsId: operationalListObject.ID,
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
        drivingforwSuggestionComments: plan.drivingforwSuggestionComments,
        goodSaveName: plan.goodSaveName,
        safetyInitiativeName: plan.safetyInitiativeName,
        drivingforwSuggestionName: plan.drivingforwSuggestionName,
        wGCrewMemberData: plan.wGCrewMemberData,
        isDelete: plan.isDelete,
        CustomerFeedback: plan.CustomerFeedback,
        CustomerFeedbackComments: plan.CustomerFeedbackComments,
        ATCSupervvisorFeedback: plan.ATCSupervvisorFeedback,
        ATCSupervisorFeedbackComments: plan.ATCSupervisorFeedbackComments,
        ToolsOnChargeForNextDay: plan.ToolsOnChargeForNextDay,
        ToolsOnChargeForNextDayComments: plan.ToolsOnChargeForNextDayComments,
        VehicleIsCleanAndNotOnReserveFor: plan.VehicleIsCleanAndNotOnReserveFor,
        VehicleIsCleanAndNotOnReserveFor0:
          plan.VehicleIsCleanAndNotOnReserveFor0,
        PaperWorkCompletePlanningTeamUpd: plan.PaperWorkCompletePlanningTeamUpd,
        PaperWorkCompletePlanningTeamUpd0:
          plan.PaperWorkCompletePlanningTeamUpd0,
        Cablingspreadsheetupdate: plan.Cablingspreadsheetupdate,
        CablingspreadsheetupdateComments: plan.CablingspreadsheetupdateComments,
        AccidentInformation: plan.AccidentInformation,
        AccidentInformationComments: plan.AccidentInformationComments,
        Drivingforwsuggestion: plan.Drivingforwsuggestion,
        siteAccessdelay: operationalListObject.SiteAccessDelays
          ? operationalListObject.SiteAccessDelays
          : "",
        CrewNameAuditCheckConductedBy: CrewNameAuditCheckConductedBy
          ? CrewNameAuditCheckConductedBy
          : [],
        Finalrackpositioncheckedby: Finalrackpositioncheckedby
          ? Finalrackpositioncheckedby
          : [],
        siteAccessDelaysTime: operationalListObject.SiteAccessDelaysTime
          ? operationalListObject.SiteAccessDelaysTime
          : "",
        securityOrOtherdelays: operationalListObject.SecurityOrOtherDelays
          ? operationalListObject.SecurityOrOtherDelays
          : "",
        securityorotherdelaysTime:
          operationalListObject.SecurityorotherdelaysTime
            ? operationalListObject.SecurityorotherdelaysTime
            : "",
        full5PPE: operationalListObject.Full5PPE
          ? operationalListObject.Full5PPE
          : "",
        siteAccessDelaysComments: operationalListObject.SiteAccessDelaysComments
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
        TruckSealBreak: operationalListObject.TruckSealBreak
          ? operationalListObject.TruckSealBreak
          : "",
        TruckSealBreakComments: operationalListObject.TruckSealBreakComments
          ? operationalListObject.TruckSealBreakComments
          : "",
        Truckdeparturedelays: operationalListObject.Truckdeparturedelays
          ? operationalListObject.Truckdeparturedelays
          : "",
        TruckdeparturedelaysTime: operationalListObject.TruckdeparturedelaysTime
          ? operationalListObject.TruckdeparturedelaysTime
          : "",
        TruckdeparturedelaysComments:
          operationalListObject.TruckdeparturedelaysComments
            ? operationalListObject.TruckdeparturedelaysComments
            : "",
        DCATsDelays: operationalListObject.DCATsDelays
          ? operationalListObject.DCATsDelays
          : "",
        DCATsDelaysTime: operationalListObject.DCATsDelaysTime
          ? operationalListObject.DCATsDelaysTime
          : "",
        DCATsDelaysComments: operationalListObject.DCATsDelaysComments
          ? operationalListObject.DCATsDelaysComments
          : "",
        VendorWGCrewdelays: operationalListObject.VendorWGCrewdelays
          ? operationalListObject.VendorWGCrewdelays
          : "",
        VendorWGCrewdelaysTime: operationalListObject.VendorWGCrewdelaysTime
          ? operationalListObject.VendorWGCrewdelaysTime
          : "",
        VendorWGCrewdelaysComments:
          operationalListObject.VendorWGCrewdelaysComments
            ? operationalListObject.VendorWGCrewdelaysComments
            : "",
        BANKSMANPresent: operationalListObject.BANKSMANPresent
          ? operationalListObject.BANKSMANPresent
          : "",
        BANKSMANPresentComments: operationalListObject.BANKSMANPresentComments
          ? operationalListObject.BANKSMANPresentComments
          : "",
        PhoneMediaUsage: operationalListObject.PhoneMediaUsage
          ? operationalListObject.PhoneMediaUsage
          : "",
        PhoneMediaUsageComments: operationalListObject.PhoneMediaUsageComments
          ? operationalListObject.PhoneMediaUsageComments
          : "",
        RestingOnFloor: operationalListObject.RestingOnFloor
          ? operationalListObject.RestingOnFloor
          : "",
        RestingOnFloorComments: operationalListObject.RestingOnFloorComments
          ? operationalListObject.RestingOnFloorComments
          : "",
        TruckArrival: operationalListObject.TruckArrival
          ? operationalListObject.TruckArrival
          : "",
        TruckArrivalLoadingbayComments:
          operationalListObject.TruckArrivalLoadingbayComments
            ? operationalListObject.TruckArrivalLoadingbayComments
            : "",
        TruckDeparture: operationalListObject.TruckDeparture
          ? operationalListObject.TruckDeparture
          : "",
        TruckdepartureLoadingbayComments:
          operationalListObject.TruckdepartureLoadingbayComments
            ? operationalListObject.TruckdepartureLoadingbayComments
            : "",
        RealtimeETAs: operationalListObject.RealtimeETAs
          ? operationalListObject.RealtimeETAs
          : "",
        RealtimeETAComments: operationalListObject.RealtimeETAComments
          ? operationalListObject.RealtimeETAComments
          : "",
        COLLOaccessissues: operationalListObject.COLLOaccessissues
          ? operationalListObject.COLLOaccessissues
          : "",
        COLLOaccessissuesTime: operationalListObject.COLLOaccessissuesTime
          ? operationalListObject.COLLOaccessissuesTime
          : "",
        COLLOaccessissuesComments:
          operationalListObject.COLLOaccessissuesComments
            ? operationalListObject.COLLOaccessissuesComments
            : "",
        Induction: operationalListObject.Induction
          ? operationalListObject.Induction
          : "",
        InductionComments: operationalListObject.InductionComments
          ? operationalListObject.InductionComments
          : "",
        STARTofoperationMSFTstaff:
          operationalListObject.STARTofoperationMSFTstaff
            ? operationalListObject.STARTofoperationMSFTstaff
            : "",
        STARTofoperationMSFTstaffComment:
          operationalListObject.STARTofoperationMSFTstaffComment
            ? operationalListObject.STARTofoperationMSFTstaffComment
            : "",
        SmartTeamdelegating: operationalListObject.SmartTeamdelegating
          ? operationalListObject.SmartTeamdelegating
          : "",
        SmartTeamdelegatingComments:
          operationalListObject.SmartTeamdelegatingComments
            ? operationalListObject.SmartTeamdelegatingComments
            : "",
        Rampsetup: operationalListObject.Rampsetup
          ? operationalListObject.Rampsetup
          : "",
        RampsetupComments: operationalListObject.RampsetupComments
          ? operationalListObject.RampsetupComments
          : "",
        LoadingBayPreparationofworkareae0:
          operationalListObject.LoadingBayPreparationofworkareae0
            ? operationalListObject.LoadingBayPreparationofworkareae0
            : "",
        LoadingBayPreparationofworkareae:
          operationalListObject.LoadingBayPreparationofworkareae
            ? operationalListObject.LoadingBayPreparationofworkareae
            : "",
        FINALcheckasperSOP_x2013_WGorDep0:
          operationalListObject.FINALcheckasperSOP_x2013_WGorDep0
            ? operationalListObject.FINALcheckasperSOP_x2013_WGorDep0
            : "",
        FINALcheckasperSOP_x2013_WGorDep:
          operationalListObject.FINALcheckasperSOP_x2013_WGorDep
            ? operationalListObject.FINALcheckasperSOP_x2013_WGorDep
            : "",
        DebrisSeparationOfPlasticMetal:
          operationalListObject.DebrisSeparationOfPlasticMetal
            ? operationalListObject.DebrisSeparationOfPlasticMetal
            : "",
        DebrisSeparationOfPlasticMetalCo:
          operationalListObject.DebrisSeparationOfPlasticMetalCo
            ? operationalListObject.DebrisSeparationOfPlasticMetalCo
            : "",
        DebrisCleanUpLoadingbay: operationalListObject.DebrisCleanUpLoadingbay
          ? operationalListObject.DebrisCleanUpLoadingbay
          : "",
        DebrisCleanUpLoadingbayComments:
          operationalListObject.DebrisCleanUpLoadingbayComments
            ? operationalListObject.DebrisCleanUpLoadingbayComments
            : "",
        JobCompletionConfirmation:
          operationalListObject.JobCompletionConfirmation
            ? operationalListObject.JobCompletionConfirmation
            : "",
        JobCompletionConfirmationComment:
          operationalListObject.JobCompletionConfirmationComment
            ? operationalListObject.JobCompletionConfirmationComment
            : "",
        SecondTruck: operationalListObject.SecondTruck
          ? operationalListObject.SecondTruck
          : "",
        SecondTruckArrivalDateTime:
          operationalListObject.SecondTruckArrivalDateTime
            ? operationalListObject.SecondTruckArrivalDateTime
            : "",
        SecondTruckArrivalDateTimeCommen:
          operationalListObject.SecondTruckArrivalDateTimeCommen
            ? operationalListObject.SecondTruckArrivalDateTimeCommen
            : "",
        SecondTruckDepartureDateTime:
          operationalListObject.SecondTruckDepartureDateTime
            ? operationalListObject.SecondTruckDepartureDateTime
            : "",
        SecondTruckDepartureDateTimeComm:
          operationalListObject.SecondTruckDepartureDateTimeComm
            ? operationalListObject.SecondTruckDepartureDateTimeComm
            : "",
        Team1LoadingBay: operationalListObject.Team1LoadingBay
          ? operationalListObject.Team1LoadingBay
          : false,
        Team2Rackpushing0toCOLLO: operationalListObject.Team2Rackpushing0toCOLLO
          ? operationalListObject.Team2Rackpushing0toCOLLO
          : false,
        ThirdTruck: operationalListObject.ThirdTruck
          ? operationalListObject.ThirdTruck
          : "",
        ThirdTruckArrivalDateTime:
          operationalListObject.ThirdTruckArrivalDateTime
            ? operationalListObject.ThirdTruckArrivalDateTime
            : "",
        ThirdTruckArrivalDateTimeComment:
          operationalListObject.ThirdTruckArrivalDateTimeComment
            ? operationalListObject.ThirdTruckArrivalDateTimeComment
            : "",
        ThirdTruckDepartureDateTime:
          operationalListObject.ThirdTruckDepartureDateTime
            ? operationalListObject.ThirdTruckDepartureDateTime
            : "",
        ThirdTruckDepartureDateTimeComme:
          operationalListObject.ThirdTruckDepartureDateTimeComme
            ? operationalListObject.ThirdTruckDepartureDateTimeComme
            : "",
        SiteAccessDelays: operationalListObject.SiteAccessDelays
          ? operationalListObject.SiteAccessDelays
          : "",
        SiteAccessDelaysTime: operationalListObject.SiteAccessDelaysTime
          ? operationalListObject.SiteAccessDelaysTime
          : "",
        SiteAccessDelaysComments: operationalListObject.SiteAccessDelaysComments
          ? operationalListObject.SiteAccessDelaysComments
          : "",
        SecurityOrOtherDelays: operationalListObject.SecurityOrOtherDelays
          ? operationalListObject.SecurityOrOtherDelays
          : "",
        SecurityorotherdelaysTime:
          operationalListObject.SecurityorotherdelaysTime
            ? operationalListObject.SecurityorotherdelaysTime
            : "",
        SecurityOrOtherDelaysComments:
          operationalListObject.SecurityOrOtherDelaysComments
            ? operationalListObject.SecurityOrOtherDelaysComments
            : "",
        FinalPositionCheckRacksFibres:
          operationalListObject.FinalPositionCheckRacksFibres
            ? operationalListObject.FinalPositionCheckRacksFibres
            : "",
        FinalPositionCheckRacksFibresCom:
          operationalListObject.FinalPositionCheckRacksFibresCom
            ? operationalListObject.FinalPositionCheckRacksFibresCom
            : "",
        // Finalrackpositioncheckedby:
        //   operationalListObject.Finalrackpositioncheckedby
        //     ? operationalListObject.Finalrackpositioncheckedby
        //     : "",
        FinalrackpositioncheckedbyCommen:
          operationalListObject.FinalrackpositioncheckedbyCommen
            ? operationalListObject.FinalrackpositioncheckedbyCommen
            : "",
        RackScanningbyAWSBBonSite:
          operationalListObject.RackScanningbyAWSBBonSite
            ? operationalListObject.RackScanningbyAWSBBonSite
            : "",
        RackScanningbyAWSBBonSiteComment:
          operationalListObject.RackScanningbyAWSBBonSiteComment
            ? operationalListObject.RackScanningbyAWSBBonSiteComment
            : "",
        AssetMismatch: operationalListObject.AssetMismatch
          ? operationalListObject.AssetMismatch
          : "",
        AssetMismatchComments: operationalListObject.AssetMismatchComments
          ? operationalListObject.AssetMismatchComments
          : "",
        RackInspectionwgteamleadOnly:
          operationalListObject.RackInspectionwgteamleadOnly
            ? operationalListObject.RackInspectionwgteamleadOnly
            : "",
        RackInspectionwgteamleadOnlyComm:
          operationalListObject.RackInspectionwgteamleadOnlyComm
            ? operationalListObject.RackInspectionwgteamleadOnlyComm
            : "",
        ConfirmIRISHCheckWithSiteReprese:
          operationalListObject.ConfirmIRISHCheckWithSiteReprese
            ? operationalListObject.ConfirmIRISHCheckWithSiteReprese
            : "",
        ConfirmIRISHCheckWithSiteReprese0:
          operationalListObject.ConfirmIRISHCheckWithSiteReprese0
            ? operationalListObject.ConfirmIRISHCheckWithSiteReprese0
            : "",
        MatchRackStickerPosition: operationalListObject.MatchRackStickerPosition
          ? operationalListObject.MatchRackStickerPosition
          : "",
        MatchRackStickerPositionComments:
          operationalListObject.MatchRackStickerPositionComments
            ? operationalListObject.MatchRackStickerPositionComments
            : "",
        CompleteStriderPosition: operationalListObject.CompleteStriderPosition
          ? operationalListObject.CompleteStriderPosition
          : "",
        CompleteStriderPositionComments:
          operationalListObject.CompleteStriderPositionComments
            ? operationalListObject.CompleteStriderPositionComments
            : "",
        FinishCabling: operationalListObject.FinishCabling
          ? operationalListObject.FinishCabling
          : "",
        FinishCablingComments: operationalListObject.FinishCablingComments
          ? operationalListObject.FinishCablingComments
          : "",
        FinalAuditCheckAsPerSOP: operationalListObject.FinalAuditCheckAsPerSOP
          ? operationalListObject.FinalAuditCheckAsPerSOP
          : "",
        FinalAuditCheckAsPerSOPComments:
          operationalListObject.FinalAuditCheckAsPerSOPComments
            ? operationalListObject.FinalAuditCheckAsPerSOPComments
            : "",
        CrewNameAuditCheckConductedByCom:
          operationalListObject.CrewNameAuditCheckConductedByCom
            ? operationalListObject.CrewNameAuditCheckConductedByCom
            : "",
        WalkthroughSUPERVISOROnly:
          operationalListObject.WalkthroughSUPERVISOROnly
            ? operationalListObject.WalkthroughSUPERVISOROnly
            : "",
        WalkthroughSUPERVISOROnlyComment:
          operationalListObject.WalkthroughSUPERVISOROnlyComment
            ? operationalListObject.WalkthroughSUPERVISOROnlyComment
            : "",
        Briefingconductedby: Briefingconductedby,
        STARTofoperationoperationToCheck:
          operationalListObject.STARTofoperationoperationToCheck
            ? operationalListObject.STARTofoperationoperationToCheck
            : "",
        STARTofoperationoperationToCheck0:
          operationalListObject.STARTofoperationoperationToCheck0
            ? operationalListObject.STARTofoperationoperationToCheck0
            : "",
        Preparationofequipment: operationalListObject.Preparationofequipment
          ? operationalListObject.Preparationofequipment
          : "",
        Preparationofequipmentomments:
          operationalListObject.Preparationofequipmentomments
            ? operationalListObject.Preparationofequipmentomments
            : "",
        EnsureSafeEnvironment: operationalListObject.EnsureSafeEnvironment
          ? operationalListObject.EnsureSafeEnvironment
          : "",
        EnsureSafeEnvironmentComments:
          operationalListObject.EnsureSafeEnvironmentComments
            ? operationalListObject.EnsureSafeEnvironmentComments
            : "",
        RemovingRacksfromDH: operationalListObject.RemovingRacksfromDH
          ? operationalListObject.RemovingRacksfromDH
          : "",
        RemovingRacksfromDHComments:
          operationalListObject.RemovingRacksfromDHComments
            ? operationalListObject.RemovingRacksfromDHComments
            : "",
        ContactwithAWSDecomTeam: operationalListObject.ContactwithAWSDecomTeam
          ? operationalListObject.ContactwithAWSDecomTeam
          : "",
        AssetandsealNocheck: operationalListObject.AssetandsealNocheck
          ? operationalListObject.AssetandsealNocheck
          : "",
        DCSMConfirmBFRackMovement:
          operationalListObject.DCSMConfirmBFRackMovement
            ? operationalListObject.DCSMConfirmBFRackMovement
            : "",
        Teamsplitting: operationalListObject.Teamsplitting
          ? operationalListObject.Teamsplitting
          : "",
        TeamsplittingComments: operationalListObject.TeamsplittingComments
          ? operationalListObject.TeamsplittingComments
          : "",
        TeamTask: operationalListObject.TeamTask
          ? operationalListObject.TeamTask
          : "",
        TeamTaskComments: operationalListObject.TeamTaskComments
          ? operationalListObject.TeamTaskComments
          : "",
        TruckSealingAndLocking: operationalListObject.TruckSealingAndLocking
          ? operationalListObject.TruckSealingAndLocking
          : "",
        TruckSealingAndLockingComments:
          operationalListObject.TruckSealingAndLockingComments
            ? operationalListObject.TruckSealingAndLockingComments
            : "",
        RealtimepostingonJob: operationalListObject.RealtimepostingonJob
          ? operationalListObject.RealtimepostingonJob
          : "",
        RealtimepostingonJobComments:
          operationalListObject.RealtimepostingonJobComments
            ? operationalListObject.RealtimepostingonJobComments
            : "",
        TruckparkingonLoadingbay: operationalListObject.TruckparkingonLoadingbay
          ? operationalListObject.TruckparkingonLoadingbay
          : "",
        TruckparkingonLoadingbayComments:
          operationalListObject.TruckparkingonLoadingbayComments
            ? operationalListObject.TruckparkingonLoadingbayComments
            : "",
        BriefingAndTaskbifurcation:
          operationalListObject.BriefingAndTaskbifurcation
            ? operationalListObject.BriefingAndTaskbifurcation
            : "",
        BriefingAndTaskbifurcationCommen:
          operationalListObject.BriefingAndTaskbifurcationCommen
            ? operationalListObject.BriefingAndTaskbifurcationCommen
            : "",
        Team1: operationalListObject.Team1 ? operationalListObject.Team1 : "",
        Team2: operationalListObject.Team2 ? operationalListObject.Team2 : "",
        Team3: operationalListObject.Team3 ? operationalListObject.Team3 : "",
        TruckLoadAuditconductedby: TruckLoadAuditconductedby,

        handSBriefingConductedby: handSBriefingConductedbyList
          ? handSBriefingConductedbyList
          : [],
        OperationalRes: plan.OperationalRes,
        ReviewComments: plan.InReviewComments,
        ActionPlan: plan.ActionPlan,
        EffectiveCommunication: plan.EffectiveCommunication,
        WrappingUp: plan.WrappingUp,
        WrappingUpID: plan.WrappingUpID,
        // Milestone datas
        MilestoneSiteCode: "-",
        Escalation: "-",
        EscalationType: "-",
        EscalationDescription: "-",
        EscalationTime: "-",
        MileStatus: "-",
        MileStatusTime: "-",
        incompleteType: "-",
        jobCancelType: "-",
        SupervisorSts: "-",
        SupervisorTiem: "-",
        WGCrewSts: "-",
        WGCrewTime: "-",
        Truck1Sts: "-",
        Truck1Time: "-",
        Truck2Sts: "-",
        Truck2Time: "-",
        Truck3Sts: "-",
        Truck3Time: "-",
        SafetyWalkSts: "-",
        SafetyWalkTime: "-",
        EscalationOwner: "-",
        AccessTracker: "-",
        PlannerName: plan.PlannerName,
        PlannerTime: plan.PlannerTime,
        SupervisorAssign: plan.SupervisorAssign,
        PreCheckTime: plan.PreCheckTime,
      });
    }
    // console.log(index, responsibilityItem.length - 1);
    if (index == responsibilityItem.length - 1) {
      getEffectivedata();
      getactionplan();
      globalPlanArr = globalPlanArr.sort(function (a, b) {
        return moment(a.deleteDate) > moment(b.deleteDate)
          ? -1
          : moment(a.deleteDate) < moment(b.deleteDate)
          ? 1
          : 0;
      });
      if (loggedinuser == "davor.salkanovic@atc-logistics.de") {
        // let onlyMobilizationYes = responsibilityData.filter(
        //   (yes) => yes.mobilization == "Yes"
        // );
        globalPlanArr.forEach(async (data) => {
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
        filterFunction(FilterKey, onlyMobilizationYes);
        // setDisplayData([...onlyMobilizationYes]);
        // setExportExcel([...onlyMobilizationYes]);
        // paginateFunction(1, [...onlyMobilizationYes]);
        setLoader(false);
      } else {
        setMasterData([...globalPlanArr]);
        setDuplicateData([...globalPlanArr]);
        filterFunction(FilterKey, globalPlanArr);

        // setDisplayData([...responsibilityData]);
        // setExportExcel([...responsibilityData]);
        // paginateFunction(1, [...responsibilityData]);
        allFilterOptions(globalPlanArr);
        setLoader(false);
      }
    }
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
        onlyMobilizationYes = [];
        if (Response.length > 0) {
          Response.forEach((data) => {
            wrappingData.push({
              WrappingUpID: data.ID,
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
              ToolsOnChargeForNextDay: data.ToolsOnChargeForNextDay
                ? data.ToolsOnChargeForNextDay
                : "",
              ToolsOnChargeForNextDayComments:
                data.ToolsOnChargeForNextDayComments
                  ? data.ToolsOnChargeForNextDayComments
                  : "",
              VehicleIsCleanAndNotOnReserveFor:
                data.VehicleIsCleanAndNotOnReserveFor
                  ? data.VehicleIsCleanAndNotOnReserveFor
                  : "",
              VehicleIsCleanAndNotOnReserveFor0:
                data.VehicleIsCleanAndNotOnReserveFor0
                  ? data.VehicleIsCleanAndNotOnReserveFor0
                  : "",
              PaperWorkCompletePlanningTeamUpd:
                data.PaperWorkCompletePlanningTeamUpd
                  ? data.PaperWorkCompletePlanningTeamUpd
                  : "",
              PaperWorkCompletePlanningTeamUpd0:
                data.PaperWorkCompletePlanningTeamUpd0
                  ? data.PaperWorkCompletePlanningTeamUpd0
                  : "",
              Cablingspreadsheetupdate: data.Cablingspreadsheetupdate
                ? data.Cablingspreadsheetupdate
                : "",
              CablingspreadsheetupdateComments:
                data.CablingspreadsheetupdateComments
                  ? data.CablingspreadsheetupdateComments
                  : "",
              AccidentInformation: data.AccidentInformation
                ? data.AccidentInformation
                : "",
              AccidentInformationComments: data.AccidentInformationComments
                ? data.AccidentInformationComments
                : "",
              Drivingforwsuggestion: data.Drivingforwsuggestion
                ? data.Drivingforwsuggestion
                : "",
            });
          });
        }
        getQualityPlanningData(wrappingData, country);
      });
  };

  //EffectiveCommunication
  const getEffectivedata = () => {
    spweb.lists
      .getByTitle("Effective Communication")
      .items.top(5000)
      .get()
      .then((Response) => {
        let effectiveData: any[] = [];
        if (Response.length > 0) {
          Response.forEach((data) => {
            effectiveData.push({
              Id: data.ID,
              TrackingNumberReferenceId: data.TrackingNumberReferenceId,
              InformTeamleadOfIssuesOnSite: data.InformTeamleadOfIssuesOnSite
                ? data.InformTeamleadOfIssuesOnSite
                : "",
              InformTeamleadOfIssuesOnSiteComm:
                data.InformTeamleadOfIssuesOnSiteComm
                  ? data.InformTeamleadOfIssuesOnSiteComm
                  : "",
              CommunicationIssuesTeamOrVendor:
                data.CommunicationIssuesTeamOrVendor
                  ? data.CommunicationIssuesTeamOrVendor
                  : "",
              CommunicationIssuesTeamOrVendorC:
                data.CommunicationIssuesTeamOrVendorC
                  ? data.CommunicationIssuesTeamOrVendorC
                  : "",
              Driversrating_x0028_Vendorsonly_:
                data.Driversrating_x0028_Vendorsonly_
                  ? data.Driversrating_x0028_Vendorsonly_
                  : "",
              NotesToReportOnDailyMeeting: data.NotesToReportOnDailyMeeting
                ? data.NotesToReportOnDailyMeeting
                : "",
              NotesToReportOnDailyMeetingComme:
                data.NotesToReportOnDailyMeetingComme
                  ? data.NotesToReportOnDailyMeetingComme
                  : "",
              SolveProblemWithSiteRepresentati:
                data.SolveProblemWithSiteRepresentati
                  ? data.SolveProblemWithSiteRepresentati
                  : "",
              SolveProblemWithSiteRepresentati0:
                data.SolveProblemWithSiteRepresentati0
                  ? data.SolveProblemWithSiteRepresentati0
                  : "",
            });
          });
        }
        setEffectivedata([...effectiveData]);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  //Actionplan
  const getactionplan = () => {
    spweb.lists
      .getByTitle("Action Plan")
      .items.top(5000)
      .get()
      .then((Response) => {
        let actionplandata: any[] = [];
        if (Response.length > 0) {
          Response.forEach((data) => {
            actionplandata.push({
              Id: data.ID,
              TrackingNumberReferenceId: data.TrackingNumberReferenceId,
              Generalprecheck: data.Generalprecheck ? data.Generalprecheck : "",
              GeneralprecheckComments: data.GeneralprecheckComments
                ? data.GeneralprecheckComments
                : "",
              Crewdetailsprecheck: data.Crewdetailsprecheck
                ? data.Crewdetailsprecheck
                : "",
              CrewdetailsprecheckComments: data.CrewdetailsprecheckComments
                ? data.CrewdetailsprecheckComments
                : "",
              RealtimecontactATCoffice: data.RealtimecontactATCoffice
                ? data.RealtimecontactATCoffice
                : "",
              RealtimecontactATCofficeComments:
                data.RealtimecontactATCofficeComments
                  ? data.RealtimecontactATCofficeComments
                  : "",
              Equipment_x2019_scheck_x002d_Too:
                data.Equipment_x2019_scheck_x002d_Too
                  ? data.Equipment_x2019_scheck_x002d_Too
                  : "",
              Equipment_x2019_scheck_x002d_Too0:
                data.Equipment_x2019_scheck_x002d_Too0
                  ? data.Equipment_x2019_scheck_x002d_Too0
                  : "",
              AdditionalJobs: data.AdditionalJobs ? data.AdditionalJobs : "",
              AdditionalJobsComments: data.AdditionalJobsComments
                ? data.AdditionalJobsComments
                : "",

              ConfirmETA: data.ConfirmETA ? data.ConfirmETA : "",
              ConfirmETAComments: data.ConfirmETAComments
                ? data.ConfirmETAComments
                : "",
              LabelPrinted: data.LabelPrinted ? data.LabelPrinted : "",
              LabelPrintedComments: data.LabelPrintedComments
                ? data.LabelPrintedComments
                : "",
              ToolsPaperWork: data.ToolsPaperWork ? data.ToolsPaperWork : "",
              ToolsPaperWorkComments: data.ToolsPaperWorkComments
                ? data.ToolsPaperWorkComments
                : "",
              Trackercheck: data.Trackercheck ? data.Trackercheck : "",
              TrackercheckComments: data.TrackercheckComments
                ? data.TrackercheckComments
                : "",
              RoambeeNumber: data.RoambeeNumber ? data.RoambeeNumber : "",
              CardNumber: data.CardNumber ? data.CardNumber : "",
              TrackerNumber: data.TrackerNumber ? data.TrackerNumber : "",
              SealNumber: data.SealNumber ? data.SealNumber : "",
              DocumentsPrinting: data.DocumentsPrinting
                ? data.DocumentsPrinting
                : "",
              DocumentsPrintingComments: data.DocumentsPrintingComments
                ? data.DocumentsPrintingComments
                : "",
              CMR: data.CMR ? data.CMR : "",
              Crewdetailssharing: data.Crewdetailssharing
                ? data.Crewdetailssharing
                : "",
              CrewdetailssharingComments: data.CrewdetailssharingComments
                ? data.CrewdetailssharingComments
                : "",
              ContactDCSM: data.ContactDCSM ? data.ContactDCSM : "",
              ContactDCSMComments: data.ContactDCSMComments
                ? data.ContactDCSMComments
                : "",
              PrepareEquipment: data.PrepareEquipment
                ? data.PrepareEquipment
                : "",
              PrepareEquipmentComments: data.PrepareEquipmentComments
                ? data.PrepareEquipmentComments
                : "",
            });
          });
        }
        setActiondata([...actionplandata]);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  //Get Siteusers
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

  const init = () => {
    setLoader(true);
    getAdmins();
  };

  useEffect(() => {
    init();
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
    let tempKey = FilterKey;
    tempKey[key] = text;

    setFilterKey({ ...tempKey });
    filterFunction(tempKey, duplicateData);
  };
  const filterFunction = (tempKey, tempArr) => {
    // let tempArr = [...duplicateData];
    if (tempKey.country != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.country == tempKey.country;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.status != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.status == tempKey.status;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.supervisor.key != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.supervisor == tempKey.supervisor.key;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.siteCode.key != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.siteCode == tempKey.siteCode.key;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.client != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.client == tempKey.client;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.joptype != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.joptype == tempKey.joptype;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.week != "All") {
      if (tempKey.week == "Last Week") {
        let lastweek = moment().subtract(1, "week").isoWeek();
        tempArr = tempArr.filter((arr) => {
          return moment(arr.deleteDate).isoWeek() == lastweek;
        });
        // setDuplicateData(tempArr);
      } else if (tempKey.week == "This Week") {
        let thisweek = moment().isoWeek();
        tempArr = tempArr.filter((arr) => {
          return moment(arr.deleteDate).isoWeek() == thisweek;
        });
        // setDuplicateData(tempArr);
      } else if (tempKey.week == "Last Month") {
        let lastMonth = moment().subtract(1, "month").month();
        tempArr = tempArr.filter((arr) => {
          return moment(arr.deleteDate).month() == lastMonth;
        });
        // setDuplicateData(tempArr);
      }
    }
    if (tempKey.mobilization != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.mobilization == tempKey.mobilization;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.siteAccessdelay != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.siteAccessdelay == tempKey.siteAccessdelay;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.securityOrOtherdelays != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.securityOrOtherdelays == tempKey.securityOrOtherdelays;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.accidentInformation != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.accidentInformation == tempKey.accidentInformation;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.full5PPE != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.full5PPE == tempKey.full5PPE;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.escalated != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.escalated == tempKey.escalated;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.wgcrew.key != "All") {
      tempArr = tempArr.filter((arr) => {
        let filterCrew = arr.wgcrew.some(
          (ex) => ex.Title == tempKey.wgcrew.key
        );
        return filterCrew ? arr : "";
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.filterStartDate != "All") {
      setDeliveryStartDate(tempKey.filterStartDate);
      if (tempKey.filterStartDate) {
        tempArr = tempArr.filter((arr) => {
          return moment(tempKey.filterStartDate) <= moment(arr.deleteDate);
        });
        // setDuplicateData(tempArr);
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
        // setDuplicateData(tempArr);
      }
    }
    if (tempKey.goodSave != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.goodSave == tempKey.goodSave;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.safetyInitiative != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.safetyInitiative == tempKey.safetyInitiative;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.DrivingforwSuggestion != "All") {
      tempArr = tempArr.filter((arr) => {
        return arr.DrivingforwSuggestion == tempKey.DrivingforwSuggestion;
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.handSBriefingConductedby.key != "All") {
      tempArr = tempArr.filter((arr) => {
        let filterHandS = arr.handSBriefingConductedby.some(
          (ex) => ex.Title == tempKey.handSBriefingConductedby.key
        );
        return filterHandS ? arr : "";
      });
      // setDuplicateData(tempArr);
    }
    if (tempKey.isCabled != "All") {
      if (tempKey.isCabled == "Yes") {
        tempArr = tempArr.filter((arr) => {
          return arr.wGCrewMemberData != "";
        });
      } else {
        tempArr = tempArr.filter((arr) => {
          return arr.wGCrewMemberData == "";
        });
      }
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

    setDisplayData([...tempArr]);
    setExportExcel([...tempArr]);
    // setDuplicateData([...masterData]);
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
      isCabled: "All",
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
      const EscalationWorksheet = workbook.addWorksheet("Escalation_Sheet");

      worksheet.columns = [
        { header: "Country", key: "country", width: 25 },
        { header: "Jop Type", key: "joptype", width: 25 },
        { header: "City", key: "city", width: 25 },
        { header: "Client", key: "client", width: 25 },
        { header: "Tracking No", key: "trackingNo", width: 25 },
        { header: "Supervisor", key: "supervisor", width: 25 },
        { header: "Delivery Date", key: "delDate", width: 25 },
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
        {
          header: "InReviewComment",
          key: "ReviewComments",
          width: 25,
        },
        {
          header: "Planner Name",
          key: "PlannerNames",
          width: 25,
        },
        {
          header: "Planner Submission Time",
          key: "PlannerTime",
          width: 25,
        },
        {
          header: "Supervisor Assign",
          key: "SupervisorAssign",
          width: 25,
        },
        {
          header: "PreCheck Time",
          key: "PreCheckTime",
          width: 25,
        },
      ];
      EscalationWorksheet.columns = [
        { header: "Escalation", key: "escalation", width: 25 },
        { header: "Escalation Owner", key: "escalateOwner", width: 25 },
        { header: "Escalation Type", key: "escalationType", width: 25 },
        { header: "Description", key: "description", width: 25 },
      ];
      // arrExport.wgcrew.forEach((ev, index) => {
      //   worksheet.columns.push({
      //     header: "White Glove Crew on Delivery",arr
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
          delDate: item.deleteDate ? dateFormater(item.deleteDate) : "-",
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
          ReviewComments: item.ReviewComments ? item.ReviewComments : "-",
          PlannerNames: item.PlannerName ? item.PlannerName : "-",
          PlannerTime: item.PlannerTime ? item.PlannerTime : "-",
          SupervisorAssign: item.SupervisorAssign ? item.SupervisorAssign : "-",
          PreCheckTime: item.PreCheckTime ? item.PreCheckTime : "-",
        });
        if (item.EscalationType != "-") {
          EscalationWorksheet.addRow({
            escalationType: item.EscalationType,
            escalation: item.Escalation,
            escalateOwner: item.EscalationOwner,
            description: item.EscalationDescription,
          });
        }
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
        "AQ1",
        "AR1",
        "AS1",
        "AT1",
        "AU1",
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
        "AQ1",
        "AR1",
        "AS1",
        "AT1",
        "AU1",
      ].map((key) => {
        worksheet.getCell(key).color = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF" },
        };
      });

      await ["A1", "B1", "C1", "D1"].map((val) => {
        EscalationWorksheet.getCell(val).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "C5D9F1" },
        };
        EscalationWorksheet.getCell(val).color = {
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
                className={styles.autoComplete}
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
                  className={styles.autoComplete}
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
                  className={styles.autoComplete}
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
                  className={styles.autoComplete}
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
              <Dropdown
                label="IsCabled"
                selectedKey={FilterKey.isCabled}
                onChange={(e, option) => {
                  filterHandleFunction("isCabled", option["text"]);
                }}
                placeholder="Select an option"
                options={dropDownOptions.isCabled}
                styles={dropdownStyles}
              />
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
          {/*Pravin*/}

          {isApprovePopup && (
            <Layer>
              <Popup
                className={approvePopupStyles.root}
                role="dialog"
                aria-modal="true"
                onDismiss={() => {
                  setIsApprovePopup(false),
                    setActionPlan([...actionjson]),
                    setEffectiveCom([...effectivejson]);
                }}
              >
                <Overlay
                  onClick={() => {
                    setIsApprovePopup(false);
                  }}
                />
                <FocusTrapZone>
                  <div className={approvePopupStyles.sec}>
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
                        onClick={() => {
                          setIsApprovePopup(false),
                            setActionPlan([...actionjson]);
                        }}
                      />
                    </div>

                    {isClient ? (
                      <>
                        <div className={approvePopupStyles.content}>
                          {actionplan[0].Generalprecheck ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Generalprecheck :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={actionplan[0].Generalprecheck}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}

                          {actionplan[0].GeneralprecheckComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                GeneralprecheckComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={actionplan[0].GeneralprecheckComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {actionplan[0].Crewdetailsprecheck ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Crewdetailsprecheck :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={actionplan[0].Crewdetailsprecheck}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {actionplan[0].CrewdetailsprecheckComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CrewdetailsprecheckComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  actionplan[0].CrewdetailsprecheckComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {actionplan[0].RealtimecontactATCoffice ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RealtimecontactATCoffice :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={actionplan[0].RealtimecontactATCoffice}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {actionplan[0].RealtimecontactATCofficeComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RealtimecontactATCofficeComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  actionplan[0].RealtimecontactATCofficeComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {actionplan[0].Equipment_x2019_scheck_x002d_Too ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Equipment’scheck-ToolsPaperwork :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  actionplan[0].Equipment_x2019_scheck_x002d_Too
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {actionplan[0].Equipment_x2019_scheck_x002d_Too0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Equipment’scheck-ToolsPaperworkComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  actionplan[0]
                                    .Equipment_x2019_scheck_x002d_Too0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {actionplan[0].AdditionalJobs ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AdditionalJobs :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={actionplan[0].AdditionalJobs}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {actionplan[0].AdditionalJobsComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AdditionalJobsComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={actionplan[0].AdditionalJobsComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {effectivecom[0].InformTeamleadOfIssuesOnSite ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                InformTeamleadOfIssuesOnSite :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  effectivecom[0].InformTeamleadOfIssuesOnSite
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {effectivecom[0].InformTeamleadOfIssuesOnSiteComm ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                InformTeamleadOfIssuesOnSiteComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  effectivecom[0]
                                    .InformTeamleadOfIssuesOnSiteComm
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {effectivecom[0].CommunicationIssuesTeamOrVendor ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CommunicationIssuesTeamOrVendor :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  effectivecom[0]
                                    .CommunicationIssuesTeamOrVendor
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {effectivecom[0].CommunicationIssuesTeamOrVendorC ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CommunicationIssuesTeamOrVendorComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  effectivecom[0]
                                    .CommunicationIssuesTeamOrVendorC
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {effectivecom[0].Driversrating_x0028_Vendorsonly_ ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Driversrating(Vendorsonly) :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  effectivecom[0]
                                    .Driversrating_x0028_Vendorsonly_
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {effectivecom[0].NotesToReportOnDailyMeeting ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                NotesToReportOnDailyMeeting :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  effectivecom[0].NotesToReportOnDailyMeeting
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {effectivecom[0].NotesToReportOnDailyMeetingComme ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                NotesToReportOnDailyMeetingComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  effectivecom[0]
                                    .NotesToReportOnDailyMeetingComme
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].ToolsOnChargeForNextDay ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ToolsOnChargeForNextDay :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={wrappingup[0].ToolsOnChargeForNextDay}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].ToolsOnChargeForNextDayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ToolsOnChargeForNextDayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  wrappingup[0].ToolsOnChargeForNextDayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].VehicleIsCleanAndNotOnReserveFor ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                VehicleIsCleanAndNotOnReserveForNextDay :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  wrappingup[0].VehicleIsCleanAndNotOnReserveFor
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].VehicleIsCleanAndNotOnReserveFor0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                VehicleIsCleanAndNotOnReserveForNextDayComments
                                :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  wrappingup[0]
                                    .VehicleIsCleanAndNotOnReserveFor0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].PaperWorkCompletePlanningTeamUpd ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PaperWorkCompletePlanningTeamUpdated :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  wrappingup[0].PaperWorkCompletePlanningTeamUpd
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].PaperWorkCompletePlanningTeamUpd0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PaperWorkCompletePlanningTeamUpdatedComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  wrappingup[0]
                                    .PaperWorkCompletePlanningTeamUpd0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingnext[0].AdditionalDeliveryComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AdditionalDeliveryComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  wrappingnext[0].AdditionalDeliveryComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].Cablingspreadsheetupdate ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Cablingspreadsheetupdate :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={wrappingup[0].Cablingspreadsheetupdate}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].CablingspreadsheetupdateComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CablingspreadsheetupdateComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  wrappingup[0].CablingspreadsheetupdateComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].AccidentInformation ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AccidentInformation :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={wrappingup[0].AccidentInformation}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].AccidentInformationComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AccidentInformationComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  wrappingup[0].AccidentInformationComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].GoodSave ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                GoodSave :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={wrappingup[0].GoodSave}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].GoodSaveComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                GoodSaveComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={wrappingup[0].GoodSaveComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].Safetyinitiative ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Safetyinitiative :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={wrappingup[0].Safetyinitiative}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].SafetyinitiativeComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SafetyinitiativeComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={wrappingup[0].SafetyinitiativeComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].Drivingforwsuggestion ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Drivingforwsuggestion :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={wrappingup[0].Drivingforwsuggestion}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingup[0].DrivingforwsuggestionComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DrivingforwsuggestionComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  wrappingup[0].DrivingforwsuggestionComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingnext[0].CustomerFeedback ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CustomerFeedback :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={wrappingnext[0].CustomerFeedback}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingnext[0].CustomerFeedbackComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CustomerFeedbackComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={wrappingnext[0].CustomerFeedbackComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingnext[0].ATCSupervvisorFeedback ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ATCSupervvisorFeedback :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={wrappingnext[0].ATCSupervvisorFeedback}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {wrappingnext[0].ATCSupervisorFeedbackComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ATCSupervisorFeedbackComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  border: "1px solid",
                                  height: "110%",
                                }}
                                value={
                                  wrappingnext[0].ATCSupervisorFeedbackComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].TruckSealBreak ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckSealBreak :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].TruckSealBreak}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].TruckSealBreakComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckSealBreakComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={operationalres[0].TruckSealBreakComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].Truckdeparturedelays ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Truckdeparturedelays :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].Truckdeparturedelays}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].TruckdeparturedelaysTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckdeparturedelaysTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].TruckdeparturedelaysTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].TruckdeparturedelaysComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckdeparturedelaysComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0].TruckdeparturedelaysComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].DCATsDelays ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DCATsDelays :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].DCATsDelays}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].DCATsDelaysTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DCATsDelaysTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].DCATsDelaysTime}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].DCATsDelaysComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DCATsDelaysComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={operationalres[0].DCATsDelaysComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].VendorWGCrewdelays ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                VendorWGCrewdelays :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].VendorWGCrewdelays}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].VendorWGCrewdelaysTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                VendorWGCrewdelaysTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].VendorWGCrewdelaysTime}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].VendorWGCrewdelaysComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                VendorWGCrewdelaysComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0].VendorWGCrewdelaysComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].BANKSMANPresent ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                BANKSMANPresent :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].BANKSMANPresent}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].BANKSMANPresentComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                BANKSMANPresentComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0].BANKSMANPresentComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].SecurityOrOtherDelays ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecurityOrOtherDelays :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].SecurityOrOtherDelays}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].SecurityorotherdelaysTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecurityorotherdelaysTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].SecurityorotherdelaysTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].SecurityOrOtherDelaysComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecurityOrOtherDelaysComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .SecurityOrOtherDelaysComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].Full5PPE ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Full5PPE :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].Full5PPE}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].Full5PPEComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Full5PPEComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={operationalres[0].Full5PPEComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].PhoneMediaUsage ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PhoneMediaUsage :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].PhoneMediaUsage}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].PhoneMediaUsageComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PhoneMediaUsageComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0].PhoneMediaUsageComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].RestingOnFloor ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RestingOnFloor :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].RestingOnFloor}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].RestingOnFloorComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RestingOnFloorComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={operationalres[0].RestingOnFloorComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].TruckArrival ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckArrival :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].TruckArrival}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].TruckArrivalLoadingbayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckArrivalLoadingbayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .TruckArrivalLoadingbayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].TruckDeparture ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckDeparture :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].TruckDeparture}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .TruckDepartureLoadingbayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckDepartureLoadingbayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .TruckDepartureLoadingbayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].RealtimeETAs ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RealtimeETAs :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].RealtimeETAs}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].RealtimeETAComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RealtimeETAComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={operationalres[0].RealtimeETAComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].COLLOaccessissues ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                COLLOaccessissues :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].COLLOaccessissues}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].COLLOaccessissuesTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                COLLOaccessissuesTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].COLLOaccessissuesTime}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].COLLOaccessissuesComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                COLLOaccessissuesComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0].COLLOaccessissuesComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].Induction ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Induction :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].Induction}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].InductionComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                InductionComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={operationalres[0].InductionComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].HandSBriefingConductedby ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                HandSBriefingConductedby :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].HandSBriefingConductedby
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].STARTofoperationMSFTstaff ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                STARTofoperationMSFTstaff :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].STARTofoperationMSFTstaff
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .STARTofoperationMSFTstaffComment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                STARTofoperationMSFTstaffComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .STARTofoperationMSFTstaffComment
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].SmartTeamdelegating ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SmartTeamdelegating :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].SmartTeamdelegating}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].SmartTeamdelegatingComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SmartTeamdelegatingComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0].SmartTeamdelegatingComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].Rampsetup ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Rampsetup :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].Rampsetup}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].RampsetupComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RampsetupComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={operationalres[0].RampsetupComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .LoadingBayPreparationofworkareae0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                LoadingBayPreparationofworkareae0 :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0]
                                    .LoadingBayPreparationofworkareae0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .LoadingBayPreparationofworkareae ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                LoadingBayPreparationofworkareae :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0]
                                    .LoadingBayPreparationofworkareae
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .FINALcheckasperSOP_x2013_WGorDep0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FINALcheckasperSOP_x2013_WGorDep0 :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0]
                                    .FINALcheckasperSOP_x2013_WGorDep0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .FINALcheckasperSOP_x2013_WGorDep ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FINALcheckasperSOP_x2013_WGorDep :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0]
                                    .FINALcheckasperSOP_x2013_WGorDep
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].DebrisSeparationOfPlasticMetal ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DebrisSeparationOfPlasticMetal :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0]
                                    .DebrisSeparationOfPlasticMetal
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .DebrisSeparationOfPlasticMetalCo ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DebrisSeparationOfPlasticMetalCo :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0]
                                    .DebrisSeparationOfPlasticMetalCo
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].DebrisCleanUpLoadingbay ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DebrisCleanUpLoadingbay :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].DebrisCleanUpLoadingbay
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].DebrisCleanUpLoadingbayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DebrisCleanUpLoadingbayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .DebrisCleanUpLoadingbayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].JobCompletionConfirmation ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                JobCompletionConfirmation :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].JobCompletionConfirmation
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .JobCompletionConfirmationComment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                JobCompletionConfirmationComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .JobCompletionConfirmationComment
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].SecondTruck ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruck :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].SecondTruck}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].SecondTruckArrivalDateTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruckArrivalDateTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].SecondTruckArrivalDateTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .SecondTruckArrivalDateTimeCommen ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruckArrivalDateTimeComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .SecondTruckArrivalDateTimeCommen
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].SecondTruckDepartureDateTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruckDepartureDateTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].SecondTruckDepartureDateTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .SecondTruckDepartureDateTimeComm ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruckDepartureDateTimeCommt :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .SecondTruckDepartureDateTimeComm
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].Team1LoadingBay ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Team1LoadingBay :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].Team1LoadingBay}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].Team2Rackpushing0toCOLLO ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Team2Rackpushing0toCOLLO :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].Team2Rackpushing0toCOLLO
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].ThirdTruck ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ThirdTruck :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={operationalres[0].ThirdTruck}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].ThirdTruckArrivalDateTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ThirdTruckArrivalDateTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].ThirdTruckArrivalDateTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .ThirdTruckArrivalDateTimeComment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ThirdTruckArrivalDateTimeComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .ThirdTruckArrivalDateTimeComment
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0].ThirdTruckDepartureDateTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ThirdTruckDepartureDateTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  operationalres[0].ThirdTruckDepartureDateTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {operationalres[0]
                            .ThirdTruckDepartureDateTimeComme ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ThirdTruckDepartureDateTimeCommet :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  operationalres[0]
                                    .ThirdTruckDepartureDateTimeComme
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {/* <div
                          style={{
                            width: "95%",
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "20px",
                          }}
                        >
                          <DefaultButton
                            primary
                            text={"Reject"}
                            style={{
                              cursor: "pointer",
                              backgroundColor: "#be3535ed",
                              border: "1px solid #be3535ed",
                              marginRight: "20px",
                            }}
                            onClick={() => {
                              setIsRejectPopup(true);
                            }}
                          />
                          <DefaultButton
                            primary
                            text={"Approve"}
                            style={{
                              cursor: "pointer",
                              backgroundColor: "#67c25f",
                              border: "1px solid #67c25f",
                            }}
                            onClick={(item) => approvelFunction()}
                          />
                        </div> */}
                        </div>
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
                            text={"Reject"}
                            style={{
                              cursor: "pointer",
                              backgroundColor: "#be3535ed",
                              border: "1px solid #be3535ed",
                              marginRight: "20px",
                            }}
                            onClick={() => {
                              setIsRejectPopup(true);
                            }}
                          />
                          <DefaultButton
                            primary
                            text={"Approve"}
                            style={{
                              cursor: "pointer",
                              backgroundColor: "#67c25f",
                              border: "1px solid #67c25f",
                            }}
                            onClick={(item) => approvelFunction()}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={approvePopupStyles.content}>
                          {awsactionplan[0].ConfirmETA ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ConfirmETA :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].ConfirmETA}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].ConfirmETAComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ConfirmETAComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsactionplan[0].ConfirmETAComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].LabelPrinted ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                LabelPrinted :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].LabelPrinted}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].LabelPrintedComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                LabelPrintedComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsactionplan[0].LabelPrintedComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].ToolsPaperWork ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ToolsPaperWork :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].ToolsPaperWork}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].ToolsPaperWorkComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ToolsPaperWorkComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsactionplan[0].ToolsPaperWorkComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].AdditionalJobs ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AdditionalJobs :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].AdditionalJobs}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].AdditionalJobsComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AdditionalJobsComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsactionplan[0].AdditionalJobsComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].Trackercheck ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Trackercheck :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].Trackercheck}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].TrackercheckComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TrackercheckComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsactionplan[0].TrackercheckComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].RoambeeNumber ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RoambeeNumber :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].RoambeeNumber}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].CardNumber ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CardNumber :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].CardNumber}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].TrackerNumber ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TrackerNumber :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].TrackerNumber}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].SealNumber ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SealNumber :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].SealNumber}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].DocumentsPrinting ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DocumentsPrinting :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].DocumentsPrinting}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].DocumentsPrintingComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DocumentsPrintingComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsactionplan[0].DocumentsPrintingComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].DecomManifest ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DecomManifest :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].DecomManifest}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].CMR ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CMR :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].CMR}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].Crewdetailssharing ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Crewdetailssharing :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].Crewdetailssharing}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].CrewdetailssharingComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CrewdetailssharingComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsactionplan[0].CrewdetailssharingComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].ContactDCSM ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ContactDCSM :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].ContactDCSM}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].ContactDCSMComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ContactDCSMComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsactionplan[0].ContactDCSMComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].PrepareEquipment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PrepareEquipment :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsactionplan[0].PrepareEquipment}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsactionplan[0].PrepareEquipmentComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PrepareEquipmentComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsactionplan[0].PrepareEquipmentComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].ToolsOnChargeForNextDay ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ToolsOnChargeForNextDay :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsWrapping[0].ToolsOnChargeForNextDay}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].ToolsOnChargeForNextDayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ToolsOnChargeForNextDayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsWrapping[0].ToolsOnChargeForNextDayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].VehicleIsCleanAndNotOnReserveFor ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                VehicleIsCleanAndNotOnReserveForNextDay :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsWrapping[0]
                                    .VehicleIsCleanAndNotOnReserveFor
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].VehicleIsCleanAndNotOnReserveFor0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                VehicleIsCleanAndNotOnReserveForNextDayComments
                                :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsWrapping[0]
                                    .VehicleIsCleanAndNotOnReserveFor0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].PaperWorkCompletePlanningTeamUpd ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PaperWorkCompletePlanningTeamUpdated :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsWrapping[0]
                                    .PaperWorkCompletePlanningTeamUpd
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].PaperWorkCompletePlanningTeamUpd0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PaperWorkCompletePlanningTeamUpdatedcomments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsWrapping[0]
                                    .PaperWorkCompletePlanningTeamUpd0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].Cablingspreadsheetupdate ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Cablingspreadsheetupdate :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsWrapping[0].Cablingspreadsheetupdate}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].CablingspreadsheetupdateComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CablingspreadsheetupdateComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsWrapping[0]
                                    .CablingspreadsheetupdateComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].AccidentInformation ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AccidentInformation :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsWrapping[0].AccidentInformation}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].AccidentInformationComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AccidentInformationComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsWrapping[0].AccidentInformationComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsATCplanning[0].HealthSafetyPerformance ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RatingValue :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsATCplanning[0].HealthSafetyPerformance
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].GoodSave ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                GoodSave :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsWrapping[0].GoodSave}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].GoodSaveComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                GoodSaveComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsWrapping[0].GoodSaveComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].Safetyinitiative ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Safetyinitiative :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsWrapping[0].Safetyinitiative}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].SafetyinitiativeComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SafetyinitiativeComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsWrapping[0].SafetyinitiativeComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].Drivingforwsuggestion ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Drivingforwsuggestion :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsWrapping[0].Drivingforwsuggestion}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsWrapping[0].DrivingforwsuggestionComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DrivingforwsuggestionComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsWrapping[0].DrivingforwsuggestionComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].InformTeamleadOfIssuesOnSite ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                InformTeamleadOfIssuesOnSite :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsEffective[0].InformTeamleadOfIssuesOnSite
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].InformTeamleadOfIssuesOnSiteComm ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                InformTeamleadOfIssuesOnSiteComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsEffective[0]
                                    .InformTeamleadOfIssuesOnSiteComm
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].SolveProblemWithSiteRepresentati ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SolveProblemWithSiteRepresentative :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsEffective[0]
                                    .SolveProblemWithSiteRepresentati
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].SolveProblemWithSiteRepresentati0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SolveProblemWithSiteRepresentativecomment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsEffective[0]
                                    .SolveProblemWithSiteRepresentati0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].CommunicationIssuesTeamOrVendor ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CommunicationIssuesTeamOrVendor :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsEffective[0]
                                    .CommunicationIssuesTeamOrVendor
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].CommunicationIssuesTeamOrVendorC ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CommunicationIssuesTeamOrVendorComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsEffective[0]
                                    .CommunicationIssuesTeamOrVendorC
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].NotesToReportOnDailyMeeting ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                NotesToReportOnDailyMeeting :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsEffective[0].NotesToReportOnDailyMeeting
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].NotesToReportOnDailyMeetingComme ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                NotesToReportOnDailyMeetingComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsEffective[0]
                                    .NotesToReportOnDailyMeetingComme
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsEffective[0].Driversrating_x0028_Vendorsonly_ ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DriversratingVendors :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsEffective[0]
                                    .Driversrating_x0028_Vendorsonly_
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsATCplanning[0].AdditionalDeliveryComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AdditionalDeliveryComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsATCplanning[0].AdditionalDeliveryComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].SiteAccessDelays ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SiteAccessDelays :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].SiteAccessDelays}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].SiteAccessDelaysTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SiteAccessDelaysTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].SiteAccessDelaysTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].SiteAccessDelaysComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SiteAccessDelaysComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0].SiteAccessDelaysComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].BANKSMANPresent ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                BANKSMANPresent :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].BANKSMANPresent}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].BANKSMANPresentComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                BANKSMANPresentComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0].BANKSMANPresentComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].SecurityOrOtherDelays ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecurityOrOtherDelays :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].SecurityOrOtherDelays
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].SecurityorotherdelaysTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecurityorotherdelaysTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].SecurityorotherdelaysTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .SecurityOrOtherDelaysComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecurityOrOtherDelaysComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .SecurityOrOtherDelaysComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Full5PPE ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Full5PPE :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].Full5PPE}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Full5PPEComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Full5PPEComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsOperationalres[0].Full5PPEComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].PhoneMediaUsage ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PhoneMediaUsage :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].PhoneMediaUsage}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].PhoneMediaUsageComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                PhoneMediaUsageComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0].PhoneMediaUsageComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].RestingOnFloor ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RestingOnFloor :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].RestingOnFloor}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].RestingOnFloorComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RestingOnFloorComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0].RestingOnFloorComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].TruckArrival ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckArrival :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].TruckArrival}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .TruckArrivalLoadingbayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckArrivalLoadingbayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .TruckArrivalLoadingbayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].TruckDeparture ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckDeparture :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].TruckDeparture}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .TruckDepartureLoadingbayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckDepartureLoadingbayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .TruckDepartureLoadingbayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .FinalPositionCheckRacksFibres ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FinalPositionCheckRacksFibres :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .FinalPositionCheckRacksFibres
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .FinalPositionCheckRacksFibresCom ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FinalPositionCheckRacksFibresComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .FinalPositionCheckRacksFibresCom
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Finalrackpositioncheckedby ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Finalrackpositioncheckedby :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .Finalrackpositioncheckedby
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .FinalrackpositioncheckedbyCommen ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FinalrackpositioncheckedbyComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .FinalrackpositioncheckedbyCommen
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].RackScanningbyAWSBBonSite ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RackScanningbyAWSBBonSite :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].RackScanningbyAWSBBonSite
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .RackScanningbyAWSBBonSiteComment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RackScanningbyAWSBBonSiteComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .RackScanningbyAWSBBonSiteComment
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].AssetMismatch ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AssetMismatch :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].AssetMismatch}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].AssetMismatchComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AssetMismatchComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0].AssetMismatchComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].RackInspectionwgteamleadOnly ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RackInspectionwgteamleadOnly :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .RackInspectionwgteamleadOnly
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .RackInspectionwgteamleadOnlyComm ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RackInspectionwgteamleadOnlyComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .RackInspectionwgteamleadOnlyComm
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .ConfirmIRISHCheckWithSiteReprese ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ConfirmIRISHCheckWithSiteRepresentative :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .ConfirmIRISHCheckWithSiteReprese
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .ConfirmIRISHCheckWithSiteReprese0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ConfirmIRISHCheckWithSiteRepresentativeComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .ConfirmIRISHCheckWithSiteReprese0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].MatchRackStickerPosition ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                MatchRackStickerPosition :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].MatchRackStickerPosition
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .MatchRackStickerPositionComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                MatchRackStickerPositionComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .MatchRackStickerPositionComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].CompleteStriderPosition ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CompleteStriderPosition :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].CompleteStriderPosition
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .CompleteStriderPositionComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CompleteStriderPositionComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .CompleteStriderPositionComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].FinishCabling ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FinishCabling :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].FinishCabling}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].FinishCablingComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FinishCablingComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0].FinishCablingComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].FinalAuditCheckAsPerSOP ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FinalAuditCheckAsPerSOP :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].FinalAuditCheckAsPerSOP
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .FinalAuditCheckAsPerSOPComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                FinalAuditCheckAsPerSOPComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .FinalAuditCheckAsPerSOPComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .DebrisSeparationOfPlasticMetal ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DebrisSeparationOfPlasticMetal :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .DebrisSeparationOfPlasticMetal
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .DebrisSeparationOfPlasticMetalCo ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DebrisSeparationOfPlasticMetalComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .DebrisSeparationOfPlasticMetalCo
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].DebrisCleanUpLoadingbay ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DebrisCleanUpLoadingbay :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].DebrisCleanUpLoadingbay
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .DebrisCleanUpLoadingbayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DebrisCleanUpLoadingbayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .DebrisCleanUpLoadingbayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].JobCompletionConfirmation ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                JobCompletionConfirmation :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].JobCompletionConfirmation
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .JobCompletionConfirmationComment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                JobCompletionConfirmationComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .JobCompletionConfirmationComment
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .CrewNameAuditCheckConductedBy ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CrewNameAuditCheckConductedBy :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .CrewNameAuditCheckConductedBy
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .CrewNameAuditCheckConductedByCom ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                CrewNameAuditCheckConductedByComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .CrewNameAuditCheckConductedByCom
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].WalkthroughSUPERVISOROnly ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                WalkthroughSUPERVISOROnly :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].WalkthroughSUPERVISOROnly
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .WalkthroughSUPERVISOROnlyComment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                WalkthroughSUPERVISOROnlyComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .WalkthroughSUPERVISOROnlyComment
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].SecondTruck ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruck :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].SecondTruck}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].SecondTruckArrivalDateTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruckArrivalDateTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .SecondTruckArrivalDateTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .SecondTruckArrivalDateTimeCommen ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruckArrivalDateTimeComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .SecondTruckArrivalDateTimeCommen
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].SecondTruckDepartureDateTime ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruckDepartureDateTime :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .SecondTruckDepartureDateTime
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .SecondTruckDepartureDateTimeComm ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                SecondTruckDepartureDateTimeComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .SecondTruckDepartureDateTimeComm
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Briefingconductedby ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Briefingconductedby :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].Briefingconductedby}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .STARTofoperationoperationToCheck ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                STARTofoperationoperationToCheck :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .STARTofoperationoperationToCheck
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .STARTofoperationoperationToCheck0 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                STARTofoperationoperationToCheckComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .STARTofoperationoperationToCheck0
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Preparationofequipment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Preparationofequipment :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].Preparationofequipment
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .Preparationofequipmentomments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Preparationofequipmentomments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .Preparationofequipmentomments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].EnsureSafeEnvironment ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                EnsureSafeEnvironment :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].EnsureSafeEnvironment
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .EnsureSafeEnvironmentComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                EnsureSafeEnvironmentComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .EnsureSafeEnvironmentComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].RemovingRacksfromDH ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RemovingRacksfromDH :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].RemovingRacksfromDH}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].RemovingRacksfromDHComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RemovingRacksfromDHComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .RemovingRacksfromDHComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].ContactwithAWSDecomTeam ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                ContactwithAWSDecomTeam :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].ContactwithAWSDecomTeam
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].AssetandsealNocheck ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                AssetandsealNocheck :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].AssetandsealNocheck}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].DCSMConfirmBFRackMovement ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                DCSMConfirmBFRackMovement :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].DCSMConfirmBFRackMovement
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Teamsplitting ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Teamsplitting :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].Teamsplitting}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].TeamsplittingComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TeamsplittingComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0].TeamsplittingComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].TeamTask ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TeamTask :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].TeamTask}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].TeamTaskComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TeamTaskComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={awsOperationalres[0].TeamTaskComments}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].TruckSealingAndLocking ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckSealingAndLocking :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].TruckSealingAndLocking
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .TruckSealingAndLockingComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckSealingAndLockingComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .TruckSealingAndLockingComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].RealtimepostingonJob ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RealtimepostingonJob :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].RealtimepostingonJob
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].RealtimepostingonJobComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                RealtimepostingonJobComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .RealtimepostingonJobComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].TruckparkingonLoadingbay ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckparkingonLoadingbay :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].TruckparkingonLoadingbay
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .TruckparkingonLoadingbayComments ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckparkingonLoadingbayComments :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .TruckparkingonLoadingbayComments
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].BriefingAndTaskbifurcation ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                BriefingAndTaskbifurcation :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0]
                                    .BriefingAndTaskbifurcation
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0]
                            .BriefingAndTaskbifurcationCommen ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                BriefingAndTaskbifurcationComment :
                              </label>
                              <textarea
                                style={{
                                  width: "50%",
                                  height: "110%",
                                  border: "1px solid",
                                }}
                                value={
                                  awsOperationalres[0]
                                    .BriefingAndTaskbifurcationCommen
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Team1 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Team1 :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].Team1}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Team2 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Team2 :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].Team2}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].Team3 ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                Team3 :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={awsOperationalres[0].Team3}
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {awsOperationalres[0].TruckLoadAuditconductedby ? (
                            <div className={approvePopupStyles.right}>
                              <label
                                style={{ width: "46%", fontWeight: "700" }}
                              >
                                TruckLoadAuditconductedby :
                              </label>
                              <input
                                style={{ width: "50%" }}
                                type="text"
                                value={
                                  awsOperationalres[0].TruckLoadAuditconductedby
                                }
                                disabled
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {/* <div
                            style={{
                              width: "95%",
                              display: "flex",
                              justifyContent: "center",
                              marginTop: "20px",
                            }}
                          >
                            <DefaultButton
                              primary
                              text={"Reject"}
                              style={{
                                cursor: "pointer",
                                backgroundColor: "#be3535ed",
                                border: "1px solid #be3535ed",
                                marginRight: "20px",
                              }}
                              onClick={() => {
                                setIsRejectPopup(true);
                              }}
                            />
                            <DefaultButton
                              primary
                              text={"Approve"}
                              style={{
                                cursor: "pointer",
                                backgroundColor: "#67c25f",
                                border: "1px solid #67c25f",
                              }}
                              onClick={(item) => approvelFunction()}
                            />
                          </div> */}
                        </div>
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
                            text={"Reject"}
                            style={{
                              cursor: "pointer",
                              backgroundColor: "#be3535ed",
                              border: "1px solid #be3535ed",
                              marginRight: "20px",
                            }}
                            onClick={() => {
                              setIsRejectPopup(true);
                            }}
                          />
                          <DefaultButton
                            primary
                            text={"Approve"}
                            style={{
                              cursor: "pointer",
                              backgroundColor: "#67c25f",
                              border: "1px solid #67c25f",
                            }}
                            onClick={(item) => approvelFunction()}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </FocusTrapZone>
              </Popup>
            </Layer>
          )}

          {/*Pravin*/}

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
                        Tracking Number : {trackingNum}
                      </label>
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
                          height: "80px",
                        }}
                        onChange={(ev) =>
                          (actionplan[0].InReviewComments = ev.target.value)
                        }
                      />
                    </div>
                    <DefaultButton
                      primary
                      text={"Submit"}
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
