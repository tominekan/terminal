/**
 * content.js
 *  Everything the terminal "filesystem" contains. Plain objects are directories, and
 *  text(), link(), and entry() are files. To add something, just add a key here,
 *  script.js handles all the formatting and colors.
 */

/** A plain text file, shown as-is by `cat` and `open` */
const text = (body) => ({ kind: "text", body });

/** A file that `open` launches in a new tab (`cat` just prints the url) */
const link = (url) => ({ kind: "link", url });

/** A formatted entry: a colored title, an optional date, and a list of bullet points */
const entry = (title, date, bullets) => ({ kind: "entry", title, date, bullets });

/** Used by contactinfo.txt and the email/linkedin/github commands */
const CONTACT = {
    email: "tominekan12@gmail.com",
    github: "https://github.com/tominekan",
    linkedin: "https://www.linkedin.com/in/oluwatomisin-adenekan-50b207247/",
    website: "https://tominekan.netlify.app",
};




const CONTENT = {
    About: {
        "whoiam.txt": text(`
I'm Tomi Adenekan, a junior at the University of Pennsylvania working towards a BSE in Computer Science and Philosophy (class of 2028).
Ever since moving to the U.S. from Nigeria in 2016, I taught myself how to use computers through small hands on projects.

These days I'm into systems, machine learning, and data. This past summer I was a Software Engineering Intern at Microsoft,
I do EEG research at Penn's Center for Neuroengineering & Therapeutics, and I teach and tutor CS and math around Penn and Philly.

Outside of code, I love cooking, working out, watching anime, watching ping pong, and talking about philosophy with friends.`),

        "skills.txt": text(`
Languages:  Python, C, Java, TypeScript, JavaScript, HTML/CSS
Data & ML:  Pandas, Stable Diffusion + LoRA, LightGlue, Hugging Face
Web:        React, FastAPI, C# .NET, SQLAlchemy, Azure
Tools:      Git/GitHub, Bash`),

        "resume.pdf": link("resume.pdf"),
    },

    Education: {
        "upenn.txt": entry("University of Pennsylvania", "Expected May 2028", [
            "Bachelor of Science in Engineering, majoring in Computer Science and Philosophy",
            "Cumulative GPA: 3.62",
            "Relevant coursework: Applied Machine Learning, Computer Vision, Big Data Analytics, Databases, Operating Systems",
        ]),
    },

    Experience: {
        "microsoft.txt": entry("Software Engineering Intern @ Microsoft", "May 2026 – Aug 2026", [
            "Architected a full-stack AI agent (React, C# .NET) within self-hosted government clouds, replacing 17 rigid legacy scripts with a single natural language interface for financial data",
            "Modernized deployment reporting so stakeholders can pull complex, ad-hoc financial insights without hardcoded queries",
            "Built a table tennis match scheduling app for employees (React, FastAPI, SQLAlchemy, Azure) with ELO rankings, match recommendations, and live leaderboards",
        ]),

        "cnt_research.txt": entry("Research Assistant @ Center for Neuroengineering & Therapeutics", "May 2025 – Present", [
            "Developed a logistic regression-based web tool to predict seizure laterality, aimed at improving surgical planning",
            "Applied signal processing and statistical analysis to EEG data in Python, identifying seizure onset zones with 80% accuracy",
            "Engineered data pipelines (Bash, Batch, Python) to automate processing of 226GB+ of EEG recordings",
            "Co-authored \"Quantifying Interictal Spike Asymmetry on Scalp EEG to Lateralize the Seizure-Onset Zone in Temporal Lobe Epilepsy\" in Neurology Open Access",
        ]),

        "weingarten.txt": entry("Peer Tutor @ Weingarten Center", "Aug 2025 – Present", [
            "Tutor Math 1400 (Calculus), CIS 1200 (Programming Languages and Techniques), and Math 2400 (Linear Algebra)",
            "Run one-on-one and group sessions for 30+ students on tough concepts, problem-solving, and exam prep",
        ]),

        "fife_penn.txt": entry("Instructor @ Fife-Penn STEM and CS Academy", "Sep 2024 – Present", [
            "Design and teach a weekly curriculum for 75+ elementary school students across Philadelphia",
            "Teach Scratch through custom-made workshops and demo games to get kids excited about STEM",
        ]),

        "leadership.txt": entry("Leadership & Professional Development", null, [
            "Penn Sports Analytics Group (Aug 2025 – Present): work with Penn's Strength and Conditioning coaches to rank, evaluate, and predict player performance using metrics like the Total Score of Athleticism",
            "SEO Career, SEO Edge Participant (Feb 2024 – Present): coaching for interview, technical, and professional development goals",
        ]),
    },

    Projects: {
        "babydb.c": entry("BabyDB", "June 2026", [
            "A columnar database in C using mmap and SIMD, with a 54-microsecond load latency",
            "Distributed ZeroMQ replication layer, with CPU cache locality optimized via strict 64-row memory alignment",
        ]),

        "styletransfer.py": entry("Image Style Transfer", "May 2026", [
            "Geometry-preserving style transfer pipeline: fine-tuned a Canny edge-conditioned Stable Diffusion model with LoRA to change weather and lighting while keeping structure intact",
            "Automated dataset curation with LightGlue feature matching, aligning and deduplicating 240+ raw images into a Hugging Face dataset",
        ]),

        "pycomplete.py": entry("PyComplete", "Aug 2025", [
            "A text autocomplete library and API built on Markov chains, using Python and FastAPI",
            "A mock e-commerce frontend in React to test out the API",
        ]),

        archive: {
            "Tetris1200.java": entry("Tetris1200", null, [
                "A Tetris game built with Java and Swing UI. Tetris1200 features a retro UI, multiple game modes, game saves, and more.",
            ]),

            "klarg.py": entry("Kommand Line ARgument Parser", null, [
                "A python library (with an incredibly goofy name). It's an incredibly easy to use command line argument parser using zero external libraries and a less-than 25kB file size.",
            ]),

            "musingsv2.py": entry("Musings, my blog", null, [
                "A blog I designed in Lunacy and developed with Django and Bootstrap. It's a repository for my writings about the stuff I'm currently thinking about.",
            ]),

            "designs.sketch": entry("Personal Designs", null, [
                "A collection of .sketch files of websites I've made. You can check them out on my github: https://github.com/tominekan",
            ]),

            "wave.cpp": entry("Wave", null, [
                "A C++ command line tool to edit audio file metadata, like album cover art, artist name, song genre, and more. I made it so I don't have to open Apple Music every time I want to change the metadata of songs I download, which is something I do pretty frequently.",
            ]),
        },
    },

    Contact: {
        "contactinfo.txt": text(`
Email:    ${CONTACT.email}
Github:   ${CONTACT.github}
Linkedin: ${CONTACT.linkedin}
Website:  ${CONTACT.website}

Shortcuts: email, linkedin, github`),
    },
};
