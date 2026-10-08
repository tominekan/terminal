# Tomi's Terminal

This is a redesign of my personal website as a terminal emulator. It's pretty unique and works like any unix based command line interface

*Future Ideas/Plans*
- [ ] Integrate Spotify API with this website, add what I'm currently listening to
- [x] Update website when I get into college
- [x] Add more detail in the personal information section, looks pretty spartan ngl
- [x] Create new "file system" class for extensive refactoring (reduce code repitition)
- [x] Make the directory system less trivial lol, need to get rid of repeating code
- [ ] Add some fun little easter eggs
- [ ] Add more terminal functionality like command line flags (maybe waay later down the line) 

## Spotify setup
The `spotify` command calls a Netlify Function (`netlify/functions/spotify.mjs`) that holds the Spotify secrets, so they never end up in the browser. Spotify's developer mode requires the app owner to have Premium.

1. Create an app at https://developer.spotify.com/dashboard (Web API), and add `http://127.0.0.1:8888/callback` as a Redirect URI
2. Run `SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-auth.mjs`, log in, and copy the refresh token it prints
3. In Netlify (Site configuration → Environment variables), add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN`, then redeploy
