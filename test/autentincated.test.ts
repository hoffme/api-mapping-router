import { JSONObject } from '../src/json';
import { CreateResolver } from '../src/resolver';
import { CreateMap } from '../src/map';
import { CreateServer } from '../src/server';
import { CreateClient } from '../src/client';

// Define your context type
interface Context {
	auth: {
		token?: string;
	};
}

// Define the resolver types
interface AuthUpdateProfileParams extends JSONObject {
	firstName?: string;
	lastName?: string;
}

interface AuthUpdateProfileResult extends JSONObject {
	firstName: string;
	lastName: string;
}

// Create a resolver
const AuthUpdateProfileResolver = CreateResolver<
	AuthUpdateProfileParams,
	AuthUpdateProfileResult,
	Context
>({
	// Validations params or undefined
	params: {
		parse: (v) => {
			if (typeof v !== 'object' || v === null) {
				throw new Error('invalid param type');
			}
			if ('firstName' in v && typeof v['firstName'] !== 'string') {
				throw new Error('invalid property firstName');
			}
			if ('lastName' in v && typeof v['lastName'] !== 'string') {
				throw new Error('invalid property lastName');
			}
			return v as AuthUpdateProfileParams;
		}
	},
	// Middlewares or undefined
	middlewares: [
		async (props) => {
			if (!props.ctx.auth.token) {
				throw new Error('unauthorized');
			}
		}
	],
	// Feature method
	method: async (props) => {
		const claims = JSON.parse(props.ctx.auth.token || '');
		return { ...claims, ...props.params };
	}
});

// Create map of resolvers
const map = CreateMap({
	auth: {
		profile: {
			update: AuthUpdateProfileResolver
		}
	}
});

// create a server with map
const server = CreateServer(map);

// create a funtion tunnel in server side
const tunnelServerSide = async (data: string, ctx: Context): Promise<string> => {
	try {
		return await server.tunnel.execute(data, ctx);
	} catch (e: unknown) {
		return JSON.stringify({ error: `${e}` });
	}
};

// create a funtion tunnel in client side to call tunnelServerSide
const tunnelClientSide = async (data: string): Promise<string> => {
	const ctx: Context = {
		auth: {
			token: JSON.stringify({ firstName: '-', lastName: '--' })
		}
	};

	try {
		return await tunnelServerSide(data, ctx);
	} catch (e: unknown) {
		return JSON.stringify({ error: `${e}` });
	}
};

// create a client with map tyoe in client side
const client = CreateClient<typeof map>({
	tunnel: tunnelClientSide
});

describe('Client With Context Auth', () => {
	test.only('Happy Case 1', async () => {
		const expected = {
			firstName: '-',
			lastName: '--'
		};

		const result = await client.methods.auth.profile.update.exec({});

		expect(result).toEqual(expected);
	});

	test.only('Happy Case 2', async () => {
		const expected = {
			firstName: '__ASDASD___ASD__DDSSDADSAd',
			lastName: '--'
		};

		const result = await client.methods.auth.profile.update.exec({
			firstName: expected.firstName
		});

		expect(result).toEqual(expected);
	});

	test.only('Happy Case 3', async () => {
		const expected = {
			firstName: '__ASDASD___ASD__DDSSDADSAd',
			lastName: 'asdasd3=12323asd 12x'
		};

		const result = await client.methods.auth.profile.update.exec({
			firstName: expected.firstName,
			lastName: expected.lastName
		});

		expect(result).toEqual(expected);
	});

	test.only('Invalid params firstName', async () => {
		try {
			await client.methods.auth.profile.update.exec({
				firstName: 2 as unknown as string
			});

			expect(true).toBe(false);
		} catch (e: any) {
			expect(e).toEqual(new Error('invalid property firstName'));
		}
	});

	test.only('Invalid params lastName', async () => {
		try {
			await client.methods.auth.profile.update.exec({
				lastName: { ok: true } as unknown as string
			});

			expect(true).toBe(false);
		} catch (e: any) {
			expect(e).toEqual(new Error('invalid property lastName'));
		}
	});
});
