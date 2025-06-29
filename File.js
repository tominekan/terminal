export class File {
    /**
     * Constructs a new File node, I might need to make this more robust later, to handle links and stuff
     * @param {*} fname the name of the file
     * @param {*} content the content of the file
     * @param {*} parent_dir the name of the parent directory
     */
    constructor(fname, content, parent_dir) {
        this.fname = fname;
        this.content = content;
        this.parent = parent_dir;
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
}