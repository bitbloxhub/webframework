import { assert } from "https://deno.land/std@0.186.0/_util/asserts.ts"
import {
	ConnInfo,
	serve,
	ServeInit,
} from "https://deno.land/std@0.186.0/http/server.ts"
import {
	router as makeRouter,
	RouterOptions,
	Routes,
} from "https://deno.land/x/rutt@0.1.0/mod.ts"
import * as esbuild from "https://deno.land/x/esbuild@v0.17.18/mod.js"

export interface MiddlewareFnOutput<T> {
	final?: T extends Response ? boolean : never
	output: T
}

export type MiddlewareFn<T> = (
	input: T,
	ctx: ConnInfo,
) => Promise<MiddlewareFnOutput<T>>

export interface Middleware {
	// deno-lint-ignore no-explicit-any
	data: any
	name: string
	pre: MiddlewareFn<Request>
	post: MiddlewareFn<Response>
}

export type MiddlewareFnInitializer = () => Promise<Middleware>

export interface InitFnArgs {
	routes: Routes
	routeroptions: RouterOptions<unknown>
	esbuildConfig: esbuild.BuildOptions
}

export interface InitFnOut {
	routes: Routes
	routeroptions: RouterOptions<unknown>
	esbuildConfig: esbuild.BuildOptions
}

export type InitFn = (args: InitFnArgs) => Promise<InitFnOut>

export type PostBuildFn = (built: esbuild.BuildResult) => Promise<void>

export interface PluginOut {
	middlewares: Array<MiddlewareFnInitializer>
	initfns: Array<InitFn>
	postbuildfns: Array<PostBuildFn>
}

export type Plugin = () => Promise<PluginOut>

export interface AppInit {
	routes: Routes
	routeroptions: RouterOptions<unknown>
	servinit: ServeInit
	plugins: Array<Plugin>
	esbuildconfig: esbuild.BuildOptions
}

export class App {
	routes: Routes
	routeroptions: RouterOptions<unknown>
	serveinit: ServeInit
	middlewares: Array<MiddlewareFnInitializer> = []
	plugins: Array<Plugin>
	esbuildconfig: esbuild.BuildOptions
	initfns: Array<InitFn> = []
	postbuildfns: Array<PostBuildFn> = []

	constructor(data: AppInit) {
		this.routes = data.routes
		this.routeroptions = data.routeroptions
		this.serveinit = data.servinit
		this.plugins = data.plugins
		this.esbuildconfig = data.esbuildconfig
	}

	async run() {
		for (const plugin of this.plugins) {
			const pluginout = await plugin()
			this.middlewares.push(...pluginout.middlewares)
			this.initfns.push(...pluginout.initfns)
			this.postbuildfns.push(...pluginout.postbuildfns)
		}
		for (const initfn of this.initfns) {
			const initfnargs: InitFnArgs = {
				routes: this.routes,
				routeroptions: this.routes,
				esbuildConfig: this.esbuildconfig,
			}
			const initfnout = await initfn(initfnargs)
			this.routes = initfnout.routes
			this.routeroptions = initfnout.routeroptions
			this.esbuildconfig = initfnout.esbuildConfig
		}
		const buildresult = await esbuild.build(this.esbuildconfig)
		for (const postbuild of this.postbuildfns) {
			await postbuild(buildresult)
		}
		const router = makeRouter(this.routes, this.routeroptions)
		await serve(async (req: Request, ctx: ConnInfo) => {
			const realmiddlewares: Array<Middleware> = []
			for (const middleware of this.middlewares) {
				realmiddlewares.push(await middleware())
			}
			let reqpassed = req
			for (const middleware of realmiddlewares) {
				const middlewareout = await middleware.pre(reqpassed, ctx)
				assert(
					!middlewareout.final,
					`middleware ${middleware.name} tried to make a request final`,
				)
				reqpassed = middlewareout.output
			}
			const res = await router(reqpassed, ctx)
			let respassed = res
			for (const middleware of realmiddlewares) {
				const middlewareout = await middleware.post(respassed, ctx)
				respassed = middlewareout.output
				if (middlewareout.final) {
					break
				}
			}
			return respassed
		}, this.serveinit)
	}
}

export function responseHeaders(res: Response): Record<string, string> {
	const out: Record<string, string> = {}
	for (const [header, value] of res.headers) {
		out[header] = value
	}
	return out
}

// deno-lint-ignore no-explicit-any
declare function isEntrypointsRecord(arg: any): arg is Record<string, string>
export function entryPointsAsRecord(
	entrypoints:
		| Record<string, string>
		| string[]
		| { in: string; out: string }[]
		| undefined,
): Record<string, string> {
	if (isEntrypointsRecord(entrypoints)) {
		return entrypoints
	} else {
		assert(false, "all entrypoints need to be records")
	}
}
