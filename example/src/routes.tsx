import { flatRoute, buildAddressable, route, routeSymbol, PT } from "routing";
import React, { FC } from "react";

const Posts: FC = () => <>Page for posts list</>;
const Post: FC<{ postId: number }> = x => 
    <>Page for post with id { x.postId }</>;
const PostComments: FC<{ postId: number }> = x =>
    <>Page for comments for post with id { x.postId }</>;

const User: FC<{ id: number }> = x =>
    <>Page for user with id { x.id }</>;

const postsSymbol = routeSymbol();

const rawRoot = flatRoute().redirect(postsSymbol, x => x)
    .with({
        posts: route("posts").as(Posts).mark(postsSymbol).with({
            byId: route(":postId", { postId: PT.number }).as(Post).with({
                comments: route("comments").inherits<{ postId: number }>().as(PostComments)
            })
        }),
        user: route("user/:id", { id: PT.number }).as(User)
    });

export const [root] = buildAddressable(rawRoot);