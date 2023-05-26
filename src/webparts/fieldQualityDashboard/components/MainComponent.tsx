import * as React from "react";
import Dashboard from "./Dashboard";

export default function MainComponent(props: any): JSX.Element {
  return (
    <div>
      <Dashboard spcontext={props.spcontext} />
    </div>
  );
}
