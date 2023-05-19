import { JSONValue } from './json';
import { Context } from './context';
import { Resolver } from './resolver';

export interface ResolverMap<D extends Context = Context> {
	[K: string]: ResolverMap<D> | Resolver<JSONValue, JSONValue, D>;
}

export const CreateMap = <M extends ResolverMap<Context>>(map: M) => map;
