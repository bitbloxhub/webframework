import { extname } from "https://deno.land/std@0.186.0/path/mod.ts"
import * as webframework from "../webframework.ts"

async function middleware(): Promise<webframework.Middleware> {
	return {
		data: null,
		name: "autoContentType",
		pre: async (req: Request) => {
			return {
				output: req
			}
		},
		post: async (req: Response) => {
			if (!req.headers.get("Content-Type")) {
				let contenttype = ""
				return {
					output: new Response(req.body, {
						headers: {
							...webframework.responseHeaders(req),
							"Content-Type": "",
						},
						status: req.status,
						statusText: req.statusText,
					}),
				}
			} else {
				return {
					output: req
				}
			}
		}
	}
}

export default async function plugin(): Promise<webframework.PluginOut> {
	return {
		initfns: [],
		postbuildfns: [],
		middlewares: [middleware]
	}
}