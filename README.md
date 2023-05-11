# API Mapping Router
This library has the objective of executing functions 
sending parameters and obtaining the result, through a 
tunnel that transfers text.

Useful examples where to use:

- NextJs to execute backend functions from the client
- Monorepo where you can import files from back to the front.

## How to Implement?

### Backend
create map.ts file where the function map is created
executables.

```ts
import { CreateMap } from "api-mapping-router/map";

export const map = CreateMap({
    auth: {
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
        const result = await server.tunnel.execute(data);
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send(JSON.stringify({ error }));
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
            headers: { 'Content-Type': 'text/plain' },
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