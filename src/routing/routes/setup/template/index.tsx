import React from "react";
import { route, PT } from "routing";
import { foobar } from "./foobar";
import { foobaz } from "./foobaz";

export type TemplateRouteProps = { templateId: number };
export const template = route<TemplateRouteProps>(":templateId", { templateId: PT.number })
    .as(x => <>TEMPLATE with id { x.templateId }</>)
    .with({ foobar, foobaz });