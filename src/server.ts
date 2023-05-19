import { JSONValue } from './json';
import { Context } from './context';
import { Resolver } from './resolver';
import { ResolverMap } from './map';

export const CreateServer = <M extends ResolverMap<D>, D extends Context = Context>(map: M) => {
	return {
		tunnel: {
			execute: async (data: string, ctx: D): Promise<string> => {
				const metadata = JSON.parse(data);

				let obj: Resolver<JSONValue, JSONValue, D> | ResolverMap<D> = map;
				for (const key of metadata.path) {
					if (!obj) break;
					obj = obj[key as keyof object];
				}

				let result;
				if (obj) {
					const resolver = obj as Resolver<JSONValue, JSONValue, D>;

					try {
						const data = await resolver._exec({
							ctx,
							params: metadata.params
						});
						result = { data };
					} catch (e: unknown) {
						const error = e instanceof Error ? e.message : 'unknow error';
						result = { error };
					}
				} else {
					result = { error: 'method not found' };
				}

				return JSON.stringify(result);
			}
		}
	};
};
