import "server-only";

import { getServiceClient } from "@/lib/supabase/server";

export function getFeedbackDatabase() {
  const database = getServiceClient();
  if (!database) {
    throw new Error("Feedback database is not configured.");
  }
  return database;
}
