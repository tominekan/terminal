class SingleFile {
    /**
     * This is our representaiton of a single file
     * @param {*} name is the name of the file
     * @param {*} content  is the contnet of the file
     */
    constructor(name, content) {
        this.fileName = name;
        this.fileContent = content;
        this.displayFunc = null;
    }


    /**
     * Sets a function to display the contents of the file
     * @param {*} displayFunction must be a function that takes in
     * a SINGLE argument (the content of the file),
     */
    setOpener(displayFunction) {
        this.displayFunc - displayFunction;
    }


    /**
     * This displays the content of the file
     * according to the specifications of the displayFunction
     * set in setOpenener. If this.displayFunc is null,
     * then do nothing lol
     */
    open() {
        if (this.displayFunc !== null) {
            this.displayFunc(this.fileContent);
        }
    }
}