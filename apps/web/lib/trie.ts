import { db } from "@nvii/db";
import { getCurrentUserFromSession } from "./current-user";

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

    for (const [, childNode] of node.children) {
      this.collectWords(childNode, results, userTeamIds);
    }
  }

  async buildIndex() {
    const user = await getCurrentUserFromSession();

    if (!user) {
      return;
    }

    const userTeams = await db.projectAccess.findMany({
      where: {
        userId: user.id,
      },
    });

    const [spaces, articles, members] = await Promise.all([
      db.project.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          userId: true,
          key: true,
          deviceId: true,
          content: true,
          ProjectAccess: {
            select: {
              userId: true,
            },
          },
        },
      }),
      db.project.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          userId: true,
          key: true,
          deviceId: true,
          content: true,
        },
      }),
      db.projectAccess.findMany({
        select: {
          userId: true,
          projectId: true,
          assignedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Index spaces
    for (const space of spaces) {
      const articlesCount = space.ProjectAccess?.length ?? 0;
      this.insert(space.name, { type: "space", ...space, articlesCount });
    }

    // Index articles
    for (const article of articles) {
      this.insert(article.name, {
        type: "article",
        ...article,
      });
    }

    // Index members
    for (const member of members) {
      if (member.user?.name) {
        this.insert(member.user.name, { type: "member", ...member });
      }
      if (member.user?.email) {
        this.insert(member.user.email, { type: "member", ...member });
      }
    }
  }
}

// Create a singleton instance
export const searchTrie = new Trie();
