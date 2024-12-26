import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// export const getAllUsers = query({
//     args: {},
//     handler: async (context) => {
//         return await context.db.query("users").collect();
//     }
// })

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.union(v.string(), v.null()),
    bio: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    followersCount: v.number(),
  },
  handler: async (context, args) => {
    const userId = await context.db.insert("users", {
      ...args,
      username: args.username || `${args.first_name} ${args.last_name}`,
    });

    return userId;
  },
});

export const getUserByClerkId = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (context, args) => {
    const user = await context.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    return await getUserWithImageUrl(context, user);
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (context, args) => {
    const user = await context.db.get(args.userId);

    return await getUserWithImageUrl(context, user);
  },
});

export const updateUser = mutation({
  args: {
    _id: v.id("users"),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.id("_storage")),
    websiteUrl: v.optional(v.string()),
    pushToken: v.optional(v.string()),
  },
  handler: async (context, args) => {
    await getCurrentUserOrThrow(context);

    return await context.db.patch(args._id, args);
  },
});

export const generateUploadUrl = mutation({
  handler: async (context) => {
    await getCurrentUserOrThrow(context);

    return await context.storage.generateUploadUrl();
  },
});

export const updateImage = mutation({
  args: {
    storageId: v.id("_storage"),
    _id: v.id("users"),
  },
  handler: async (context, args) => {
    await context.db.patch(args._id, {
      imageUrl: args.storageId,
    });
  },
});

export const searchUserByUsername = query({
  args: {
    search: v.string(),
  },
  handler: async (context, args) => {
    const users = await context.db
      .query("users")
      .withSearchIndex("searchUsers", (q) => q.search("username", args.search))
      .collect();

    const usersWithImageUrl = await Promise.all(
      users.map(async (user) => {
        return getUserWithImageUrl(context, user);
      })
    );

    return usersWithImageUrl;
  },
});

// Reusable method here
export const getUserWithImageUrl = async (
  context: QueryCtx,
  user: Doc<"users"> | null
) => {
  if (!user?.imageUrl || user.imageUrl.startsWith("http")) {
    return user;
  }

  const imageUrl = await context.storage.getUrl(
    user.imageUrl as Id<"_storage">
  );

  return { ...user, imageUrl };
};

// get current user / identity checking
// https://docs.convex.dev/auth/database-auth#mutations-for-upserting-and-deleting-users

export const me = query({
  args: {},
  handler: async (context, args) => {
    return await getCurrentUser(context);
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  async handler(context, { clerkId }) {
    const user = await userByExternalId(context, clerkId);

    if (user !== null) {
      await context.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkId}`
      );
    }
  },
});

export async function getCurrentUserOrThrow(context: QueryCtx) {
  const userRecord = await getCurrentUser(context);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(context: QueryCtx) {
  const identity = await context.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(context, identity.subject);
}

async function userByExternalId(context: QueryCtx, externalId: string) {
  return await context.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", externalId))
    .unique();
}
