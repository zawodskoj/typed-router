import { route } from "routing";
import { TemplateRouteProps } from "../index";
import { foobazSymbol } from "routing/routes/setup/template/foobaz";

export type FoobarRouteProps = { };
export const foobar = route<FoobarRouteProps>("foobar")
    .inherits<TemplateRouteProps>()
    .redirect(foobazSymbol, p => ({ ...p, wtf: "fromredir!" }));