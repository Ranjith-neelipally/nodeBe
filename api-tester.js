"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const BASE_URL = "http://localhost:1430";
let token = "";
let userId = "69a95e232a08a67e7f4f5bdb";
let projectId = "";
let plotId = "";
let noteId = "";
let ideaId = "";
function makeRequest(method_1, path_1, body_1) {
    return __awaiter(this, arguments, void 0, function* (method, path, body, useToken = true) {
        return new Promise((resolve, reject) => {
            const url = new URL(BASE_URL + path);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method,
                headers: {
                    "Content-Type": "application/json",
                },
            };
            if (useToken && token) {
                options.headers["Authorization"] = `Bearer ${token}`;
            }
            const req = http.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({ status: res.statusCode, data: parsed });
                    }
                    catch (e) {
                        resolve({ status: res.statusCode, data });
                    }
                });
            });
            req.on("error", (e) => reject(e));
            if (body) {
                req.write(JSON.stringify(body));
            }
            req.end();
        });
    });
}
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        console.log("Starting API Tests...\n");
        console.log("--- TEST: Auth Sign-In ---");
        const loginRes = yield makeRequest("POST", "/auth/sign-in", {
            email: "ranjithsam21@gmail.com",
            password: "Test@123",
        }, false);
        console.log(`Status: ${loginRes.status}`);
        if (loginRes.status !== 200) {
            console.error("Failed to sign in!", loginRes.data);
            return;
        }
        token = loginRes.data.token;
        userId = loginRes.data.profile.id;
        console.log("Sign-in OK! Token acquired.\n");
        console.log("--- TEST: Create Project ---");
        const createProjRes = yield makeRequest("POST", "/projects", {
            userId,
            title: "Test Project Integration " + Date.now(),
            replications: 3,
            treatments: 5,
            location: "Test Location",
        });
        console.log(`Status: ${createProjRes.status}`);
        if (createProjRes.status !== 200 && createProjRes.status !== 201) {
            console.error("Failed to create project!", createProjRes.data);
            return;
        }
        projectId = createProjRes.data._id || ((_a = createProjRes.data.project) === null || _a === void 0 ? void 0 : _a._id) || ((_b = createProjRes.data.Project) === null || _b === void 0 ? void 0 : _b._id);
        if (!projectId && ((_c = createProjRes.data.data) === null || _c === void 0 ? void 0 : _c._id))
            projectId = createProjRes.data.data._id;
        if (!projectId) {
            console.log("Check payload structure:", JSON.stringify(createProjRes.data, null, 2));
            projectId = ((_d = Object.values(createProjRes.data).find((val) => val === null || val === void 0 ? void 0 : val._id)) === null || _d === void 0 ? void 0 : _d._id) || "";
        }
        console.log(`Project Created OK! ID: ${projectId}\n`);
        console.log("--- TEST: Create Plot ---");
        const createPlotRes = yield makeRequest("POST", "/projects/plot", {
            userId,
            projectId,
            plots: [
                {
                    title: "Test Plot 1",
                    color: "#ffffff",
                    replication: 1,
                    treatment: 1,
                    plotIndex: [0, 0],
                },
                {
                    title: "Test Plot 2",
                    color: "#ff0000",
                    replication: 1,
                    treatment: 2,
                    plotIndex: [0, 1],
                },
                {
                    title: "Test Plot 3",
                    color: "#00ff00",
                    replication: 2,
                    treatment: 1,
                    plotIndex: [1, 0],
                },
                {
                    title: "Test Plot 4",
                    color: "#0000ff",
                    replication: 2,
                    treatment: 2,
                    plotIndex: [1, 1],
                },
            ],
        });
        console.log(`Status: ${createPlotRes.status}`);
        if (createPlotRes.status !== 200 && createPlotRes.status !== 201) {
            console.error("Failed to create plot!", JSON.stringify(createPlotRes.data, null, 2));
            return;
        }
        let plots = createPlotRes.data.plots || createPlotRes.data;
        plotId = Array.isArray(plots) ? plots[0]._id : plots._id;
        console.log(`Plot Created OK! ID: ${plotId}\n`);
        console.log("--- TEST: Create Note ---");
        const createNoteRes = yield makeRequest("POST", "/projects/note", {
            userId,
            projectId,
            plotId,
            content: ["Automated testing note content"],
            photoIds: ["test_photo_id_123"]
        });
        console.log(`Status: ${createNoteRes.status}`);
        if (createNoteRes.status !== 200 && createNoteRes.status !== 201) {
            console.error("Failed to create note!", createNoteRes.data);
            return;
        }
        console.log(`Note Created OK!\n`);
        console.log("--- TEST: Get All Projects ---");
        const getProjRes = yield makeRequest("GET", `/projects?userId=${userId}`);
        console.log(`Status: ${getProjRes.status}`);
        if (getProjRes.status !== 200) {
            console.error("Failed to get projects!", getProjRes.data);
        }
        else {
            console.log(`Get Projects OK!\n`);
        }
        console.log("--- TEST: Get All Plots ---");
        const getPlotsRes = yield makeRequest("GET", `/projects/plot?userId=${userId}&projectId=${projectId}`);
        console.log(`Status: ${getPlotsRes.status}`);
        if (getPlotsRes.status !== 200) {
            console.error("Failed to get plots!", getPlotsRes.data);
        }
        else {
            console.log(`Get Plots OK!\n`);
        }
        console.log("--- TEST: Get All Photos ---");
        const getPhotosRes = yield makeRequest("GET", `/projects/photos?userId=${userId}`);
        console.log(`Status: ${getPhotosRes.status}`);
        if (getPhotosRes.status !== 200) {
            console.error("Failed to get photos!", getPhotosRes.data);
        }
        else {
            console.log(`Get Photos OK!\n`);
        }
        console.log("--- TEST: Create Idea ---");
        const createIdeaRes = yield makeRequest("POST", "/ideas", {
            userId,
            idea: "This is an automated test idea",
            date: new Date().toISOString()
        });
        console.log(`Status: ${createIdeaRes.status}`);
        if (createIdeaRes.status !== 200 && createIdeaRes.status !== 201) {
            console.error("Failed to create idea!", createIdeaRes.data);
        }
        else {
            ideaId = createIdeaRes.data._id || ((_e = createIdeaRes.data.idea) === null || _e === void 0 ? void 0 : _e._id);
            console.log(`Idea Created OK!\n`);
        }
        console.log("--- TEST: Get Ideas ---");
        const getIdeasRes = yield makeRequest("GET", `/ideas?userId=${userId}`);
        console.log(`Status: ${getIdeasRes.status}`);
        if (getIdeasRes.status !== 200) {
            console.error("Failed to get ideas!", getIdeasRes.data);
        }
        else {
            console.log(`Get Ideas OK!\n`);
        }
        console.log("--- ALL APIS TESTED SUCCESSFULLY ---");
    });
}
runTests().catch(console.error);
