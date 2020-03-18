import React, { FC } from "react";
import { root } from "routes";

import { Hardlink, NavigatorView, useNav } from "routing";

export const App: FC = () => {
    const nav = useNav();
    console.log(nav.resolved, nav.path);

    return <div>
        <button onClick={() => nav.goBack()}>
            Go back
        </button>
        <br />
        <Hardlink to={root.posts({})}>
            /posts
        </Hardlink>
        <br />
        <Hardlink to={root.posts.byId({ postId: 123 })}>
            /posts/123
        </Hardlink>
        <br />
        <Hardlink to={root.posts.byId.comments({ postId: 456 })}>
            /posts/456/comments
        </Hardlink>
        <br />
        <Hardlink to={root.user({ id: 789 })}>
            /user/789
        </Hardlink>
        <br />
        <NavigatorView />
    </div>;
};