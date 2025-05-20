// This script manually creates sample data for testing

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany({});
    await prisma.reading.deleteMany({});

    // Create sample readings
    console.log('Creating sample readings...');
    await prisma.reading.createMany({
      data: [
        {
          slug: 'the-lord-of-the-rings',
          title: 'The Lord of the Rings',
          author: 'J.R.R. Tolkien',
          finishedDate: new Date('2024-01-15'),
          coverImageSrc: '/readings/lotr.jpg',
          thoughts: 'A true classic!',
          dropped: false,
        },
        {
          slug: 'dune',
          title: 'Dune',
          author: 'Frank Herbert',
          finishedDate: new Date('2024-02-20'),
          coverImageSrc: '/readings/dune.jpg',
          thoughts: 'Epic sci-fi masterpiece',
          dropped: false,
        },
        {
          slug: 'current-reading',
          title: 'Current Reading',
          author: 'Test Author',
          finishedDate: null,
          coverImageSrc: null,
          thoughts: '',
          dropped: false,
        },
      ],
    });

    // Create sample quotes
    console.log('Creating sample quotes...');
    await prisma.quote.createMany({
      data: [
        {
          text: 'Not all those who wander are lost.',
          author: 'J.R.R. Tolkien',
        },
        {
          text: "The mystery of life isn't a problem to solve, but a reality to experience.",
          author: 'Frank Herbert, Dune',
        },
        {
          text: 'Fear is the mind-killer.',
          author: 'Frank Herbert, Dune',
        },
      ],
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
