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
 * @param {String} text the text we want to change
 * @param {String} color the color we want to change it to
 * @returns the text changed to a specific color 
 */
function toColor(text, color) {
    return `[[b;${color};]${text}]`
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

    /**
     * Sets the function to handle errors
     * @param {Function} errFunc a function that must take in a string argument
     */
    setErrorFunc(errFunc) {
        this.errorFunc = errFunc;
    }

    /**
     * Returns a Directory or file from the path specified
     * @param {String} path the path to handle 
     * @param {String} funcName name of the function that's colling this method
     * @returns the directroy or File from path
     */
    #getFromPath(path, funcName) {
        // If the path is empty, then we know that we're referring to the root directory
        if ((path === "") || (path === "~")) {
            return this.root;
        }

        let tempCwd = this.cwd;
        let pathSplit = path.trim().split("/");
        // Remove all empty elements from the list
        pathSplit = pathSplit.filter((elem) => elem !== "")
        if (path.startsWith("/")) {
            tempCwd = this.root;
        }

        // So start backtracking
        for (const dirname of pathSplit) {
            // Start tracking back
            let pathSet = new Set(dirname);
            // Then we know that this path consists dots only
            if (dirname.startsWith(".") && (pathSet.size === 1)) {
                for (let i = 1; i < dirname.length; i++) {
                    if (tempCwd != this.root) {
                        tempCwd = tempCwd.getParentDir();
                    }
                }
            } else {
                // Otherwise try to find the directory
                if (!tempCwd.contains(dirname) && (dirname !== "")) {
                    this.errorFunc(`${funcName}: no such file or directory: ${path}`);
                    return -1; // exit da program early
                }
                tempCwd = tempCwd.get(dirname);
            }
        }
        
        return tempCwd;
    }

    /**.
     * @param {*} path the path to the file/Directory we're talking about
     * @returns an object with a `parent` key, a string representing the path to the parent,
     * and the `child` key, which is the child item, File or Directory.
     */
    #getParentDir(path) {
        let splitPath = path.split("/");
        let item = splitPath.pop();
        let parent = splitPath.join("/");

        return {
            "parent": parent,
            "child": item
        };
    }

    /**
     * Adds a list of all those directories
     * @param {Array} directories all the new directories we need to create
     */
    mkdir(directories) {
        for (const item of directories) {
            let parentChild = {
                "parent": this.pwd(),
                "child": item
            };
            // Grab the parent folder from the specified path 
            if (item.includes("/")) {
                parentChild = this.#getParentDir(item);
            }

            let tempCwd = this.#getFromPath(parentChild["parent"], "mkdir");
            if (tempCwd !== -1) {
                if (tempCwd.contains(parentChild["child"])) {
                    this.errorFunc(`mkdir: ${item}: File exists`);
                    return -1;
                }

                if (tempCwd.type() === "file") {
                    this.errorFunc(`mkdir: ${item}: not a directory`);
                    return -1;
                }

                let newDir = new Directory(parentChild["child"], tempCwd);
                tempCwd.add(newDir);
            }
        }
    }

    /**
     * Displays a list of contents
     * @param {*} directories the list of directories to view
     * @param {*} displayFunction the function to display contents of the directory
     * it should be able to handle both Arrays and Strings.
     */
    ls(directories, displayFunction) {
        if (directories.length == 0) {
            displayFunction(this.cwd.getContents());
            return 0;
        }
        for (const item of directories) {
            let dir = this.#getFromPath(item, "ls");
            displayFunction(`${item}:`);
            displayFunction(dir.getContents());
        }
    }

    /**
     * Act's akin to rm -rfv items
     * @param {Array} items the items to remove  
     */
    rm(items) {
        for (const item of items) {
            let itemObject = this.#getFromPath(item, 'rm');
            if (itemObject !== -1) {
                itemObject.parent.remove(itemObject.getName());
            }
        }
    }

    /**
     * Change the current working directory to whatever path is
     * @param {String} path the path of the file
     */
    cd(path) {
        if (path === undefined) {
            this.cwd = this.root;
        } else {
            let newCwd = this.#getFromPath(path, "cd");
            if (newCwd != -1) {
                if (newCwd.type() === "file") {
                    this.errorFunc(`cd: not a directory: ${item}`);
                    return -1;
                }
                this.cwd = newCwd;
            }

        }
    }

    /**
     * @returns a string representation of the current working directory
     */
    pwd() {
        let filePath = "";
        let tempCwd = this.cwd;

        // Backtrack to add it all back up
        while (tempCwd != this.root) {
            filePath += "/" + tempCwd.getName();
            tempCwd = tempCwd.getParentDir();
        }

        return filePath;
    }

    /**
     * Creates an empty file if the file does not exist
     * @param {Array} filenames a list of all the files to add
     */
    touch(filenames) {
        for (const file of filenames) {
            let info = {
                "parent": this.pwd(),
                "child": file
            };

            if (file.includes("/")) {
                info = this.#getParentDir(file);
            }

            let tempCwd = this.#getFromPath(info["parent"], "touch");
            if (!tempCwd.contains(info["child"])) {
                tempCwd.add(info["child"], "file");
            }
        }
    }


    /**
     * Opens a file using the default method for the file
     * @param {String} filename the name of the file we want to open
     */
    open(filename) {
        if (filename.length === 0) {
            this.errorFunc(`open: no arguments provided`);
            return -1;
        }

        for (const file of filename) {
            let info = {
                "parent": this.pwd(),
                "child": file
            };

            if (file.includes("/")) {
                info = this.#getParentDir(file);
            }
            let tempCwd = this.#getFromPath(info["parent"], "open");
            if (tempCwd != -1) {
                if (!tempCwd.contains(info["child"]) || (tempCwd.type() === "file")) {
                    this.errorFunc(`open: ${file}: file does not exist`);
                    return -1;
                }

                tempCwd.openFile(info["child"]);
            }
        }


    }

    /**
     * Opens a file using a specified method
     * @param {*} filename the path to the file we want to open
     * @param {*} func the function to open the file
     */
    customOpen(filename, func, funcName="customOpen") {
        if (filename.length === 0) {
            this.errorFunc(`${funcName}: no arguments provided`);
            return -1;
        }

        for (const file of filename) {
            let info = {
                "parent": this.pwd(),
                "child": file
            };

            if (file.includes("/")) {
                info = this.#getParentDir(file);
            }

            let tempCwd = this.#getFromPath(info["parent"], funcName);
            if (tempCwd != -1) {
                if (!tempCwd.contains(info["child"]) || (tempCwd.type() === "file")) {
                    this.errorFunc(`${funcName}: ${file}: file does not exist`);
                    return -1;
                }

                tempCwd.get(info["child"]).customOpen(func);
            }
        }

    }

    /**
     * The creates a new file within the cwd
     * @param {} filename name of the file
     * @param {*} content the content of the file
     * @param {*} opener the method to open the file
     */
    createFile(filename, content, opener=null) {
        let info = this.#getParentDir(filename);
        let tempCwd = this.#getFromPath(info["parent"], "createFile");
        if (tempCwd != -1) {
            if (tempCwd.type() == "file") {
                this.errorFunc(`createFile: ${filename}: not a directory`)
                return -1;
            }
            tempCwd.createFile(info["child"], content, opener);
        }
    }
}

/**
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * File Class
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

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
        return this.fname;
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
     * @returns the type of object this is, 
     */
    type() {
        return "file";
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

    /**
     * @returns the name of the file
     */
    getContents() {
        return this.fname;
    }
}

/**
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * Directory Class
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

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
     * @returns the type of object this is
     */
    type() {
        return "directory";
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
            if (type === "dir") {
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


/**
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * Actual Terminal
 * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

let openInNewWindow = (item) => window.open(item);

// In Projects Directory
let fs = new FileSystem();
fs.mkdir(["Projects", "About", "Contact"]);


function colorcodeFS(items) {
    newItems = [];
    for (const item of items) {
        if (item.type() === "directory") {
            newItems.push(toColor(item.getName(), colors.purple));
        } else {
            newItems.push(item.getName());
        }
    }

    return newItems;
}

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
        this.echo("    open -- Opens the file, slightly different from cat\n");
        this.echo("    mkdir -- Create a new directory");
        this.echo("    touch -- Creates an empty file lol");
    },

    ls: function(...input) {
        // input = Array.from(input);
        modified = input.map(String);
        modified = Array.from(modified);
        fs.ls(modified, (items) => {
            if (typeof items === "string") {
                this.echo(items)
            } else {
                this.echo(colorcodeFS(items))
            }
        });
    },

    cd: function(input) { // Change directory function
        fs.cd(input);
        term.set_prompt(`[[;${colors.green};]tomster@localhost] [[b;${colors.cyan};]${fs.pwd()}] `);
    },

    pwd: function() {
        this.echo(fs.pwd());
    },

    cat: function(...input) {
        modified = input.map(String);
        modified = Array.from(modified);
        fs.customOpen(modified, term.echo, "cat");
    },

    open: function(...input) {
        modified = input.map(String);
        modified = Array.from(modified);
        fs.open(modified)
    },

    mkdir: function(...input) {
        modified = input.map(String);
        modified = Array.from(modified);
        fs.mkdir(modified);
    },

    rm: function(...input) {
        modified = input.map(String);
        modified = Array.from(modified);
        fs.rm(modified);
    },

    touch: function(...input) {
        modified = input.map(String);
        modified = Array.from(modified);
        fs.touch(modified);
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

term.set_prompt(`[[;${colors.green};]tomster@localhost] [[b;${colors.cyan};]${fs.pwd()}] `);
fs.setErrorFunc((error) => {term.echo(toColor(error, colors.red))});

fs.createFile(
    "Contact/contactinfo.txt",
     `\nEmail: tominekan12@gmail.com
Github: https://github.com/tominekan
Linkedin: https://www.linkedin.com/in/oluwatomisin-adenekan-50b207247/`,
term.echo
);

fs.createFile(
    "Projects/Tetris1200.java",
    `[[bu;${colors.pink};] TETRIS1200:] 
[[i;${colors.purple};]INFO:]: This is a Tetris game built with Java and Swing UI. Tetris1200 features a retro UI, multiple game modes, game saves, and more.`,
term.echo
);

fs.createFile(
    "Projects/pycomplete.py",
    `[[bu;${colors.pink};] PYCOMPLETE:] 
[[i;${colors.purple};]INFO:]: I put together some stuff I learned about Markov Chains and implemented my own Markov-chain based autocomplete library.
I then implemented the frontend with React`,
term.echo
);

// Projects Directory
fs.createFile(
    "Projects/designs.sketch",
     `[[bu;${colors.pink};]PERSONAL DESIGNS:]
These are a collection of .sketch files of websites I've made. You can check them out on my github. https://github.com/tominekan`,
term.echo
);

fs.createFile(
    "Projects/klarg.py",
    `[[bu;${colors.pink};]Kommand Line ARgument Parser:]
[[i;${colors.purple};]INFO:] This is a python library (with an incredibly goofy name).
It's is an incredibly easy to use command line argument parsing script using zero external libraries and a less-than 25kB file size.`,
term.echo
);

fs.createFile(
    "Projects/musingsv2.py",
    `[[bu;${colors.pink};]Musings, my blog:]
[[i;${colors.purple};]INFO:] This is a blog I designed in Lunacy and developed with Django and Bootstrap.
It's a repository for my writings about the stuff I'm currently thinking about. I have a few more ideas to make it better as time goes on.`,
term.echo
);

fs.createFile(
    "Projects/wave.cpp",
    `[[bu;${colors.pink};]Wave:]
[[i;${colors.purple};]INFO:]  It's a C++ based commmand line tool to edit the audio file metadata. It lets you edit the common properties like album cover art,
artist name, song genre, and more. I created this so that I don't have to open apple music every time I want to change the metadata of songs I download, which is 
somethign I do pretty frequently.
`
)

// About Directory
fs.createFile(
    "About/whoiam.txt",
    `I'm Tomi Adenekan, a college sophomore interested in coding, data analytics, and philosophy.
Ever since moving to the U.S. from Nigeria in 2016, I taught myself how to use computers through small hands on projects. 
I love cooking, working out, coding, watching anime, and talking about philosophy with friends.
I work with schools throughout Philadelphia to teach Scratch and Python through the UPenn-Fife CS Academy, and I tutor math through Penn's Weingarten Center.

I'm currently working towards a BSE in Computer Science and a minor in Philosophy at the University of Pennsylvania (might even tack on a masters in data science too).`,
term.echo
);


fs.createFile(
    "About/resume.pdf",
    "resume.pdf",
    openInNewWindow
);