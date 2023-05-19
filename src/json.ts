export type JSONLiteral = string | number | boolean | null | undefined;

export type JSONValue = JSONLiteral | JSONValue[] | { [K in string]: JSONValue };

export type JSONArray = JSONValue[];

export type JSONObject = { [K in string]: JSONValue };
