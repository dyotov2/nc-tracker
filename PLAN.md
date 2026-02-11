# Implementation Plan: Threaded RCA Comment System

## Context

This change adds a threaded comment/discussion system to each NC record, allowing multiple users to document the investigation timeline for root cause analysis. Currently, NCs have single-entry fields for root cause and corrective actions, but there's no way to track the investigation process over time with multiple contributors.

**Why this change is needed:**
- Auditors need to see the investigation timeline and who contributed what findings
- Multiple people often collaborate on root cause analysis, requiring a discussion log
- Audit trails require chronological tracking of containment actions, findings, corrective actions, and verification steps

**Intended outcome:**
- Each NC will have a threaded comment section displaying investigation history
- Comments show author, timestamp (date + time), optional category tag, and text
- Comments display in chronological order (oldest first) for audit trail clarity
- NC list view shows comment count for quick visibility into investigation activity
- Comments are immutable (no edit/delete) to preserve audit trail integrity

## Database Changes

**File:** `backend/database.js`

### 1. Add Comment Table Schema

Add to `initDatabase()` function after the main `non_conformances` table creation:

```javascript
// Create RCA comments table
db.run(`
  CREATE TABLE IF NOT EXISTS rca_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nc_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_tag TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (nc_id) REFERENCES non_conformances(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) {
    console.error('Error creating rca_comments table:', err);
  }
});
```

**Schema notes:**
- `comment_tag` is nullable for optional categorization
- Valid tags: "Containment Action", "Root Cause Finding", "Corrective Action", "Verification", "General Note"
- No `updated_at` field - comments are immutable for audit integrity
- CASCADE delete ensures comments are removed when NC is deleted

### 2. Add Database Functions

Add these four functions following the existing Promise-based pattern:

**a) Get comments for an NC (oldest first):**
```javascript
const getCommentsByNCId = (ncId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM rca_comments WHERE nc_id = ? ORDER BY created_at ASC',
      [ncId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
```

**b) Create new comment:**
```javascript
const createComment = (data) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    const query = `
      INSERT INTO rca_comments (nc_id, author_name, comment_text, comment_tag, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      data.nc_id,
      data.author_name,
      data.comment_text,
      data.comment_tag || null,
      now
    ];

    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          nc_id: data.nc_id,
          author_name: data.author_name,
          comment_text: data.comment_text,
          comment_tag: data.comment_tag || null,
          created_at: now
        });
      }
    });
  });
};
```

**c) Get comment count for an NC:**
```javascript
const getCommentCountByNCId = (ncId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM rca_comments WHERE nc_id = ?',
      [ncId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      }
    );
  });
};
```

### 3. Update module.exports

Add new functions to the exports:
```javascript
module.exports = {
  // ... existing exports ...
  getCommentsByNCId,
  createComment,
  getCommentCountByNCId
};
```

## API Endpoint Changes

**File:** `backend/routes/ncs.js`

Add three new endpoints following the existing try-catch async/await pattern:

### 1. Get Comments Endpoint

```javascript
// GET /api/ncs/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await db.getCommentsByNCId(req.params.id);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});
```

### 2. Create Comment Endpoint

```javascript
// POST /api/ncs/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const { author_name, comment_text, comment_tag } = req.body;

    // Validation
    if (!author_name || !comment_text) {
      return res.status(400).json({ error: 'Author name and comment text are required' });
    }

    // Validate tag if provided
    const validTags = [
      'Containment Action',
      'Root Cause Finding',
      'Corrective Action',
      'Verification',
      'General Note'
    ];

    if (comment_tag && !validTags.includes(comment_tag)) {
      return res.status(400).json({ error: 'Invalid comment tag' });
    }

    // Verify NC exists
    const nc = await db.getNCById(req.params.id);
    if (!nc) {
      return res.status(404).json({ error: 'Non-conformance not found' });
    }

    const commentData = {
      nc_id: req.params.id,
      author_name: author_name.trim(),
      comment_text: comment_text.trim(),
      comment_tag: comment_tag || null
    };

    const comment = await db.createComment(commentData);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});
```

### 3. Get Comment Count Endpoint

```javascript
// GET /api/ncs/:id/comments/count
router.get('/:id/comments/count', async (req, res) => {
  try {
    const count = await db.getCommentCountByNCId(req.params.id);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching comment count:', error);
    res.status(500).json({ error: 'Failed to fetch comment count' });
  }
});
```

## Frontend: New Component

**File:** `frontend/src/components/CommentThread.jsx` (create new)

Create a new component that displays the comment timeline and handles comment creation. The component will:
- Fetch comments on mount using `useEffect`
- Display comments in chronological order (oldest first) as a visual timeline
- Provide a form to add new comments
- Handle form validation and submission
- Format timestamps as "Jan 15, 2026, 2:30 PM"
- Display optional category tags as color-coded badges
- Show empty state when no comments exist

**Key features:**
- Uses existing Toast context for notifications
- Follows existing state management patterns (useState for form, comments, loading states)
- Timeline visual: vertical line with blue dots, card-based comment display
- Color-coded tag badges: Blue (Containment), Purple (Root Cause Finding), Green (Corrective Action), Yellow (Verification), Gray (General Note)
- Form clears after successful submission
- Disabled state during submission

**Reuses existing patterns:**
- `useToast()` hook for user feedback
- Standard fetch API calls with try-catch
- Tailwind styling matching existing components
- Form structure similar to NCForm.jsx

## Frontend: Integrate into Detail View

**File:** `frontend/src/components/NCDetail.jsx`

### Changes Required:

1. Add import at top:
```javascript
import CommentThread from './CommentThread';
```

2. Add CommentThread component after the main NC content section (around line 380, before the closing main div):
```javascript
{/* Comment Thread Section */}
<div className="px-6 py-6">
  <CommentThread ncId={id} />
</div>
```

This adds the comment thread to the bottom of each NC detail page, separated by padding.

## Frontend: Show Comment Count in List

**File:** `frontend/src/components/NCList.jsx`

### Changes Required:

1. Add state for comment counts:
```javascript
const [commentCounts, setCommentCounts] = useState({});
```

2. Create function to fetch comment counts:
```javascript
const fetchCommentCounts = async (ncIds) => {
  try {
    const counts = {};
    await Promise.all(
      ncIds.map(async (id) => {
        try {
          const response = await fetch(`/api/ncs/${id}/comments/count`);
          if (response.ok) {
            const data = await response.json();
            counts[id] = data.count;
          }
        } catch (err) {
          console.error(`Error fetching count for NC ${id}:`, err);
          counts[id] = 0;
        }
      })
    );
    setCommentCounts(counts);
  } catch (err) {
    console.error('Error fetching comment counts:', err);
  }
};
```

3. Call `fetchCommentCounts` in `fetchNCs` after setting NCs:
```javascript
setNcs(data);

// Fetch comment counts
if (data.length > 0) {
  fetchCommentCounts(data.map(nc => nc.id));
}
```

4. Add "Comments" column header in table:
```javascript
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
  Comments
</th>
```

5. Add comment count cell in table row:
```javascript
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
  <div className="flex items-center space-x-1">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
    <span>{commentCounts[nc.id] || 0}</span>
  </div>
</td>
```

This displays a speech bubble icon with the comment count next to each NC in the list.

## Critical Files Summary

**Backend (2 files modified):**
1. `backend/database.js` - Add table schema, 3 new functions, update exports
2. `backend/routes/ncs.js` - Add 3 new endpoints (GET comments, POST comment, GET count)

**Frontend (3 files: 1 new, 2 modified):**
1. `frontend/src/components/CommentThread.jsx` - **NEW** component for timeline display and comment form (~200 lines)
2. `frontend/src/components/NCDetail.jsx` - Add import and render CommentThread (2 lines)
3. `frontend/src/components/NCList.jsx` - Add comment count state, fetch logic, and table column display (~30 lines)

## Verification Steps

### 1. Backend Testing
```bash
cd backend
npm start
```

Test with curl:
```bash
# Get comments for NC #1 (should return empty array initially)
curl http://localhost:5000/api/ncs/1/comments

# Create a comment
curl -X POST http://localhost:5000/api/ncs/1/comments \
  -H "Content-Type: application/json" \
  -d '{"author_name":"John Doe","comment_text":"Initial containment: Line stopped and product quarantined.","comment_tag":"Containment Action"}'

# Get comment count
curl http://localhost:5000/api/ncs/1/comments/count
```

### 2. Frontend Testing
```bash
cd frontend
npm start
```

**Manual test checklist:**
1. Open an NC detail page - verify CommentThread section displays
2. Add a comment with all fields filled - verify it appears in timeline
3. Add a comment without tag - verify it displays without badge
4. Refresh page - verify comments persist
5. Check NC list - verify comment count appears with icon
6. Add multiple comments - verify chronological order (oldest first)
7. Test form validation - try submitting with empty fields
8. Verify timestamp format: "Feb 11, 2026, 2:30 PM"
9. Verify tag badges display with correct colors
10. Test dark mode - verify all elements are visible

### 3. Database Verification

Check SQLite database directly:
```bash
cd backend
sqlite3 ncs.db
.schema rca_comments
SELECT * FROM rca_comments;
```

### 4. Edge Cases to Test
- NC with 0 comments (empty state message)
- Creating first comment (timeline initialization)
- Long comment text (wrapping behavior)
- Special characters in author name and text
- All 5 tag categories (verify color coding)
- Delete NC (verify comments cascade delete)

## Technical Notes

**Patterns followed:**
- Database: Promise-wrapped SQLite callbacks, parameterized queries
- API: Express async/await with try-catch, consistent error responses
- Frontend: React hooks (useState, useEffect), fetch API, Toast for notifications
- Styling: Tailwind CSS with dark mode support

**Design decisions:**
- Comments are immutable (no edit/delete) to preserve audit trail integrity
- Chronological display (oldest first) for investigation timeline clarity
- Optional tags allow categorization without being required
- Author name is plain text (no authentication system exists)
- Comment count fetched per-NC (could be optimized later with batch endpoint)
- Timeline visual design mimics common audit log patterns

**Performance considerations:**
- Comment counts fetched in parallel using Promise.all
- Comments only loaded when detail page is viewed
- No real-time updates (manual refresh required)
- Foreign key cascade ensures cleanup on NC deletion
