class Directory {
    /**
     * Construct a new, empty Directory
     * @param {*} directoryName 
     */
    constructor(directoryName) {
        this.name = directoryName;
        this.contents = [];
    }
    
    /**
     * Removes a single file from the directory
     * if it doesn't exist, then we do nothing
     * @param {*} singleItem 
     */
    removeItem(singleItem) {
        let index = this.contents.indexOf(singleItem);
        if (index != -1) {
            this.contents.splice(index, 1);
        }

    }

    /**
     * Adds either a single file or a sub-directory
     * to a directory
     * @param {Directory, SingleFile} content 
     */
    addContent(content) {
        this.contents.push(content);
    }

    /**
     * This method returns a list containing all the items in the directory
     * It should return a shallow copy of this item for security, but i got lazy lol
     * @returns A list containing all items in the directory
     */
    getContents() {
        return this.contents;
    }

    /**
     * Checks if the other item is a directory
     * @param {*} otherContent can be any object techincally
     * One invariant of the file system is that every item must either be a SingleFile or Directory 
     * @returns boolean  
     */
    isDirectory(otherContent) {
        return (otherContent instanceof Directory);
    }

    /**
     * @returns the name of the directory
     */
    getName() {
        return this.name;
    }

    /**
     * Opens up a specific file that matches the name of the specific file
     * we are targeting, returns -1 if the file does not exist. Returns true otherwise
     * @param {String} otherFile 
     */
    openFile(otherFile) {
        for (let index = 0; index < this.contents.length; index++) {
            // If the current index is a single file, compare the file names
            if (this.contents[index] instanceof SingleFile) {
                if (this.contents[index].getName() === otherFile) {
                    this.contents[index].open();
                }
            }
        }
        return -1;
    }

    /**
     * Checks if the name of a file (or directory) exists within a given directory
     * @returns true if the item is inside the directory, false otherwise.
     */
    inDirectory(otherItem) {
        for (let index = 0; index < this.contents.length; index++) {
            if (this.contents[index].getName() === otherItem) {
                return true;
            }
        }

        return false;
    }

}