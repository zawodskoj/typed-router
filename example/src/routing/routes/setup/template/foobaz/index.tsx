import React from "react";
import { MergeProps, PT, route, routeSymbol } from "routing";
import { TemplateRouteProps } from "../index";

export const foobazSymbol = routeSymbol<MergeProps<TemplateRouteProps, { wtf: string }>>();

export const foobaz = route<{}>("foobaz")
    .inherits<TemplateRouteProps>()
    .withQuery({ wtf: PT.string })
    .as(x => <>Template { x.templateId } ({ typeof x.templateId }) foobaz (wtf: { x.wtf })</>)
    .mark(foobazSymbol);