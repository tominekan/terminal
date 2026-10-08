/**
 * spotify-auth.mjs
 *  One-time script to get the Spotify refresh token the Netlify function needs. It opens the Spotify
 *  login page, catches the redirect on 127.0.0.1:8888, and prints the refresh token. Run it once, then never again
 *  (unless the token gets revoked).
 *
 *  Usage: SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-auth.mjs
 */

import http from "node:http";
import crypto from "node:crypto";
import { execFile } from "node:child_process";

const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } = process.env;
if (!clientId || !clientSecret) {
    console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first");
    process.exit(1);
}

// This exact URI has to be added under Redirect URIs in the Spotify app settings
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPES = "user-read-currently-playing user-read-recently-played user-top-read";
const state = crypto.randomBytes(16).toString("hex");

const authUrl = "https://accounts.spotify.com/authorize?" + new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
});

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, REDIRECT_URI);
    if (url.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
    }

    const code = url.searchParams.get("code");
    if (url.searchParams.get("state") !== state || !code) {
        res.end("Something went wrong, check the terminal.");
        console.error("Login failed:", url.searchParams.get("error") ?? "state mismatch");
        server.close();
        return;
    }

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
    });
    const data = await tokenRes.json();

    if (!data.refresh_token) {
        res.end("Something went wrong, check the terminal.");
        console.error("Token exchange failed:", data);
    } else {
        res.end("Got it! You can close this tab and go back to the terminal.");
        console.log("\nAdd this to your Netlify environment variables:\n");
        console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
    }
    server.close();
});

server.listen(8888, "127.0.0.1", () => {
    console.log("Opening the Spotify login page. If it doesn't open, visit:\n" + authUrl);
    execFile("open", [authUrl], () => {});
});
