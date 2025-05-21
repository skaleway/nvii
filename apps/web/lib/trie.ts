import { db } from "@workspace/db";
import { auth } from "@clerk/nextjs/server";

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  data: any[];

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.data = [];
  }
}

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string, data: any) {
    let node = this.root;
    const normalizedWord = word.toLowerCase();

    for (const char of normalizedWord) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }

    node.isEndOfWord = true;
    node.data.push(data);
  }

  search(prefix: string, userTeamIds: string[]): any[] {
    let node = this.root;
    const normalizedPrefix = prefix.toLowerCase();
    const results: any[] = [];

    // Find the node corresponding to the prefix
    for (const char of normalizedPrefix) {
      if (!node.children.has(char)) {
        return results; // Prefix not found
      }
      node = node.children.get(char)!;
    }

    // Collect all words with the given prefix
    this.collectWords(node, results, userTeamIds);
    return results;
  }

  private collectWords(node: TrieNode, results: any[], userTeamIds: string[]) {
    if (node.isEndOfWord) {
      // Filter results based on team membership
      const filteredData = node.data.filter((item) => {
        // For spaces and articles, check if they belong to user's teams
        if (item.type === "space" || item.type === "article") {
          return userTeamIds.includes(item.teamId);
        }
        // For members, check if they belong to user's teams
        if (item.type === "member") {
          return userTeamIds.includes(item.teamId);
        }
        return false;
      });
      results.push(...filteredData);
    }

    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, results, userTeamIds);
    }
  }

  async buildIndex() {
    const [spaces, articles, members] = await Promise.all([
      db.space.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          teamId: true,
          articles: {
            select: {
              id: true,
            },
          },
          team: {
            select: {
              name: true,
            },
          },
        },
      }),
      db.article.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          spaceId: true,
          previewImage: true,
          status: true,
          space: {
            select: {
              name: true,
              teamId: true,
            },
          },
        },
      }),
      db.member.findMany({
        select: {
          id: true,
          role: true,
          teamId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
          team: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Index spaces
    for (const space of spaces) {
      const articlesCount = space.articles.length;
      this.insert(space.name, { type: "space", ...space, articlesCount });
      if (space.description) {
        this.insert(space.description, {
          type: "space",
          ...space,
          articlesCount,
        });
      }
    }

    // Index articles
    for (const article of articles) {
      this.insert(article.title, {
        type: "article",
        ...article,
        teamId: article.space.teamId, // Include teamId from the space
      });
      if (article.description) {
        this.insert(article.description, {
          type: "article",
          ...article,

          teamId: article.space.teamId, // Include teamId from the space
        });
      }
    }

    // Index members
    for (const member of members) {
      if (member.user.name) {
        this.insert(member.user.name, { type: "member", ...member });
      }
      this.insert(member.user.email, { type: "member", ...member });
    }
  }
}

// Create a singleton instance
export const searchTrie = new Trie();
