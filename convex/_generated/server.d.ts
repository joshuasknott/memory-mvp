// Generated types for Convex
// Run `npx convex dev` to generate the actual types when connecting to a Convex deployment

import { FunctionReference } from "convex/server";

export type QueryBuilder<T extends string> = {
  withIndex(indexName: string): QueryBuilder<T>;
  order(direction: "asc" | "desc"): QueryBuilder<T>;
  collect(): Promise<any[]>;
  first(): Promise<any>;
};

export type DatabaseReader = {
  query<T extends string>(tableName: T): QueryBuilder<T>;
  get(id: any): Promise<any>;
};

export type DatabaseWriter = DatabaseReader & {
  insert<T extends string>(tableName: T, value: any): Promise<any>;
  patch(id: any, updates: any): Promise<void>;
  delete(id: any): Promise<void>;
};

export type QueryCtx = {
  db: DatabaseReader;
};

export type MutationCtx = {
  db: DatabaseWriter;
};

export function query<Args extends Record<string, any>, Output>(
  definition: {
    args: Args;
    handler: (ctx: QueryCtx, args: Args) => Promise<Output>;
  }
): FunctionReference<"query", "public", Args, Output>;

export function mutation<Args extends Record<string, any>, Output>(
  definition: {
    args: Args;
    handler: (ctx: MutationCtx, args: Args) => Promise<Output>;
  }
): FunctionReference<"mutation", "public", Args, Output>;

export type DataModel = any;
