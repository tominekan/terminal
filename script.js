/**
 * script.js
 *  Rework of the fake terminal to be more extensible. Will probably uadd more updates the more I learn about CS.
 *  
 * 
 * This is the Project Structure:
 * 
 * Root:
 * |- Projects
 *    |- Tetris1200.java
 *    |- designs.sketch
 *    |- klarg.py
 *    |- musingsv2.py
 * |- Contact
 *    |- contactinfo.txt
 *    |- resume.pdf
 * |- About
 *    |- whoiam.txt
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
 * Tools that can allow us to emulate the Linux file system.
 */

class FileSystem {
    /**
     * Create a new filesystem with a root directory. This doesn't support some more advanced features like regex. 
     * @param {Function} onError a function to handle errors, it should take in one argument, the error message to handle.
     */
    constructor(onError) {
        this.root = new Directory("~", null);
        this.cwd = this.root;
        this.errorFunc = onError;
    }

    /**
     * Returns a Directory or file from the path specified
     * @param {String} path the path to handle 
     * @param {String} funcName name of the function that's colling this method
     * @returns the directroy or File from path
     */
    #getFromPath(path, funcName) {
        let tempCwd = this.cwd;
        let pathSplit = path.split("/");
        if (path.startsWith("/")) {
            tempCwd = this.root;
        }

        // So start backtracking
        for (const dirname in pathSplit) {
            // Start tracking back
            let pathSet = new Set(dirname);
            // Then we know that this path consists dots only
            if (dirname.startsWith(".") && (pathSet.size == 1)) {
                for (let i = 1; i < folder.length; i++) {
                    if (this.tempCwd != this.root) {
                        tempCwd = this.tempCwd.getParentDir();
                    }
                }
            } else {
                // Otherwise try to find the directory
                if (!this.tempCwd.contains(dirname)) {
                    this.errorFunc(`${funcName}: no such file or directory: ${path}`);
                    return; // exit da program early
                }
                tempCwd = this.tempCwd.get(dirname);
            }
        }
        
        return tempCwd;
    }

    /**
     * NOTE: it's pretty important that the path leads to an actual file.
     * @param {*} path the path to the file we're talking about
     * @returns an object with a `path` key, a string representing the actual path,
     * and the `file` key, which is the actual filename.
     */
    #splitFileNameFromPath(path) {
        let splitPath = path.split("/");
        let fileName = splitPath.pop();
        let actualPath = splitPath.join("/");

        return {
            "path": actualPath,
            "file": fileName
        };
    }

    /**
     * Adds a list of all those directories
     * @param {Array} directories all the new directories we need to create
     */
    mkdir(directories) {
        for (const item in directories) {
            // If it exists then do something about it, otherwise, add it
            let tempCwd = this.#getFromPath(item)
            if (tempCwd.contains(item)) {
                this.errorFunc(`mkdir: ${item}: File exists`);
                return;
            }


            newDir = new Directory(item, tempCwd);
            tempCwd.add(newDir);
        }
    }

    /**
     * Act's akin to rm -rfv items
     * @param {Array} items the items to remove  
     */
    rm(items) {
        for (const item in items) {
            if (!this.cwd.contains(item)) {
                this.errorFunc(`rm: ${item}: No such file or directory`);
                return;
            }

            this.cwd.remove(item);
        }
    }

    /**
     * Change the current working directory to whatever path is
     * @param {String} path the path of the file
     */
    cd(path) {
        let dirs = path.split("/");
        let newCwd = this.#getFromPath(path);
        this.cwd = newCwd;
    }

    /**
     * @returns a string representation of the current working directory
     */
    pwd() {
        let filePath = "";
        let tempCwd = this.cwd;

        // Backtrack to add it all back up
        while (tempCwd != this.root) {
            filePath += "/" + this.tempCwd.getName();
            tempCwd = tempCwd.parent();
        }

        return filePath;
    }

    /**
     * Creates an empty file if the file does not exist
     * @param {Array} filenames a list of all the files to add
     */
    touch(filenames) {
        for (const file in filenames) {
            let info = this.#splitFileNameFromPath(file);
            let tempCwd = this.#getFromPath(info["path"]);
            if (!tempCwd.contains(info["file"])) {
                tempCwd.add(info["file"], type="file");
            }
        }
    }


    /**
     * Opens a file using a predetermined method
     * @param {String} filename the name of the file we want to open
     */
    open(filename) {
        let info = this.#splitFileNameFromPath(filename);
        let tempCwd = this.#getFromPath(info["path"]);
        if (!tempCwd.contains(info["file"])) {
            this.errorFunc(`open: ${filename}: file does not exist`);
            return;
        }

        tempCwd.openFile(info["file"]);
    }

    customOpen(filename, func) {
        let info = this.#splitFileNameFromPath(filename);
        let tempCwd = this.#getFromPath(info["path"]);
        if (!tempCwd.contains(info["file"])) {
            this.errorFunc(`open: ${filename}: file does not exist`);
            return;
        }

        tempCwd.get(info["file"]).customOpen();
    }

    /**
     * The creates a new file within the cwd
     * @param {*} filename name of the file
     * @param {*} content the content of the file
     * @param {*} opener the method to open the file
     */
    createFile(filename, content, opener) {
        let info = this.#splitFileNameFromPath(filename);
        let tempCwd = this.#getFromPath(info["path"]);
        tempCwd.createFile(info["file"], content, opener);
    }
}


class File {
    /**
     * Constructs a new File node, I might need to make this more robust later, to handle links and stuff
     * @param {String} fname the name of the file
     * @param {*} content the content of the file
     * @param {Directory} parent_dir the name of the parent directory
     * @param {Function} opener a function to open the file, it must take in a single argument, the content. 
     * By default it has none
     */
    constructor(fname, content, parent_dir, opener=null) {
        this.fname = fname;
        this.content = content;
        this.parent = parent_dir;
        this.opener = opener;
    }

    /**
     * @returns the content of this file
     */
    getContent() {
        return this.content;
    }

    /**
     * @returns the parent directory of this file
     */
    getParentDir() {
        return this.parent;
    }

    /**
     * @returns the name of this file
     */
    getName() {
        return this.getName;
    }

    /**
     * Opens the file using the function specified in opener
     */
    open() {
        if (this.opener != null) {
            this.opener(this.content);
        }
    }

    /**
     * Sets the new opening function
     * @param {Function} newOpener the new function to open the contents of the file
     */
    setOpener(newOpener) {
        this.opener = newOpener;
    } 

    /**
     * Opens the file using a custom opener
     * @param {Function} customOpener the method to open the file
     */
    customOpen(customOpener) {
        customOpener(this.content);
    }
}

class Directory {
    /**
     * Constructs a new, empty Directory node.
     * @param {String} dirname the name of the directory
     * @param {Directory} parent_dir the parent directory
     */
    constructor(dirname, parent_dir) {
        this.dirname = dirname;
        this.parent = parent_dir;
        this.contents = {};
    }

    /**
     * @returns the contents of this directory
     */
    getContents() {
        return Object.values(this.contents);
    }

    /**
     * Adds a Directory or File to this directory
     * @param {String | File | Directory} content the object we want to add to this directory, 
     * @param {String} type the type of content to add, "dir" for directory, and "file" for file
     * if it's a string, then it creates an empty file with the specified name
     */
    add(item, type="dir") {
        if ((item instanceof Directory) || (item instanceof File)) {
            this.contents[item.getName()] = item;
        } else {
            // Otherwise initialize an empty file
            if (type == "dir") {
                this.contents[item] = new Directory(item, this);
            } else {
                this.contents[item] = new File(item, "", this);
            }
        }
    }
    /**
     * Removes an item, Directory or File, from this Directory
     * @param {String | File | Directory} item the item we want to remove
     */
    remove(item) {
        if ((item instanceof Directory) || (item instanceof File)) {
            delete this.contents[item.getName()]
        } else {
            // Otherwise it must be a string
            delete this.contents[item];
        }
    }

    /**
     * @returns the parent directory as a Directory object
     */
    getParentDir() {
        return this.parent;
    }

    /**
     * @returns the name of this directory
     */
    getName() {
        return this.dirname;
    }

    /**
     * Checks if an item, file or directory is in this directory
     * @param {String | Directory | File} name the name of the Directory or File. If the type of name is Directory/File, then we check 
     * if it's in the directory content. it also works for just file/folder names too.
     * @returns true if the item is in the directory, false otherwise
     */
    contains(name) {
        if ((name instanceof Directory) || (name instanceof File)) {
            return (name.getName() in this.contents);
        }
        return (name in this.contents);
    }

    /**
     * Gets the `Directory` or `File object associated with `directory_name`
     * @param {String} item_name the name of the file or directory
     * @returns a Directory object 
     */
    get(item_name) {
        return this.contents[item_name]
    }

    /**
     * Opens the file if it's in this directory
     * @param {String} filename the name of the file to open 
     */
    openFile(filename) {
        this.contents[filename].open()
    }

    /**
     * Creates a new file with a custom opening method
     * @param {*} filename the name of the file
     * @param {*} content the content of the file
     * @param {*} opener method to open the file
     */
    createFile(filename, content, opener) {
        this.contents[filename] = new File(filename, content, this, opener);
    } 

}


let fs = new FileSystem();
fs.mkdir(["Contact", "About", "Projects"]);
let openInNewWindow = (item) => window.open(item);
// In Contact Directory
let contactInfo = new SingleFile("contactinfo.txt", 
    `\nEmail: tominekan12@gmail.com
Github: https://github.com/tominekan
Linkedin: https://www.linkedin.com/in/oluwatomisin-adenekan-50b207247/`);
// Set the custom opener for the resume
let resume = new SingleFile("resume.pdf", "resume.pdf");
resume.setOpener(openInNewWindow);

// In Projects Directory
fs.mkdir("Projects");
fs.mkdir("About");
fs.mkdir("Contact");

fs.createFile(
    "Projects/Tetris1200.java",
    `\n[[bu;${colors.pink};] TETRIS1200:] 
[[i;${colors.purple};]INFO:]: This is a Tetris game built with Java and Swing UI. Tetris1200 features a retro UI, multiple game modes, game saves, and more.`,
    null
);

fs.createFile(
    "Projects/designs.sketch",
     `\n[[bu;${colors.pink};]PERSONAL DESIGNS:]
These are a collection of .sketch files of websites I've made. You can check them out on my github. https://github.com/tominekan`,
    null
);

fs.createFile(
    "Projects/klarg.py",
    `\n[[bu;${colors.pink};]Kommand Line ARgument Parser:]
[[i;${colors.purple};]INFO:] This is a python library (with an incredibly goofy name).
It's is an incredibly easy to use command line argument parsing script using zero external libraries and a less-than 25kB file size.`,
    null
)

fs.createFile(
    "Projects/musingsv2.py",
    `\n[[bu;${colors.pink};]Musings, my blog:]
[[i;${colors.purple};]INFO:] This is a blog I designed in Lunacy and developed with Django and Bootstrap.
It's a repository for my writings about the stuff I'm currently thinking about. I have a few more ideas to make it better as time goes on.`,
    null
)


// In About Directory
let whoiam = new SingleFile("whoiam.txt", 
    `\nI'm Tomi Adenekan, a college sophomore interested in coding, data analytics, and philosophy.
Ever since moving to the U.S. from Nigeria in 2016, I taught myself how to use computers through small hands on projects. 
I love cooking, working out, coding, watching anime, and talking about philosophy with friends.
I work with schools throughout Philadelphia to teach Scratch and Python through the UPenn-Fife CS Academy, and I tutor math through Penn's Weingarten Center.

I'm currently working towards a BSE in Computer Science and a minor in Philosophy at the University of Pennsylvania (might even tack on a masters in data science too).`);

// Actual Terminal
let term = $('body').terminal({
    help: function() {
        this.echo("This is my attempt at recreating my personal website as a terminal. This only has the basic terminal features though.");
        this.echo("Use it like you would any unix command line.");
        this.echo("\nBasic Unix Commands:");
        this.echo("    cat -- Outputs the content of a file")
        this.echo("    cd -- Changes the current directory of the terminal");
        this.echo("    cwd -- Returns the directory the user is currently in");
        this.echo("    ls -- Lists all the items in the directory");
        this.echo("    open -- Opens the file, in this website, it has the same effect as cat\n");
    },

    ls: function(input) {
        if (input) {
            input = input.toLowerCase();
        } 
        if (input === "about") {
            this.echo(siteStructure.about.content);
        } else if (input === "projects") {
            this.echo(siteStructure.projects.content);
        } else if (input === "contact") {
            this.echo(siteStructure.contact.content);
        } else if (input === "~") {
            this.echo(`[[b;${colors.cyan};]${foldersToString(siteStructure.home.content)}]`);
        } else { // If there is no argument attached to ls
            if (cwd === siteStructure.home) { // If the current working directory is the home directory, print it a different way
                this.echo(`[[b;${colors.cyan};]${foldersToString(siteStructure.home.content)}]`);
            } else {
                if (input) {
                    term.echo("")
                } else {
                    this.echo(cwd.content);
                }
            }

        }
    },

    cd: function(input) { // Change directory function
        fs.cd(input);
        term.set_prompt(`[[;${colors.green};]tomster@localhost] [[b;${colors.cyan};]${fs.pwd()}] `);
    },

    pwd: function() {
        this.echo(fs.pwd());
    },

    cat: function() {
        this.echo(fs.pwd());
    },

    open: function() {
        this.echo(fs.pwd());
    },

    spotify: function() {
        term.echo(`\n[[bu;${colors.pink};]2023 TOP 5 ARTISTS:]`);
        term.echo("1. Playboi Carti\n2. Pop Smoke\n3. POLO PERKS <3 <3 <3\n4. Homixide Gang\n5. Yeat");
        term.echo(`\n[[bu;${colors.pink};]2023 TOP 5 SONGS:]`);
        term.echo("1. Notice It (Homixide Gang)\n2. YA DIG (Menacelations)\n3. \"Who Killed Kenny (Evil Giane, Tommytohotty)\" (POLO PERKS <3 <3 <3)\n4. \"SomethingThatMatters (GonerProd)\" (POLO PERKS <3 <3 <3)\n5. \"i91 (SkrappDollaz)\" (POLO PERKS <3 <3 <3)\n");
    }

}, {
    checkArity: false,
    greetings: greetings.innerHTML,
});

term.set_prompt(`[[;${colors.green};]tomster@localhost] [[b;${colors.cyan};]${cwd.folderName}] `);