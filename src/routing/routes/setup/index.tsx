import React from "react"; 
import { route } from "routing";
import { template } from "./template";

export type SetupRouteProps = { };
export const setup = route<SetupRouteProps>("setup")
    .as(() => <>SETUP</>)
    .with({
        template
    });