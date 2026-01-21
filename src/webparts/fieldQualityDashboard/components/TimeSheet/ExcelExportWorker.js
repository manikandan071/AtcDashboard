// timesheetWorker.js
importScripts("https://unpkg.com/exceljs/dist/exceljs.min.js");
importScripts("https://unpkg.com/moment/min/moment.min.js");

self.onmessage = async ({ data: { list } }) => {
  debugger;
  const Excel = globalThis.ExcelJS;
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("TimeSheet");
  const crmFlag = list.some((item) => item.CRMId !== "-");
  const CRMworksheet = crmFlag ? workbook.addWorksheet("CRM_Activity") : null;

  // define columns (you can inline or import these definitions)
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

  // group by week
  const weeklyDataMap = list.reduce((m, it) => {
    (m.get(it.week) || m.set(it.week, [])).get(it.week).push(it);
    return m;
  }, new Map());

  let rowCounter = 2;
  for (const week of uniqueWeeks) {
    let totalHours = 0;
    let totalMinutes = 0;
    const weeklyData = weeklyDataMap.get(week);
    let i = 0;
    for (const item of weeklyData) {
      if (item.totalHours != "") {
        let timeSplit = item.totalHours.split(":");
        totalHours += parseInt(timeSplit[0]);
        if (totalMinutes < 60) {
          totalMinutes += parseInt(timeSplit[1]);
        } else {
          totalHours += 1;
          totalMinutes = 0;
        }
      }

      const meetingPersons = item.oneToOneMeetingPerson?.join(",") || "-";

      // Add CRM Data if applicable
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

      // Add service details if available
      if (item.serviceDetails?.length) {
        const startRow = worksheet._rows.length + 1;
        const endRow = startRow + item.serviceDetails.length - 1;

        for (const service of item.serviceDetails) {
          worksheet.addRow({
            week: item.week ? item.week : "-",
            date: item.date ? dateFormater(item.date) : "-",
            city: item.city ? item.city : "-",
            supervisor: item.supervisor ? item.supervisor : "-",
            siteCode:
              service.sitecode == "Others"
                ? service.otherSiteCode
                : service.sitecode
                ? service.sitecode
                : "-",
            client: service.client ? service.client : "-",
            serCode: service.serCode ? service.serCode : "-",
            serDescription: service.serDescription
              ? service.serDescription
              : "-",
            startTime: service.startTime ? service.startTime : "-",
            finishTime: service.finishTime ? service.finishTime : "-",
            costCenter: item.costCenter ? item.costCenter : "-",
            totalHours: item.totalHours ? item.totalHours : "-",
            ifOverTime: item.overTime ? "Yes" : "No",
            overTime:
              item.overTime && item.overtimeSts == "Approved"
                ? item.overTime
                : "-",
            status: item.status ? item.status : "-",
            mobilization: item.mobilization ? item.mobilization : "-",
            travel: item.travel ? item.travel : "-",
            otherSiteCode: item.otherSiteCode ? item.otherSiteCode : "-",
            comments: item.comments ? item.comments.toString() : "-",
            reviewComments: item.reviewComments ? item.reviewComments : "-",
            kmWithPrivateCar: item.kmWithPrivateCar
              ? item.kmWithPrivateCar
              : "-",
            cityOverNight: item.cityOverNight ? item.cityOverNight : "-",
            travelWithCar: item.travelWithCar ? item.travelWithCar : "-",
            overTimeComments: item.overTimeComments
              ? item.overTimeComments
              : "-",
            expense: item.expense ? item.expense : "-",
            AtcCreditAmount: item.AtcCreditAmount ? item.AtcCreditAmount : "-",
            personalCardAmount: item.personalCardAmount
              ? item.personalCardAmount
              : "-",
            isRefund: item.isRefund,
            overtimecommentsDrp: item.overtimecommentsDrp
              ? item.overtimecommentsDrp.join(",")
              : "-",
            country: item.Country ? item.Country : "-",
            orgCity: item.originCity ? item.originCity : "-",
            orgCountry: item.originCountry ? item.originCountry : "-",
            CRMActivity: item.CRMActivity ? item.CRMActivity : "-",
            oneToOneMeeting: item.oneTOoneMeeting ? "Yes" : "No",
            meetingPerson: meetingPersons ? meetingPersons : "-",
            onCall: item.onCallVisible ? "Yes" : "No",
          });
        }

        // Merge relevant cells
        ["C", "D", "E", "F", "G", "H", "I"].forEach((col) => {
          worksheet.mergeCells(`${col}${startRow}:${col}${endRow}`);
        });
      } else {
        worksheet.addRow({
          week: item.week ? item.week : "-",
          date: item.date ? dateFormater(item.date) : "-",
          city: item.city ? item.city : "-",
          supervisor: item.supervisor ? item.supervisor : "-",
          siteCode: item.siteCode ? item.siteCode : "-",
          client: item.client ? item.client : "-",
          serCode: item.serCode ? item.serCode : "-",
          serDescription: item.serDescription ? item.serDescription : "-",
          startTime: item.startTime ? item.startTime : "-",
          finishTime: item.finishTime ? item.finishTime : "-",
          costCenter: item.costCenter ? item.costCenter : "-",
          totalHours: item.totalHours ? item.totalHours : "-",
          ifOverTime: item.overTime ? "Yes" : "No",
          overTime:
            item.overTime && item.overtimeSts == "Approved"
              ? item.overTime
              : "-",
          status: item.status ? item.status : "-",
          mobilization: item.mobilization ? item.mobilization : "-",
          travel: item.travel ? item.travel : "-",
          otherSiteCode: item.otherSiteCode ? item.otherSiteCode : "-",
          comments: item.comments ? item.comments.toString() : "-",
          reviewComments: item.reviewComments ? item.reviewComments : "-",
          kmWithPrivateCar: item.kmWithPrivateCar ? item.kmWithPrivateCar : "-",
          cityOverNight: item.cityOverNight ? item.cityOverNight : "-",
          travelWithCar: item.travelWithCar ? item.travelWithCar : "-",
          overTimeComments: item.overTimeComments ? item.overTimeComments : "-",
          expense: item.expense ? item.expense : "-",
          AtcCreditAmount: item.AtcCreditAmount ? item.AtcCreditAmount : "-",
          personalCardAmount: item.personalCardAmount
            ? item.personalCardAmount
            : "-",
          isRefund: item.isRefund,
          overtimecommentsDrp: item.overtimecommentsDrp
            ? item.overtimecommentsDrp.join(",")
            : "-",
          country: item.Country ? item.Country : "-",
          orgCity: item.originCity ? item.originCity : "-",
          orgCountry: item.originCountry ? item.originCountry : "-",
          CRMActivity: item.CRMActivity ? item.CRMActivity : "-",
          oneToOneMeeting: item.oneTOoneMeeting ? "Yes" : "No",
          meetingPerson: meetingPersons ? meetingPersons : "-",
          onCall: item.onCallVisible ? "Yes" : "No",
        });
      }

      let date = new Date(item.date);
      let isMobilization = EmployeeConfig.some(
        (a) => a.Name == item.supervisor && a.Mobilization
      );
      let day = date.toLocaleString("en-us", { weekday: "long" });
      if (day == "Saturday" || day == "Sunday") {
        worksheet.getCell("B" + (i + rowCounter)).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f8696b" },
        };
      }

      if (isMobilization) {
        worksheet.getCell("C" + (i + rowCounter)).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f8696b" },
        };
      }
      if (item.overTime) {
        worksheet.getCell("K" + (i + rowCounter)).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f8696b" },
        };
      }
      if (item.status == "Submitted") {
        worksheet.getCell("M" + (i + rowCounter)).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "90EE90" },
        };
      } else if (item.status == "Draft") {
        worksheet.getCell("M" + (i + rowCounter)).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "d3d3d3" },
        };
      } else if (item.status == "Pending Approval") {
        worksheet.getCell("M" + (i + rowCounter)).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f4f2bf" },
        };
      } else if (item.status == "InReview") {
        worksheet.getCell("M" + (i + rowCounter)).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f4f2bf" },
        };
      }
      i++;
    }

    if (totalMinutes >= 60) {
      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes %= 60;
    }

    worksheet.addRow({
      totalHours: `Total = ${totalHours}:${totalMinutes}`,
    });
    worksheet.getCell(`J + ${worksheet._rows.length}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f8696b" },
    };

    rowCounter += weeklyData.length + 1;
  }

  // header formatting
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
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C5D9F1" } };
    c.font = { color: { argb: "FFFFFF" } };
    c.alignment = { vertical: "middle", horizontal: "center" };
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

  // write buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Time_Sheet_${moment().format("DDMMYYYY_HHmm")}.xlsx`;
  // post back transferable bufferW
  self.postMessage({ buffer, fileName }, [buffer]);
};
