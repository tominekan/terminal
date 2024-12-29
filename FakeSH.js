class FakeSH extends Directory {
    /**
     * Ultimately FakeFS is just a directory (root directory)
     * with extra functions for processing stuff
     * This creates a /Users/username user directory
     * @param {*} username name of current user
     */

    constructor(username) {
        // We consider this the root directory
        super("");
        // Add the Users/username/home directory
        this.homeDir = new Directory("home");
        this.userDir = new Directory(username);
        this.cwd = this.homeDir + this.userDir;
        // Add the user directory to the home directory
        this.homeDir.addContent(this.userDir);
        this.addContent(this.homeDir);
    }

    /**
     * Adds a reot directory (or file) to current file system
     * @param {Directory, SingleFile} otherDir 
     */
    addToRoot(otherDir) {
        if ((otherDir instanceof Directory) || (otherDir instanceof SingleFile)) {
            super.addContent(otherDir);
        }
    }

    /**
     * Adds a new directory (or file) to the home directory
     * @param {Directcory, SingleFile} otherDir 
     */
    addDirectoryToHome(otherDir) {
        if ((otherDir instanceof Directory) || (otherDir instanceof SingleFile)) {
            this.homeDir.addContent(otherDir)
        }
    }
}