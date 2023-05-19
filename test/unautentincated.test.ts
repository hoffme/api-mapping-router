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
		// this line have a unauthorized context
		auth: {}
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

describe('Client Without Context Auth', () => {
	test.only('Check unauthorized without context auth empty', async () => {
		const params = {
			firstName: 'asdasss',
			lastName: 'asdasdddd'
		};

		try {
			await client.methods.auth.profile.update.exec({
				firstName: params.firstName,
				lastName: params.lastName
			});

			expect(true).toBe(false);
		} catch (e: any) {
			expect(e).toEqual(new Error('unauthorized'));
		}
	});
});
