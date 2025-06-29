/**
 * script.js
 *  Rework of the fake terminal to be more dynamic.
 *  
 * As a little aside, across all .js files, 
 * 0 is returned when a function executes successfully,
 * otherwise, -1 is returned.
 * 
 * This is the Project Structure:
 * 
 * Root:
 * |- Projects
 *    |- Tetris1200.java
 *    |- designs.sketch
 *    |- klarg.py
 *    |- DataScience
 *        |- 2dlinreg.py
 *        |- kmeans.py
 * |- Contact
 *    |- contactinfo.txt
 *    |- resume.pdf
 * |- About
 *    |- whoiam.txt
 */

import { SingleFile } from "./singleFile";
import { Directory } from "./directory";

// Follows the Dracula color scheme
const colors = {
    red: "#ff5555",
    cyan: "#8be9fd",
    green: "#50FA7B",
    pink: "#FF79C6",
    purple: "#BD93F9"
};

// In Contact Directory
let contactInfo = new SingleFile("contactinfo.txt", 
    `\nEmail: tominekan12@gmail.com
Github: https://github.com/tominekan
Linkedin: https://www.linkedin.com/in/oluwatomisin-adenekan-50b207247/`);
// Set the custom opener for the resume
let resume = new SingleFile("resume.pdf", "resume.pdf");
resume.setOpener((item) => window.open(item));

// In Projects Directory
let tetris1200 = new SingleFile("Tetris1200.java", 
    `\n[[bu;${colors.pink};] TETRIS1200:] 
[[i;${colors.purple};]INFO:]: This is a Tetris game built with Java and Swing UI. Tetris1200 features a retro UI, multiple game modes, game saves, and more.`);

let designs = new SingleFile("designs.sketch", 
    `\n[[bu;${colors.pink};]PERSONAL DESIGNS:]
These are a collection of .sketch files of websites I've made. You can check them out on my github. https://github.com/tominekan`);

let klarg = new SingleFile("klarg.py", 
    `\n[[bu;${colors.pink};]Kommand Line ARgument Parser:]
[[i;${colors.purple};]INFO:] This is a python library (with an incredibly goofy name).
It's is an incredibly easy to use command line argument parsing script using zero external libraries and a less-than 25kB file size.`);

// Within Projects, we have DataScience Sub Directory
let twoDlinreg = new SingleFile("2dlinreg.py", 
    `\n[[bu;${colors.pink};]2D LINEAR REGRESSION:]
[[i;${colors.purple};]INFO:] This is a command line statistical analysis application. It implements all algorithms by hand (they aren't performance optimized tho).
It calculates and plots various statistics for a given dataset.`);

let kmeans = new SingleFile("kmeans.py", 
    `\n[[bu;${colors.pink};]K-MEANS CLASSIFICATION ALGORITHM:]
    [[i;${colors.purple};]INFO:] This is an hand-implementation of a machine learning algorithm.
    It takes in estimated centroids and applies the K-Means algorithms to return new centroids.`)

// In About Directory
let whoiam = new SingleFile("whoiam.txt", 
    `\nI'm Tomi Adenekan, a college freshman interested in coding, data analytics, and philosophy.
Ever since moving to the U.S. from Nigeria in 2016, I taught myself how to use computers through coding. 
I love cooking, working out, coding, and engaging in philosophical discussions with friends.
I work with schools throughout Philadelphia to teach Scratch and Python through the UPenn-Fife CS Academy.

I'm currently working towards a BSE in Computer Science and a minor in Philosophy at the University of Pennsylvania.`);


// In Projects Directory
let contact = new Directory("Contact");
contact.addContent(contactInfo);
contact.addContent(resume);

let about = new Directory("About");
about.addContent(whoiam);


let projects = new Directory("Projects");
projects.addContent(tetris1200);
projects.addContent(designs);
projects.addContent(klarg);

let datasci = new Directory("DataScience");
datasci.addContent(kmeans);
datasci.addContent(twoDlinreg);
projects.addContent(datasci);

// Create the home directory to add stuff
let rootDir = new Directory("root");
rootDir.addContent("About");
rootDir.addContent("Contact");
rootDir.addContent("Projects");

//let cwd = siteStructure.home;
// One invariant is that cwdString is an absolute path
let cwdString = "root";
let cwd = rootDir;

/**
 * This method works by starting at a specific directory, looping through
 * all the names in the pathTokens file recursively getting the directory.
 * @param { Directory } startCwd the starting directory (must be a Directory class)
 * @param { String[] } pathTokens the new directory split by "/"
 * @returns 0 if we successfully found and selected the current directory, -1 otherwise
 */
function getDir(startCwd, pathTokens) {
    let currentDir = startCwd;
    for (let index = 0; index < pathTokens.length; index++) {
        // Check if the directory even exists
        if (currentDir.inDirectory(pathTokens[index])) {
            currentDir = currentDir.getDirectory(pathTokens[index]);

            // This means that the item is a file not a directory
            // return -1, meaning that the directory we want to change to
            if (currentDir === null) {
                return -1;
            }
            return 0; 
        } else {
            // Else if the directory doesn't exist at all
            return -1;
        }
    }
}

function updateCwd(newDir) {
    let tokens = newDir.split("/");

    // If we are using absolute paths e.g "/home"
    if (newDir[0] === '/') {
        return getDir(rootDir, tokens);
    }

    // If we call something like ./whatever
    if (tokens[0] === ".") {
        // Then the starting directory is the current directory
        return getDir(cwd, tokens.slice(1));
    }

    // If we have .. in any of our files ".." is the backwards direction.
    if (tokens.indexOf("..") != 1) {
        
        if (cwd === "root") {

        }
    }
}


// Actual Terminal
let term = $('body').terminal({
    help: function() {
        this.echo("This is my attempt at recreating my personal website as a terminal. This only has the basic terminal features though.");
        this.echo("Use it like you would any unix command line.");
        this.echo("\nBasic Unix Commands:");
        this.echo("    cat -- Outputs the content of a file")
        this.echo("    cd -- Changes the current directory of the terminal");
        this.echo("    cwd -- Returns the directory the user is currently in");
        this.echo("    ls -- Lists all the items in the directory");
        this.echo("    open -- Opens the file, in this website, it has the same effect as cat\n");
    },

    ls: function(input) {
        if (input) {
            input = input.toLowerCase();
        } 
        if (input === "about") {
            this.echo(siteStructure.about.content);
        } else if (input === "projects") {
            this.echo(siteStructure.projects.content);
        } else if (input === "contact") {
            this.echo(siteStructure.contact.content);
        } else if (input === "~") {
            this.echo(`[[b;${colors.cyan};]${foldersToString(siteStructure.home.content)}]`);
        } else { // If there is no argument attached to ls
            if (cwd === siteStructure.home) { // If the current working directory is the home directory, print it a different way
                this.echo(`[[b;${colors.cyan};]${foldersToString(siteStructure.home.content)}]`);
            } else {
                if (input) {
                    term.echo("")
                } else {
                    this.echo(cwd.content);
                }
            }

        }
    },

    cd: function(input) { // Change directory function
        let homeWords = ["home", "..", "tominekan", "tominekan", "home", "CA", "NIG", "../"] // Easter egg is California and Nigeria which are both my homes
        if (input) {
            input = input.toLowerCase()
        }
        if ((input === siteStructure.home.name) || (homeWords.includes(input))) { // cd ~ or any words in the list for home
            cwd = siteStructure.home;
        } else if (input === siteStructure.about.name) { // cd About
            cwd = siteStructure.about;
        } else if (input === siteStructure.projects.name) { // cd Projects
            cwd = siteStructure.projects;
        } else if (input === siteStructure.contact.name) { // cd Contact
            cwd = siteStructure.contact;
        } else { // cd anything else lol, this includes "../Home"
            // The set of if statements below should handle ../home, nd other type shit
            if (cwd != siteStructure.home && input)
                if ((input === "../" + siteStructure.home.name) || (homeWords.includes(input))) { // cd ~ or any words in the list for home
                    cwd = siteStructure.home;
                } else if (input === "../" + siteStructure.about.name) { // cd About
                    cwd = siteStructure.about;
                } else if (input === "../" + siteStructure.projects.name) { // cd Projects
                    cwd = siteStructure.projects;
                } else if (input === "../" + siteStructure.contact.name) { // cd Contact
                    cwd = siteStructure.contact;
                } else {
                    term.echo(`[[;${colors.red};]Directory "${input}" does not exist]`) // Error no such directory exits
                }
            else {
                if (input) {
                    term.echo(`[[;${colors.red};]Directory "${input}" does not exist]`) // Error no such directory exits
                } else {
                    cwd = siteStructure.home
                }
            }
        }
        term.set_prompt(`[[;${colors.green};]tomster@localhost] [[b;${colors.cyan};]${cwd.folderName}] `);
    },

    cwd: function() {
        this.echo(`${cwd.folderName}`);
    },

    cat: openFiles,

    open: openFiles,

    spotify: function() {
        term.echo(`\n[[bu;${colors.pink};]2023 TOP 5 ARTISTS:]`);
        term.echo("1. Playboi Carti\n2. Pop Smoke\n3. POLO PERKS <3 <3 <3\n4. Homixide Gang\n5. Yeat");
        term.echo(`\n[[bu;${colors.pink};]2023 TOP 5 SONGS:]`);
        term.echo("1. Notice It (Homixide Gang)\n2. YA DIG (Menacelations)\n3. \"Who Killed Kenny (Evil Giane, Tommytohotty)\" (POLO PERKS <3 <3 <3)\n4. \"SomethingThatMatters (GonerProd)\" (POLO PERKS <3 <3 <3)\n5. \"i91 (SkrappDollaz)\" (POLO PERKS <3 <3 <3)\n");
    }

}, {
    checkArity: false,
    greetings: greetings.innerHTML,
});



function openFiles(input) {
    if (!input) {
        term.echo(`[[;${colors.red};]No file specified :(]`);


    } else {
        input = input.toLowerCase();
        if (cwd === siteStructure.about) { // in the About Folder
            if (input === "whoiam.txt") { // whoiam

                term.echo("\nI'm Tomi Adenekan, a graduating high school student interested in coding and data analytics.");
                term.echo("I've been involved in sports such as Cross Country, Rowing, and Track and Field");
                term.echo("I currently work at Chipotle and volunteer at TeenTechSF a local STEM organization.\n");
            } else if (input === "education.txt") { // schooling
                term.echo("\nI am a senior at Hillsdale High School and have previously attended Junipero Serra High School");
                term.echo("I will be attending the University of Pennyslvania to major in Computer Science with a concentration in Data Analytics\n");
            } else {
                term.echo(`[[;${colors.red};]${input} not found in ${cwd.folderName}]`) // Error file doesn't exist
            }


        } else if (cwd === siteStructure.projects) { // in the Projects folder
            if (input === "2dlinreg.txt") {
                term.echo(`\n[[bu;${colors.pink};]2D LINEAR REGRESSION TOOL:]\n`);
                term.echo(`[[i;${colors.purple};]TYPE:] This is a command line statistical analysis application. It implements all algorithms by hand (they aren't performance optimized tho)`);
                term.echo(`[[i;${colors.purple};]FUNCTION:] It calculates and plots various statistics for a given dataset.\n`);
            } else if (input === "kmeans.txt") {
                term.echo(`\n[[bu;${colors.pink};]K-MEANS CLASSIFICATION ALGORITHM:]\n`);
                term.echo(`[[i;${colors.purple};]TYPE:] This is an hand-implementation of a machine learning algorithm.`);
                term.echo(`[[i;${colors.purple};]WHAT IT DOES:] It takes in estimated centroids and applies the K-Means algorithms to return new centroids.\n`);
            } else if (input === "designs.txt") {
                term.echo(`\n[[bu;${colors.pink};]PERSONAL DESIGNS:]\n`);
                term.echo(`[[i;${colors.purple};]TYPE:] These are a collection of .sketch files of websites I've made.`);
                term.echo(`[[i;${colors.purple};]WHAT IT DOES:] You can them on my github. https://github.com/tominekan \n`);
            } else if (input === "klarg.txt") {
                term.echo(`\n[[bu;${colors.pink};]Kommand Line ARGument parser:]\n`);
                term.echo(`[[i;${colors.purple};]TYPE:] This is a python library (with an incredibly goofy name).`);
                term.echo(`[[i;${colors.purple};]WHAT IT DOES:] This is an incredibly easy to use command line argument parser using no external libraries and a less-than 25kB file size.\n`);
            } else {
                term.echo(`[[;${colors.red};]${input} not found in ${cwd.folderName}]`)
            }


        } else if (cwd === siteStructure.contact) { // in the Projects folder
            if (input === "contactinfo.txt") {
                term.echo("\nEmail: tominekan12@gmail.com");
                term.echo("Github: https://github.com/tominekan");
                term.echo("Linkedin: https://www.linkedin.com/in/oluwatomisin-adenekan-50b207247/\n");
            } else if (input === "resume.pdf") {
                term.echo("Opening resume in a new tab...");
                window.open("resume.pdf")
            } else {
                term.echo(`[[;${colors.red};]${input} not found in ${cwd.folderName}]`)
            }


        } else { 
            if (cwd === siteStructure.home) { // IF WE ARE IN THE HOME DIRECTORY

                if (input === "about/whoiam.txt") { // whoiam
                    term.echo("\nI'm Tomi Adenekan, a graduating high school student interested in coding and data analytics.");
                    term.echo("I've been involved in sports such as Cross Country, Rowing, and Track and Field");
                    term.echo("I currently work at Chipotle and volunteer at TeenTechSF a local STEM organization.\n");
                    
                } else if (input === "about/education.txt") { // schooling
                    term.echo("\nI am a senior at Hillsdale High School and have previously attended Junipero Serra High School");
                    term.echo("I will be attending the University of Pennyslvania to major in Computer Science with a concentration in Data Analytics\n");

                } else if (input === "projects/2dlinreg.txt") {
                    term.echo(`\n[[bu;${colors.pink};]2D LINEAR REGRESSION TOOL:]\n`);
                    term.echo(`[[i;${colors.purple};]TYPE:] This is a command line statistical analysis application. It implements all algorithms by hand (they aren't performance optimized tho)`);
                    term.echo(`[[i;${colors.purple};]WHAT IT DOES:] It calculates and plots various statistics for a given dataset.\n`);

                } else if (input === "projects/kmeans.txt") {
                    term.echo(`\n[[bu;${colors.pink};]K-MEANS CLASSIFICATION ALGORITHM:]\n`);
                    term.echo(`[[i;${colors.purple};]TYPE:] This is an hand-implementation of a machine learning algorithm.`);
                    term.echo(`[[i;${colors.purple};]WHAT IT DOES:] It takes in estimated centroids and applies the K-Means algorithms to return new centroids.\n`);

                } else if (input === "projects/designs.txt") {
                    term.echo(`\n[[bu;${colors.pink};]PERSONAL DESIGNS:]\n`);
                    term.echo(`[[i;${colors.purple};]TYPE:] These are a collection of .sketch files of websites I've made.`);
                    term.echo(`[[i;${colors.purple};]WHAT IT DOES:] You can them on my github. https://github.com/tominekan \n`);

                } else if (input === "projects/klarg.txt") {
                    term.echo(`\n[[bu;${colors.pink};]Kommand Line ARGument parser:]\n`);
                    term.echo(`[[i;${colors.purple};]TYPE:] This is a python library (with an incredibly goofy name).`);
                    term.echo(`[[i;${colors.purple};]WHAT IT DOES:] This is an incredibly easy to use command line argument parser using no external libraries and a less-than 25kB file size.\n`);

                } else if (input === "contact/contactinfo.txt") {
                    term.echo("\nEmail: tominekan12@gmail.com");
                    term.echo("Github: https://github.com/tominekan");
                    term.echo("Linkedin: https://www.linkedin.com/in/oluwatomisin-adenekan-50b207247/\n");

                } else if (input === "contact/resume.pdf") {
                    term.echo("Opening resume in a new tab...");
                    window.open("resume.pdf");

                } else { // if we are in the home directory and we don't have any file names specified
                    term.echo(`[[;${colors.red};]${input} not found in ${cwd.folderName}]`);
                }

            } else {
                term.echo(`[[;${colors.red};]${input} not found in ${cwd.folderName}]`);
            }
        }
    }
}
term.set_prompt(`[[;${colors.green};]tomster@localhost] [[b;${colors.cyan};]${cwd.folderName}] `);