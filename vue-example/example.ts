import * as webframework from "../webframework.ts"
import vue from "../plugins/vue.ts"
import * as importMap from "npm:esbuild-plugin-import-map"

importMap.load({
	imports: {
		"vue": "https://esm.sh/vue"
	}
})

const app: webframework.App = new webframework.App({
	routes: {},
	plugins: [await vue({
		isprod: false,
		cssinline: true,
	})],
	routeroptions: {},
	esbuildconfig: {
		entryPoints: {},
		minify: false,
		splitting: true,
		bundle: true,
		format: "esm",
		platform: "browser",
		target: ["chrome113"],
		plugins: [importMap.plugin()]
	},
	servinit: {
		port: 8909,
	},
})

await app.run()
