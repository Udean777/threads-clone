import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";

export const addThread = mutation({
  args: {
    content: v.string(),
    mediaFiles: v.optional(v.array(v.string())),
    websiteUrl: v.optional(v.string()),
    threadId: v.optional(v.id("messages")),
  },
  handler: async (context, args) => {
    const user = await getCurrentUserOrThrow(context);

    return await context.db.insert("messages", {
      ...args,
      userId: user._id,
      likeCount: 0,
      commentCount: 0,
      retweetCount: 0,
    });

    if (args.threadId) {
      // TODO
    }
  },
});

export const getThreads = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.optional(v.id("users")),
  },
  handler: async (context, args) => {
    let threads;

    if (args.userId) {
      threads = await context.db
        .query("messages")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      threads = await context.db
        .query("messages")
        .filter((q) => q.eq(q.field("threadId"), undefined))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const msgWithCreator = await Promise.all(
      threads.page.map(async (thread) => {
        const creator = await getMessageCreator(context, thread.userId);

        return {
          ...thread,
          creator,
        };
      })
    );

    return {
      ...threads,
      page: msgWithCreator,
    };
  },
});

const getMessageCreator = async (context: QueryCtx, userId: Id<"users">) => {
  const user = await context.db.get(userId);

  if (!user?.imageUrl || user.imageUrl.startsWith("http")) {
    return user;
  }

  const imgUrl = await context.storage.getUrl(user.imageUrl as Id<"_storage">);

  return {
    ...user,
    imgUrl,
  };
};

export const generateUploadUrl = mutation(async (ctx) => {
  await getCurrentUserOrThrow(ctx);

  return await ctx.storage.generateUploadUrl();
});
