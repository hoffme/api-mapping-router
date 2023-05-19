import { JSONValue } from './json';
import { Context } from './context';

export type Middleware<P extends JSONValue, C extends Context = Context> = (props: {
	ctx: C;
	params: P;
}) => Promise<void> | void;

export type Method<
	P extends JSONValue,
	R extends JSONValue,
	C extends Context = Context
> = (props: { ctx: C; params: P }) => Promise<R>;

export type Resolver<P extends JSONValue, R extends JSONValue, C extends Context = Context> = {
	_type_props: P;
	_type_result: R;
	_exec: (props: { ctx: C; params: JSONValue }) => Promise<JSONValue>;
};

export const CreateResolver = <
	P extends JSONValue,
	R extends JSONValue,
	C extends Context = Context
>(props: {
	params?: { parse: (v: unknown) => P };
	middlewares?: Middleware<P, C>[];
	method: Method<P, R, C>;
}): Resolver<P, R, C> => ({
	_type_props: {} as P,
	_type_result: {} as R,
	_exec: async (executionProps): Promise<R> => {
		let params = executionProps.params as P;
		if (props.params) {
			params = props.params.parse(executionProps.params);
		}

		const parameters = {
			ctx: executionProps.ctx,
			params
		};

		if (props.middlewares) {
			for (const middleware of props.middlewares) {
				await middleware(parameters);
			}
		}

		return await props.method(parameters);
	}
});
