// content/lessons/web-internet.ts
// Populated by a content contributor. Every sample is checked by
// `node scripts/verify-output.mjs content/lessons/web-internet.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "http-request-response",
    pillar: "Web & Internet",
    name: "How HTTP Works (Request → Response)",
    easy: "HTTP (HyperText Transfer Protocol — the language browsers and servers speak to each other) works like ordering food at a restaurant: you (the browser) tell the waiter what you want (a request), the kitchen (the server) makes it, and the waiter brings back a response — either what you asked for, or an apology that it's unavailable. Every time you open a web page, your browser sends an HTTP request and waits for an HTTP response.",
    how: [
      "The client (your browser, or an app) builds a request: which method (like GET) it's using, and which path (like /home) it wants.",
      "The request travels to a server — a computer whose whole job is to listen for requests and answer them.",
      "The server looks at the request, decides what to do, and builds a response: a status (did it work?) plus a body (the actual content).",
      "The response travels back to the client, which reads it and shows you the result — a page, an error, whatever it received.",
    ],
    when: "Every single web page load, every button click that fetches new data, every mobile app pulling your feed — anywhere two computers exchange information over the web.",
    mistakes: [
      "Thinking the server 'pushes' pages to you unprompted — normally the client always asks first, and the server only ever replies.",
      "Forgetting that each request/response pair usually stands alone — the server doesn't automatically remember your last request unless something (like a cookie) reminds it who you are.",
    ],
    code: {
      JavaScript: `function handleRequest(request) {
  // A tiny web server: look at what was asked for, decide what to send back.
  if (request.path === "/home") {
    return { status: 200, body: "Welcome home!" };
  }
  return { status: 404, body: "Not Found" };
}

function logExchange(request) {
  const response = handleRequest(request);
  console.log("Request:", request.method, request.path);
  console.log("Response:", response.status, response.body);
}

logExchange({ method: "GET", path: "/home" });
logExchange({ method: "GET", path: "/missing" });`,
      Python: `def handle_request(request):
    # A tiny web server: look at what was asked for, decide what to send back.
    if request["path"] == "/home":
        return {"status": 200, "body": "Welcome home!"}
    return {"status": 404, "body": "Not Found"}

def log_exchange(request):
    response = handle_request(request)
    print("Request:", request["method"], request["path"])
    print("Response:", response["status"], response["body"])

log_exchange({"method": "GET", "path": "/home"})
log_exchange({"method": "GET", "path": "/missing"})`,
    },
    output: `Request: GET /home
Response: 200 Welcome home!
Request: GET /missing
Response: 404 Not Found`,
  },
  {
    id: "http-status-codes",
    pillar: "Web & Internet",
    name: "HTTP Status Codes",
    easy: "A status code is the three-digit number a server attaches to every response, like a waiter's one-word summary of how your order went: 'here you go' (200), 'we don't have that' (404), or 'the kitchen caught fire' (500). You don't have to read the whole response to know if it worked — the status code tells you instantly.",
    how: [
      "Codes starting with 2 mean success — the request worked, like 200 OK.",
      "Codes starting with 4 mean the client made a mistake — like asking for something that doesn't exist, 404 Not Found.",
      "Codes starting with 5 mean the server messed up while trying to help — like it crashed, 500 Internal Server Error.",
      "Real programs check the status code first to decide what to do next: show the page, show an error, or retry later.",
    ],
    when: "Every HTTP response includes one — you'll see them constantly in browser dev tools, API responses, and server logs whenever something needs debugging.",
    big: "O(1) lookup — checking a status code is reading one number, no matter how big the rest of the response is.",
    mistakes: [
      "Assuming any response that 'loads' means success — a 404 or 500 page still loads fine in the browser, just carrying bad news.",
      "Mixing up 401 (Unauthorized — you're not logged in) and 403 (Forbidden — you're logged in but not allowed) is a common beginner trip-up.",
    ],
    code: {
      JavaScript: `const statusMeanings = {
  200: "OK - here you go",
  201: "Created - made a new one for you",
  400: "Bad Request - I didn't understand that order",
  404: "Not Found - we don't have that",
  500: "Internal Server Error - the kitchen caught fire",
};

function describe(code) {
  return statusMeanings[code] || "Unknown status code";
}

function category(code) {
  if (code >= 200 && code < 300) return "success";
  if (code >= 400 && code < 500) return "client error";
  if (code >= 500 && code < 600) return "server error";
  return "other";
}

const codes = [200, 404, 500];
for (const code of codes) {
  console.log(code + " (" + category(code) + "):", describe(code));
}`,
      Python: `status_meanings = {
    200: "OK - here you go",
    201: "Created - made a new one for you",
    400: "Bad Request - I didn't understand that order",
    404: "Not Found - we don't have that",
    500: "Internal Server Error - the kitchen caught fire",
}

def describe(code):
    return status_meanings.get(code, "Unknown status code")

def category(code):
    if 200 <= code < 300:
        return "success"
    if 400 <= code < 500:
        return "client error"
    if 500 <= code < 600:
        return "server error"
    return "other"

codes = [200, 404, 500]
for code in codes:
    print(str(code) + " (" + category(code) + "):", describe(code))`,
    },
    output: `200 (success): OK - here you go
404 (client error): Not Found - we don't have that
500 (server error): Internal Server Error - the kitchen caught fire`,
  },
  {
    id: "client-vs-server",
    pillar: "Web & Internet",
    name: "Client vs Server",
    easy: "The client is the customer, the server is the kitchen. The client (a browser, a phone app, or another program) sends requests asking for things; the server (a computer that's always running and listening) does the actual work and sends results back. The client never cooks its own food — it always asks the server and waits for the answer.",
    how: [
      "The client puts together a request describing what it wants.",
      "The client sends the request and waits for a response.",
      "The server, always running and listening, receives the request and does the actual work.",
      "The server sends its result back as a response, and the client uses it — like rendering a page or updating the screen.",
    ],
    when: "Anytime an app needs data or work done somewhere else: loading a webpage, checking your email, or a mobile app fetching your latest notifications.",
    mistakes: [
      "Thinking 'server' always means a giant machine in a data center — it can be a laptop, a phone, or a single small program; the point is that it waits for and answers requests.",
      "Forgetting the client initiates — over plain HTTP, the server can't just decide to send you something out of nowhere.",
    ],
    code: {
      JavaScript: `function server(request) {
  // The server's job: receive a request, do work, send a response.
  console.log("Server received:", request);
  return "order #" + request.split(" ")[1] + " is ready";
}

function client() {
  // The client's job: send a request, wait, then handle the response.
  const request = "order 42";
  console.log("Client sends:", request);
  const response = server(request);
  console.log("Client receives:", response);
}

client();`,
      Python: `def server(request):
    # The server's job: receive a request, do work, send a response.
    print("Server received:", request)
    return "order #" + request.split(" ")[1] + " is ready"

def client():
    # The client's job: send a request, wait, then handle the response.
    request = "order 42"
    print("Client sends:", request)
    response = server(request)
    print("Client receives:", response)

client()`,
    },
    output: `Client sends: order 42
Server received: order 42
Client receives: order #42 is ready`,
  },
  {
    id: "dns",
    pillar: "Web & Internet",
    name: "DNS (Domain Name System)",
    easy: "DNS (Domain Name System) is the internet's phone book. Computers don't actually navigate to 'example.com' — they navigate to a numeric address called an IP address, like 93.184.216.34. DNS is the lookup service that turns the easy-to-remember name you type into the actual number your computer needs to connect to.",
    how: [
      "You type a domain name, like example.com, into your browser.",
      "Your computer asks a DNS server: 'what's the IP address for this name?'",
      "The DNS server looks it up in its records and returns the matching IP address.",
      "Your browser then connects directly to that IP address to actually load the page.",
    ],
    when: "Every time you visit a website by typing its name instead of a raw IP address — which is essentially always, since nobody memorizes strings of numbers.",
    big: "O(1) lookup in a simple table like ours — real DNS involves multiple hops between servers, but it's the same lookup idea underneath.",
    mistakes: [
      "Forgetting that DNS results can be cached (remembered temporarily) — that's why a site can 'still work' briefly right after its DNS record changes, or why a change sometimes takes time to 'propagate'.",
      "Confusing a domain name with the website itself — the domain is just a label; DNS's only job is pointing that label at an address.",
    ],
    code: {
      JavaScript: `const dnsRecords = {
  "example.com": "93.184.216.34",
  "openai.com": "104.18.12.123",
  "devpath.app": "127.0.0.1",
};

function resolve(domain) {
  // DNS turns a human-friendly name into the numeric address (IP) behind it.
  if (domain in dnsRecords) return dnsRecords[domain];
  return null;
}

function visit(domain) {
  const ip = resolve(domain);
  if (ip) {
    console.log(domain, "->", ip);
  } else {
    console.log(domain, "-> not found");
  }
}

visit("example.com");
visit("devpath.app");
visit("unknown.test");`,
      Python: `dns_records = {
    "example.com": "93.184.216.34",
    "openai.com": "104.18.12.123",
    "devpath.app": "127.0.0.1",
}

def resolve(domain):
    # DNS turns a human-friendly name into the numeric address (IP) behind it.
    if domain in dns_records:
        return dns_records[domain]
    return None

def visit(domain):
    ip = resolve(domain)
    if ip:
        print(domain, "->", ip)
    else:
        print(domain, "-> not found")

visit("example.com")
visit("devpath.app")
visit("unknown.test")`,
    },
    output: `example.com -> 93.184.216.34
devpath.app -> 127.0.0.1
unknown.test -> not found`,
  },
  {
    id: "rest-api-routing",
    pillar: "Web & Internet",
    name: "REST API Routing",
    easy: "An API (Application Programming Interface — the menu of things a server lets other programs ask for) built in REST style organizes requests by combining a method (like GET or POST) with a path (like /users/1). Routing is the server's job of matching that combination against a list of known routes and calling the right handler — like a receptionist reading your appointment slip and pointing you to the correct department.",
    how: [
      "The server keeps a list of routes it knows about, each pairing a method + path pattern with a handler function.",
      "When a request comes in, break its path into pieces and compare them against each route's pattern piece by piece.",
      "A piece like :id in the pattern is a placeholder — it matches anything and captures that value as a parameter.",
      "The first route that fully matches gets to handle the request; if nothing matches, the server answers with a 404.",
    ],
    when: "Building any REST API (a common style for web services) — one URL path per resource, and one method per action, like GET /users/1 to fetch and POST /users to create.",
    big: "O(number of routes) to find a match in this simple version — real frameworks use faster lookup structures, but the matching idea is identical.",
    mistakes: [
      "Forgetting that method matters as much as path — GET /users and POST /users are two completely different routes, even though the path looks the same.",
      "Writing routes in the wrong order when patterns overlap — a very general pattern placed before a specific one can accidentally swallow requests meant for the specific one.",
    ],
    code: {
      JavaScript: `const routes = [
  { method: "GET", path: "/users", handler: () => "list of all users" },
  { method: "GET", path: "/users/:id", handler: (params) => "user #" + params.id },
  { method: "POST", path: "/users", handler: () => "created a new user" },
];

function matchRoute(method, path) {
  const pathParts = path.split("/").filter(Boolean);
  for (const route of routes) {
    if (route.method !== method) continue;
    const routeParts = route.path.split("/").filter(Boolean);
    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let matched = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return route.handler(params);
  }
  return "404 Not Found";
}

function handleRequest(method, path) {
  console.log(method, path, "->", matchRoute(method, path));
}

handleRequest("GET", "/users");
handleRequest("GET", "/users/1");
handleRequest("POST", "/users");
handleRequest("DELETE", "/users/1");`,
      Python: `routes = [
    {"method": "GET", "path": "/users", "handler": lambda params: "list of all users"},
    {"method": "GET", "path": "/users/:id", "handler": lambda params: "user #" + params["id"]},
    {"method": "POST", "path": "/users", "handler": lambda params: "created a new user"},
]

def match_route(method, path):
    path_parts = [p for p in path.split("/") if p]
    for route in routes:
        if route["method"] != method:
            continue
        route_parts = [p for p in route["path"].split("/") if p]
        if len(route_parts) != len(path_parts):
            continue

        params = {}
        matched = True
        for i in range(len(route_parts)):
            if route_parts[i].startswith(":"):
                params[route_parts[i][1:]] = path_parts[i]
            elif route_parts[i] != path_parts[i]:
                matched = False
                break
        if matched:
            return route["handler"](params)
    return "404 Not Found"

def handle_request(method, path):
    print(method, path, "->", match_route(method, path))

handle_request("GET", "/users")
handle_request("GET", "/users/1")
handle_request("POST", "/users")
handle_request("DELETE", "/users/1")`,
    },
    output: `GET /users -> list of all users
GET /users/1 -> user #1
POST /users -> created a new user
DELETE /users/1 -> 404 Not Found`,
  },
  {
    id: "url-query-parsing",
    pillar: "Web & Internet",
    name: "URL & Query Parsing",
    easy: "A URL (Uniform Resource Locator — the web address you type or click) often carries extra information after a question mark, called a query string, like /search?q=cats&limit=10. Parsing it just means splitting that messy text apart into a clean set of key/value pairs your program can actually use — the same way you'd split a shopping list written as one long sentence into separate items.",
    how: [
      "Split the URL at the '?' — everything before it is the path, everything after it is the query string.",
      "Split the query string at each '&' — that separates it into individual key=value pairs.",
      "Split each pair at its '=' to get the key on the left and the value on the right.",
      "Collect all those pairs into a simple lookup (an object or dictionary) so your code can read params.q or params.limit directly.",
    ],
    when: "Reading filters, search terms, page numbers, or IDs passed in a web address — almost every search bar, filter dropdown, or 'page=2' link relies on query parsing.",
    mistakes: [
      "Forgetting a URL might have no query string at all — always check for the '?' before assuming there's anything to split.",
      "Not decoding special characters (like %20 for a space) in a real parser — our simplified version skips this, but production code must handle it.",
    ],
    code: {
      JavaScript: `function parseUrl(url) {
  const [path, query] = url.split("?");
  return { path, query: query || "" };
}

function parseQueryString(query) {
  const params = {};
  if (query === "") return params;
  for (const pair of query.split("&")) {
    const [key, value] = pair.split("=");
    params[key] = value;
  }
  return params;
}

const url = "/search?q=cats&limit=10";
const parsed = parseUrl(url);
const params = parseQueryString(parsed.query);

console.log("Full URL:", url);
console.log("Path:", parsed.path);
console.log("Query string:", parsed.query);
console.log("q =", params.q);
console.log("limit =", params.limit);`,
      Python: `def parse_url(url):
    if "?" in url:
        path, query = url.split("?", 1)
    else:
        path, query = url, ""
    return path, query

def parse_query_string(query):
    params = {}
    if query == "":
        return params
    for pair in query.split("&"):
        key, value = pair.split("=")
        params[key] = value
    return params

url = "/search?q=cats&limit=10"
path, query = parse_url(url)
params = parse_query_string(query)

print("Full URL:", url)
print("Path:", path)
print("Query string:", query)
print("q =", params["q"])
print("limit =", params["limit"])`,
    },
    output: `Full URL: /search?q=cats&limit=10
Path: /search
Query string: q=cats&limit=10
q = cats
limit = 10`,
  },
  {
    id: "json-data",
    pillar: "Web & Internet",
    name: "JSON (JavaScript Object Notation)",
    easy: "JSON (JavaScript Object Notation, said 'JAY-son') is a simple text format for sending structured data between programs — the same way a filled-out form sends information in labeled fields instead of one long paragraph. It represents data as key/value pairs (like \"name\": \"Ada\"), lists (like [\"math\", \"code\"]), and nested groups of both, so any two programs, in any language, can agree on the shape of the data passing between them.",
    how: [
      "A program on one end turns its data into JSON text, ready to send anywhere — this is called 'serializing'.",
      "That text travels over HTTP, gets saved to a file, or passes along however it needs to.",
      "A program on the other end reads the JSON text and turns it back into real data it can work with — this is called 'parsing'.",
      "Once parsed, you read individual fields the normal way, like a value inside an object or list you already know how to use.",
    ],
    when: "Virtually every modern API sends and receives JSON — it's the standard shape of data flowing between a client and a server on the web.",
    mistakes: [
      "Forgetting that JSON keys and strings must use double quotes, not single quotes — text that breaks this rule simply fails to parse.",
      "Comparing JSON text directly between two systems to check if 'the data is the same' — always parse it first and compare the actual values, since formatting like spacing or key order can differ even when the meaning is identical.",
    ],
    code: {
      JavaScript: `const jsonText = '{"name":"Ada","age":36,"active":true,"skills":["math","code"],"address":{"city":"London","zip":"NW1"}}';
const data = JSON.parse(jsonText);

console.log("name =", data.name);
console.log("age =", data.age);
console.log("active =", data.active ? "yes" : "no");
console.log("skills =", data.skills.join(", "));
console.log("city =", data.address.city);`,
      Python: `import json

json_text = '{"name":"Ada","age":36,"active":true,"skills":["math","code"],"address":{"city":"London","zip":"NW1"}}'
data = json.loads(json_text)

print("name =", data["name"])
print("age =", data["age"])
print("active =", "yes" if data["active"] else "no")
print("skills =", ", ".join(data["skills"]))
print("city =", data["address"]["city"])`,
    },
    output: `name = Ada
age = 36
active = yes
skills = math, code
city = London`,
  },
  {
    id: "cookies-sessions",
    pillar: "Web & Internet",
    name: "Cookies & Sessions",
    easy: "A cookie is like the wristband a club gives you at check-in: it's small, it's yours, and the doorman glances at it every time you walk back in instead of asking for your ID again. HTTP (HyperText Transfer Protocol — the language browsers and servers speak) normally forgets you the instant a request finishes, so a cookie is a little piece of data the server asks your browser to hold onto and resend on every future request, just so the server can recognize you. A session is the club's actual guest-list entry — the real record of who you are, stored on the server and looked up using the code printed on your wristband.",
    how: [
      "First visit, no wristband yet: the server has no way to tell you apart from a stranger.",
      "When you log in, the server creates a session record (who you are, what you're allowed to do) and stores it under a fresh session ID.",
      "The server tells your browser to remember that session ID as a cookie, and attach it to every future request to this site.",
      "Your browser automatically resends the cookie on the next request, without you doing anything.",
      "The server reads the cookie, looks up that session ID in its records, and instantly knows who's asking.",
    ],
    when: "Login systems, shopping carts, 'remember me', and anything else that needs to recall who you are across separate requests — since plain HTTP requests are otherwise independent and stateless.",
    big: "O(1) session lookup — finding a session by its ID is a single hash-map lookup, no matter how many users are logged in.",
    mistakes: [
      "Thinking the cookie IS the session — the cookie is just the ticket with an ID printed on it; the actual data (who you are, your permissions) lives in the server's session store, not in the cookie itself.",
      "Forgetting that if the cookie never gets sent back (a new browser, it expired, it was cleared), the server has no memory of you at all and treats you as a brand-new stranger.",
    ],
    code: {
      JavaScript: `const sessions = {};
let nextSessionId = 1;

function login(username) {
  // Create a session record server-side, and hand back its ID as the "cookie".
  const sessionId = "sess-" + nextSessionId;
  nextSessionId++;
  sessions[sessionId] = { user: username };
  return sessionId;
}

function whoIs(cookie) {
  if (cookie === null) return "guest (no cookie sent)";
  const session = sessions[cookie];
  if (!session) return "guest (unknown session)";
  return session.user;
}

console.log("Visit 1, no cookie:", whoIs(null));

const cookie = login("ada");
console.log("Logged in, cookie issued:", cookie);

console.log("Visit 2, cookie sent:", whoIs(cookie));
console.log("Visit 3, wrong cookie:", whoIs("sess-999"));`,
      Python: `sessions = {}
next_session_id = 1

def login(username):
    # Create a session record server-side, and hand back its ID as the "cookie".
    global next_session_id
    session_id = "sess-" + str(next_session_id)
    next_session_id += 1
    sessions[session_id] = {"user": username}
    return session_id

def who_is(cookie):
    if cookie is None:
        return "guest (no cookie sent)"
    session = sessions.get(cookie)
    if not session:
        return "guest (unknown session)"
    return session["user"]

print("Visit 1, no cookie:", who_is(None))

cookie = login("ada")
print("Logged in, cookie issued:", cookie)

print("Visit 2, cookie sent:", who_is(cookie))
print("Visit 3, wrong cookie:", who_is("sess-999"))`,
    },
    output: `Visit 1, no cookie: guest (no cookie sent)
Logged in, cookie issued: sess-1
Visit 2, cookie sent: ada
Visit 3, wrong cookie: guest (unknown session)`,
  },
  {
    id: "jwt-auth-tokens",
    pillar: "Web & Internet",
    name: "Authentication Tokens (JWT)",
    easy: "A JWT (JSON Web Token, said 'jot' — a signed, self-contained ticket that proves who you are) is like a concert wristband with your seat number printed right on it, plus a tamper-evident hologram sticker over the print: anyone can read the seat number, but nobody can change it without visibly breaking the hologram. The 'seat number' part is your claims (who you are, your role); the 'hologram' part is a signature the server computes from a secret only it knows. Because the proof travels with the ticket itself, the server doesn't need to keep a guest list (a session store) to check it — it just re-checks the hologram.",
    how: [
      "The server builds a payload of plain claims about you — like your user ID and role.",
      "The server 'signs' that payload by running it through a formula together with a secret key it keeps private, producing a signature.",
      "The server hands you a token: the payload plus its signature stuck together — no per-user record needs to be stored anywhere.",
      "On a later request, you send the whole token back; the server recomputes the signature from the payload using its secret and compares it to the one attached.",
      "If the freshly computed signature matches, the server trusts the payload's claims without looking anything up; if it doesn't match, the payload was tampered with (or someone guessed wrong) and the token is rejected.",
    ],
    when: "Stateless APIs that don't want to store per-user session data, mobile app logins, and microservices that need to verify who's calling without sharing a session database between them.",
    big: "O(n) to sign or verify a payload of length n — verifying costs exactly as much as signing did.",
    mistakes: [
      "Assuming a JWT is encrypted or secret — the payload part is normally just plainly readable text, so never put real secrets (passwords, credit card numbers) inside one; the signature only proves it wasn't altered, not that it's hidden from view.",
      "Reading the payload without checking the signature — skip that check, and anyone can hand-craft their own token claiming to be an admin, since nothing stopped them.",
    ],
    code: {
      JavaScript: `const SECRET = "shh-server-secret";

function sign(payloadText, secret) {
  // Not real crypto -- a simple deterministic stand-in so both languages match.
  let total = 0;
  for (const ch of payloadText + secret) {
    total += ch.charCodeAt(0);
  }
  return "sig" + total;
}

function makeToken(userId, role) {
  const payloadText = userId + ":" + role;
  const signature = sign(payloadText, SECRET);
  return payloadText + "." + signature;
}

function verifyToken(token, secret) {
  const [payloadText, signature] = token.split(".");
  const expected = sign(payloadText, secret);
  if (expected !== signature) return null;
  const [userId, role] = payloadText.split(":");
  return { userId, role };
}

const token = makeToken("42", "admin");
console.log("Issued token:", token);

const claims = verifyToken(token, SECRET);
console.log("Verified user:", claims.userId, "role:", claims.role);

const tampered = "42:superadmin." + token.split(".")[1];
const result = verifyToken(tampered, SECRET);
console.log("Tampered token accepted:", result ? "yes" : "no");

const wrongSecret = verifyToken(token, "wrong-secret");
console.log("Wrong secret accepted:", wrongSecret ? "yes" : "no");`,
      Python: `SECRET = "shh-server-secret"

def sign(payload_text, secret):
    # Not real crypto -- a simple deterministic stand-in so both languages match.
    total = 0
    for ch in payload_text + secret:
        total += ord(ch)
    return "sig" + str(total)

def make_token(user_id, role):
    payload_text = user_id + ":" + role
    signature = sign(payload_text, SECRET)
    return payload_text + "." + signature

def verify_token(token, secret):
    payload_text, signature = token.split(".")
    expected = sign(payload_text, secret)
    if expected != signature:
        return None
    user_id, role = payload_text.split(":")
    return {"userId": user_id, "role": role}

token = make_token("42", "admin")
print("Issued token:", token)

claims = verify_token(token, SECRET)
print("Verified user:", claims["userId"], "role:", claims["role"])

tampered = "42:superadmin." + token.split(".")[1]
result = verify_token(tampered, SECRET)
print("Tampered token accepted:", "yes" if result else "no")

wrong_secret = verify_token(token, "wrong-secret")
print("Wrong secret accepted:", "yes" if wrong_secret else "no")`,
    },
    output: `Issued token: 42:admin.sig2403
Verified user: 42 role: admin
Tampered token accepted: no
Wrong secret accepted: no`,
  },
  {
    id: "http-caching",
    pillar: "Web & Internet",
    name: "HTTP Caching (ETag)",
    easy: "HTTP caching is like leaving a dated sticky note on your fridge: once you've checked the milk and it's fine, the note lets you skip re-checking it every time you open the door — you just glance at the note. An ETag (ETag, short for 'Entity Tag' — a short fingerprint the server calculates from a piece of content) works the same way for a web page or file: the server hands your browser a fingerprint of the content, and next time, your browser says 'I already have the copy with fingerprint X — did it change?' If the server computes that same fingerprint again, it can say 'nope, still good' without resending the whole thing.",
    how: [
      "The server computes a fingerprint (the ETag) from the content it's about to send, and attaches it to the response.",
      "The browser stores the content and its ETag together in its local cache.",
      "Next time the browser wants that same resource, it sends the ETag it already has along with the request, instead of blindly assuming it needs a fresh copy.",
      "The server recomputes the current content's fingerprint and compares it to the one the browser sent.",
      "If the fingerprints match, the server replies '304 Not Modified' with no body, and the browser reuses its cached copy; if they differ, the server sends the full new content along with a new ETag.",
    ],
    when: "Images, stylesheets, scripts, and API responses that don't change on every request — anywhere re-downloading identical data would waste bandwidth and time.",
    big: "O(n) to compute a fingerprint over content of length n, but a cache hit then costs O(1) to confirm — no resending the content at all.",
    mistakes: [
      "Assuming a cached response means 'old' or 'stale' data — a fresh 304 check confirms the content is still current, so a cache hit can be exactly as up to date as a full re-download, just faster.",
      "Using a fingerprint function that doesn't change when the content changes — if even a tiny edit doesn't produce a new ETag, browsers keep serving stale content by mistake.",
    ],
    code: {
      JavaScript: `function computeETag(content) {
  // A stand-in fingerprint: real servers use a hash function, we use a checksum.
  let total = 0;
  for (const ch of content) {
    total += ch.charCodeAt(0);
  }
  return "etag-" + total;
}

const pages = {
  "/home": "Welcome home!",
};

function handleRequest(path, ifNoneMatch) {
  const content = pages[path];
  const etag = computeETag(content);
  if (ifNoneMatch === etag) {
    return { status: 304, body: "", etag };
  }
  return { status: 200, body: content, etag };
}

function describeResponse(label, response) {
  console.log(label, "status:", response.status, "etag:", response.etag, "body:", response.body || "(empty)");
}

const first = handleRequest("/home", null);
describeResponse("First request", first);

const second = handleRequest("/home", first.etag);
describeResponse("Second request (same etag)", second);

pages["/home"] = "Welcome home! (updated)";
const third = handleRequest("/home", first.etag);
describeResponse("Third request (content changed)", third);`,
      Python: `def compute_etag(content):
    # A stand-in fingerprint: real servers use a hash function, we use a checksum.
    total = 0
    for ch in content:
        total += ord(ch)
    return "etag-" + str(total)

pages = {
    "/home": "Welcome home!",
}

def handle_request(path, if_none_match):
    content = pages[path]
    etag = compute_etag(content)
    if if_none_match == etag:
        return {"status": 304, "body": "", "etag": etag}
    return {"status": 200, "body": content, "etag": etag}

def describe_response(label, response):
    print(label, "status:", response["status"], "etag:", response["etag"], "body:", response["body"] or "(empty)")

first = handle_request("/home", None)
describe_response("First request", first)

second = handle_request("/home", first["etag"])
describe_response("Second request (same etag)", second)

pages["/home"] = "Welcome home! (updated)"
third = handle_request("/home", first["etag"])
describe_response("Third request (content changed)", third)`,
    },
    output: `First request status: 200 etag: etag-1206 body: Welcome home!
Second request (same etag) status: 304 etag: etag-1206 body: (empty)
Third request (content changed) status: 200 etag: etag-2062 body: Welcome home! (updated)`,
  },
  {
    id: "cors-basics",
    pillar: "Web & Internet",
    name: "CORS (Cross-Origin Resource Sharing)",
    easy: "CORS (Cross-Origin Resource Sharing — the rulebook deciding whether a website can fetch data from a different website's server) works like a bouncer at a club checking a guest list before letting someone from another building's group in: your browser is the bouncer, and before it lets a page's own code read data that came back from a different origin (a different domain, like api.example.com instead of mysite.com), it checks whether that server put the page's origin on an approved list.",
    how: [
      "A page loaded from one origin (say https://mysite.com) tries to fetch data from a different origin's server (say https://api.example.com).",
      "The browser attaches the calling page's origin to the request, so the server can see exactly who's asking.",
      "The server checks its own list of allowed origins and decides whether to include the requester's origin in its response.",
      "If the requesting origin is on that allowed list, the browser lets the page's own code read the response; otherwise, the browser blocks the page from reading it, even if the server already sent the data back.",
    ],
    when: "Any web app whose JavaScript calls an API hosted on a different domain or subdomain than the page itself — the normal setup for a modern single-page app talking to a separate API server.",
    big: "O(1) per request — just testing whether one origin string appears on an allow-list.",
    mistakes: [
      "Thinking CORS stops the server from ever receiving the request — it doesn't; the server still gets it and can still act on it. CORS is enforced by the browser, and it only blocks the page's own JavaScript from reading the response.",
      "Allowing every origin just to make an error go away — it silences the browser's complaint, but throws away the entire point of the check, since now any website can read the API's responses.",
    ],
    code: {
      JavaScript: `const allowedOrigins = ["https://mysite.com", "https://admin.mysite.com"];

function handleCorsRequest(origin) {
  const allowed = allowedOrigins.includes(origin);
  const headerValue = allowed ? origin : "none";
  return { allowed, headerValue };
}

function browserFetch(origin) {
  const response = handleCorsRequest(origin);
  const canRead = response.allowed;
  console.log("Origin:", origin, "-> Access-Control-Allow-Origin:", response.headerValue, "-> page can read response:", canRead ? "yes" : "no");
}

browserFetch("https://mysite.com");
browserFetch("https://admin.mysite.com");
browserFetch("https://evil.test");`,
      Python: `allowed_origins = ["https://mysite.com", "https://admin.mysite.com"]

def handle_cors_request(origin):
    allowed = origin in allowed_origins
    header_value = origin if allowed else "none"
    return {"allowed": allowed, "headerValue": header_value}

def browser_fetch(origin):
    response = handle_cors_request(origin)
    can_read = response["allowed"]
    print("Origin:", origin, "-> Access-Control-Allow-Origin:", response["headerValue"], "-> page can read response:", "yes" if can_read else "no")

browser_fetch("https://mysite.com")
browser_fetch("https://admin.mysite.com")
browser_fetch("https://evil.test")`,
    },
    output: `Origin: https://mysite.com -> Access-Control-Allow-Origin: https://mysite.com -> page can read response: yes
Origin: https://admin.mysite.com -> Access-Control-Allow-Origin: https://admin.mysite.com -> page can read response: yes
Origin: https://evil.test -> Access-Control-Allow-Origin: none -> page can read response: no`,
  },
  {
    id: "websockets-basics",
    pillar: "Web & Internet",
    name: "WebSockets (Real-Time Connections)",
    easy: "Regular HTTP is like exchanging letters by mail: every time you want to say something new, you seal a fresh envelope (a brand-new request) and wait for a reply before you can send the next one. A WebSocket (a connection that, once opened, stays open in both directions) is like hanging up the letters and picking up the phone instead — you dial once, and after that, either side can just speak whenever it wants, without hanging up and redialing for every single sentence.",
    how: [
      "The client sends a special HTTP request asking to 'upgrade' the connection into a WebSocket.",
      "The server agrees, and from that moment on, the very same connection stays open for both sides to use.",
      "Either side, client or server, can send a message at any time — nobody has to ask permission first or wait to be asked.",
      "Messages arrive in the order they were sent, and the connection stays open until either side deliberately closes it.",
    ],
    when: "Chat apps, live notifications, multiplayer games, live sports scores, and collaborative editing — anywhere the server needs to push updates the instant something happens, rather than waiting to be asked.",
    big: "O(1) to send a message once the connection is open — there's no new connection setup cost per message, unlike issuing a fresh HTTP request each time.",
    mistakes: [
      "Assuming WebSockets replace HTTP entirely — most apps still use regular HTTP requests for most things, and only add a WebSocket connection for the specific parts that need instant, two-way updates.",
      "Forgetting the connection can close unexpectedly (a dropped network, a server restart) — real code has to detect a closed connection and reconnect, or messages sent afterward simply go nowhere.",
    ],
    code: {
      JavaScript: `function createConnection() {
  return { open: true, log: [] };
}

function send(connection, from, message) {
  if (!connection.open) {
    connection.log.push(from + " tried to send after close: " + message);
    return;
  }
  connection.log.push(from + ": " + message);
}

function closeConnection(connection) {
  connection.open = false;
  connection.log.push("connection closed");
}

const connection = createConnection();
send(connection, "client", "hello server");
send(connection, "server", "hello client");
send(connection, "server", "score update: 2-1");
closeConnection(connection);
send(connection, "client", "are you there?");

for (const line of connection.log) {
  console.log(line);
}`,
      Python: `def create_connection():
    return {"open": True, "log": []}

def send(connection, from_, message):
    if not connection["open"]:
        connection["log"].append(from_ + " tried to send after close: " + message)
        return
    connection["log"].append(from_ + ": " + message)

def close_connection(connection):
    connection["open"] = False
    connection["log"].append("connection closed")

connection = create_connection()
send(connection, "client", "hello server")
send(connection, "server", "hello client")
send(connection, "server", "score update: 2-1")
close_connection(connection)
send(connection, "client", "are you there?")

for line in connection["log"]:
    print(line)`,
    },
    output: `client: hello server
server: hello client
server: score update: 2-1
connection closed
client tried to send after close: are you there?`,
  },
];

export default lessons;
