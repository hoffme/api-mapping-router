# API Mapping Router
Esta libreria tiene como objetivo ejecutar funciones 
enviando parametros y obtener el resultado, atravez 
de un tunel que transfiera texto.

Ejemplos utiles en donde usar:

- NextJs para ejecutar funciones del backend desde 
el cliente
- Monorepo en donde se pueda importar archivos de back
en el front.

## Como Implementar 

### Backend
crear archivo map.ts en donde se crea el mapa de funciones
executables.

```ts
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

ya con el mapa de funciones creado por ejemplo en NextJs
hay que crear el archivo por Ej: /pages/api/index.ts 
para ejecutar las funciones mediante HTTP.

```ts
import { NextApiHandler } from "next";

import { map } from '../server/map';

const server = CreateServer(map);

const apiHandler = async (req, res) => {
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

en el cliente se crea la en la carpeta services el archivo
index.ts que llama a la api del server.

```ts
import type { Map } from '../server/map';

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

ahora desde el front se puede llamar a las funciones mediante
el `client`. Lo gran ventaja de esto es que esta completamente
tipado el objeto de map en el cliente.

```ts
import { client } from './services';

client.methods.auth.signIn.exec(...params)
    .then((result) => {
        ...
    })
    .catch((error) => {
        ...
    })

```