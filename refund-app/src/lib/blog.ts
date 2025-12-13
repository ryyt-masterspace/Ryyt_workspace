import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    description: string;
    content: string;
    readTime: string;
}

export function getAllPosts(): BlogPost[] {
    // 1. Create folder if missing
    if (!fs.existsSync(contentDirectory)) {
        fs.mkdirSync(contentDirectory);
    }

    const fileNames = fs.readdirSync(contentDirectory);

    const allPostsData = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(contentDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Estimate read time
        const wordCount = content.split(/\s+/g).length;
        const readTime = Math.ceil(wordCount / 200) + ' min read';

        return {
            slug,
            title: data.title || 'Untitled',
            date: data.date || new Date().toISOString(),
            description: data.description || '',
            content,
            readTime
        };
    });

    // Sort posts by date
    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string) {
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
        slug,
        title: data.title,
        date: data.date,
        description: data.description,
        content,
    };
}
