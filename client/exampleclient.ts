/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
import { h } from "npm:preact"
const element = document.getElementById("id")
if (element != null) {
	element.append("\nmade with js")
}
let a = h("img", {})
console.log(a)
