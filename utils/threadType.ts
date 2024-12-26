import { Doc } from "@/convex/_generated/dataModel";

export interface ThreadProps {
  thread: Doc<"messages"> & {
    creator: Doc<"users">;
    isLiked: boolean;
    repliesCount?: number;
  };
  isComment?: boolean;
  onDeleted?: () => void;
}
