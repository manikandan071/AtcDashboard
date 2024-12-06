import * as React from "react";
import { useState, useEffect } from "react";
import { Web } from "@pnp/sp/presets/all";
import FieldQualityDashboard from "./FieldQuality/FieldQualityDashboard";
import FieldQualityView from "./FieldQuality/FieldQualityView";
import TimeSheet from "./TimeSheet/TimeSheetDashboard";
import TimeSheetView from "./TimeSheet/TimeSheetView";
import TravelExpense from "./TravelExpense";
let tsWeb = Web(
  "https://atclogisticsie.sharepoint.com/sites/FieldQualityDashboard"
);
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

export default function Dashboard(props: any): JSX.Element {
  let loggedinuser = props.spcontext.pageContext.user.email;
  const [showDashboard, setShowDashboard] = useState<string>(
    "fieldQualityDashboard"
    // "timeSheetDashboard"
  );
  // const [showDashboard, setShowDashboard] = useState<string>("Travel Expense");
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
        // console.log(Response);
        let onlyTSPermission = Response.filter((user) => {
          return user.Email == loggedinuser;
        });
        setOnlyTimeSheetPermission([...onlyTSPermission]);
        init([...onlyTSPermission]);
      })
      .catch((err) => {
        console.log(err, "User don't have permission ");
      });
  };

  const init = (res: any[]): void => {
    const urlParams = new URLSearchParams(window.location.search);
    let fQID = urlParams.get("FqID");
    let tSID = urlParams.get("TsID");

    if (fQID) {
      setFieldQualityId(parseInt(fQID));
      setShowDashboard("fieldQualityView");
      setFieldQualityDash("fieldQualityView");
    } else {
      setFieldQualityDash("fieldQualityDashboard");
    }
    if (tSID) {
      // setShowDashboard(false);
      setTimeSheetId(parseInt(tSID));
      setShowDashboard("timeSheetView");
      setTimeSheetDash("timeSheetView");
    } else if (res.length) {
      setShowDashboard("timeSheetDashboard");
      setTimeSheetDash("timeSheetDashboard");
    }
  };

  useEffect(() => {
    getOnlyTimeSheetPermissions();
  }, []);
  return (
    <div>
      {onlyTimeSheetPermission.length == 0 ? (
        // showDashboard == "fieldQualityDashboard" ? (
        showDashboard == "fieldQualityDashboard" ? (
          <FieldQualityDashboard
            DashboardChangeFun={setShowDashboard}
            spcontext={props.spcontext}
          />
        ) : showDashboard == "fieldQualityView" ? (
          <FieldQualityView Id={fieldQualityId} spcontext={props.spcontext} />
        ) : // )
        showDashboard == "timeSheetDashboard" ? (
          <TimeSheet
            DashboardChangeFun={setShowDashboard}
            spcontext={props.spcontext}
          />
        ) : (
          // : showDashboard == "Travel Expense" ? (
          //   <TravelExpense
          //     DashboardChangeFun={setShowDashboard}
          //     spcontext={props.spcontext}
          //   />
          // )
          <TimeSheetView Id={timeSheetId} />
        )
      ) : showDashboard == "timeSheetDashboard" ? (
        <TimeSheet
          DashboardChangeFun={setShowDashboard}
          spcontext={props.spcontext}
        />
      ) : (
        // : showDashboard == "Travel Expense" ? (
        //   <TravelExpense
        //     DashboardChangeFun={setShowDashboard}
        //     spcontext={props.spcontext}
        //   />
        // )
        <TimeSheetView Id={timeSheetId} />
      )}
    </div>
  );
}
// export default Dashboard;
