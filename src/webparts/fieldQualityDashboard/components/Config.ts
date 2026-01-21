import * as moment from "moment";

interface ICamlRange {
  startDate: string;
  endDate: string;
}
interface ICamlQuery {
  timesheet: string;
  serviceDetails: string;
  crmActivity: string;
}

export const camlQueryFunc = (camlRange: ICamlRange): ICamlQuery => {
  let camlObj: ICamlQuery = {
    timesheet: `
      <View Scope='RecursiveAll'>
        <Query>
          <Where>
               <And>
              <Geq>
                <FieldRef Name="Date" />
                <Value IncludeTimeValue="TRUE" Type="DateTime">${camlRange.startDate}}</Value>
              </Geq>
              <Leq>
                <FieldRef Name="Date" />
                <Value IncludeTimeValue="TRUE" Type="DateTime">${camlRange.endDate}</Value>
              </Leq>
            </And>
          </Where>
          <OrderBy>
            <FieldRef Name='ID' Ascending='FALSE'/>
          </OrderBy>
        </Query>
        <ViewFields>
          <FieldRef Name='ID' />
          <FieldRef Name='Week' />
          <FieldRef Name='Date' />
          <FieldRef Name='Status' />
          <FieldRef Name='FieldValuesAsText' />
          <FieldRef Name='Name' />
          <FieldRef Name='StartTime' />
          <FieldRef Name='FinishTime' />
          <FieldRef Name='OverTime' />
          <FieldRef Name='Status' />
          <FieldRef Name='SiteCode' />
          <FieldRef Name='Mobilization' />
          <FieldRef Name='Travel' />
          <FieldRef Name='City' />
          <FieldRef Name='CostCenter' />
          <FieldRef Name='OtherSiteCode' />
          <FieldRef Name='Comments' />
          <FieldRef Name='ReviewComments' />
          <FieldRef Name='KmWithPrivateCar' />
          <FieldRef Name='CityOverNight' />
          <FieldRef Name='TravelWithCar' />
          <FieldRef Name='OverTimeComments' />
          <FieldRef Name='Expense' />
          <FieldRef Name='TotalWHrs' />
          <FieldRef Name='TotalAtcCredit' />
          <FieldRef Name='TotalPersonalCard' />
          <FieldRef Name='ison' />
          <FieldRef Name='IsRefundApproved' />
          <FieldRef Name='OvertimecommentsDrp' />
          <FieldRef Name='Country' />
          <FieldRef Name='originCity' />
          <FieldRef Name='OrginCountry' />
          <FieldRef Name='CRM_Activity' />
          <FieldRef Name='ProjectType' />
          <FieldRef Name='ProjectTypeOthers' />
          <FieldRef Name='OneToOneMeeting' />
          <FieldRef Name='OneToOneMeetingParticipants' />
          <FieldRef Name='OnCallVisible' />
          <FieldRef Name='OverTimeStatus' />      
        </ViewFields>
        <RowLimit Paged='TRUE'>5000</RowLimit>
      </View>`,
    serviceDetails: `
      <View Scope='RecursiveAll'>
        <Query>
         <Where>
            <And>
              <Geq>
                <FieldRef Name="Created" />
                <Value IncludeTimeValue="FALSE" Type="DateTime">${camlRange.startDate}</Value>
              </Geq>
              <Leq>
                <FieldRef Name="Created" />
                <Value IncludeTimeValue="FALSE" Type="DateTime">${camlRange.endDate}</Value>
              </Leq>
            </And>
          </Where>
          <OrderBy>
            <FieldRef Name='ID' Ascending='FALSE'/>
          </OrderBy>
        </Query>
        <ViewFields>
          <FieldRef Name='ID' />
          <FieldRef Name='SiteCode' />
          <FieldRef Name='Client' />
          <FieldRef Name='ServiceCode' />
          <FieldRef Name='ServiceDescription' />
          <FieldRef Name='StartTime' />
          <FieldRef Name='FinishTime' />
          <FieldRef Name='OverTime' />
          <FieldRef Name='TMST_ID' />
          <FieldRef Name='OtherSiteCode' />  
        </ViewFields>
        <RowLimit Paged='TRUE'>5000</RowLimit>
      </View>`,
    crmActivity: `
      <View Scope='RecursiveAll'>
        <Query>
          <Where>
            <And>
              <Geq>
                <FieldRef Name="Created" />
                <Value IncludeTimeValue="FALSE" Type="DateTime">${camlRange.startDate}</Value>
              </Geq>
              <Leq>
                <FieldRef Name="Created" />
                <Value IncludeTimeValue="FALSE" Type="DateTime">${camlRange.endDate}</Value>
              </Leq>
            </And>
          </Where>
          <OrderBy>
            <FieldRef Name='ID' Ascending='FALSE'/>
          </OrderBy>
        </Query>
        <ViewFields>
          <FieldRef Name='ID' />
          <FieldRef Name='PersonName' />
          <FieldRef Name='EmailAddress' />
          <FieldRef Name='TelNumber' />
          <FieldRef Name='Comments' />
          <FieldRef Name='Name' />
          <FieldRef Name='Date' />
          <FieldRef Name='Client' />
          <FieldRef Name='MeetingConducted' />
          <FieldRef Name='ConversationType' /> 
          <FieldRef Name='TMST_CRM_ID' /> 
        </ViewFields>
        <RowLimit Paged='TRUE'>5000</RowLimit>
      </View>`,
  };

  return camlObj;
};
