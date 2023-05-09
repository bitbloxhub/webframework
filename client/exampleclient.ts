/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />
import { h } from "npm:preact"
const element = document.getElementById("id")
if (element != null) {
	element.append("\nmade with js")
}
let a = h("img", {})
console.log(a)
