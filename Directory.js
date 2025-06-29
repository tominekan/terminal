export class Directory {
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
     * Gets the `Directory` object associated with `directory_name`
     * @param {String} directory_name the name of the directory
     * @returns a Directory object 
     */
    getDir(directory_name) {
        return this.contents[directory_name]
    }

}