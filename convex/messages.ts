import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getCurrentUserOrThrow, getUserWithImageUrl } from "./users";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

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

      if (originalThread?.userId !== user._id) {
        const threadUser = await context.db.get(
          originalThread?.userId as Id<"users">
        );
        const userWithImage = await getUserWithImageUrl(context, threadUser);
        const pushToken = userWithImage?.pushToken;

        if (!pushToken) return;

        await context.scheduler.runAfter(
          500,
          internal.push.sendPushNotifications,
          {
            pushToken,
            threadTitle: "New comment",
            threadBody: args.content,
            threadId: args.threadId,
          }
        );
      }
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

    // Check if user liked this thread
    const existingLike = await context.db
      .query("likes")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .first();

    const thread = await context.db.get(args.threadId);
    if (!thread) return;

    if (existingLike) {
      // Unlike: Delete like record and decrease the like count
      await context.db.delete(existingLike._id);
      await context.db.patch(args.threadId, {
        likeCount: Math.max(0, (thread.likeCount || 0) - 1),
      });
      return false;
    } else {
      // Like: Add like record and increase like count
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
    paginationOpts: paginationOptsValidator,
  },
  handler: async (context, args) => {
    const currentUser = await getCurrentUserOrThrow(context);

    const comments = await context.db
      .query("messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .order("desc")
      .paginate(args.paginationOpts);

    const commentsWithDetails = await Promise.all(
      comments.page.map(async (comment) => {
        const creator = await getMessageCreator(context, comment.userId);
        const mediaUrls = await getMediaUrls(context, comment.mediaFiles);

        // Check if current user liked this comment
        let isLiked = false;
        if (currentUser) {
          const like = await context.db
            .query("likes")
            .withIndex("by_user_and_thread", (q) =>
              q.eq("userId", currentUser._id).eq("threadId", comment._id)
            )
            .unique();
          isLiked = !!like;
        }

        // Get replies count for this comment
        const repliesCount = await context.db
          .query("messages")
          .filter((q) => q.eq(q.field("threadId"), comment._id))
          .collect();

        return {
          ...comment,
          mediaFiles: mediaUrls,
          creator,
          isLiked,
          repliesCount,
        };
      })
    );

    return {
      ...comments,
      page: commentsWithDetails,
    };
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id("messages"),
  },
  handler: async (context, args) => {
    const user = await getCurrentUserOrThrow(context);

    const comment = await context.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== user._id) {
      throw new Error("Not authorized to delete this comment");
    }

    const parentThreadId = comment.threadId;

    if (parentThreadId) {
      const parentThread = await context.db.get(
        parentThreadId as Id<"messages">
      );
      if (parentThread) {
        // Decrease comment count on parent thread
        await context.db.patch(parentThreadId as Id<"messages">, {
          commentCount: Math.max(0, (parentThread.commentCount || 0) - 1),
        });
      }
    }

    // Delete the comment's likes
    const likes = await context.db
      .query("likes")
      .filter((q) => q.eq(q.field("threadId"), args.commentId))
      .collect();

    for (const like of likes) {
      await context.db.delete(like._id);
    }

    // Delete any replies to this comment
    const replies = await context.db
      .query("messages")
      .filter((q) => q.eq(q.field("threadId"), args.commentId))
      .collect();

    for (const reply of replies) {
      await context.db.delete(reply._id);
    }

    // Delete the comment itself
    await context.db.delete(args.commentId);

    return true;
  },
});

const getMessageCreator = async (context: QueryCtx, userId: Id<"users">) => {
  const user = await context.db.get(userId);
  return getUserWithImageUrl(context, user);
};

export const generateUploadUrl = mutation({
  handler: async (context) => {
    await getCurrentUserOrThrow(context);

    return await context.storage.generateUploadUrl();
  },
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
