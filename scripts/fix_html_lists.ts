import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Detects and converts list-like patterns in HTML to proper list structures
 * Handles both single-line and multi-line HTML
 */
function fixLists(html: string): string {
  // For now, always use single-line processing since it handles both cases
  // The single-line processor works by finding paragraphs, which works regardless of line breaks
  return processSingleLineHtml(html);
  const result: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let currentListStart = -1;

  /**
   * Detects if a line contains a list item pattern
   */
  function detectListItem(line: string): {
    isListItem: boolean;
    type: 'ul' | 'ol' | null;
    content: string;
  } {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      return { isListItem: false, type: null, content: '' };
    }

    // Pattern for numbered lists: <p>1. content</p> or <p><strong>1. content</strong></p>
    const numberedMatch = trimmed.match(/^<p>(?:<strong>)?(\d+)\.\s+(.+?)(?:<\/strong>)?<\/p>$/i);
    if (numberedMatch) {
      // Extract the content, preserving any inner tags
      const fullContent = numberedMatch[2];
      // Remove the number prefix if it's duplicated in the content
      const cleanedContent = fullContent.replace(/^\d+\.\s+/, '');
      return { isListItem: true, type: 'ol', content: cleanedContent };
    }

    // Pattern for letter lists: <p>A. content</p> or <p><strong>A. content</strong></p>
    // Match single capital letter followed by period or parenthesis
    const letterMatch = trimmed.match(/^<p>(?:<strong>)?([A-Z])[.)]\s+(.+?)(?:<\/strong>)?<\/p>$/);
    if (letterMatch) {
      const fullContent = letterMatch[2];
      // Remove the letter prefix if duplicated
      const cleanedContent = fullContent.replace(/^[A-Z][.)]\s+/i, '');
      // Preserve strong tags if they wrap the whole content
      let finalContent = cleanedContent;
      if (trimmed.includes('<strong>') && !cleanedContent.includes('<strong>')) {
        finalContent = `<strong>${cleanedContent}</strong>`;
      }
      return { isListItem: true, type: 'ol', content: finalContent };
    }

    // Pattern for bullet lists: <p>• content</p> or <p>- content</p> or <p><strong>• content</strong></p>
    const bulletMatch = trimmed.match(
      /^<p>(?:<strong>)?([•·▪▫○●◦‣⁃\-*])\s+(.+?)(?:<\/strong>)?<\/p>$/
    );
    if (bulletMatch) {
      const fullContent = bulletMatch[2];
      const cleanedContent = fullContent.replace(/^[•·▪▫○●◦‣⁃\-*]\s+/, '');
      let finalContent = cleanedContent;
      if (trimmed.includes('<strong>') && !cleanedContent.includes('<strong>')) {
        finalContent = `<strong>${cleanedContent}</strong>`;
      }
      return { isListItem: true, type: 'ul', content: finalContent };
    }

    // Pattern for lists that might span multiple lines within a single <p> tag
    // This is trickier - we need to check if the content inside <p> starts with list markers
    const multiLineMatch = trimmed.match(/^<p>(.+?)<\/p>$/);
    if (multiLineMatch) {
      const innerContent = multiLineMatch[1];

      // Check for numbered pattern inside
      const innerNumbered = innerContent.match(/^(?:<strong>)?(\d+)\.\s+(.+)$/i);
      if (innerNumbered) {
        const cleanedContent = innerNumbered[2].replace(/^\d+\.\s+/, '');
        return { isListItem: true, type: 'ol', content: cleanedContent };
      }

      // Check for letter pattern inside
      const innerLetter = innerContent.match(/^(?:<strong>)?([A-Z])[.)]\s+(.+)$/);
      if (innerLetter) {
        const cleanedContent = innerLetter[2].replace(/^[A-Z][.)]\s+/i, '');
        let finalContent = cleanedContent;
        if (innerContent.includes('<strong>') && !cleanedContent.includes('<strong>')) {
          finalContent = `<strong>${cleanedContent}</strong>`;
        }
        return { isListItem: true, type: 'ol', content: finalContent };
      }

      // Check for bullet pattern inside
      const innerBullet = innerContent.match(/^(?:<strong>)?([•·▪▫○●◦‣⁃\-*])\s+(.+)$/);
      if (innerBullet) {
        const cleanedContent = innerBullet[2].replace(/^[•·▪▫○●◦‣⁃\-*]\s+/, '');
        let finalContent = cleanedContent;
        if (innerContent.includes('<strong>') && !cleanedContent.includes('<strong>')) {
          finalContent = `<strong>${cleanedContent}</strong>`;
        }
        return { isListItem: true, type: 'ul', content: finalContent };
      }
    }

    return { isListItem: false, type: null, content: '' };
  }

  function closeList() {
    if (inList && listItems.length > 0) {
      const tag = listType === 'ul' ? 'ul' : 'ol';
      result.push(`<${tag}>`);
      for (const item of listItems) {
        // Ensure list items are properly formatted
        const cleanItem = item.trim();
        if (cleanItem) {
          result.push(`  <li>${cleanItem}</li>`);
        }
      }
      result.push(`</${tag}>`);
      listItems = [];
      inList = false;
      listType = null;
      currentListStart = -1;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const detection = detectListItem(line);

    if (detection.isListItem) {
      // If we're starting a new list or the type changed, close the old one
      if (!inList || listType !== detection.type) {
        closeList();
      }

      inList = true;
      listType = detection.type;
      if (currentListStart === -1) {
        currentListStart = i;
      }
      listItems.push(detection.content);
    } else {
      // Not a list item - close any open list
      if (inList) {
        // If we've had at least 2 items, it's a list. Otherwise, might be a false positive
        if (listItems.length >= 2) {
          closeList();
        } else {
          // Single item - probably not a real list, just emit the original line
          inList = false;
          listType = null;
          if (currentListStart >= 0) {
            result.push(lines[currentListStart]);
          }
          listItems = [];
          currentListStart = -1;
        }
      }

      // Emit the regular line
      result.push(line);
    }
  }

  // Close any remaining list
  closeList();

  return result.join('\n');
}

/**
 * Process single-line HTML (when --wrap=none is used)
 */
function processSingleLineHtml(html: string): string {
  // Find all paragraph tags and their content
  const paraRegex = /<p[^>]*>(.*?)<\/p>/g;
  const paragraphs: Array<{ full: string; content: string; index: number; paraIndex: number }> = [];
  let match;

  let paraIndex = 0;
  while ((match = paraRegex.exec(html)) !== null) {
    paragraphs.push({
      full: match[0],
      content: match[1],
      index: match.index,
      paraIndex: paraIndex++,
    });
  }

  if (paragraphs.length === 0) {
    return html; // No paragraphs found
  }

  const result: string[] = [];
  let i = 0;
  let lastIndex = 0;
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: Array<{ content: string; original: string; index: number }> = [];
  let nonListGap: Array<{ content: string; index: number }> = [];

  function closeList() {
    if (inList && listItems.length >= 2) {
      const tag = listType === 'ul' ? 'ul' : 'ol';
      result.push(`<${tag}>`);
      for (const item of listItems) {
        result.push(`  <li>${item.content}</li>`);
      }
      result.push(`</${tag}>`);
      listItems = [];
      inList = false;
      listType = null;
      nonListGap = [];
    } else if (inList && listItems.length === 1) {
      // Single item - not a real list, emit original
      result.push(listItems[0].original);
      listItems = [];
      inList = false;
      listType = null;
      nonListGap = [];
    }
  }

  function shouldContinueList(newParaIndex: number): boolean {
    if (listItems.length === 0) return false;
    if (nonListGap.length === 0) return true;

    // If we have list items and a small gap (1-2 paragraphs), continue the list
    // This handles cases like "A. Item" [regular para] "B. Item" [regular para] "C. Item"
    const lastListItemIndex = listItems[listItems.length - 1].index;
    const gapSize = newParaIndex - lastListItemIndex - 1; // Number of paragraphs in between
    return gapSize <= 2; // Allow up to 2 intervening paragraphs
  }

  function detectListItem(para: { full: string; content: string }): {
    isListItem: boolean;
    type: 'ul' | 'ol' | null;
    content: string;
  } {
    const content = para.content.trim();

    // Pattern 1: <strong>A. content</strong> - letter inside strong tags
    const strongLetterMatch = content.match(/^<strong>([A-Z])[.)]\s+(.+?)<\/strong>$/s);
    if (strongLetterMatch) {
      const cleaned = `<strong>${strongLetterMatch[2]}</strong>`;
      if (cleaned.replace(/<[^>]+>/g, '').trim().length > 0) {
        return { isListItem: true, type: 'ol', content: cleaned };
      }
    }

    // Pattern 2: A. content or A. <strong>content</strong> - letter at start
    const letterMatch = content.match(/^([A-Z])[.)]\s+(.+)$/s);
    if (letterMatch) {
      const cleaned = letterMatch[2].trim();
      // Ensure we have actual content (not just whitespace or empty)
      if (cleaned.replace(/<[^>]+>/g, '').trim().length > 0) {
        return { isListItem: true, type: 'ol', content: cleaned };
      }
    }

    // Pattern 3: <strong>1. content</strong> - number inside strong tags
    const strongNumberMatch = content.match(/^<strong>(\d+)\.\s+(.+?)<\/strong>$/s);
    if (strongNumberMatch) {
      return { isListItem: true, type: 'ol', content: `<strong>${strongNumberMatch[2]}</strong>` };
    }

    // Pattern 4: 1. content - number at start
    const numberedMatch = content.match(/^(\d+)\.\s+(.+)$/s);
    if (numberedMatch) {
      const cleaned = numberedMatch[2].trim();
      if (cleaned.replace(/<[^>]+>/g, '').trim().length > 0) {
        return { isListItem: true, type: 'ol', content: cleaned };
      }
    }

    // Pattern 5: <strong>• content</strong> - bullet inside strong tags
    const strongBulletMatch = content.match(/^<strong>([•·▪▫○●◦‣⁃\-*])\s+(.+?)<\/strong>$/s);
    if (strongBulletMatch) {
      return { isListItem: true, type: 'ul', content: `<strong>${strongBulletMatch[2]}</strong>` };
    }

    // Pattern 6: • content - bullet at start
    const bulletMatch = content.match(/^([•·▪▫○●◦‣⁃\-*])\s+(.+)$/s);
    if (bulletMatch) {
      const cleaned = bulletMatch[2].trim();
      if (cleaned.replace(/<[^>]+>/g, '').trim().length > 0) {
        return { isListItem: true, type: 'ul', content: cleaned };
      }
    }

    return { isListItem: false, type: null, content: '' };
  }

  while (i < paragraphs.length) {
    const para = paragraphs[i];

    // Add any content before this paragraph
    if (para.index > lastIndex) {
      const before = html.substring(lastIndex, para.index);
      if (before.trim()) {
        closeList();
        result.push(before);
      }
    }

    const detection = detectListItem(para);

    if (detection.isListItem) {
      // Check if we should continue an existing list or start a new one
      const shouldContinue =
        inList && listType === detection.type && shouldContinueList(para.paraIndex);

      if (!inList || listType !== detection.type || !shouldContinue) {
        closeList();
      }

      // If we're continuing a list, add any gap content first (as regular content)
      if (shouldContinue && nonListGap.length > 0) {
        for (const gapItem of nonListGap) {
          result.push(gapItem.content);
        }
        nonListGap = [];
      }

      inList = true;
      listType = detection.type;
      listItems.push({ content: detection.content, original: para.full, index: para.paraIndex });
    } else {
      if (inList) {
        // Add to gap - we might continue the list
        nonListGap.push({ content: para.full, index: para.paraIndex });
      } else {
        closeList();
        result.push(para.full);
      }
    }

    lastIndex = para.index + para.full.length;
    i++;
  }

  closeList();

  // Add any remaining content
  if (lastIndex < html.length) {
    result.push(html.substring(lastIndex));
  }

  return result.join('');
}

/**
 * Process a single HTML file
 */
function processFile(filePath: string): void {
  console.log(`Processing ${path.basename(filePath)}...`);
  const html = fs.readFileSync(filePath, 'utf-8');

  // Count lists before
  const listsBefore = (html.match(/<ul>|<ol>/gi) || []).length;

  const fixed = fixLists(html);

  // Count lists after
  const listsAfter = (fixed.match(/<ul>|<ol>/gi) || []).length;

  fs.writeFileSync(filePath, fixed, 'utf-8');

  if (listsAfter > listsBefore) {
    console.log(
      `  ✓ Fixed lists: ${listsBefore} → ${listsAfter} (added ${listsAfter - listsBefore})`
    );
  } else if (listsAfter === listsBefore && listsAfter > 0) {
    console.log(`  ✓ Already had ${listsAfter} list(s), processed for consistency`);
  } else {
    console.log(`  ⚠️  No lists detected or converted (found ${listsAfter})`);
  }
}

async function main(): Promise<void> {
  const reportsDir = path.join(__dirname, '..', 'public', 'content', 'reports');

  const files = ['2021-2022.html', '2022-2023.html', '2023-2024.html'];

  console.log('Fixing list structures in HTML reports...\n');

  for (const file of files) {
    const filePath = path.join(reportsDir, file);
    if (fs.existsSync(filePath)) {
      processFile(filePath);
    } else {
      console.warn(`  ⚠️  File not found: ${filePath}`);
    }
  }

  console.log('\n✅ Processing complete!');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
