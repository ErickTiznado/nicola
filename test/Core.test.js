import request from "supertest";
import Core from "../core/Core.js";

describe("🧠 Core System (Core.js)", () => {
  let app;
  let server;

  beforeAll((done) => {
    app = new Core();

    app.get("/ping", (req, res) => {
      res.statusCode = 200;
      res.end("pong");
    });

    app.get("/query", (req, res) => {
      res.json({ query: req.query });
    });

    app.post("/json", (req, res) => {
      res.json({ body: req.body });
    });

    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("GET /ping responde 200", async () => {
    const res = await request(server).get("/ping");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("pong");
  });

  test("Aplica headers de Teleforce", async () => {
    const res = await request(server).get("/ping");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("Deny");
    expect(res.headers["x-xss-protection"]).toBe("1");
  });

  test("Parsea querystring y lo expone en req.query", async () => {
    const res = await request(server).get("/query?x=1&y=hola");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ query: { x: "1", y: "hola" } });
  });

  test("POST JSON válido -> req.body parseado", async () => {
    const res = await request(server)
      .post("/json")
      .set("Content-Type", "application/json; charset=utf-8")
      .send(JSON.stringify({ a: 1 }));

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ body: { a: 1 } });
  });

  test("POST JSON inválido -> 400", async () => {
    const res = await request(server)
      .post("/json")
      .set("Content-Type", "application/json")
      .send("{invalid");

    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("Bad Request: Invalid JSON");
  });

  test("Sin Content-Type -> req.body = {}", async () => {
    const res = await request(server).post("/json").send("no-json");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ body: {} });
  });

  test("OPTIONS responde 204 y headers CORS", async () => {
    const res = await request(server).options("/ping");
    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
    expect(res.headers["access-control-allow-methods"]).toBe(
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
  });

  test("Body > ~2MB -> 413", async () => {
    const big = "{\"x\":\"" + "a".repeat(2_000_001) + "\"}";

    const res = await request(server)
      .post("/json")
      .set("Content-Type", "application/json")
      .send(big);

    expect(res.statusCode).toBe(413);
    expect(res.text).toBe("Request Entity Too Large");
  });
});
