const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Example seed data. Extend as needed for your courses.
  const math = await prisma.subjects.upsert({
    where: { id: 1 },
    update: { title: "Mathematics", description: "Learn core math", is_published: true, is_free: true },
    create: { id: 1, title: "Mathematics", description: "Learn core math", is_published: true, is_free: true }
  });

  const algebra = await prisma.sections.upsert({
    where: { id: 1 },
    update: { subject_id: math.id, title: "Algebra Basics", order_index: 1 },
    create: { id: 1, subject_id: math.id, title: "Algebra Basics", order_index: 1 }
  });

  const videos = [
    {
      id: 1,
      section_id: algebra.id,
      title: "What is Algebra?",
      description: "Intro lesson",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order_index: 1,
      duration_seconds: 120
    },
    {
      id: 2,
      section_id: algebra.id,
      title: "Solving Equations",
      description: "Basics of equation solving",
      youtube_url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      order_index: 2,
      duration_seconds: 240
    }
  ];

  for (const v of videos) {
    await prisma.videos.upsert({
      where: { id: v.id },
      update: v,
      create: v
    });
  }

  await prisma.subjects.upsert({
    where: { id: 2 },
    update: { title: "Programming Fundamentals", description: "Coding basics", is_published: true, is_free: false },
    create: { id: 2, title: "Programming Fundamentals", description: "Coding basics", is_published: true, is_free: false }
  });

  // Free Python track — Corey Schafer’s “Python Tutorial for Beginners” on YouTube
  // Playlist: https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXhwoFUiLCjGgY7
  const python = await prisma.subjects.upsert({
    where: { id: 3 },
    update: {
      title: "Python (YouTube) — Beginner series",
      description:
        "Step‑through lessons from Corey Schafer’s Python Tutorial for Beginners on YouTube (install, types, collections, control flow, functions, modules).",
      is_published: true,
      is_free: true
    },
    create: {
      id: 3,
      title: "Python (YouTube) — Beginner series",
      description:
        "Step‑through lessons from Corey Schafer’s Python Tutorial for Beginners on YouTube (install, types, collections, control flow, functions, modules).",
      is_published: true,
      is_free: true
    }
  });

  const pythonSection = await prisma.sections.upsert({
    where: { id: 2 },
    update: { subject_id: python.id, title: "Python Tutorial for Beginners (YouTube)", order_index: 1 },
    create: { id: 2, subject_id: python.id, title: "Python Tutorial for Beginners (YouTube)", order_index: 1 }
  });

  const pythonVideos = [
    {
      id: 3,
      title: "Install and Setup for Mac and Windows",
      description: "Python Tutorial for Beginners — ep.1",
      youtube_url: "https://www.youtube.com/watch?v=YYXdXT2l-Gg",
      order_index: 1,
      duration_seconds: 15 * 60
    },
    {
      id: 4,
      title: "Strings — Working with Textual Data",
      description: "Python Tutorial for Beginners — ep.2",
      youtube_url: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
      order_index: 2,
      duration_seconds: 21 * 60
    },
    {
      id: 5,
      title: "Integers and Floats — Numeric Data",
      description: "Python Tutorial for Beginners — ep.3",
      youtube_url: "https://www.youtube.com/watch?v=khKv-8q7YmY",
      order_index: 3,
      duration_seconds: 12 * 60
    },
    {
      id: 6,
      title: "Lists, Tuples, and Sets",
      description: "Python Tutorial for Beginners — ep.4",
      youtube_url: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
      order_index: 4,
      duration_seconds: 24 * 60
    },
    {
      id: 7,
      title: "Dictionaries — Key-Value Pairs",
      description: "Python Tutorial for Beginners — ep.5",
      youtube_url: "https://www.youtube.com/watch?v=daefaLgNkw0",
      order_index: 5,
      duration_seconds: 18 * 60
    },
    {
      id: 8,
      title: "Conditionals and Booleans — If / Else / Elif",
      description: "Python Tutorial for Beginners — ep.6",
      youtube_url: "https://www.youtube.com/watch?v=DZwmZ8Usvnk",
      order_index: 6,
      duration_seconds: 16 * 60
    },
    {
      id: 9,
      title: "Loops and Iterations — For / While",
      description: "Python Tutorial for Beginners — ep.7",
      youtube_url: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
      order_index: 7,
      duration_seconds: 22 * 60
    },
    {
      id: 10,
      title: "Functions",
      description: "Python Tutorial for Beginners — ep.8",
      youtube_url: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
      order_index: 8,
      duration_seconds: 20 * 60
    },
    {
      id: 11,
      title: "Import Modules and the Standard Library",
      description: "Python Tutorial for Beginners — ep.9",
      youtube_url: "https://www.youtube.com/watch?v=CqvZ3vGoGs0",
      order_index: 9,
      duration_seconds: 18 * 60
    }
  ];

  for (const v of pythonVideos) {
    await prisma.videos.upsert({
      where: { id: v.id },
      update: { ...v, section_id: pythonSection.id },
      create: { ...v, section_id: pythonSection.id }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

