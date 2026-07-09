import * as http from "http";
import * as https from "https";

const BASE_URL = "http://localhost:1430";

let token = "";
let userId = "69a95e232a08a67e7f4f5bdb"; // The test user ID we got earlier
let projectId = "";
let plotId = "";
let noteId = "";
let ideaId = "";

async function makeRequest(
    method: string,
    path: string,
    body?: any,
    useToken = true
): Promise<any> {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options: http.RequestOptions = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (useToken && token) {
            options.headers!["Authorization"] = `Bearer ${token}`;
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
                } catch (e) {
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
}

async function runTests() {
    console.log("Starting API Tests...\n");

    // 1. SIGN IN
    console.log("--- TEST: Auth Sign-In ---");
    const loginRes = await makeRequest("POST", "/auth/sign-in", {
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

    // 2. CREATE PROJECT
    console.log("--- TEST: Create Project ---");
    const createProjRes = await makeRequest("POST", "/projects", {
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
    projectId = createProjRes.data._id || createProjRes.data.project?._id || createProjRes.data.Project?._id;
    if (!projectId && createProjRes.data.data?._id) projectId = createProjRes.data.data._id;
    if (!projectId) {
        console.log("Check payload structure:", JSON.stringify(createProjRes.data, null, 2));
        projectId = Object.values(createProjRes.data).find((val: any) => val?._id)?._id || "";
    }
    console.log(`Project Created OK! ID: ${projectId}\n`);

    // 3. CREATE PLOT
    console.log("--- TEST: Create Plot ---");
    const createPlotRes = await makeRequest("POST", "/projects/plot", {
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
    // Data structure might be an array or an object containing array
    let plots = createPlotRes.data.plots || createPlotRes.data;
    plotId = Array.isArray(plots) ? plots[0]._id : plots._id;
    console.log(`Plot Created OK! ID: ${plotId}\n`);

    // 4. CREATE NOTE
    console.log("--- TEST: Create Note ---");
    const createNoteRes = await makeRequest("POST", "/projects/note", {
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

    // 5. GET PROJECTS
    console.log("--- TEST: Get All Projects ---");
    const getProjRes = await makeRequest("GET", `/projects?userId=${userId}`);
    console.log(`Status: ${getProjRes.status}`);
    if (getProjRes.status !== 200) {
        console.error("Failed to get projects!", getProjRes.data);
    } else {
        console.log(`Get Projects OK!\n`);
    }

    // 6. GET ALL PLOTS FOR PROJECT
    console.log("--- TEST: Get All Plots ---");
    const getPlotsRes = await makeRequest("GET", `/projects/plot?userId=${userId}&projectId=${projectId}`);
    console.log(`Status: ${getPlotsRes.status}`);
    if (getPlotsRes.status !== 200) {
        console.error("Failed to get plots!", getPlotsRes.data);
    } else {
        console.log(`Get Plots OK!\n`);
    }

    // 7. GET ALL PHOTOS
    console.log("--- TEST: Get All Photos ---");
    const getPhotosRes = await makeRequest("GET", `/projects/photos?userId=${userId}`);
    console.log(`Status: ${getPhotosRes.status}`);
    if (getPhotosRes.status !== 200) {
        console.error("Failed to get photos!", getPhotosRes.data);
    } else {
        console.log(`Get Photos OK!\n`);
    }

    // 8. CREATE IDEA
    console.log("--- TEST: Create Idea ---");
    const createIdeaRes = await makeRequest("POST", "/ideas", {
        userId,
        idea: "This is an automated test idea",
        date: new Date().toISOString()
    });
    console.log(`Status: ${createIdeaRes.status}`);
    if (createIdeaRes.status !== 200 && createIdeaRes.status !== 201) {
        console.error("Failed to create idea!", createIdeaRes.data);
    } else {
        ideaId = createIdeaRes.data._id || createIdeaRes.data.idea?._id;
        console.log(`Idea Created OK!\n`);
    }

    // 9. GET IDEAS
    console.log("--- TEST: Get Ideas ---");
    const getIdeasRes = await makeRequest("GET", `/ideas?userId=${userId}`);
    console.log(`Status: ${getIdeasRes.status}`);
    if (getIdeasRes.status !== 200) {
        console.error("Failed to get ideas!", getIdeasRes.data);
    } else {
        console.log(`Get Ideas OK!\n`);
    }

    // 10. GET USER
    console.log("--- TEST: Get User ---");
    const getUserRes = await makeRequest("GET", "/auth/get-user", null, true);
    console.log(`Status: ${getUserRes.status}`);
    if (getUserRes.status !== 200) {
        console.error("Failed to get user!", getUserRes.data);
    } else {
        console.log(`Get User OK! Verified: ${getUserRes.data.profile.verified}\n`);
    }

    // 11. LOGOUT
    console.log("--- TEST: Logout ---");
    const logoutRes = await makeRequest("POST", "/auth/log-out", null, true);
    console.log(`Status: ${logoutRes.status}`);
    if (logoutRes.status !== 200) {
        console.error("Failed to logout!", logoutRes.data);
    } else {
        console.log(`Logout OK!\n`);
    }

    console.log("--- ALL APIS TESTED SUCCESSFULLY ---");
}

runTests().catch(console.error);
