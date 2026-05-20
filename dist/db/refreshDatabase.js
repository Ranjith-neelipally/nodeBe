"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Projects_1 = require("../modals/Projects");
const Plots_1 = require("../modals/Projects/Plots");
const Notes_1 = require("../modals/Projects/Notes");
const Idea_1 = __importDefault(require("../modals/Idea"));
const userModal_1 = __importDefault(require("../modals/userModal"));
const Treatments_1 = __importDefault(require("../modals/Treatments"));
const router = (0, express_1.Router)();
const apiDocs = {
    route: "/admin/api",
    description: "Lightweight API reference for available backend routes.",
    sections: {
        auth: {
            basePath: "/auth",
            requiresAuth: false,
            routes: [
                {
                    method: "GET",
                    path: "/auth/get-user",
                    requiresAuth: true,
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/auth/signup",
                    requiresAuth: false,
                    accepted: {
                        body: {
                            userName: "string",
                            email: "string",
                            password: "string",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/auth/sign-in",
                    requiresAuth: false,
                    accepted: {
                        body: {
                            email: "string",
                            password: "string",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/auth/verify-email",
                    requiresAuth: false,
                    accepted: {
                        body: {
                            userId: "string",
                            code: "string",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/auth/resend-verification-email",
                    requiresAuth: false,
                    accepted: {
                        body: {
                            userId: "string",
                            code: "string",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/auth/forgot-password",
                    requiresAuth: false,
                    accepted: {
                        body: {
                            email: "string",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/auth/verify-reset-password",
                    requiresAuth: false,
                    accepted: {
                        body: {
                            token: "string",
                            userId: "string",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/auth/update-password",
                    requiresAuth: false,
                    accepted: {
                        body: {
                            token: "string",
                            userId: "string",
                            password: "string",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/auth/log-out",
                    requiresAuth: true,
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                    },
                },
            ],
        },
        projects: {
            basePath: "/projects",
            requiresAuth: true,
            routes: [
                {
                    method: "POST",
                    path: "/projects",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            userId: "string",
                            title: "string",
                            replications: "number",
                            treatments: "number",
                            location: "string optional",
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/projects/plot",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            userId: "string",
                            projectId: "string",
                            plots: [
                                {
                                    title: "string",
                                    color: "string",
                                    replication: "number",
                                    treatment: "number",
                                    plotIndex: ["number", "number"],
                                },
                            ],
                        },
                    },
                },
                {
                    method: "POST",
                    path: "/projects/note",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            userId: "string",
                            projectId: "string",
                            plotId: "string",
                            title: "string optional",
                            content: "string | string[]",
                            photoIds: ["string"],
                        },
                    },
                },
                {
                    method: "PATCH",
                    path: "/projects",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            _id: "string",
                            userId: "string",
                            title: "string optional",
                            replications: "number optional",
                            treatments: "number optional",
                            location: "string optional",
                        },
                    },
                },
                {
                    method: "PATCH",
                    path: "/projects/plot",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            _id: "string",
                            userId: "string",
                            projectId: "string",
                            title: "string optional",
                            color: "string optional",
                            notesCount: "number optional",
                            replication: "number optional",
                            treatment: "number optional",
                        },
                    },
                },
                {
                    method: "PATCH",
                    path: "/projects/note",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            noteId: "string",
                            userId: "string",
                            projectId: "string",
                            plotId: "string",
                            title: "string optional",
                            content: ["string"],
                            photoIds: ["string"],
                        },
                    },
                },
                {
                    method: "DELETE",
                    path: "/projects",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            _id: "string",
                            userId: "string",
                        },
                    },
                },
                {
                    method: "DELETE",
                    path: "/projects/plot",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            _id: "string",
                            userId: "string",
                            projectId: "string",
                        },
                    },
                },
                {
                    method: "DELETE",
                    path: "/projects/note",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            _id: "string",
                            userId: "string",
                            projectId: "string",
                            plotId: "string",
                        },
                    },
                },
                {
                    method: "GET",
                    path: "/projects",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        query: {
                            userId: "string",
                        },
                        response: {
                            data: [
                                {
                                    _id: "string",
                                    title: "string",
                                    plotColors: ["string"],
                                },
                            ],
                            dates: ["YYYY-MM-DD"],
                        },
                    },
                },
                {
                    method: "GET",
                    path: "/projects/plot",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        query: {
                            userId: "string optional",
                            projectId: "string",
                        },
                        response: {
                            data: [
                                {
                                    _id: "string",
                                    projectId: "string",
                                    title: "string",
                                    color: "string",
                                    replication: "number",
                                    treatment: "number",
                                    notesCount: "number",
                                },
                            ],
                            dates: ["YYYY-MM-DD"],
                        },
                    },
                },
                {
                    method: "GET",
                    path: "/projects/note",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        query: {
                            userId: "string optional",
                            projectId: "string",
                            plotId: "string optional",
                            date: "YYYY-MM-DD optional, fetches notes across all plots in the project for that date",
                            limit: "number optional, default 15",
                            page: "number optional, default 1",
                        },
                        response: {
                            data: [
                                {
                                    _id: "string",
                                    projectId: "string",
                                    plotId: "string",
                                    date: "YYYY-MM-DD",
                                    content: [
                                        {
                                            note: ["string"],
                                            photoIds: ["string"],
                                        },
                                    ],
                                    createdAt: "ISO date string",
                                },
                            ],
                            page: "number",
                            limit: "number",
                            total: "number",
                        },
                    },
                },
                {
                    method: "GET",
                    path: "/projects/photos",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        query: {
                            userId: "string",
                        },
                    },
                },
            ],
        },
        ideas: {
            basePath: "/ideas",
            requiresAuth: true,
            routes: [
                {
                    method: "POST",
                    path: "/ideas",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            userId: "string",
                            idea: "string",
                            date: "ISO date string",
                        },
                    },
                },
                {
                    method: "PATCH",
                    path: "/ideas",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            _id: "string",
                            userId: "string",
                            idea: "string",
                            date: "ISO date string optional",
                        },
                    },
                },
                {
                    method: "GET",
                    path: "/ideas",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        query: {
                            userId: "string",
                            date: "ISO date string optional",
                            limit: "number optional, default 15",
                            page: "number optional, default 1",
                        },
                    },
                },
                {
                    method: "DELETE",
                    path: "/ideas",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        body: {
                            _id: "string",
                            userId: "string",
                        },
                    },
                },
            ],
        },
        photos: {
            basePath: "/photos",
            requiresAuth: true,
            routes: [
                {
                    method: "GET",
                    path: "/photos",
                    accepted: {
                        headers: {
                            Authorization: "Bearer <jwt-token>",
                        },
                        query: {
                            userId: "string",
                            photoId: "string",
                        },
                    },
                },
            ],
        },
        admin: {
            basePath: "/admin",
            requiresAuth: false,
            routes: [
                {
                    method: "GET",
                    path: "/admin/api",
                    accepted: {},
                },
                {
                    method: "POST",
                    path: "/admin/refresh-modals",
                    accepted: {},
                },
            ],
        },
    },
};
const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const renderAcceptedBlock = (accepted) => {
    const entries = Object.entries(accepted);
    if (!entries.length) {
        return `<p class="empty-state">No request payload is required for this route.</p>`;
    }
    return entries
        .map(([key, value]) => `
        <div class="payload-block">
          <div class="payload-title">${escapeHtml(key)}</div>
          <pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre>
        </div>
      `)
        .join("");
};
const renderApiDocsPage = () => {
    const sections = Object.entries(apiDocs.sections)
        .map(([sectionKey, section]) => {
        const routes = section.routes
            .map((route) => {
            const routeRequiresAuth = "requiresAuth" in route ? route.requiresAuth : section.requiresAuth;
            return `
            <article class="route-card">
              <div class="route-top">
                <span class="method method-${route.method.toLowerCase()}">${escapeHtml(route.method)}</span>
                <a href="${escapeHtml(route.path)}" class="route-link">${escapeHtml(route.path)}</a>
                <span class="auth-pill ${routeRequiresAuth ? "secure" : "public"}">
                  ${routeRequiresAuth ? "Auth required" : "Public"}
                </span>
              </div>
              ${renderAcceptedBlock(route.accepted)}
            </article>
          `;
        })
            .join("");
        return `
        <section class="docs-section" id="${escapeHtml(sectionKey)}">
          <div class="section-head">
            <div>
              <p class="section-kicker">${escapeHtml(section.basePath)}</p>
              <h2>${escapeHtml(sectionKey)}</h2>
            </div>
            <span class="section-badge">${section.routes.length} routes</span>
          </div>
          <div class="routes-grid">
            ${routes}
          </div>
        </section>
      `;
    })
        .join("");
    return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Admin API Docs</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>
        :root {
          --bg: #f7f3ea;
          --paper: rgba(255, 252, 246, 0.9);
          --ink: #1f2937;
          --muted: #5b6472;
          --line: rgba(31, 41, 55, 0.12);
          --accent: #c96b3b;
          --accent-soft: rgba(201, 107, 59, 0.14);
          --green: #1f7a5a;
          --green-soft: rgba(31, 122, 90, 0.14);
          --shadow: 0 24px 60px rgba(77, 57, 35, 0.12);
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: "Space Grotesk", sans-serif;
          color: var(--ink);
          background:
            radial-gradient(circle at top left, rgba(201, 107, 59, 0.18), transparent 30%),
            radial-gradient(circle at top right, rgba(31, 122, 90, 0.14), transparent 28%),
            linear-gradient(180deg, #f9f6ef 0%, var(--bg) 100%);
        }
        .shell {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 40px 0 64px;
        }
        .hero {
          background: linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,248,238,0.92));
          border: 1px solid var(--line);
          border-radius: 28px;
          box-shadow: var(--shadow);
          padding: 32px;
          position: relative;
          overflow: hidden;
        }
        .hero::after {
          content: "";
          position: absolute;
          inset: auto -40px -40px auto;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(201, 107, 59, 0.18), transparent 68%);
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-soft);
          color: var(--accent);
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        h1 {
          margin: 16px 0 12px;
          font-size: clamp(2.2rem, 4vw, 4rem);
          line-height: 0.96;
        }
        .lead {
          margin: 0;
          max-width: 720px;
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.7;
        }
        .quick-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }
        .quick-links a {
          text-decoration: none;
          color: var(--ink);
          background: rgba(255,255,255,0.8);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 0.95rem;
        }
        .docs-section {
          margin-top: 28px;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 26px;
          box-shadow: var(--shadow);
          padding: 24px;
        }
        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 16px;
          margin-bottom: 20px;
        }
        .section-kicker {
          margin: 0 0 6px;
          color: var(--accent);
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        h2 {
          margin: 0;
          font-size: 1.7rem;
          text-transform: capitalize;
        }
        .section-badge {
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 0.9rem;
          color: var(--muted);
          white-space: nowrap;
        }
        .routes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }
        .route-card {
          background: rgba(255,255,255,0.82);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 18px;
        }
        .route-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .method {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 64px;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: white;
        }
        .method-get { background: #2d7ff9; }
        .method-post { background: #c96b3b; }
        .method-patch { background: #8b5cf6; }
        .method-delete { background: #dc2626; }
        .route-link {
          color: var(--ink);
          text-decoration: none;
          font-weight: 700;
          word-break: break-word;
        }
        .auth-pill {
          margin-left: auto;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .auth-pill.secure {
          background: var(--green-soft);
          color: var(--green);
        }
        .auth-pill.public {
          background: rgba(45, 127, 249, 0.14);
          color: #2d7ff9;
        }
        .payload-block + .payload-block {
          margin-top: 12px;
        }
        .payload-title {
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 0.84rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        pre {
          margin: 0;
          overflow: auto;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: #111827;
          color: #f9fafb;
          font-family: "IBM Plex Mono", monospace;
          font-size: 0.82rem;
          line-height: 1.6;
        }
        .empty-state {
          margin: 0;
          color: var(--muted);
        }
        @media (max-width: 720px) {
          .shell { width: min(100% - 20px, 1180px); padding-top: 20px; }
          .hero, .docs-section { padding: 20px; border-radius: 22px; }
          .section-head { align-items: start; flex-direction: column; }
          .auth-pill { margin-left: 0; }
        }
      </style>
    </head>
    <body>
      <main class="shell">
        <section class="hero">
          <div class="eyebrow">Admin API Docs</div>
          <h1>Backend routes, payloads, and quick links.</h1>
          <p class="lead">${escapeHtml(apiDocs.description)}</p>
          <div class="quick-links">
            <a href="/admin/api?format=json">View JSON</a>
            ${Object.entries(apiDocs.sections)
        .map(([sectionKey, section]) => `<a href="#${escapeHtml(sectionKey)}">${escapeHtml(section.basePath)}</a>`)
        .join("")}
          </div>
        </section>
        ${sections}
      </main>
    </body>
  </html>
  `;
};
const modalUpdates = [
    {
        model: Projects_1.Projects,
        update: {},
    },
    {
        model: Treatments_1.default,
        update: {},
    },
    {
        model: Plots_1.Plots,
        update: {},
    },
    {
        model: Notes_1.PlotNotes,
        update: { photoIds: [] },
    },
    {
        model: Idea_1.default,
        update: {},
    },
    {
        model: userModal_1.default,
        update: { bio: "", profilePhotoUrl: "" },
    },
];
router.post("/refresh-modals", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const { model, update } of modalUpdates) {
            if (Object.keys(update).length > 0) {
                yield model.updateMany(Object.fromEntries(Object.keys(update).map((k) => [k, { $exists: false }])), { $set: update });
            }
        }
        res.json({ success: true, message: "All modals refreshed." });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, error: errorMessage });
    }
}));
router.get("/api", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        return res.status(404).json({ error: "Not found" });
    }
    if (req.query.format === "json") {
        return res.status(200).json(apiDocs);
    }
    return res.status(200).send(renderApiDocsPage());
});
exports.default = router;
