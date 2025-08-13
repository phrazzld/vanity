import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

export function getQuotes() {
  const dir = path.join(process.cwd(), 'content/quotes');
  const files = fs.readdirSync(dir);
  return files.map(file => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    return { 
      id: data.id as number, 
      author: data.author as string, 
      text: content.trim() 
    };
  });
}

export function getReadings() {
  const dir = path.join(process.cwd(), 'content/readings');
  const files = fs.readdirSync(dir);
  const readings = files.map(file => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    return { 
      slug: file.replace('.md', ''),
      title: data.title as string,
      author: data.author as string,
      finishedDate: (data.finished as string | null) || null,
      coverImageSrc: (data.coverImage as string | null) || null,
      thoughts: content.trim(),
      dropped: (data.dropped as boolean) || false
    };
  });
  
  // Filter out dropped readings
  const activeReadings = readings.filter(r => !r.dropped);
  
  // Sort by finished date (most recent first)
  // Put null dates (currently reading) at the end
  return activeReadings.sort((a, b) => {
    if (!a.finishedDate && !b.finishedDate) return 0;
    if (!a.finishedDate) return 1;
    if (!b.finishedDate) return -1;
    return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
  });
}