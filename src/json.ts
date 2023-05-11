export type JSONLiteral = string | number | boolean | null;

export type JSONValue = JSONLiteral | JSONValue[] | { [K: string]: JSONValue };

export type JSONArray = JSONValue[];

export type JSONObject = { [K: string]: JSONValue };
