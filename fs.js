/**
 * Tools that can allow us to emulate the Linux file system.
 */
import { File } from "./File.js";
import { Directory } from "./directory";

export class FileSystem {
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
     * Returns a Directory object from the path
     * @param {String} path the path to handle 
     * @param {String} funcName name of the function for error calls
     * @returns a Directory object
     */
    #getDirectoryFromPath(path, funcName) {
        let tempCwd = this.cwd;
        if (path.startsWith("/")) {
            tempCwd = this.root;
        }

        // Start tracking back
        let pathSet = new Set(path);
        // Then we know that this path consists dots only
        // So start backtracking
        if (path.startsWith(".") && (pathSet.size == 1)) {
            for (let i = 1; i < folder.length; i++) {
                if (this.tempCwd != this.root) {
                    tempCwd = this.tempCwd.getParentDir();
                }
            }
        } else {
            // Otherwise try to find the directory
            if (!this.tempCwd.contains(folder)) {
                this.errorFunc(`${funcName}: no such file or directory: ${path}`);
                return; // exit da program early
            }
            tempCwd = this.tempCwd.getDir(folder);
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
            let tempCwd = this.#getDirectoryFromPath(item)
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
        let newCwd = this.#getDirectoryFromPath(path);
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
            let tempCwd = this.#getDirectoryFromPath(info["path"]);
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
        let tempCwd = this.#getDirectoryFromPath(info["path"]);
        if (!tempCwd.contains(info["file"])) {
            this.errorFunc(`open: ${filename}: file does not exist`);
            return;
        }

        tempCwd.openFile(filename);
    }

    /**
     * The creates a new file within the cwd
     * @param {*} filename name of the file
     * @param {*} content the content of the file
     * @param {*} opener the method to open the file
     */
    createFile(filename, content, opener) {
        let info = this.#splitFileNameFromPath(filename);
        let tempCwd = this.#getDirectoryFromPath(info["path"]);
        tempCwd.createFile(info["file"], content, opener);
    }
}