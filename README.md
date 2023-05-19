# API Mapping Router
This library has the objective of executing functions 
sending parameters and obtaining the result, through a 
tunnel that transfers text.

Useful examples where to use:

- NextJs to execute backend functions from the client
- Monorepo where you can import files from back to the front.

## How to Implement?

### Backend
create context.ts file with context type

```ts
export interface Context {
	req: NextApiRequest
}
```

create a resolver function in any file

```ts
import { CreateResolver } from "api-mapping-router/resolver";

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
export const AuthUpdateProfileResolver = CreateResolver<
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
			if (!props.ctx.req.headers.autenticated) {
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
```

create map.ts file where the function map is created
executables.

```ts
import { CreateMap } from "api-mapping-router/map";

import { AuthUpdateProfileResolver } from './resolver.ts';

export const map = CreateMap({
    auth: {
        profile: {
			update: AuthUpdateProfileResolver
		},
        signIn: async (params: AuthSignInParams): Promise<User> => {
            ...
        }, 
        signUp: async (params: AuthSignUpParams): Promise<User> => {
            ...
        },
        ...
    },
    user: {
        profile: {
            get: async (): Promise<User> => {
                ...
            },
            ...
        },
        ...
    }
});

export type Map = typeof map;
```

already with the function map created for example in NextJs
you have to create the file for example: /pages/api/index.ts
to run the functions over HTTP.

```ts
import { NextApiHandler } from "next";
import { CreateServer } from "api-mapping-router/server";

import { map } from 'src/server/map';

const server = CreateServer(map);

const handler: NextApiHandler = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(404).end();
    }

    try {
        const result = await server.tunnel.execute(data, { req });
        res.status(200).send(result);
    } catch (e) {
        res.status(400).send(JSON.stringify({
            error: e instanceof Error ? e.message : 'unknow error'
        }));
    }
};

export default handler;
```

## Frontend

on the client the file is created in the services folder
index.ts which calls the server api.

```ts
import { CreateClient } from "api-mapping-router/client";

import type { Map } from 'src/server/map';

export const client = CreateClient<typeof appMap>({
    tunnel: async (data: string) => {
        const response = await fetch('/api', {
            headers: {
                'Content-Type': 'text/plain',
                'Autenticated': `Basic ${window.localStorage.get('token')}`
            },
            method: 'POST',
            body: data
        });

        return await response.text();
    }
});
```

functions can now be called from the front using the `client`. 
The great advantage of this is that it is completely
typed the map object on the client.

```ts
import { client } from 'src/services';

client.methods.auth.signIn.exec(...params)
    .then((result) => {
        ...
    })
    .catch((error) => {
        ...
    })

```