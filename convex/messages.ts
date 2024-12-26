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

    const thread = await context.db.insert("messages", {
      ...args,
      userId: user._id,
      likeCount: 0,
      commentCount: 0,
      retweetCount: 0,
    });

    if (args.threadId) {
      const originalThread = await context.db.get(args.threadId);
      await context.db.patch(args.threadId, {
        commentCount: (originalThread?.commentCount || 0) + 1,
      });
    }

    return thread;
  },
});

export const getThreads = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.optional(v.id("users")),
  },
  handler: async (context, args) => {
    const currentUser = await getCurrentUserOrThrow(context);
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
        const mediaUrls = await getMediaUrls(context, thread.mediaFiles);

        // Check if current user liked this thread
        let isLiked = false;
        if (currentUser) {
          const like = await context.db
            .query("likes")
            .withIndex("by_user_and_thread", (q) =>
              q.eq("userId", currentUser._id).eq("threadId", thread._id)
            )
            .unique();
          isLiked = !!like;
        }

        return {
          ...thread,
          mediaFiles: mediaUrls,
          creator,
          isLiked,
        };
      })
    );

    return {
      ...threads,
      page: msgWithCreator,
    };
  },
});

export const likeThread = mutation({
  args: {
    threadId: v.id("messages"),
  },
  handler: async (context, args) => {
    const user = await getCurrentUserOrThrow(context);

    // Cek apakah user sudah like thread ini
    const existingLike = await context.db
      .query("likes")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .first();

    const thread = await context.db.get(args.threadId);
    if (!thread) return;

    if (existingLike) {
      // Unlike: Hapus record like dan kurangi counter
      await context.db.delete(existingLike._id);
      await context.db.patch(args.threadId, {
        likeCount: Math.max(0, (thread.likeCount || 0) - 1),
      });
      return false;
    } else {
      // Like: Tambah record like dan tambah counter
      await context.db.insert("likes", {
        userId: user._id,
        threadId: args.threadId,
      });
      await context.db.patch(args.threadId, {
        likeCount: (thread.likeCount || 0) + 1,
      });
      return true;
    }
  },
});

export const getThreadById = query({
  args: {
    threadId: v.id("messages"),
  },
  handler: async (context, args) => {
    const thread = await context.db.get(args.threadId);

    if (!thread) return null;

    const creator = await getMessageCreator(context, thread.userId);
    const mediaUrls = await getMediaUrls(context, thread.mediaFiles);

    return {
      ...thread,
      mediaFiles: mediaUrls,
      creator,
    };
  },
});

export const getComments = query({
  args: {
    threadId: v.id("messages"),
  },
  handler: async (context, args) => {
    const comments = await context.db
      .query("messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .order("desc")
      .collect();

    const commentsWithMedia = await Promise.all(
      comments.map(async (comment) => {
        const creator = await getMessageCreator(context, comment.userId);
        const mediaUrls = await getMediaUrls(context, comment.mediaFiles);

        return {
          ...comment,
          mediaFiles: mediaUrls,
          creator,
        };
      })
    );

    return commentsWithMedia;
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

export const generateUploadUrl = mutation(async (context) => {
  await getCurrentUserOrThrow(context);

  return await context.storage.generateUploadUrl();
});

const getMediaUrls = async (
  context: QueryCtx,
  mediaFiles: string[] | undefined
) => {
  if (!mediaFiles || mediaFiles.length === 0) {
    return [];
  }

  const urlPromises = mediaFiles.map((file) =>
    context.storage.getUrl(file as Id<"_storage">)
  );
  const results = await Promise.allSettled(urlPromises);
  return results
    .filter(
      (result): result is PromiseFulfilledResult<string> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);
};
