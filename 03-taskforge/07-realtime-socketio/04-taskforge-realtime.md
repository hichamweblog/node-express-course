# Lesson 04: 🛠️ PROJECT — Real-Time Features

> **Module 07** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

1. Socket.io integrated into all task operations
2. Board room management (join/leave)
3. Presence system (who's viewing this board)
4. Typing indicators
5. Real-time notification delivery

## WebSocket Event Map

```
CLIENT → SERVER           SERVER → CLIENT
──────────────            ──────────────
board:join                board:user_joined
board:leave               board:user_left
task:move                 task:moved
presence:typing_start     presence:user_typing
presence:typing_stop      presence:user_stopped_typing
                          presence:update
                          notification:new
```

---

## ✅ Definition of Done

- [ ] Tasks sync in real-time across multiple browser tabs
- [ ] Presence shows who's on the board
- [ ] Typing indicators work

---

<div align="center">

**🎉 Module 07 Complete! → [Start Module 08: Notifications](../08-notifications-system/README.md)**

</div>
