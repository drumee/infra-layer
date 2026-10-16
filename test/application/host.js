"use strict";
// Test-only composition of the unchanged published runtime. No identity store,
// SQL, Hub, MFS, custom session or alternate dispatcher is implemented here.
if (process.env.APP_CRASH === "1") throw Error("ISOLATED_STARTUP_FAILURE");
const { DescriptorRegistry, ServiceDispatcher, createAuthorizer, createServiceServer } = require("@drumee/server-runtime");
const registry = new DescriptorRegistry();
registry.registerDirectory("/app/plugins/qualification/acl");
registry.registerDescriptor("health", { modules: { public: "health" }, services: { ready: { scope: "domain", permission: { src: 0, fast_check: "public-api" } } } }, { workdir: "/app" });
const dispatcher = new ServiceDispatcher({ registry, authorize: createAuthorizer() });
const server = createServiceServer({ dispatcher, onDispatch: ({ request, session }) => { session.request_path = request.url; } });
server.listen(3101, "0.0.0.0");
for (const signal of ["SIGTERM", "SIGINT"]) process.once(signal, () => server.close(() => process.exit(0)));
