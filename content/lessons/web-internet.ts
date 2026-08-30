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
];

export default lessons;
