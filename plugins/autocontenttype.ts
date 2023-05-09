import { extname } from "https://deno.land/std@0.186.0/path/mod.ts"
import { contentType } from "https://deno.land/std@0.186.0/media_types/mod.ts"
import * as webframework from "../webframework.ts"

async function middleware(): Promise<webframework.Middleware> {
	return {
		data: null,
		name: "autoContentType",
		pre: async (req: Request) => {
			return {
				output: req,
			}
		},
		post: async (res: Response) => {
			if (
				res.headers.get("Content-Type") == "text/plain;charset=UTF-8" &&
				res.headers.get("Autocontenttype-Skip") == undefined
			) {
				let contenttype = ""
				let url = res.url
				console.log(url)
				const inferredContentType = "text/html; charset=utf-8" //contentType(extname(new URL(url).pathname))
				if (inferredContentType != undefined) {
					contenttype = inferredContentType
				} else {
					contenttype = "text/html; charset=utf-8"
				}
				console.log(contenttype)
				return {
					output: new Response(res.body, {
						headers: {
							...webframework.responseHeaders(
								res,
								new Set(["Autocontenttype-Skip"]),
							),
							"Content-Type": contenttype,
						},
						status: res.status,
						statusText: res.statusText,
					}),
				}
			} else {
				return {
					output: res,
				}
			}
		},
	}
}

export default async function plugin(): Promise<webframework.PluginOut> {
	return {
		initfns: [],
		postbuildfns: [],
		middlewares: [],
	}
}
