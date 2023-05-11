import { Resolver, ResolverMap } from './map';

export type ClientMethodsMap<R extends ResolverMap> = {
	[K in keyof R]: R[K] extends ResolverMap
		? ClientMethodsMap<R[K]>
		: R[K] extends Resolver<any, any>
		? { exec: R[K] }
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
	return new Proxy<ClientMethodsMap<M>>({} as ClientMethodsMap<M>, {
		get<K extends keyof ClientMethodsMap<M>>(
			target: ClientMethodsMap<M>,
			p: string | symbol
		): ClientMethodsMap<M>[K] {
			if (p === 'exec') {
				const fn = async (...params: any[]) => {
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

			return buildClientMethodMap(tunnel, [...path, p as string]) as ClientMethodsMap<M>[K];
		}
	});
};
