# Lesson 01: MongoDB Text Search

> **Module 12** | **Lesson 1 of 4** | ⏱️ 50 minutes

---

## 📖 Theory: MongoDB Text Indexes

```
┌──────────────────────────────────────────────────────────┐
│         MONGODB TEXT SEARCH                               │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   SETUP: Create a text index                             │
│   db.tasks.createIndex(                                  │
│     { title: "text", description: "text" },              │
│     { weights: { title: 10, description: 5 } }           │
│   )                                                      │
│                                                           │
│   SEARCH: Use $text operator                             │
│   db.tasks.find({ $text: { $search: "login bug" } })    │
│                                                           │
│   FEATURES:                                              │
│   ✅ Word stemming (running → run)                       │
│   ✅ Stop word removal (the, a, is)                      │
│   ✅ Relevance scoring with $meta: "textScore"           │
│   ✅ Phrase search: "login bug" (exact phrase)           │
│   ✅ Negation: login -bug (exclude "bug")                │
│   ❌ No fuzzy matching (typos don't match)               │
│   ❌ One text index per collection                       │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Search Service

```typescript
async searchTasks(workspaceId: string, query: string, filters: any) {
  const pipeline: any[] = [];

  // Text search stage
  if (query) {
    pipeline.push({
      $match: { $text: { $search: query } },
    });
    pipeline.push({
      $addFields: { score: { $meta: 'textScore' } },
    });
  }

  // Filter by workspace (via board → project → workspace chain)
  pipeline.push(
    { $lookup: { from: 'boards', localField: 'boardId', foreignField: '_id', as: 'board' } },
    { $unwind: '$board' },
    { $lookup: { from: 'projects', localField: 'board.projectId', foreignField: '_id', as: 'project' } },
    { $unwind: '$project' },
    { $match: { 'project.workspaceId': new mongoose.Types.ObjectId(workspaceId) } },
  );

  // Apply filters
  if (filters.priority) pipeline.push({ $match: { priority: filters.priority } });
  if (filters.assignee) pipeline.push({ $match: { assignees: new mongoose.Types.ObjectId(filters.assignee) } });
  if (filters.labels) pipeline.push({ $match: { labels: { $in: filters.labels } } });

  // Sort by relevance if searching, by date otherwise
  pipeline.push({ $sort: query ? { score: -1 } : { createdAt: -1 } });
  pipeline.push({ $limit: 50 });

  return Task.aggregate(pipeline);
}
```

---

## ✅ Definition of Done

- [ ] Create text indexes on task title/description
- [ ] Search with relevance scoring
- [ ] Combine text search with filters

---

<div align="center">

**Module 12** | **Lesson 1** → [Lesson 2](./02-faceted-search.md)

</div>
