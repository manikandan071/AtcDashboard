import * as React from "react";
import styles from "./FieldQualityDashboard.module.scss";
import { IFieldQualityDashboardProps } from "./IFieldQualityDashboardProps";
import { sp } from "@pnp/sp/presets/all";
import { escape } from "@microsoft/sp-lodash-subset";
import "./style.css";
import MainComponent from "./MainComponent";

export default class FieldQualityDashboard extends React.Component<
  IFieldQualityDashboardProps,
  {}
> {
  constructor(prop: IFieldQualityDashboardProps, state: {}) {
    super(prop);
    sp.setup({ spfxContext: this.props.context });
  }
  public render(): React.ReactElement<IFieldQualityDashboardProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName,
    } = this.props;

    return <MainComponent spcontext={this.props.context} />;
  }
}
