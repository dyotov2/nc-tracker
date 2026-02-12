import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

const TAG_COLORS = {
  'Containment Action': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Root Cause Finding': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Corrective Action': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Verification': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'General Note': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const VALID_TAGS = Object.keys(TAG_COLORS);

function CommentThread({ ncId }) {
  const showToast = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentTag, setCommentTag] = useState('');

  useEffect(() => {
    fetchComments();
  }, [ncId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ncs/${ncId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authorName.trim() || !commentText.trim()) {
      showToast('Author name and comment text are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/ncs/${ncId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName.trim(),
          comment_text: commentText.trim(),
          comment_tag: commentTag || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const newComment = await response.json();
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      setCommentTag('');
      showToast('Comment added', 'success');
    } catch (err) {
      console.error('Error creating comment:', err);
      showToast('Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (iso) => {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Investigation Timeline
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({comments.length} {comments.length === 1 ? 'comment' : 'comments'})
          </span>
        )}
      </h3>

      {/* Timeline */}
      {loading ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm py-4">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm py-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          No investigation comments yet. Add the first comment below to start the timeline.
        </div>
      ) : (
        <div className="relative mb-6">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="relative pl-10">
                {/* Dot */}
                <div className="absolute left-2.5 top-3 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>

                {/* Card */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {comment.author_name}
                      </span>
                      {comment.comment_tag && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${TAG_COLORS[comment.comment_tag] || TAG_COLORS['General Note']}`}>
                          {comment.comment_tag}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.comment_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Comment</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={submitting}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Category (optional)
            </label>
            <select
              value={commentTag}
              onChange={(e) => setCommentTag(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">No category</option>
              {VALID_TAGS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Comment *
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Describe findings, actions taken, or observations..."
            rows={3}
            disabled={submitting}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !authorName.trim() || !commentText.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Adding...' : 'Add Comment'}
        </button>
      </form>
    </div>
  );
}

export default CommentThread;
