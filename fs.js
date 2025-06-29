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
     * Adds a list of all those directories
     * @param {Array} directories all the new directories we need to create
     */
    mkdir(directories) {
        for (const item in directories) {
            // If it exists then do something about it, otherwise, add it
            if (this.cwd.contains(item)) {
                this.errorFunc(`mkdir: ${item}: File exists`);
            }


            newDir = new Directory(item, this.cwd);
            this.cwd.add(newDir);
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
        let newCwd = this.cwd;

        // If the path starts with /, then start looking from the root directory
        if (path.startsWith("/")) {
            newCwd = this.root;
        }

        // Start tracking back
        for (const folder in dirs) {
            let folderSet = new Set(folder);
            // Then we know that this path consists dots only
            // So start backtracking
            if (folder.startsWith(".") && (folderSet.size == 1)) {
                for (let i = 1; i < folder.length; i++) {
                    if (this.newCwd != this.root) {
                        newCwd = this.newCwd.getParentDir();
                    }
                }
            } else {
                // Otherwise try to find the directory
                if (!this.newCwd.contains(folder)) {
                    this.errorFunc(`cd: no such file or directory: ${path}`);
                    return; // exit da program early
                }
                newCwd = this.newCwd.getDir(folder);
            }
        }
        
        this.cwd = newCwd;
    }

    /**
     * @returns the current working diectory
     */
    pwd() {
        return this.cwd;
    }

    /**
     * Creates an empty file if the file does not exist
     * @param {Array} filenames a list of all the files to add
     */
    touch(filenames) {
        for (const file in filenames) {
            if (!this.cwd.contains(file)) {
                this.cwd.add(file, type="file");
            }
        }
    }


}