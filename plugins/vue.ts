import * as webframework from "../webframework.ts"
import * as esbuild from "https://deno.land/x/esbuild@v0.17.18/mod.js"
import * as vueesbuild from "https://raw.githubusercontent.com/bitbloxhub/esbuild-vue3/main/mod.ts"
import { createSSRApp } from 'npm:vue'
import { renderToString } from 'npm:vue/server-renderer'
import { createRouter, createMemoryHistory } from "npm:vue-router"

let app: any = null
let options: vueesbuild.Options | null = null

async function render(req: Request): Promise<Response> {
	let ssrapp = createSSRApp(app)
	return new Response(`
<html>
	<head></head>
	<body>
		<div id="app">${await renderToString(ssrapp)}</div>
	</body>
</html>
	`, {
		headers: {
			"Content-Type": "text/html; charset=utf-8"
		}
	})	
}

async function initfn(args: webframework.InitFnArgs): Promise<webframework.InitFnOut> {
	const oldplugins = args.esbuildConfig.plugins ? args.esbuildConfig.plugins : []
	return {
		routeroptions: args.routeroptions,
		esbuildConfig: {
			...args.esbuildConfig,
			plugins: [...oldplugins, vueesbuild.vue3plugin()],
			entryPoints: {
				"App": "App.vue"
			}
		},
		routes: {
			...args.routes,
			"/:url?*": render
		}
	}
}

async function postbuildfn(args: esbuild.BuildResult) {
	app = await import(`${Deno.cwd()}/esbuild_out/App.js`)
	console.log(app)
}

async function plugin(): Promise<webframework.PluginOut> {
	return {
		initfns: [initfn],
		postbuildfns: [postbuildfn],
		middlewares: []
	}	
}

export default async function buildPlugin(config: vueesbuild.Options): Promise<webframework.Plugin> {
	options = config
	return plugin	
}