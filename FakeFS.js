class FakeFS extends Directory {
    /**
     * Ultimately FakeFS is just a directory (root directory)
     * with extra functions for processing stuff
     * This creates a /Users/username user directory
     * @param {*} username name of current user
     */

    constructor(username) {
        this.fs = 
        [{
            Users: [
                {username: [""]},
            ]
        }]
    }
}