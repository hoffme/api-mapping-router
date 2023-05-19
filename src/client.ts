import { JSONValue } from './json';
import { Context } from './context';
import { ResolverMap } from './map';
import { Resolver } from './resolver';

export type ClientMethodsMap<R extends ResolverMap> = {
	[K in keyof R]: R[K] extends ResolverMap
		? ClientMethodsMap<R[K]>
		: R[K] extends Resolver<JSONValue, JSONValue, Context>
		? { exec: (params: R[K]['_type_props']) => Promise<R[K]['_type_result']> }
		: never;
};

export const CreateClient = <M extends ResolverMap>(props: {
	tunnel: (data: string) => Promise<string>;
}) => ({
	methods: buildClientMethodMap<M>(props.tunnel)
});

const buildClientMethodMap = <M extends ResolverMap>(
	tunnel: (params: string) => Promise<string>,
	path: string[] = []
): ClientMethodsMap<M> => {
	return new Proxy({} as ClientMethodsMap<M>, {
		get<K extends keyof ClientMethodsMap<M> & string>(
			_: unknown,
			property: K
		): ClientMethodsMap<M>[K] {
			if (property === 'exec') {
				const fn = async (params: unknown) => {
					const metadata = { path, params };

					const response = await tunnel(JSON.stringify(metadata));

					const json = response ? JSON.parse(response) : undefined;
					if (!json || json.error) {
						throw new Error(json.error || 'unknown error');
					}

					return json.data;
				};

				return fn as unknown as ClientMethodsMap<M>[K];
			}

			return buildClientMethodMap(tunnel, [...path, property]) as ClientMethodsMap<M>[K];
		}
	});
};
