/**
 * script.js
 *  The fake terminal. All of the actual content lives in content.js, this file just handles
 *  the filesystem and the commands.
 *
 * This is the Project Structure:
 *
 * Root:
 * |- About
 *    |- whoiam.txt
 *    |- skills.txt
 *    |- resume.pdf
 * |- Education
 *    |- upenn.txt
 * |- Experience
 *    |- microsoft.txt, cnt_research.txt, weingarten.txt, fife_penn.txt, leadership.txt
 * |- Projects
 *    |- babydb.c, styletransfer.py, pycomplete.py
 *    |- archive (older projects)
 * |- Contact
 *    |- contactinfo.txt
 */

// Follows the Dracula color scheme
const colors = {
    red: "#ff5555",
    cyan: "#8be9fd",
    green: "#50FA7B",
    pink: "#FF79C6",
    purple: "#BD93F9"
};

/**
 * @param {String} text the text we want to change
 * @param {String} color the color we want to change it to
 * @param {String} style jquery.terminal style flags, b = bold, u = underline, i = italic
 * @returns the text changed to a specific color
 */
function toColor(text, color, style="b") {
    return `[[${style};${color};]${text}]`
}


/**
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * File and Directory Classes
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

class File {
    /**
     * @param {String} name the name of the file
     * @param {Directory} parent the directory this file lives in
     * @param {Object} data what's in the file, one of text(), link(), or entry() from content.js
     */
    constructor(name, parent, data=text("")) {
        this.name = name;
        this.parent = parent;
        this.data = data;
    }
}

class Directory {
    /**
     * @param {String} name the name of the directory
     * @param {Directory} parent the parent directory, null for the root
     */
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
        this.children = {};
    }

    add(node) {
        this.children[node.name] = node;
    }

    remove(name) {
        delete this.children[name];
    }

    contains(name) {
        return name in this.children;
    }

    get(name) {
        return this.children[name];
    }

    list() {
        return Object.values(this.children);
    }
}


/**
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * FileSystem Class
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */
class FileSystem {
    /**
     * Create a new filesystem with a root directory. This doesn't support some more advanced features like regex.
     * @param {Function} onError a function to handle errors, it should take in one argument, the error message to handle.
     */
    constructor(onError=null) {
        this.root = new Directory("~", null);
        this.cwd = this.root;
        this.errorFunc = onError;
    }

    setErrorFunc(errFunc) {
        this.errorFunc = errFunc;
    }

    /**
     * Fills the filesystem from a nested object like CONTENT in content.js
     * @param {Object} tree plain objects are directories, anything with a `kind` is a file
     * @param {Directory} dir the directory to load into
     */
    load(tree, dir=this.root) {
        for (const [name, value] of Object.entries(tree)) {
            if (value.kind) {
                dir.add(new File(name, dir, value));
            } else {
                const subdir = new Directory(name, dir);
                dir.add(subdir);
                this.load(value, subdir);
            }
        }
    }

    /**
     * Finds the File or Directory at a path. Handles ~, /, ., and .. like a normal unix shell
     * @param {String} path the path to look up
     * @returns the File or Directory, or null if nothing's there
     */
    resolve(path="") {
        let node = this.cwd;
        if (path.startsWith("~") || path.startsWith("/")) {
            node = this.root;
            path = path.replace(/^~/, "");
        }

        for (const part of path.split("/")) {
            if (part === "" || part === ".") {
                continue;
            }
            if (part === "..") {
                node = node.parent ?? node;
                continue;
            }
            if (!(node instanceof Directory) || !node.contains(part)) {
                return null;
            }
            node = node.get(part);
        }
        return node;
    }

    #fail(message) {
        if (this.errorFunc) {
            this.errorFunc(message);
        }
        return null;
    }

    /** resolve(), but reports an error if nothing's there */
    #lookup(path, cmd) {
        return this.resolve(path) ?? this.#fail(`${cmd}: no such file or directory: ${path}`);
    }

    /**
     * Splits a path into the directory it would live in and its name, for creating new things
     * @returns an object `{dir, name}`, or null if the parent directory doesn't exist
     */
    #lookupParent(path, cmd) {
        const trimmed = path.replace(/\/+$/, "");
        const slash = trimmed.lastIndexOf("/");
        const name = trimmed.slice(slash + 1);
        const dir = (slash === -1) ? this.cwd : this.resolve(trimmed.slice(0, slash) || "/");

        if (!(dir instanceof Directory)) {
            return this.#fail(`${cmd}: no such directory: ${path}`);
        }
        return { dir, name };
    }

    /**
     * @param {String} path the path to a file
     * @param {String} cmd name of the command asking, for error messages
     * @returns the File at path, or null if it doesn't exist or is a directory
     */
    readFile(path, cmd) {
        const node = this.#lookup(path, cmd);
        if (node instanceof Directory) {
            return this.#fail(`${cmd}: ${path}: is a directory`);
        }
        return node;
    }

    /**
     * @param {String} path the directory (or file) to list, the cwd by default
     * @returns an array of Files and Directories, or null on error
     */
    ls(path) {
        const node = (path === undefined) ? this.cwd : this.#lookup(path, "ls");
        if (node === null) {
            return null;
        }
        return (node instanceof Directory) ? node.list() : [node];
    }

    /**
     * Change the current working directory, back to root if path is undefined
     */
    cd(path) {
        const node = this.#lookup(path ?? "~", "cd");
        if (node === null) {
            return;
        }
        if (node instanceof File) {
            this.#fail(`cd: not a directory: ${path}`);
            return;
        }
        this.cwd = node;
    }

    /**
     * @returns a string representation of the current working directory, like ~/Projects/archive
     */
    pwd() {
        const parts = [];
        for (let node = this.cwd; node !== this.root; node = node.parent) {
            parts.unshift(node.name);
        }
        return ["~", ...parts].join("/");
    }

    mkdir(paths) {
        for (const path of paths) {
            const target = this.#lookupParent(path, "mkdir");
            if (target === null) {
                continue;
            }
            if (target.dir.contains(target.name)) {
                this.#fail(`mkdir: ${path}: File exists`);
                continue;
            }
            target.dir.add(new Directory(target.name, target.dir));
        }
    }

    /**
     * Creates an empty file if the file does not exist
     */
    touch(paths) {
        for (const path of paths) {
            const target = this.#lookupParent(path, "touch");
            if (target !== null && !target.dir.contains(target.name)) {
                target.dir.add(new File(target.name, target.dir));
            }
        }
    }

    /**
     * Act's akin to rm -rf items
     */
    rm(paths) {
        for (const path of paths) {
            const node = this.#lookup(path, "rm");
            if (node === null) {
                continue;
            }
            if (node === this.root) {
                this.#fail("rm: refusing to remove root, nice try");
                continue;
            }
            // If we just deleted a folder we're inside of, hop out of it
            for (let dir = this.cwd; dir !== null; dir = dir.parent) {
                if (dir === node) {
                    this.cwd = node.parent;
                }
            }
            node.parent.remove(node.name);
        }
    }
}


/**
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * Actual Terminal
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

let fs = new FileSystem();
fs.load(CONTENT);

/**
 * Turns a file's data (from content.js) into a string the terminal can print
 */
function render(data) {
    switch (data.kind) {
        case "link":
            return data.url;
        case "entry": {
            let header = toColor(data.title, colors.pink, "bu");
            if (data.date) {
                header += "  " + toColor(data.date, colors.purple, "i");
            }
            return "\n" + header + "\n" + data.bullets.map((bullet) => `  • ${bullet}`).join("\n") + "\n";
        }
        default:
            return data.body;
    }
}

function colorcodeFS(items) {
    return items.map((item) => (item instanceof Directory) ? toColor(item.name, colors.purple) : item.name);
}

/**
 * jquery.terminal passes arguments as numbers sometimes, this makes sure a command always gets an array of strings
 */
const withArgs = (fn) => function(...args) {
    return fn.call(this, args.map(String));
};

function updatePrompt() {
    term.set_prompt(`[[;${colors.green};]tomster@localhost] [[b;${colors.cyan};]${fs.pwd()}] `);
}

/**
 * Figures out what Tab should do for what's been typed so far
 * @param {String} command everything typed at the prompt
 * @param {Array} commandNames the names of all the commands
 * @returns `{before, matches}` to cycle through, `{list}` to print, or null to do nothing
 */
function complete(command, commandNames) {
    if (command.trim() === "") {
        return null;
    }

    // No space yet, so we're still typing the command name
    const space = command.lastIndexOf(" ");
    if (space === -1) {
        return matchesFor(command, "", commandNames);
    }

    const word = command.slice(space + 1);
    const slash = word.lastIndexOf("/");
    const dir = fs.resolve(word.slice(0, slash + 1));
    const partial = word.slice(slash + 1);
    if (!(dir instanceof Directory)) {
        return null;
    }

    // cd only cares about directories
    const onlyDirs = command.trim().split(/\s+/)[0] === "cd";
    const items = dir.list().filter((item) => !onlyDirs || item instanceof Directory);

    if (partial === "") {
        return (items.length > 0) ? { list: items } : null;
    }
    const names = items.map((item) => (item instanceof Directory) ? item.name + "/" : item.name);
    return matchesFor(partial, command.slice(0, command.length - partial.length), names);
}

/**
 * @returns `{before, matches}` with every candidate starting with partial (ignoring case), or null if there are none
 */
function matchesFor(partial, before, candidates) {
    const matches = candidates
        .filter((name) => name.toLowerCase().startsWith(partial.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));
    return (matches.length > 0) ? { before, matches } : null;
}

// What the last Tab completed to, so pressing Tab again cycles to the next match
let tabState = null;

function onTab() {
    const command = term.get_command();

    if (tabState !== null && command === tabState.text) {
        tabState.index = (tabState.index + 1) % tabState.matches.length;
    } else {
        tabState = null;
        const result = complete(command, Object.keys(commands));
        if (result === null) {
            return false;
        }
        if (result.list) {
            term.echo(colorcodeFS(result.list));
            return false;
        }
        tabState = { ...result, index: 0 };
    }

    tabState.text = tabState.before + tabState.matches[tabState.index];
    term.set_command(tabState.text);

    // With only one match there's nothing to cycle, so the next Tab starts fresh
    // (e.g. `cd Exp` -> `cd Experience/`, then Tab again lists what's inside)
    if (tabState.matches.length === 1) {
        tabState = null;
    }
    return false;
}


/**
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * Spotify
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

// The Netlify function (netlify/functions/spotify.mjs), using the full url so it also works when index.html is opened from disk
const SPOTIFY_API = "https://tominekan.netlify.app/.netlify/functions/spotify";
const SPOTIFY_RANGES = { month: "short_term", "6months": "medium_term", alltime: "long_term" };
const RANGE_LABELS = { short_term: "last 4 weeks", medium_term: "last 6 months", long_term: "all time" };

// Album art is ART_SIZE x ART_SIZE pixels, and each line of text fits two rows of them
const ART_SIZE = 16;

/** Song names can have brackets in them, which would mess up the terminal formatting */
const escapeBrackets = (text) => $.terminal.escape_brackets(text);

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function timeAgo(date) {
    const minutes = Math.floor((Date.now() - new Date(date)) / 60000);
    if (minutes < 60) {
        return `${minutes} min ago`;
    }
    if (minutes < 60 * 24) {
        return `${Math.floor(minutes / 60)} hr ago`;
    }
    return `${Math.floor(minutes / (60 * 24))} days ago`;
}

function progressBar(progressMs, durationMs, width=24) {
    const filled = Math.min(Math.round(progressMs / durationMs * width), width);
    const bar = toColor("━".repeat(filled), colors.green, "") + "●" + "─".repeat(width - filled);
    return `${bar}  ${formatTime(progressMs)} / ${formatTime(durationMs)}`;
}

/**
 * Draws the album cover with colored half-block characters (▀), where the text color is the top
 * pixel and the background color is the bottom one
 * @returns a promise of an array of lines, or null if the image couldn't load
 */
function albumArt(url) {
    return new Promise((resolve) => {
        if (!url) {
            resolve(null);
            return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onerror = () => resolve(null);
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = ART_SIZE;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, ART_SIZE, ART_SIZE);
            const pixels = ctx.getImageData(0, 0, ART_SIZE, ART_SIZE).data;
            const hex = (x, y) => {
                const i = (y * ART_SIZE + x) * 4;
                return "#" + [pixels[i], pixels[i + 1], pixels[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("");
            };

            const lines = [];
            for (let y = 0; y < ART_SIZE; y += 2) {
                let line = "";
                for (let x = 0; x < ART_SIZE; x++) {
                    line += `[[;${hex(x, y)};${hex(x, y + 1)}]▀]`;
                }
                lines.push(line);
            }
            resolve(lines);
        };
        img.src = url;
    });
}

async function renderNowPlaying(now) {
    let status = toColor("♫ NOW PLAYING", colors.green);
    let footer = progressBar(now.progressMs, now.durationMs);
    if (now.playedAt) {
        status = toColor("♫ LAST PLAYED", colors.purple);
        footer = timeAgo(now.playedAt);
    } else if (!now.isPlaying) {
        status = toColor("❚❚ PAUSED", colors.purple);
    }

    const info = ["", status, toColor(escapeBrackets(now.name), colors.pink), escapeBrackets(now.artists), "", footer];
    const art = await albumArt(now.image);
    if (art === null) {
        return info.join("\n");
    }
    return art.map((line, i) => `${line}   ${info[i] ?? ""}`).join("\n");
}

function renderTopTracks(tracks, range) {
    const lines = tracks.map((track, i) => `${i + 1}. ${escapeBrackets(track.name)} ${toColor("— " + escapeBrackets(track.artists), colors.purple, "")}`);
    return `${toColor(`TOP TRACKS (${RANGE_LABELS[range]}):`, colors.pink, "bu")}\n${lines.join("\n")}`;
}

function showSpotify2023() {
    term.echo(`\n[[bu;${colors.pink};]2023 TOP 5 ARTISTS:]`);
    term.echo("1. Playboi Carti\n2. Pop Smoke\n3. POLO PERKS <3 <3 <3\n4. Homixide Gang\n5. Yeat");
    term.echo(`\n[[bu;${colors.pink};]2023 TOP 5 SONGS:]`);
    term.echo("1. Notice It (Homixide Gang)\n2. YA DIG (Menacelations)\n3. \"Who Killed Kenny (Evil Giane, Tommytohotty)\" (POLO PERKS <3 <3 <3)\n4. \"SomethingThatMatters (GonerProd)\" (POLO PERKS <3 <3 <3)\n5. \"i91 (SkrappDollaz)\" (POLO PERKS <3 <3 <3)\n");
}

async function showSpotify(range) {
    let data;
    try {
        const res = await fetch(`${SPOTIFY_API}?range=${range}`);
        data = await res.json();
        if (!res.ok) {
            throw new Error(data.error);
        }
    } catch {
        term.echo(toColor("spotify: couldn't reach spotify right now, here's 2023 instead", colors.red));
        showSpotify2023();
        return;
    }

    if (data.now) {
        term.echo(await renderNowPlaying(data.now));
    }
    term.echo("\n" + renderTopTracks(data.top, data.range) + "\n");
}

const commands = {
    help: function() {
        this.echo("This is my attempt at recreating my personal website as a terminal. This only has the basic terminal features though.");
        this.echo("Use it like you would any unix command line. Try `ls`, then `cd Experience`.");
        this.echo("\nBasic Unix Commands:");
        this.echo("    cat -- Outputs the content of a file");
        this.echo("    cd -- Changes the current directory of the terminal");
        this.echo("    pwd -- Returns the directory the user is currently in");
        this.echo("    ls -- Lists all the items in the directory");
        this.echo("    open -- Opens the file, slightly different from cat");
        this.echo("    mkdir -- Create a new directory");
        this.echo("    touch -- Creates an empty file lol");
        this.echo("    rm -- Removes a file or directory");
        this.echo("\nOther Commands:");
        this.echo("    spotify -- What I'm listening to + my top tracks (try month, 6months, alltime, or 2023)\n");
    },

    ls: withArgs(function(paths) {
        if (paths.length === 0) {
            paths = [undefined];
        }
        for (const path of paths) {
            const items = fs.ls(path);
            if (items === null) {
                continue;
            }
            if (paths.length > 1) {
                this.echo(`${path}:`);
            }
            this.echo(colorcodeFS(items));
        }
    }),

    cd: function(path) {
        fs.cd(path === undefined ? undefined : String(path));
        updatePrompt();
    },

    pwd: function() {
        this.echo(fs.pwd());
    },

    cat: withArgs(function(paths) {
        for (const path of paths) {
            const file = fs.readFile(path, "cat");
            if (file !== null) {
                this.echo(render(file.data));
            }
        }
    }),

    open: withArgs(function(paths) {
        if (paths.length === 0) {
            this.echo(toColor("open: no arguments provided", colors.red));
        }
        for (const path of paths) {
            const file = fs.readFile(path, "open");
            if (file === null) {
                continue;
            }
            if (file.data.kind === "link") {
                window.open(file.data.url);
            } else {
                this.echo(render(file.data));
            }
        }
    }),

    mkdir: withArgs((paths) => fs.mkdir(paths)),

    rm: withArgs(function(paths) {
        fs.rm(paths);
        updatePrompt();
    }),

    touch: withArgs((paths) => fs.touch(paths)),

    // Returning the promise makes the terminal wait (and block input) until spotify answers
    spotify: withArgs(function(args) {
        const option = args[0];
        if (option === "2023") {
            showSpotify2023();
            return;
        }
        if (option !== undefined && !(option in SPOTIFY_RANGES)) {
            this.echo(toColor(`spotify: unknown option ${option}, try month, 6months, alltime, or 2023`, colors.red));
            return;
        }
        return showSpotify(SPOTIFY_RANGES[option ?? "month"]);
    })

};

// Actual Terminal
let term = $('body').terminal(commands, {
    checkArity: false,
    keymap: { TAB: onTab },
    greetings: greetings.innerHTML,
});

updatePrompt();
fs.setErrorFunc((error) => {term.echo(toColor(error, colors.red))});
