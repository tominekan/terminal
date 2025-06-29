
export class File {
    /**
     * Constructs a new File node, I might need to make this more robust later, to handle links and stuff
     * @param {String} fname the name of the file
     * @param {*} content the content of the file
     * @param {Directory} parent_dir the name of the parent directory
     */
    constructor(fname, content, parent_dir) {
        this.fname = fname;
        this.content = content;
        this.parent = parent_dir;
        this.opener = null;
    }

    /**
     * Constructs a new File node, I might need to make this more robust later, to handle links and stuff
     * @param {String} fname the name of the file
     * @param {*} content the content of the file
     * @param {Directory} parent_dir the name of the parent directory
     * @param {Function} opener a function to open the file, it must take in a single argument, the content
     */
    constructor(fname, content, parent_dir, opener) {
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