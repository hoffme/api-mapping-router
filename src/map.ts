import { JSONValue } from './json';

export type Resolver<P extends JSONValue[], R extends JSONValue> = (...params: P) => Promise<R>;

export interface ResolverMap {
	[K: string]: ResolverMap | Resolver<any, any>;
}

export const CreateMap = <M extends ResolverMap>(map: M) => map;
