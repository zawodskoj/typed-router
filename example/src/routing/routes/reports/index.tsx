import React from "react";
import { route } from "routing";

export type ReportsRouteProps = { }; 
export const reports = route("reports")
    .as(() => <>REPORTS</>);