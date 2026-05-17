# Lesson 03: Saved Filters & Autocomplete

> **Module 12** | **Lesson 3 of 4** | ⏱️ 40 minutes

---

## 💻 Code: Autocomplete with Regex

```typescript
// Task title autocomplete (debounced on frontend)
async autocomplete(workspaceId: string, query: string) {
  return Task.find({
    title: { $regex: new RegExp(query, 'i') },
    isArchived: false,
  })
    .select('title taskNumber')
    .limit(10);
}
```

---

## ✅ Definition of Done

- [ ] Implement autocomplete with regex
- [ ] Save and load user filter presets
- [ ] Support keyboard shortcuts for quick filters

---

<div align="center">

**Module 12** | [Lesson 2](./02-faceted-search.md) → **Lesson 3** → [Lesson 4](./04-taskforge-search.md)

</div>
