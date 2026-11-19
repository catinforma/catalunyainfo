// next/link is a client component in Next: a client reference here, so its props are serialised as in production.
import rsdw from "react-server-dom-webpack/server";

export default rsdw.registerClientReference(function Link() {
  throw new Error("next/link is a client component");
}, "next/link", "default");
