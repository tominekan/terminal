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
     * @returns boolean that is true 
     */
    isDirectory(otherContent) {
        return (otherContent instanceof Directory);
    }
}