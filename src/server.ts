import { ResolverMap } from './map';

export const CreateServer = <M extends ResolverMap>(map: M) => {
	return {
		tunnel: {
			execute: async (data: string): Promise<string> => {
				const metadata = JSON.parse(data);

				let obj: any = map;
				for (const key of metadata.path) {
					if (!obj) break;
					obj = obj[key];
				}

				let result;
				if (!obj) {
					result = { error: 'method not found' };
				} else {
					try {
						const data = await obj(...metadata.params);
						result = { data };
					} catch (error) {
						result = { error };
					}
				}

				return JSON.stringify(result);
			}
		}
	};
};
