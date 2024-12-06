import * as React from "react";
import { useState, useEffect } from "react";
import * as moment from "moment";
import { sp, Web } from "@pnp/sp/presets/all";
import {
  TextField,
  ITextFieldStyles,
  Icon,
  DetailsList,
  SelectionMode,
  IDetailsListStyles,
  IColumn,
} from "@fluentui/react";
import { FontIcon } from "@fluentui/react/lib/Icon";
import { mergeStyles, mergeStyleSets } from "@fluentui/react/lib/Styling";
import styles from "../FieldQualityDashboard.module.scss";
import { Folder, log } from "sp-pnp-js";

let spweb = Web(
  "https://atclogisticsie.sharepoint.com/sites/PlanningOperations/Field%20Quality"
  // "https://atclogisticsie.sharepoint.com/sites/TechnoRUCS_Dev_Site"
);
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

export default function TimeSheetView(props: any): JSX.Element {
  const [timeSheetObj, setTimeSheetObj]: any = useState({});
  const [personalCard, setPersonalCard]: any = useState([]);
  const [serviceDetails, setServiceDetails] = useState([]);
  const [atcCard, setAtcCard]: any = useState([]);

  const columns = [
    {
      key: "column1",
      name: "Site Code",
      fieldName: "sitecode",
      minWidth: 100,
      maxWidth: 200,
      onRender: (item) => {
        return <div title={item.sitecode}>{item.sitecode}</div>;
      },
    },
    {
      key: "column2",
      name: "Client",
      fieldName: "client",
      minWidth: 50,
      maxWidth: 100,
      onRender: (item) => (
        <>
          <div>{item.client}</div>
        </>
      ),
    },
    {
      key: "column3",
      name: "Service Code",
      fieldName: "serCode",
      minWidth: 50,
      maxWidth: 100,
      onRender: (item) => (
        <>
          <div>{item.serCode}</div>
        </>
      ),
    },
    {
      key: "column4",
      name: "Service Description",
      fieldName: "serDescription",
      minWidth: 100,
      maxWidth: 200,
      onRender: (item) => (
        <>
          <div>{item.serDescription}</div>
        </>
      ),
    },
    {
      key: "column5",
      name: "Start Time",
      fieldName: "startTime",
      minWidth: 50,
      maxWidth: 100,
      onRender: (item) => (
        <>
          <div>{item.startTime}</div>
        </>
      ),
    },
    {
      key: "column6",
      name: "Finish Time",
      fieldName: "finishTime",
      minWidth: 50,
      maxWidth: 100,
      onRender: (item) => (
        <>
          <div>{item.finishTime}</div>
        </>
      ),
    },
  ];

  const dateFormater = (date: Date): string => {
    return !date ? "" : moment(date).format("DD/MM/YYYY");
  };

  const generalDetailsTextbox: Partial<ITextFieldStyles> = {
    root: {
      width: "25%",
      padding: "13px 30px 0px 0px",
      borderRadius: "4px",
      ".ms-Label": { color: "#a55860" },
    },
    field: { fontSize: 14, color: "#000" },
  };
  const generalDetailsTextbox1: Partial<ITextFieldStyles> = {
    root: {
      width: "50%",
      padding: "13px 30px 0px 0px",
      borderRadius: "4px",
      ".ms-Label": { color: "#a55860" },
    },
    field: { fontSize: 14, color: "#000" },
  };
  const generalDetailsTextbox2: Partial<ITextFieldStyles> = {
    root: {
      width: "37%",
      padding: "13px 19px 0px 0px",
      borderRadius: "4px",
      ".ms-Label": { color: "#a55860" },
    },
    field: { fontSize: 14, color: "#000" },
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

  const getTimeSheetlist = (Id: number) => {
    spweb.lists
      .getByTitle(`Timesheet`)
      .items.getById(Id)
      // .getById(props.Id)
      .select("*,Name/Title")
      .expand("Name")
      .get()
      .then(async (Response) => {
        let personalUrl =
          "/sites/PlanningOperations/Field%20Quality/Shared Documents/TimeSheet/" +
          moment(Response.Date).format("MMMM-YYYY") +
          "/" +
          Response.City +
          "/" +
          Response.Name.Title +
          "-" +
          moment(Response.Date).format("YYYY-MM-DD") +
          "/Personal Card";
        let atcUrl =
          "/sites/PlanningOperations/Field%20Quality/Shared Documents/TimeSheet/" +
          moment(Response.Date).format("MMMM-YYYY") +
          "/" +
          Response.City +
          "/" +
          Response.Name.Title +
          "-" +
          moment(Response.Date).format("YYYY-MM-DD") +
          "/ATC Card";
        await spweb
          .getFolderByServerRelativeUrl(personalUrl)
          .files.get()
          .then((data) => {
            // console.log(data);
            if (data.length > 0) {
              let personalCardFiles = [];
              data.forEach((file) => {
                personalCardFiles.push({
                  fileName: file.Name,
                  fileUrl: file.ServerRelativeUrl,
                });
              });
              setPersonalCard([...personalCardFiles]);
            }
          })
          .catch((error) => {
            console.log(error);
          });

        await spweb
          .getFolderByServerRelativeUrl(atcUrl)
          .files()
          .then((data) => {
            if (data.length > 0) {
              let atcCardFiles = [];
              data.forEach((file) => {
                atcCardFiles.push({
                  fileName: file.Name,
                  fileUrl: file.ServerRelativeUrl,
                });
              });
              setAtcCard([...atcCardFiles]);
            }
          })
          .catch((error) => {
            console.log(error);
          });

        let timeSheetObject = {
          city: Response.City ? Response.City : "",
          week: Response.Week ? Response.Week : "",
          supervisor: Response.Name ? Response.Name.Title : "",
          date: Response.Date ? Response.Date : "",
          costCenter: Response.CostCenter ? Response.CostCenter : "",
          startTime: Response.StartTime ? Response.StartTime : "",
          finishTime: Response.FinishTime ? Response.FinishTime : "",
          overTime: Response.OverTime ? Response.OverTime : "",
          status: Response.Status ? Response.Status : "",
          siteCode: Response.SiteCode ? Response.SiteCode : "",
          mobilization: Response.Mobilization ? Response.Mobilization : "",
          travel: Response.Travel ? Response.Travel : "",
          otherSiteCode: Response.OtherSiteCode ? Response.OtherSiteCode : "",
          comments: Response.Comments ? Response.Comments : "",
          reviewComments: Response.ReviewComments
            ? Response.ReviewComments
            : "",
          kmWithPrivateCar: Response.KmWithPrivateCar
            ? Response.KmWithPrivateCar
            : "",
          cityOverNight: Response.CityOverNight ? Response.CityOverNight : "",
          travelWithCar: Response.TravelWithCar ? Response.TravelWithCar : "",
          overTimeComments: Response.OverTimeComments
            ? Response.OverTimeComments
            : "",
          expense: Response.Expense ? Response.Expense : "",
          OvertimecommentsDrp: Response.OvertimecommentsDrp
            ? Response.OvertimecommentsDrp.join()
            : "",
        };

        if (timeSheetObject) {
          getTMSTServiceDetails(Id, timeSheetObject);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getTMSTServiceDetails = (Id: number, timeSheetObject: any) => {
    spweb.lists
      .getByTitle("TMST_ServiceDetails")
      .items.select("*,ServiceCode/Title,ServiceDescription/ServiceDescription")
      .expand("ServiceCode,ServiceDescription")
      .filter(`TMST_IDId eq ${Id}`)
      .orderBy("ID", false)
      .get()
      .then(async (data: any) => {
        let _tempTMSTSServiceDetails = [];
        if (data.length) {
          data.forEach((ser: any, i: number) => {
            _tempTMSTSServiceDetails.push({
              sitecode: ser.SiteCode ? ser.SiteCode : "",
              client: ser.Client ? ser.Client : "",
              serCode: ser.ServiceCode ? ser.ServiceCode.Title : "",
              serDescription: ser.ServiceDescription
                ? ser.ServiceDescription.ServiceDescription
                : "",
              startTime: ser.StartTime ? ser.StartTime : "",
              finishTime: ser.FinishTime ? ser.FinishTime : "",
              serviceID: ser.TMST_IDId,
              otherSitecode: ser.OtherSiteCode ? ser.OtherSiteCode : "",
            });
            if (data.length - 1 == i) {
              setTimeSheetObj({ ...timeSheetObject });
              setServiceDetails([..._tempTMSTSServiceDetails]);
            }
          });
        } else {
          setTimeSheetObj({});
          setServiceDetails([]);
        }
      })
      .catch((err) => console.log(err, "getTMSTServiceDetails"));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let tSID = urlParams.get("TsID");
    getTimeSheetlist(parseInt(tSID));
  }, []);

  const fileOpenFunction = (url) => {
    window.open("https://atclogisticsie.sharepoint.com" + url);
  };

  return (
    <div style={{ margin: "10px" }}>
      <div className={styles.heading}>
        <div style={{ display: "flex" }}>
          <Icon
            style={{ marginRight: "10px", fontSize: "20px" }}
            iconName="News"
          />
          <h3 style={{ color: "#be6469", margin: "0px" }}>View Time Sheet</h3>
        </div>
        <div></div>
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
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <TextField
            disabled
            value={timeSheetObj.week ? timeSheetObj.week : "-"}
            label="Week"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={
              timeSheetObj.date
                ? moment(timeSheetObj.date).format("DD/MM/YYYY")
                : "-"
            }
            label="Date"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={timeSheetObj.supervisor ? timeSheetObj.supervisor : "-"}
            label="Name"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={timeSheetObj.costCenter ? timeSheetObj.costCenter : "-"}
            label="Cost Center"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={timeSheetObj.startTime ? timeSheetObj.startTime : "-"}
            label="Start time"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={timeSheetObj.finishTime ? timeSheetObj.finishTime : "-"}
            label="Finish time"
            styles={generalDetailsTextbox}
          />
          {/* <TextField
            disabled
            value={timeSheetObj.siteCode ? timeSheetObj.siteCode : "-"}
            label="Site code"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={
              timeSheetObj.otherSiteCode ? timeSheetObj.otherSiteCode : "-"
            }
            label="Other sitecode"
            styles={generalDetailsTextbox}
          /> */}
          <TextField
            disabled
            value={timeSheetObj.comments ? timeSheetObj.comments : "-"}
            label="Comments"
            styles={generalDetailsTextbox1}
            multiline
            rows={3}
            resizable={false}
          />
          <TextField
            disabled
            value={
              timeSheetObj.reviewComments ? timeSheetObj.reviewComments : "-"
            }
            label="Review comments"
            styles={generalDetailsTextbox1}
            multiline
            rows={3}
            resizable={false}
          />
          <TextField
            disabled
            value={timeSheetObj.status ? timeSheetObj.status : "-"}
            label="Status"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={timeSheetObj.city ? timeSheetObj.city : "-"}
            label="City"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={
              timeSheetObj.travelWithCar ? timeSheetObj.travelWithCar : "-"
            }
            label="Travel with car"
            styles={generalDetailsTextbox}
          />
        </div>
      </div>
      <div>
        <div className={styles.generalDetails}>
          <Icon
            style={{ marginRight: "10px", width: "1%" }}
            iconName="ContactCard"
          />
          <h4 style={{ width: "14.5%", color: "#be4545", margin: "0px" }}>
            Overtime & Travel Details
          </h4>
          <div className={styles.underline}></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <TextField
            disabled
            value={timeSheetObj.overTime ? timeSheetObj.overTime : "-"}
            label="Over time"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={timeSheetObj.travel ? timeSheetObj.travel : "-"}
            label="Travel"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={
              timeSheetObj.kmWithPrivateCar
                ? timeSheetObj.kmWithPrivateCar
                : "-"
            }
            label="KM with private car"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={
              timeSheetObj.cityOverNight ? timeSheetObj.cityOverNight : "-"
            }
            label="City over night"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={timeSheetObj.mobilization ? timeSheetObj.mobilization : "-"}
            label="Mobilization"
            styles={generalDetailsTextbox}
          />
          <TextField
            disabled
            value={
              timeSheetObj.overTimeComments
                ? timeSheetObj.overTimeComments
                : "-"
            }
            label="Over time comments"
            styles={generalDetailsTextbox2}
            multiline
            rows={3}
            resizable={false}
          />
          <TextField
            disabled
            value={
              timeSheetObj.OvertimecommentsDrp
                ? timeSheetObj.OvertimecommentsDrp
                : "-"
            }
            label="Over time reason"
            styles={generalDetailsTextbox2}
            multiline
            rows={3}
            resizable={false}
          />
          <TextField
            disabled
            value={timeSheetObj.expense ? timeSheetObj.expense : "-"}
            label="Expense"
            styles={generalDetailsTextbox}
          />

          <div style={{ display: "flex", width: "75%" }}>
            <div
              // style={{ margin: "0px 30px 0px 0px" }}
              className={styles.fileSection}
            >
              <div className={styles.fileSectionlabel}>
                <span>Personal Card</span>
              </div>
              <div className={styles.withFiles}>
                {personalCard.length > 0 ? (
                  personalCard.map((file) => (
                    <div>
                      <span
                        className={styles.files}
                        onClick={() => fileOpenFunction(file.fileUrl)}
                      >
                        {" "}
                        {file.fileName.toLowerCase().match(".jpg") ||
                        file.fileName.toLowerCase().match(".jpeg") ? (
                          <FontIcon
                            iconName="PictureFill"
                            className={classNames.deepSkyBlue}
                          />
                        ) : file.fileName.toLowerCase().match(".pdf") ? (
                          <FontIcon
                            iconName="PDF"
                            className={classNames.greenYellow}
                          />
                        ) : file.fileName.toLowerCase().match(".xlsx") ||
                          file.fileName.toLowerCase().match(".doc") ||
                          file.fileName.toLowerCase().match(".xml") ? (
                          <FontIcon
                            iconName="TextDocument"
                            className={classNames.salmon}
                          />
                        ) : (
                          ""
                        )}
                        {file.fileName}
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
            <div className={styles.fileSection}>
              <div className={styles.fileSectionlabel}>
                <span>ATC card</span>
              </div>
              <div className={styles.withFiles}>
                {atcCard.length > 0 ? (
                  atcCard.map((file) => (
                    <div>
                      <span
                        className={styles.files}
                        onClick={() => fileOpenFunction(file.fileUrl)}
                      >
                        {file.fileName.toLowerCase().match(".jpg") ||
                        file.fileName.toLowerCase().match(".jpeg") ? (
                          <FontIcon
                            iconName="PictureFill"
                            className={classNames.deepSkyBlue}
                          />
                        ) : file.fileName.toLowerCase().match(".pdf") ? (
                          <FontIcon
                            iconName="PDF"
                            className={classNames.greenYellow}
                          />
                        ) : file.fileName.toLowerCase().match(".xlsx") ||
                          file.fileName.toLowerCase().match(".doc") ||
                          file.fileName.toLowerCase().match(".xml") ? (
                          <FontIcon
                            iconName="TextDocument"
                            className={classNames.salmon}
                          />
                        ) : (
                          ""
                        )}
                        {file.fileName}
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
          </div>
        </div>
      </div>

      {/* Service Details detailslist */}
      <div className={styles.generalDetails}>
        <Icon
          style={{ marginRight: "10px", width: "1%" }}
          iconName="ContactCard"
        />
        <h4 style={{ width: "10%", color: "#be4545", margin: "0px" }}>
          ServiceType Details
        </h4>
        <div className={styles.underline}></div>
      </div>
      <DetailsList
        items={serviceDetails}
        columns={columns}
        selectionMode={SelectionMode.none}
        styles={gridStyles}
      />
    </div>
  );
}
