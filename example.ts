import { ConnInfo } from "https://deno.land/std@0.186.0/http/server.ts"
import * as esbuild from "https://deno.land/x/esbuild@v0.17.18/mod.js"
import * as webframework from "./webframework.ts"

async function middleware(): Promise<webframework.Middleware> {
	return {
		data: null,
		name: "example",
		pre: async (req: Request, _ctx: ConnInfo) => {
			return {
				output: req,
			}
		},
		post: async (res: Response, _ctx: ConnInfo) => {
			return {
				output: new Response(res.body, {
					headers: {
						...webframework.responseHeaders(res),
						"Cache-Control": "no-store, must-revalidate",
					},
					status: res.status,
					statusText: res.statusText,
				}),
			}
		},
	}
}

async function initFn(
	input: webframework.InitFnArgs,
): Promise<webframework.InitFnOut> {
	return {
		routes: input.routes,
		routeroptions: input.routeroptions,
		esbuildConfig: {
			...input.esbuildConfig,
			entryPoints: {
				...input.esbuildConfig.entryPoints,
				"client/exampleclient": "client/exampleclient.ts",
			},
		},
	}
}

async function plugin(): Promise<webframework.PluginOut> {
	return {
		initfns: [initFn],
		postbuildfns: [],
		middlewares: [middleware],
	}
}

const app: webframework.App = new webframework.App({
	routes: {
		"/": async (_req): Promise<Response> => {
			return new Response(
				`
				<p id=id>hello world</p>
				<p id=example>goodbye!</p>
				<script type=module src="./exampleclient.js"></script>
				<script type=module src="./anotherexample.js"></script>
			`,
				{
					headers: {
						"Content-Type": "text/html; charset=utf-8",
					},
				},
			)
		},
		"/exampleclient.js": async (_req): Promise<Response> => {
			return new Response(
				await Deno.readFile("./esbuild_out/client/exampleclient.js"),
				{
					headers: {
						"Content-Type": "application/javascript; charset=utf-8",
					},
				},
			)
		},
		"/anotherexample.js": async (_req): Promise<Response> => {
			return new Response(
				await Deno.readFile("./esbuild_out/client/anotherexample.js"),
				{
					headers: {
						"Content-Type": "application/javascript; charset=utf-8",
					},
				},
			)
		},
	},
	plugins: [plugin],
	routeroptions: {},
	esbuildconfig: {
		entryPoints: {
			"client/anotherexample": "client/anotherexample.ts",
		},
		outdir: "esbuild_out",
		minify: true,
		splitting: true,
		format: "esm",
	},
	servinit: {
		port: 8909,
	},
})

await app.run()
