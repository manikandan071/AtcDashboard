import * as React from "react";
import * as moment from "moment";
import { IFile, Web } from "@pnp/sp/presets/all";
import { TextField, ITextFieldStyles, Icon } from "@fluentui/react";
import styles from "../FieldQualityDashboard.module.scss";
import { useEffect, useState } from "react";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IDetailsListStyles,
  IconButton,
  IIconProps,
  DefaultButton,
  mergeStyleSets,
  FocusTrapZone,
  Layer,
  Overlay,
  Popup,
} from "@fluentui/react";
import { FontIcon } from "@fluentui/react/lib/Icon";
import { mergeStyles } from "@fluentui/react/lib/Styling";

interface IFiles {
  filename: string;
  url: string;
}

let spweb = Web(
  "https://atclogisticsie.sharepoint.com/sites/PlanningOperations/Field%20Quality"
  // "https://atclogisticsie.sharepoint.com/sites/TechnoRUCS_Dev_Site"
);

let currentUrl = window.location.href;
const Delete: IIconProps = { iconName: "Delete" };
const Close: IIconProps = { iconName: "ChromeClose" };

export default function FieldQualityView(props): JSX.Element {
  let columns = [
    {
      key: "column1",
      name: "DCI",
      // fieldName: "name",
      minWidth: 100,
      maxWidth: 150,
      onRender: (item) => {
        return <div>{item.Name}</div>;
      },
    },
    {
      key: "column2",
      name: "Rack Cabled Qty",
      fieldName: "first",
      minWidth: 100,
      maxWidth: 150,
      onRender: (item) => {
        return <div>{item.cableQty ? item.cableQty : "-"}</div>;
      },
    },
    {
      key: "column3",
      name: "Bolted down Qty",
      fieldName: "second",
      minWidth: 100,
      maxWidth: 150,
      onRender: (item) => {
        return <div>{item.boltedQty ? item.boltedQty : "-"}</div>;
      },
    },
  ];
  const iconClass = mergeStyles({
    fontSize: 15,
    height: 14,
    width: 15,
    margin: "3px 5px 0px 5px",
  });
  const classNames = mergeStyleSets({
    deepSkyBlue: [{ color: "deepskyblue" }, iconClass],
    greenYellow: [{ color: "#3e55b0" }, iconClass],
    salmon: [{ color: "salmon" }, iconClass],
  });

  const [getSingleData, setSingleData]: any = useState({});
  const [isDelPopupVisible, setIsDelPopupVisible] = useState(false);
  const [deleteItemID, setDeleteItemID] = useState(null);
  const [racksCabledFiles, setracksCabledFiles] = useState<IFiles[]>([]);

  const dateFormater = (date: Date): string => {
    return !date ? "" : moment(date).format("DD/MM/YYYY");
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
            color: "#a55860",
          },
          ".ms-DetailsHeader-cellTitle": {
            padding: "0px 8px 0px 10px",
          },
        },
        ".root-154": {
          color: "#f0d8d8",
          // backgroundColor: "#3635399e",
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
  const generalDetailsTextbox: Partial<ITextFieldStyles> = {
    root: {
      width: "25%",
      padding: "13px 30px 0px 0px",
      borderRadius: "4px",
      ".ms-Label": { color: "#a55860" },
    },
    field: { fontSize: 14, color: "#000" },
  };
  const generalDetailsTextbox3: Partial<ITextFieldStyles> = {
    root: {
      width: "20%",
      padding: "13px 30px 0px 0px",
      borderRadius: "4px",
      ".ms-Label": { color: "#a55860" },
    },
    field: { fontSize: 14, color: "#000" },
  };
  const generalDetailsTextbox1: Partial<ITextFieldStyles> = {
    root: {
      width: "25%",
      padding: "13px 10px 0px 0px",
      borderRadius: "4px",
      ".ms-TextField-fieldGroup": { width: "93%" },
      ".ms-Label": { color: "#a55860" },
    },
    field: { fontSize: 14, color: "#000" },
  };
  const siteDetailsTextbox: Partial<ITextFieldStyles> = {
    root: {
      width: "25%",
      padding: "13px 30px 0px 0px",
      borderRadius: "4px",
      ".ms-Label": { color: "#a55860" },
    },
    field: { fontSize: 14, color: "#000" },
  };

  const getWrappingList = () => {
    spweb.lists
      .getByTitle(`Wrapping Up`)
      .items.select(
        "*,GoodSaveName/Title,SafetyinitiativeName/Title,Drivingforw/Title"
      )
      .expand("GoodSaveName,SafetyinitiativeName,Drivingforw")
      .orderBy("ID", false)
      .top(5000)
      .get()
      .then((Response) => {
        if (Response.length > 0) {
          // console.log(Response);
          let wrappingListData = Response.filter(
            (data) => data.TrackingNumberReferenceId == props.Id
          );
          let wrappingList =
            wrappingListData.length > 0 ? wrappingListData[0] : {};
          if (wrappingList) {
            let wrappingData = {
              accidentInformation: wrappingList.AccidentInformation,
              goodSave: wrappingList.GoodSave ? wrappingList.GoodSave : "",
              safetyInitiative: wrappingList.Safetyinitiative
                ? wrappingList.Safetyinitiative
                : "",
              drivingforwSuggestion: wrappingList.Drivingforwsuggestion
                ? wrappingList.Drivingforwsuggestion
                : "",
              goodSaveComments: wrappingList.GoodSaveComments,
              safetyInitiativeComments: wrappingList.SafetyinitiativeComments,
              drivingforwSuggestionComments:
                wrappingList.DrivingforwsuggestionComments,
              goodSaveName: wrappingList.GoodSaveName
                ? wrappingList.GoodSaveName.Title
                : "",
              safetyInitiativeName: wrappingList.SafetyinitiativeName
                ? wrappingList.SafetyinitiativeName.Title
                : "",
              drivingforwSuggestionName: wrappingList.Drivingforw
                ? wrappingList.Drivingforw.Title
                : "",
              wGCrewMemberData: wrappingList.WGCrewMemberData
                ? wrappingList.WGCrewMemberData
                : "",
            };
            getFieldQualityData(wrappingData);
          } else {
            let wrappingData = {
              accidentInformation: "",
              goodSave: "",
              safetyInitiative: "",
              drivingforwSuggestion: "",
              goodSaveComments: "",
              safetyInitiativeComments: "",
              drivingforwSuggestionComments: "",
              goodSaveName: "",
              safetyInitiativeName: "",
              drivingforwSuggestionName: "",
              wGCrewMemberData: "",
            };
            getFieldQualityData(wrappingData);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getFieldQualityData = (wrappingData) => {
    spweb.lists
      .getByTitle(`ATC Field Quality Planning`)
      .items.getById(props.Id)
      .select(
        "*,Supervisor/Title,DeploymentSupervisor/Title,DriverNameYes/Title,wgcrew/Title"
      )
      .expand("Supervisor,DeploymentSupervisor,DriverNameYes,wgcrew")
      .get()
      .then((Response) => {
        let planningData = Response;
        // getResponsibitydata(planningData, wrappingData);
        getRacksCabledAttachements(planningData, wrappingData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getRacksCabledAttachements = (planningData, wrappingData): void => {
    spweb
      .getFolderByServerRelativeUrl(
        `${props.spcontext.pageContext.web.serverRelativeUrl}/Shared Documents/Field Quality Tool/${planningData.Client}/${planningData.trackingNumber}/CablingReport`
        // `${props.spcontext.pageContext.web.serverRelativeUrl}/Shared Documents/Field Quality Tool/MSFT/4300114357/CablingReport`
      )
      .files.get()
      .then((res: any) => {
        let _tempfiles: IFiles[] = [];
        if (res.length) {
          res.forEach((_item: any, i: number) => {
            _tempfiles.push({
              filename: _item.Name ? _item.Name : "",
              url: _item.ServerRelativeUrl ? _item.ServerRelativeUrl : "",
            });
            if (res.length - 1 == i) {
              getResponsibitydata(planningData, wrappingData, [..._tempfiles]);
            }
          });
        } else {
          getResponsibitydata(planningData, wrappingData, _tempfiles);
        }
      })
      .catch((err) => console.log(err, "getRacksCabledAttachements"));
  };
  const getResponsibitydata = (planningData, wrappingData, racksCableFiles) => {
    spweb.lists
      .getByTitle(`Operational Responsibilities`)
      .items.top(5000)
      .select(
        "*,TrackingNumberReference/trackingNumber,TrackingNumberReference/delDate,TrackingNumberReference/racks,TrackingNumberReference/SiteCode,TrackingNumberReference/Country,TrackingNumberReference/Client"
      )
      .expand("TrackingNumberReference")
      .get()
      .then((Response) => {
        var wGCrewMemberDataList = [];
        let wgCrewMemberDataCountry: any[] = [];
        let wgCrewMemberDetails = [];
        let json = [];
        let total: number = 0;

        // Response.filter((data)=>{
        //   if(planningData.Id == data.TrackingNumberReferenceId){
        //     console.log(data);
        //   }
        // })
        // if (planningData.WGCrewMemberData) {
        //   var splitBy = planningData.WGCrewMemberData;
        //   var splitByArr = splitBy.split("~");
        //   splitByArr
        //     ? splitByArr.forEach((data) => {
        //         let splitObj = data != "" ? data.split("|") : "";
        //         splitObj != ""
        //           ? splitObj[0] != "" || splitObj[1] != "" || splitObj[2] != ""
        //             ? wGCrewMemberDataList.push({
        //                 first: splitObj[0],
        //                 name: splitObj[1],
        //                 second: splitObj[2],
        //               })
        //             : ""
        //           : "";
        //       })
        //     : "";
        // } else {
        //   wGCrewMemberDataList.push({
        //     first: "-",
        //     name: "-",
        //     second: "-",
        //   });
        // }
        if (planningData.WGCrewMemberData != null) {
          json = planningData.WGCrewMemberData.split("~");
          if (json.length > 0) {
            let split = json.map((arr) => {
              return arr.split("|");
            });
            split.forEach((num) => {
              if (split.length > 0 && num[0] != "") {
                let count = num[0];
                total = total + parseInt(count);
                wgCrewMemberDetails.push({
                  cableQty: num[0],
                  Name: num[1],
                  boltedQty: num[2],
                });
                wgCrewMemberDataCountry = [
                  // total,
                  // planningData.Country,
                  wgCrewMemberDetails,
                ];
              }
            });
          }
        }

        let operationalData = Response.filter(
          (data) => planningData.Id == data.TrackingNumberReferenceId
        );
        let operationalListObject =
          operationalData.length > 0 ? operationalData[0] : {};

        if (planningData.Id) {
          let userData = {
            Id: planningData.Id,
            trackingNo: planningData.trackingNumber,
            rackQuantity: planningData.racks,
            siteCode: planningData.SiteCode,
            country: planningData.Country,
            client: planningData.Client,
            city: planningData.City,

            supervisor: planningData.Supervisor
              ? planningData.Supervisor.Title
              : "",
            deleteDate: planningData.delDate ? planningData.delDate : null,
            deployementSupervisor: planningData.DeploymentSupervisorId
              ? planningData.DeploymentSupervisor.Title
              : "",
            mobilization: planningData.MobilizationJob,
            driverName: planningData.DriverName ? planningData.DriverName : "",
            isDriver: planningData.isDriver,
            status: planningData.Status,
            healthSafetyPerformance: planningData.HealthSafetyPerformance
              ? planningData.HealthSafetyPerformance
              : null,
            driverNameYes: planningData.DriverNameYesId
              ? planningData.DriverNameYes.Title
              : "",
            siteAddress: planningData.Address,
            additionalDeliveryComments: planningData.AdditionalDeliveryComments,
            wgcrew: planningData.wgcrew
              ? planningData.wgcrew.map((e) => {
                  return { Title: e.Title ? e.Title : "" };
                })
              : "",
            notes: planningData.Notes,
            isActionPlanCompleted: planningData.IsActionPlanCompleted
              ? "Yes"
              : "No",
            escalated: planningData.IsActionPlanCompleted ? "Yes" : "No",
            joptype: planningData.JobType,
            accidentInformation: wrappingData.accidentInformation,
            accidentInformationComments:
              planningData.AccidentInformationComments,
            siteAccessdelay: operationalListObject.SiteAccessDelays,
            siteAccessDelaysTime: operationalListObject.SiteAccessDelaysTime,
            securityOrOtherdelays: operationalListObject.SecurityOrOtherDelays,
            securityorotherdelaysTime:
              operationalListObject.SecurityorotherdelaysTime,
            full5PPE: operationalListObject.Full5PPE,
            siteAccessDelaysComments:
              operationalListObject.SiteAccessDelaysComments,
            securityOrOtherDelaysComments:
              operationalListObject.SecurityOrOtherDelaysComments,
            full5PPEComments: operationalListObject.Full5PPEComments,
            crewNameAuditCheckConductedByCom:
              operationalListObject.CrewNameAuditCheckConductedByCom,
            goodSave: wrappingData.goodSave,
            safetyInitiative: wrappingData.safetyInitiative,
            drivingforwSuggestion: wrappingData.drivingforwSuggestion,
            goodSaveComments: wrappingData.goodSaveComments,
            safetyInitiativeComments: wrappingData.safetyInitiativeComments,
            drivingforwSuggestionComments:
              wrappingData.drivingforwSuggestionComments,
            goodSaveName: wrappingData.goodSaveName,
            safetyInitiativeName: wrappingData.safetyInitiativeName,
            drivingforwSuggestionName: wrappingData.drivingforwSuggestionName,
            wgcrewMemberData: wGCrewMemberDataList,
            isDelete: planningData.isDelete,
            RacksCabled: wgCrewMemberDetails ? wgCrewMemberDetails : [],
            // racksCabledAttachments: racksCableFiles,
          };

          setSingleData({ ...userData });
          setracksCabledFiles([...racksCableFiles]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fileOpenFunction = (url) => {
    window.open("https://atclogisticsie.sharepoint.com" + url);
  };

  useEffect(() => {
    getWrappingList();
  }, []);

  const DeleteItem = (id) => {
    // console.log(id);
    spweb.lists
      .getByTitle(`ATC Field Quality Planning`)
      .items.getById(id)
      .update({ isDelete: true })
      .then(() => {
        setIsDelPopupVisible(false);
        console.log(currentUrl);
        let index = currentUrl.indexOf("?");
        let URL = currentUrl.slice(0, index);
        window.open(URL, "_self");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div style={{ margin: "10px" }}>
      {/* <div>
        <Icon
          className={styles.backicon}
          onClick={() => props.function(false)}
          iconName="Back"
        />
      </div> */}
      {getSingleData.isDelete != true ? (
        <div style={{ marginLeft: "20px" }}>
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
                        style={{ cursor: "pointer" }}
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
          <div className={styles.heading}>
            <div style={{ display: "flex" }}>
              <Icon
                style={{ marginRight: "10px", fontSize: "20px" }}
                iconName="News"
              />
              <h3 style={{ color: "#be6469", margin: "0px" }}>
                View Dashboard
              </h3>
            </div>
            <div>
              <DefaultButton
                primary
                style={{ cursor: "pointer" }}
                text="Delete"
                onClick={(ev) => (
                  setIsDelPopupVisible(true),
                  setDeleteItemID(props.Id),
                  ev.stopPropagation()
                )}
              />
            </div>
          </div>
          <div>
            <div className={styles.generalDetails}>
              <Icon
                style={{ marginRight: "10px", width: "1%" }}
                iconName="ContactCard"
              />
              <h4 style={{ width: "8%", color: "#be4545", margin: "0px" }}>
                General Details
              </h4>
              <div className={styles.underline}></div>
            </div>
            <div style={{ display: "flex" }}>
              <TextField
                disabled
                value={getSingleData.country ? getSingleData.country : "-"}
                label="Country"
                styles={generalDetailsTextbox}
              />
              <TextField
                disabled
                value={getSingleData.joptype ? getSingleData.joptype : "-"}
                label="Job type"
                styles={generalDetailsTextbox}
              />
              <TextField
                disabled
                value={getSingleData.city ? getSingleData.city : "-"}
                label="City"
                styles={generalDetailsTextbox}
              />
              <TextField
                disabled
                value={getSingleData.client ? getSingleData.client : "-"}
                label="Client"
                styles={generalDetailsTextbox}
              />
            </div>
          </div>
          <div>
            <div className={styles.generalDetails}>
              <Icon
                style={{ marginRight: "10px", width: "1%" }}
                iconName="PreviewLink"
              />
              <h4 style={{ width: "6%", color: "#be4545", margin: "0px" }}>
                Site Details
              </h4>
              <div className={styles.underline}></div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <TextField
                disabled
                value={
                  getSingleData.trackingNo ? getSingleData.trackingNo : "-"
                }
                label="Delivery tracking number"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.supervisor ? getSingleData.supervisor : "-"
                }
                label="Supervisor"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.deleteDate
                    ? dateFormater(getSingleData.deleteDate)
                    : "-"
                }
                label="Delivery date"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.rackQuantity ? getSingleData.rackQuantity : "-"
                }
                label="Rack quantity"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.deployementSupervisor
                    ? getSingleData.deployementSupervisor
                    : "-"
                }
                label="Deployment supervisor"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.mobilization ? getSingleData.mobilization : "-"
                }
                label="Mobilization job"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.driverName ? getSingleData.driverName : "-"
                }
                label="Driver name"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={getSingleData.isDriver ? getSingleData.isDriver : "-"}
                label="Driver"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={getSingleData.status ? getSingleData.status : "-"}
                label="Status"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.healthSafetyPerformance
                    ? getSingleData.healthSafetyPerformance
                    : "-"
                }
                label="Health safety performance"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={getSingleData.siteCode ? getSingleData.siteCode : "-"}
                label="Site code"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.driverNameYes
                    ? getSingleData.driverNameYes
                    : "-"
                }
                label="Driver name yes"
                styles={siteDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.siteAddress ? getSingleData.siteAddress : "-"
                }
                label="Site address"
                styles={siteDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
              <TextField
                disabled
                value={
                  getSingleData.additionalDeliveryComments
                    ? getSingleData.additionalDeliveryComments
                    : "-"
                }
                label="Additional delivery comments"
                styles={siteDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
              <TextField
                disabled
                value={getSingleData.notes ? getSingleData.notes : "-"}
                label="Notes"
                styles={siteDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
              {/* <TextField
              disabled
              value={
                getSingleData.wgcrew
                  ? getSingleData.wgcrew.map((item) => item.Title)
                  : "-"
              }
              label="White glove crew on delivery"
              styles={siteDetailsTextbox}
              multiline
              rows={3}
              resizable={false}
            /> */}
              {getSingleData.wgcrew
                ? getSingleData.wgcrew.map((item, index) => (
                    <TextField
                      disabled
                      value={item.Title}
                      label={"White glove crew on delivery " + (index + 1)}
                      styles={siteDetailsTextbox}
                    />
                  ))
                : ""}
              <TextField
                disabled
                value={
                  getSingleData.isActionPlanCompleted
                    ? getSingleData.isActionPlanCompleted
                    : "-"
                }
                label="Action plan completed"
                styles={siteDetailsTextbox}
              />
            </div>
          </div>
          <div>
            <div className={styles.generalDetails}>
              <Icon
                style={{ marginRight: "10px", width: "1%" }}
                iconName="WaitlistConfirm"
              />
              <h4 style={{ width: "9%", color: "#be4545", margin: "0px" }}>
                Checklist Details
              </h4>
              <div className={styles.underline}></div>
            </div>
            <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
              <TextField
                disabled
                value={
                  getSingleData.siteAccessdelay
                    ? getSingleData.siteAccessdelay
                    : "-"
                }
                label="Site access delays"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.siteAccessDelaysTime
                    ? getSingleData.siteAccessDelaysTime
                    : "-"
                }
                label="Site access delays time"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.securityOrOtherdelays
                    ? getSingleData.securityOrOtherdelays
                    : "-"
                }
                label="Security or other delays"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.securityorotherdelaysTime
                    ? getSingleData.securityorotherdelaysTime
                    : "-"
                }
                label="Security or other delays time"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={getSingleData.full5PPE ? getSingleData.full5PPE : "-"}
                label="Full5PPE"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.siteAccessDelaysComments
                    ? getSingleData.siteAccessDelaysComments
                    : "-"
                }
                label="Site access delays comments"
                styles={generalDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
              <TextField
                disabled
                value={
                  getSingleData.securityOrOtherDelaysComments
                    ? getSingleData.securityOrOtherDelaysComments
                    : "-"
                }
                label="Security or other delays comments"
                styles={generalDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
              <TextField
                disabled
                value={
                  getSingleData.full5PPEComments
                    ? getSingleData.full5PPEComments
                    : "-"
                }
                label="Full5PPE comments"
                styles={generalDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
              <TextField
                disabled
                value={
                  getSingleData.crewNameAuditCheckConductedByCom
                    ? getSingleData.crewNameAuditCheckConductedByCom
                    : "-"
                }
                label="Crew name audit check conducted by comments"
                styles={generalDetailsTextbox1}
                multiline
                rows={3}
                resizable={false}
              />
              <TextField
                disabled
                value={
                  getSingleData.accidentInformation
                    ? getSingleData.accidentInformation
                    : "-"
                }
                label="Accident information"
                styles={generalDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.accidentInformationComments
                    ? getSingleData.accidentInformationComments
                    : "-"
                }
                label="Accident information comments"
                styles={generalDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
            </div>
          </div>

          <div>
            <div className={styles.generalDetails}>
              <Icon
                style={{ marginRight: "10px", width: "1%" }}
                iconName="WaitlistConfirm"
              />
              <h4 style={{ width: "10%", color: "#be4545", margin: "0px" }}>
                Wrapping Details
              </h4>
              <div className={styles.underline}></div>
            </div>
            <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
              <TextField
                disabled
                value={getSingleData.goodSave ? getSingleData.goodSave : "-"}
                label="Good save"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.safetyInitiative
                    ? getSingleData.safetyInitiative
                    : "-"
                }
                label="Safety initiative"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.drivingforwSuggestion
                    ? getSingleData.drivingforwSuggestion
                    : "-"
                }
                label="Driving forward suggestion"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.goodSaveName ? getSingleData.goodSaveName : "-"
                }
                label="Good savename"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.safetyInitiativeName
                    ? getSingleData.safetyInitiativeName
                    : "-"
                }
                label="Safety initiative name"
                styles={generalDetailsTextbox3}
              />
              <TextField
                disabled
                value={
                  getSingleData.drivingforwSuggestionName
                    ? getSingleData.drivingforwSuggestionName
                    : "-"
                }
                label="Driving forward suggestion name"
                styles={generalDetailsTextbox}
              />
              <TextField
                disabled
                value={
                  getSingleData.goodSaveComments
                    ? getSingleData.goodSaveComments
                    : "-"
                }
                label="Good save comments"
                styles={generalDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
              <TextField
                disabled
                value={
                  getSingleData.safetyInitiativeComments
                    ? getSingleData.safetyInitiativeComments
                    : "-"
                }
                label="Safety initiative comments"
                styles={generalDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
              <TextField
                disabled
                value={
                  getSingleData.drivingforwSuggestionComments
                    ? getSingleData.drivingforwSuggestionComments
                    : "-"
                }
                label="Driving forward suggestion comments"
                styles={generalDetailsTextbox}
                multiline
                rows={3}
                resizable={false}
              />
            </div>
          </div>

          <div style={{ width: "24%" }}>
            <div className={styles.fileSectionlabel}>
              <span>Racks Cabled Attachments</span>
            </div>
            <div className={styles.withFiles}>
              {racksCabledFiles.length > 0 ? (
                racksCabledFiles.map((file) => (
                  <div>
                    <span
                      className={styles.files}
                      onClick={() => fileOpenFunction(file.url)}
                    >
                      {" "}
                      {file.filename.toLowerCase().match(".jpg") ||
                      file.filename.toLowerCase().match(".jpeg") ? (
                        <FontIcon
                          iconName="PictureFill"
                          className={classNames.deepSkyBlue}
                        />
                      ) : file.filename.toLowerCase().match(".pdf") ? (
                        <FontIcon
                          iconName="PDF"
                          className={classNames.greenYellow}
                        />
                      ) : file.filename.toLowerCase().match(".xlsx") ||
                        file.filename.toLowerCase().match(".doc") ||
                        file.filename.toLowerCase().match(".xml") ? (
                        <FontIcon
                          iconName="TextDocument"
                          className={classNames.salmon}
                        />
                      ) : (
                        ""
                      )}
                      {file.filename}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ backgroundColor: "#f3f2f1" }}>
                  <span className={styles.files}>
                    <FontIcon
                      iconName="EmptyRecycleBin"
                      className={classNames.salmon}
                    />
                    No Files
                  </span>
                </div>
              )}
            </div>
          </div>
          <div>
            <DetailsList
              items={getSingleData.RacksCabled ? getSingleData.RacksCabled : ""}
              columns={columns}
              setKey="set"
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
              styles={gridStyles}
              // onRenderRow={onRenderRow}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h4>No record found !</h4>
        </div>
      )}
    </div>
  );
}
