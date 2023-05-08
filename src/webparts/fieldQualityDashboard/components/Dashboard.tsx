import * as React from "react";
import { useState, useEffect } from "react";
import { Web } from "@pnp/sp/presets/all";
import FieldQualityDashboard from "./FieldQuality/FieldQualityDashboard";
import FieldQualityView from "./FieldQuality/FieldQualityView";
import TimeSheet from "./TimeSheet/TimeSheetDashboard";
import TimeSheetView from "./TimeSheet/TimeSheetView";
let tsWeb = Web(
  "https://atclogisticsie.sharepoint.com/sites/FieldQualityDashboard"
);
export default function Dashboard(props: any): JSX.Element {
  let loggedinuser = props.spcontext.pageContext.user.email;
  const [showDashboard, setShowDashboard] = useState(true);
  const [fieldQualityDash, setFieldQualityDash] = useState(
    "fieldQualityDashboard"
  );
  const [timeSheetDash, setTimeSheetDash] = useState("timeSheetDashboard");
  const [fieldQualityId, setFieldQualityId] = useState(null);
  const [timeSheetId, setTimeSheetId] = useState(null);
  const [onlyTimeSheetPermission, setOnlyTimeSheetPermission] = useState([]);

  const getOnlyTimeSheetPermissions = () => {
    tsWeb.siteGroups
      .getByName("Timesheet_HR")
      .users.get()
      .then((Response) => {
        console.log(Response);
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
    getOnlyTimeSheetPermissions();
    const urlParams = new URLSearchParams(window.location.search);
    let fQID = urlParams.get("FqID");
    let tSID = urlParams.get("TsID");

    if (fQID) {
      setFieldQualityId(parseInt(fQID));
      setFieldQualityDash("fieldQualityView");
    } else {
      setFieldQualityDash("fieldQualityDashboard");
    }
    if (tSID) {
      setShowDashboard(false);
      setTimeSheetId(parseInt(tSID));
      setTimeSheetDash("timeSheetView");
    } else {
      setTimeSheetDash("timeSheetDashboard");
    }
  }, []);
  return (
    <div>
      {onlyTimeSheetPermission.length == 0 ? (
        showDashboard ? (
          fieldQualityDash == "fieldQualityDashboard" ? (
            <FieldQualityDashboard
              DashboardChangeFun={setShowDashboard}
              spcontext={props.spcontext}
            />
          ) : (
            <FieldQualityView Id={fieldQualityId} />
          )
        ) : timeSheetDash == "timeSheetDashboard" ? (
          <TimeSheet
            DashboardChangeFun={setShowDashboard}
            spcontext={props.spcontext}
          />
        ) : (
          <TimeSheetView Id={timeSheetId} />
        )
      ) : timeSheetDash == "timeSheetDashboard" ? (
        <TimeSheet
          DashboardChangeFun={setShowDashboard}
          spcontext={props.spcontext}
        />
      ) : (
        <TimeSheetView Id={timeSheetId} />
      )}
    </div>
  );
}
// export default Dashboard;
