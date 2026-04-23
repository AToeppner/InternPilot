import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient, ApplicationStatus, GeneratedDocumentType } from "@prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function demoResumeText() {
  return `Drew Toeppner
Athens, GA • drew.student@example.com • (555) 555-0199 • GitHub: github.com/drewtoeppner

EDUCATION
University of Georgia (UGA) — Terry College of Business
B.B.A. Management Information Systems (MIS) + Computing Certificate
Graduation: May 2027 • GPA: 3.54

SKILLS
Java • Python • Excel (PivotTables, XLOOKUP) • SQL (learning) • Git • Unix/Linux • APIs • Data analysis • Presentation & communication • AI Integration

PROJECTS : 
OpenAI-Powered Movie Summary Generator (Java)
- Developed a Java-based GUI application that retrieved real-time movie data from the Open Movie Database API and
integrated ChatGPT for AI-generated summaries and fun facts.
- Implemented RESTful API calls, JSON parsing, and dynamic UI updates to handle data retrieval, processing, and
display efficiently within the application.




EXPERIENCE

Global Payments (BCI Pagos)  - Technology and Development Intern - Santiago, Chile
- Utilized RESTful API calls to create and manage transactions for debugging and performance validation.
- Tested and configured three different POS terminal models to ensure optimal performance and reliability.
- Collaborated and communicated effectively with colleagues in Spanish and English, enhancing teamwork and problemsolving in a diverse, and multicultural environment

Paloma Park Team Member — Athens, GA
- Worked in a fast-paced environment balancing accuracy, speed, and customer experience.
- Collaborated with a 6-person team to keep service smooth during peak hours.

Central City Tavern: Shift Leader — Athens, GA
- Led a shift team of 5, assigned stations, and resolved issues to maintain service standards.
- Trained new employees on POS workflows, food safety, and customer communication.
- Helped manage daily budgets, inventory counts, and end-of-day reconciliation.



Leadership & Involvement
- Sigma Pi Fraternity, Alpha Phi Chapter Social Chair
• Coordinated with leaders of other Greek organizations to foster relationships used to raise money for philanthropy.
• Strategically managed an $8,000 budget, carefully allocating funds to maximize event size and quality.

- Sigma Pi Fraternity, Alpha Phi Chapter Mental Health Chair
• Organized and facilitated mental health awareness events including a nature hike and wellness outreach programs for a
• chapter of 100+ members, promoting open dialogue and access to resources.


- MIS Society: Participated in workshops on analytics, SQL, and career readiness.

UGA Cybersecurity Club: Member
Gained a deeper perspective about real corporate operations through discussions with professionals and recent UGA alumni. 




`;
}

function demoJobPostingText() {
  return `Insert Company Name Here — Insert Job Title Here — Demo Posting

About the role
As a Summer Analyst Intern, you’ll gain exposure to how a global firm supports clients and internal teams. You will work on projects that combine business context with basic technology and data awareness.

Responsibilities
- Support cross-functional teams on client/business initiatives and internal process improvements
- Analyze information, build simple summaries, and communicate findings clearly
- Help maintain reports, spreadsheets, and dashboards; ensure data accuracy
- Collaborate with teammates, contribute ideas, and take ownership of assigned tasks
- Participate in presentations and write-ups for stakeholders

Required skills
- Strong communication (written + verbal) and teamwork
- Comfortable with Excel; ability to learn new tools quickly
- Analytical mindset and attention to detail
- Basic interest in technology, data, and how systems support business

Preferred qualifications
- Exposure to programming (Java, Python, or similar) and version control (Git)
- Interest in APIs, data analysis, or SQL
- Leadership experience in clubs, teams, or work settings
`;
}




async function main() {
  const profile = await prisma.resumeProfile.upsert({
    where: { email: "drew.student@example.com" },
    update: {
      fullName: "Drew Toeppner",
      school: "University of Georgia (UGA)",
      major: "MIS + Computing Certificate",
      graduationDate: "May 2027",
      gpa: "3.54",
      rawResumeText: demoResumeText(),
    
      experiences: {
        deleteMany: {},   // 🔥 removes old experiences
        create: [         // 🔥 adds your updated ones
          {
            title: "Line Cook",
            organization: "Paloma Park (Athens, GA)",
            startDate: "Aug 2024",
            endDate: "Present",
            description:
              "Worked in a fast-paced environment balancing accuracy, speed, and customer experience. Collaborated with a 6-person team to keep service smooth during peak hours.",
            skills: ["Teamwork", "Time management", "Customer communication"],
          },
          {
            title: "IT and Development Intern",
            organization: "Global Payments (BCI Pagos) (Santiago, Chile)",
            startDate: "Aug 2024",
            endDate: "Present",
            description:
              "Utilized RESTful API calls to create and manage transactions for debugging and performance validation. Tested and configured three different POS terminal models to ensure optimal performance and reliability. Collaborated and communicated effectively in both Spanish and English, enhancing teamwork and problem-solving in a diverse, multicultural environment.",
            skills: ["RESTful API", "POS terminal", "Teamwork", "Communication"],
          },
          {
            title: "Shift Leader",
            organization: "Central City Tavern (Alpharetta, GA)",
            startDate: "Jan 2025",
            endDate: "Present",
            description:
              "Led a shift team of 5, assigned stations, trained new employees on POS workflows and service standards, and helped manage daily budgets and inventory counts.",
            skills: ["Leadership", "Training", "Budgeting", "Operations"],
          },
          {
            title: "Social Director",
            organization: "Sigma PiFraternity",
            startDate: "Mar 2025",
            endDate: "Nov 2025",
            description:
              "Coordinated with leaders of other Greek organizations to foster relationships used to raise money for philanthropy. Strategically managed an $8,000 budget, carefully allocating funds to maximize event size and quality.",
            skills: ["Leadership", "Communication", "Planning"],
          },
          {
            title: "Mental Health Chair",
            organization: "Sigma Pi Fraternity",
            startDate: "Mar 2025",
            endDate: "Nov 2025",
            description:
              "Organized and facilitated mental health awareness events including a nature hike and wellness outreach programs for a chapter of 100+ members, promoting open dialogue and access to resources.",
            skills: ["Leadership", "Communication", "Planning"],
          },
          {
            title: "Member",
            organization: "UGA Cybersecurity Club",
            startDate: "Sep 2024",
            endDate: "Present",
            description:
              "Gained a deeper perspective about real corporate operations through discussions with professionals and recent UGA alumni.",
            skills: ["Cybersecurity", "Communication", "Planning"],
          },
          {
            title: "Member",
            organization: "MIS Society",
            startDate: "Sep 2024",
            endDate: "Present",
            description:
              "Participated in workshops on analytics, SQL, and career readiness; collaborated with peers on practice problems and résumé prep.",
            skills: ["Data analysis", "SQL (learning)", "Career readiness"],
          },
          {
            title: "OpenAI-Powered Movie Summary Generator",
            organization: "Java Project",
            startDate: "Oct 2025",
            endDate: "Dec 2025",
            description:
              "- Developed a Java-based GUI application that retrieved real-time movie data from the Open Movie Database API andintegrated ChatGPT for AI-generated summaries and fun facts.Implemented RESTful API calls, JSON parsing, and dynamic UI updates to handle data retrieval, processing, and display efficiently within the application.",
            skills: ["Java", "APIs", "Git", "Prompting"],
          },
        ],
      },
    },


    create: {
      fullName: "Drew Toeppner",
      email: "drew.student@example.com",
      school: "University of Georgia (UGA)",
      major: "MIS + Computing Certificate",
      graduationDate: "May 2027",
      gpa: "3.54",
      rawResumeText: demoResumeText(),
      experiences: {
        create: [
          {
            title: "Line Cook",
            organization: "Paloma Park (Athens, GA)",
            startDate: "Aug 2024",
            endDate: "Present",
            description:
              "Worked in a fast-paced environment balancing accuracy, speed, and customer experience. Collaborated with a 6-person team to keep service smooth during peak hours.",
            skills: ["Teamwork", "Time management", "Customer communication"],
          },
          {
            title: "IT and Development Intern",
            organization: "Global Payments (BCI Pagos) (Santiago, Chile)",
            startDate: "Aug 2024",
            endDate: "Present",
            description: 
            "Utilized RESTful API calls to create and manage transactions for debugging and performance validation. Tested and configured three different POS terminal models to ensure optimal performance and reliability. Collaborated and communicated effectively in both Spanish and English, enhancing teamwork and problem-solving in a diverse, multicultural environment.",
            skills: ["RESTful API", "POS terminal", "Teamwork", "Communication"],
          },
          {
            title: "Shift Leader",
            organization: "Central City Tavern (Alpharetta, GA)",
            startDate: "Jan 2025",
            endDate: "Present",
            description:
              "Led a shift team of 5, assigned stations, trained new employees on POS workflows and service standards, and helped manage daily budgets and inventory counts.",
            skills: ["Leadership", "Training", "Budgeting", "Operations"],
          },
          {
            title: "Social Director",
            organization: "Sigma PiFraternity",
            startDate: "Mar 2025",
            endDate: "Nov 2025",
            description:
              "Coordinated with leaders of other Greek organizations to foster relationships used to raise money for philanthropy. Strategically managed an $8,000 budget, carefully allocating funds to maximize event size and quality.",
            skills: ["Leadership", "Communication", "Planning"],
          },
          {
            title: "Mental Health Chair",
            organization: "Sigma Pi Fraternity",
            startDate: "Mar 2025",
            endDate: "Nov 2025",
            description:
              "Organized and facilitated mental health awareness events including a nature hike and wellness outreach programs for a chapter of 100+ members, promoting open dialogue and access to resources.",
            skills: ["Leadership", "Communication", "Planning"],
          },
          {
            title: "Member",
            organization: "UGA Cybersecurity Club",
            startDate: "Sep 2024",
            endDate: "Present",
            description:
              "Gained a deeper perspective about real corporate operations through discussions with professionals and recent UGA alumni.",
            skills: ["Cybersecurity", "Communication", "Planning"],
          },
          {
            title: "Member",
            organization: "MIS Society",
            startDate: "Sep 2024",
            endDate: "Present",
            description:
              "Participated in workshops on analytics, SQL, and career readiness; collaborated with peers on practice problems and résumé prep.",
            skills: ["Data analysis", "SQL (learning)", "Career readiness"],
          },
          {
            title: "OpenAI-Powered Movie Summary Generator",
            organization: "Java Project",
            startDate: "Oct 2025",
            endDate: "Dec 2025",
            description:
              "- Developed a Java-based GUI application that retrieved real-time movie data from the Open Movie Database API andintegrated ChatGPT for AI-generated summaries and fun facts.Implemented RESTful API calls, JSON parsing, and dynamic UI updates to handle data retrieval, processing, and display efficiently within the application.",
            skills: ["Java", "APIs", "Git", "Prompting"],
          },
        ],
      },
    },
  });




  const posting = await prisma.jobPosting.upsert({
    where: { id: "demo-blackrock-posting" },
    update: {
      company: "Insert Company Name Here",
      role: "Insert Role Here",
      sourceUrl: "https://example.com/demo-blackrock-internship",
      rawText: demoJobPostingText(),
      extractedSkills: [
        "Excel",
        "Communication",
        "Teamwork",
        "Analytical thinking",
        "Attention to detail",
        "Basic technical awareness",
        "APIs (preferred)",
        "Git (preferred)",
        "SQL (preferred)",
      ],
      extractedResponsibilities: [
        "Support cross-functional teams on initiatives and process improvements",
        "Analyze information and summarize findings",
        "Maintain reports/spreadsheets/dashboards and ensure data accuracy",
        "Collaborate with teammates and take ownership of tasks",
        "Create presentations and write-ups for stakeholders",
      ],
      extractedQualifications: [
        "Strong written/verbal communication",
        "Comfortable with Excel and learning new tools",
        "Analytical mindset and attention to detail",
        "Interest in business + technology",
      ],
      extractedKeywords: ["client", "stakeholders", "process improvement", "reports", "dashboards", "data accuracy"],
    },
    create: {
      id: "demo-blackrock-posting",
      company: "Insert Company Name Here",
      role: "Insert Role Here",
      sourceUrl: "https://example.com/demo-blackrock-internship",
      rawText: demoJobPostingText(),
      extractedSkills: [
        "Excel",
        "Communication",
        "Teamwork",
        "Analytical thinking",
        "Attention to detail",
        "Basic technical awareness",
        "APIs (preferred)",
        "Git (preferred)",
        "SQL (preferred)",
      ],
      extractedResponsibilities: [
        "Support cross-functional teams on initiatives and process improvements",
        "Analyze information and summarize findings",
        "Maintain reports/spreadsheets/dashboards and ensure data accuracy",
        "Collaborate with teammates and take ownership of tasks",
        "Create presentations and write-ups for stakeholders",
      ],
      extractedQualifications: [
        "Strong written/verbal communication",
        "Comfortable with Excel and learning new tools",
        "Analytical mindset and attention to detail",
        "Interest in business + technology",
      ],
      extractedKeywords: ["client", "stakeholders", "process improvement", "reports", "dashboards", "data accuracy"],
    },
  });

  const app = await prisma.jobApplication.upsert({
    where: { id: "demo-application" },
    update: {
      company: posting.company,
      role: posting.role,
      status: ApplicationStatus.Draft,
      resumeProfileId: profile.id,
      jobPostingId: posting.id,
      notes: "Seeded demo application for presentation.",
    },
    create: {
      id: "demo-application",
      company: posting.company,
      role: posting.role,
      status: ApplicationStatus.Draft,
      resumeProfileId: profile.id,
      jobPostingId: posting.id,
      notes: "Seeded demo application for presentation.",
      generatedDocs: {
        create: [
          {
            type: GeneratedDocumentType.resume,
            versionLabel: "Tailored Bullets (Demo)",
            content:
              "- Led a 5-person shift team in a high-volume environment, prioritizing tasks and resolving issues to keep service quality consistent.\n- Trained new employees on POS workflows and customer communication, improving onboarding speed and reducing common errors.\n- Built a Java project integrating an external API (OpenAI) with structured prompts, error handling, and iterative testing to improve output quality.\n- Maintained daily budget and inventory checks, ensuring accurate reconciliation and clear updates for stakeholders.",
          },
          {
            type: GeneratedDocumentType.cover_letter,
            versionLabel: "Main (Professional)",
            content:
              "Dear Hiring Team,\n\nI’m a University of Georgia MIS student with a Computing Certificate, excited about the opportunity to join BlackRock (Demo) as a Summer Intern in Client Business / Corporate Functions. I enjoy roles that blend business context with technology and data awareness, and I’m confident I can contribute with clear communication, strong teamwork, and an analytical mindset.\n\nIn my role as a shift leader, I coordinate a five-person team in a fast-paced environment. I assign tasks, train new employees, and help manage daily budgets and inventory checks—experiences that strengthened my attention to detail and ability to communicate expectations clearly. Academically and through projects, I’ve also built technical comfort: I created a Java app that calls an external API (OpenAI) and improved the quality of outputs through structured prompts and error handling.\n\nI’m excited to bring this combination of leadership, reliability, and curiosity about systems that support business to your team. Thank you for your time and consideration.\n\nSincerely,\nDrew Toepfer",
          },
          {
            type: GeneratedDocumentType.cover_letter,
            versionLabel: "Alt A (More Energetic)",
            content:
              "Dear Hiring Team,\n\nI’m a UGA MIS student who loves turning messy information into clear next steps—whether that’s helping a team run smoothly during a busy shift or building a small Java project that uses an API to generate better study materials. That’s why I’m excited about the BlackRock (Demo) Summer Internship in Client Business / Corporate Functions.\n\nI’ve learned to take ownership and communicate clearly as a shift leader: I coordinate a team of five, train new employees, and help with budget and inventory checks. I also enjoy the technical side—I’m comfortable with Excel, Git, and Unix basics, and I’m currently learning SQL. I’d love to apply that mindset to support cross-functional projects, maintain accurate reports, and contribute to presentations and stakeholder updates.\n\nThank you for considering my application.\n\nSincerely,\nDrew Toepfer",
          },
          {
            type: GeneratedDocumentType.cover_letter,
            versionLabel: "Alt B (More Analytical)",
            content:
              "Dear Hiring Team,\n\nI’m applying for the  Summer Internship in Client Business / Corporate Functions because it aligns with how I like to work: collaborate across teams, keep data accurate, and communicate findings in a simple, stakeholder-friendly way.\n\nAs a shift leader, I routinely assess priorities, assign roles, and resolve issues quickly to maintain service standards. I also support daily reconciliation tasks, which reinforced careful checking and clear reporting. In parallel, I’ve built a Java project integrating an external API (OpenAI), where I focused on structured inputs, error handling, and iterative improvement—skills that translate to maintaining reliable reporting processes and learning new tools fast.\n\nI’d welcome the chance to contribute to cross-functional initiatives and process improvements this summer.\n\nSincerely,\nDrew Toepfer",
          },
        ],
      },
    },
  });

  // Ensure seeded docs exist on update path
  const docsCount = await prisma.generatedDocument.count({ where: { applicationId: app.id } });
  if (docsCount === 0) {
    await prisma.generatedDocument.createMany({
      data: [
        {
          applicationId: app.id,
          type: GeneratedDocumentType.resume,
          versionLabel: "Tailored Bullets (Demo)",
          content:
            "- Led a 5-person shift team in a high-volume environment, prioritizing tasks and resolving issues to keep service quality consistent.\n- Trained new employees on POS workflows and customer communication, improving onboarding speed and reducing common errors.\n- Built a Java project integrating an external API (OpenAI) with structured prompts, error handling, and iterative testing to improve output quality.\n- Maintained daily budget and inventory checks, ensuring accurate reconciliation and clear updates for stakeholders.",
        },
        {
          applicationId: app.id,
          type: GeneratedDocumentType.cover_letter,
          versionLabel: "Main (Professional)",
          content:
            "Dear Hiring Team,\n\nI’m a University of Georgia MIS student with a Computing Certificate, excited about the opportunity to join BlackRock (Demo) as a Summer Intern in Client Business / Corporate Functions. I enjoy roles that blend business context with technology and data awareness, and I’m confident I can contribute with clear communication, strong teamwork, and an analytical mindset.\n\nIn my role as a shift leader, I coordinate a five-person team in a fast-paced environment. I assign tasks, train new employees, and help manage daily budgets and inventory checks—experiences that strengthened my attention to detail and ability to communicate expectations clearly. Academically and through projects, I’ve also built technical comfort: I created a Java app that calls an external API (OpenAI) and improved the quality of outputs through structured prompts and error handling.\n\nI’m excited to bring this combination of leadership, reliability, and curiosity about systems that support business to your team. Thank you for your time and consideration.\n\nSincerely,\nDrew Toepfer",
        },
        {
          applicationId: app.id,
          type: GeneratedDocumentType.cover_letter,
          versionLabel: "Alt A (More Energetic)",
          content:
            "Dear Hiring Team,\n\nI’m a UGA MIS student who loves turning messy information into clear next steps—whether that’s helping a team run smoothly during a busy shift or building a small Java project that uses an API to generate better study materials. That’s why I’m excited about the BlackRock (Demo) Summer Internship in Client Business / Corporate Functions.\n\nI’ve learned to take ownership and communicate clearly as a shift leader: I coordinate a team of five, train new employees, and help with budget and inventory checks. I also enjoy the technical side—I’m comfortable with Excel, Git, and Unix basics, and I’m currently learning SQL. I’d love to apply that mindset to support cross-functional projects, maintain accurate reports, and contribute to presentations and stakeholder updates.\n\nThank you for considering my application.\n\nSincerely,\nDrew Toepfer",
        },
        {
          applicationId: app.id,
          type: GeneratedDocumentType.cover_letter,
          versionLabel: "Alt B (More Analytical)",
          content:
            "Dear Hiring Team,\n\nI’m applying for the BlackRock (Demo) Summer Internship in Client Business / Corporate Functions because it aligns with how I like to work: collaborate across teams, keep data accurate, and communicate findings in a simple, stakeholder-friendly way.\n\nAs a shift leader, I routinely assess priorities, assign roles, and resolve issues quickly to maintain service standards. I also support daily reconciliation tasks, which reinforced careful checking and clear reporting. In parallel, I’ve built a Java project integrating an external API (OpenAI), where I focused on structured inputs, error handling, and iterative improvement—skills that translate to maintaining reliable reporting processes and learning new tools fast.\n\nI’d welcome the chance to contribute to cross-functional initiatives and process improvements this summer.\n\nSincerely,\nDrew Toepfer",
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

