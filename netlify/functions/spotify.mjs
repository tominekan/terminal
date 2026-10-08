/**
 * spotify.mjs
 *  Netlify Function that returns what I'm listening to and my top tracks. It holds the Spotify
 *  secrets so the browser never sees them. It needs these environment variables set in Netlify:
 *  SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN (run scripts/spotify-auth.mjs to get the last one)
 *
 *  GET /.netlify/functions/spotify?range=short_term|medium_term|long_term
 */

const RANGES = ["short_term", "medium_term", "long_term"];

const HEADERS = {
    // Any origin is fine, this only ever returns public-ish listening data. It also lets index.html work opened straight from disk
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=15",
};

/**
 * Trades the long-lived refresh token for an access token that's good for an hour
 */
async function getAccessToken() {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Authorization": "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN }),
    });
    if (!res.ok) {
        throw new Error(`token refresh failed: ${res.status} ${await res.text()}`);
    }
    return (await res.json()).access_token;
}

/**
 * @returns the JSON from a Spotify Web API endpoint, or null if there's no content (e.g. nothing playing)
 */
async function spotify(path, token) {
    const res = await fetch(`https://api.spotify.com/v1${path}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (res.status === 204) {
        return null;
    }
    if (!res.ok) {
        throw new Error(`${path} failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
}

/**
 * Trims a Spotify track down to just what the terminal needs
 */
function simplify(track) {
    const images = track.album?.images ?? [];
    return {
        name: track.name,
        artists: track.artists.map((artist) => artist.name).join(", "),
        durationMs: track.duration_ms,
        url: track.external_urls?.spotify ?? null,
        // Images come largest first, the smallest (64px) is plenty for a few dozen terminal "pixels"
        image: images.at(-1)?.url ?? null,
    };
}

export default async (req) => {
    const range = new URL(req.url).searchParams.get("range");
    const timeRange = RANGES.includes(range) ? range : "short_term";

    try {
        const token = await getAccessToken();
        const [current, top] = await Promise.all([
            spotify("/me/player/currently-playing", token),
            spotify(`/me/top/tracks?limit=5&time_range=${timeRange}`, token),
        ]);

        let now = null;
        if (current?.item && current.currently_playing_type === "track") {
            now = { ...simplify(current.item), isPlaying: current.is_playing, progressMs: current.progress_ms };
        } else {
            // Nothing playing (or a podcast), so show the last song instead
            const recent = await spotify("/me/player/recently-played?limit=1", token);
            const last = recent?.items?.[0];
            if (last) {
                now = { ...simplify(last.track), isPlaying: false, progressMs: null, playedAt: last.played_at };
            }
        }

        return new Response(JSON.stringify({ now, top: top.items.map(simplify), range: timeRange }), { headers: HEADERS });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "couldn't reach spotify" }), { status: 502, headers: HEADERS });
    }
};
