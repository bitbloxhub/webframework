/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
const element2 = document.getElementById("example")
if (element2 != null) {
	element2.append("\nanother example")
}
