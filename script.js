// Follows the Dracula color scheme
const colors = {
    red: "#ff5555",
    cyan: "#8be9fd",
    green: "#50FA7B",
    pink: "#FF79C6",
    purple: "#BD93F9"
};

// Perhaps not needed
function foldersToString(arr) {
    let newString = "";
    arr.forEach((element) => newString += `${element}    `);
    return newString.trim();
}

let siteStructure = {
    home: {
        name: "~",
        folderName: "~",
        content: ["About", "Projects", "Contact"],
    },
    about: {
        name: "about",
        folderName: "~/About",
        content: ["whoiam.txt", "education.txt"],
    },
    projects: {
        name: "projects",
        folderName: "~/Projects",
        content: ["2dlinreg.txt", "kmeans.txt", "designs.txt", "klarg.txt"],
    },
    contact: {
        name: "contact",
        folderName: "~/Contact",
        content: ["contactinfo.txt", "resume.pdf"],
    }
};

let cwd = siteStructure.home;

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