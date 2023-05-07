/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
const element = document.getElementById("id")
if (element != null) {
	element.append("\nmade with js")
}
