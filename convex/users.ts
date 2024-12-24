import { query } from "./_generated/server";

export const getAllUsers = query({
    args: {},
    handler: async (context) => {
        return await context.db.query("users").collect();
    }
})