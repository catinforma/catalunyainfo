// next/image is a client component in Next: a client reference here.
import rsdw from "react-server-dom-webpack/server";

export default rsdw.registerClientReference(function Image() {
  throw new Error("next/image is a client component");
}, "next/image", "default");
