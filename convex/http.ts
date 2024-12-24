import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

export const doSomething = httpAction(async (context, req) => {
  const { data, type } = await req.json();

  console.log("data from doSomething", data);

  switch (type) {
    case "user.created":
      await context.runMutation(internal.users.createUser, {
        clerkId: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email_addresses[0].email_address,
        imageUrl: data.image_url,
        username: data.username,
        followersCount: 0,
      });
      break;
    case "user.updated":
      console.log("User updated", data);
      break;
  }

  return new Response();
});

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: doSomething,
});

export default http;
