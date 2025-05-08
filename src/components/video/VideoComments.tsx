import React, { useState } from 'react';
import { User } from 'lucide-react';
import Button from '../ui/Button';

interface CommentType {
  id: string;
  content: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  createdAt: Date;
}

interface VideoCommentsProps {
  videoId: string;
}

const VideoComments: React.FC<VideoCommentsProps> = ({ videoId }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentType[]>([
    {
      id: '1',
      content: 'Great video! Really enjoyed the content.',
      userId: '2',
      username: 'jane_smith',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: '2',
      content: 'Thanks for sharing this! Very informative.',
      userId: '3',
      username: 'alex_jones',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      id: '3',
      content: 'I have a question about the technique you used at 2:45. Could you explain that in more detail?',
      userId: '4',
      username: 'techguru',
      avatarUrl: 'https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
    }
  ]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    // Add new comment
    const newComment: CommentType = {
      id: Date.now().toString(),
      content: commentText,
      userId: '1', // Current user
      username: 'johndoe', // Current user
      avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date()
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffSeconds = Math.floor(diffTime / 1000);
    
    if (diffSeconds < 60) {
      return 'Just now';
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="flex space-x-4">
        <div className="h-10 w-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
          <User className="h-full w-full p-2" />
        </div>
        
        <div className="flex-grow">
          <textarea
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          
          <div className="flex justify-end mt-2">
            <Button 
              type="submit" 
              disabled={!commentText.trim()}
              size="sm"
            >
              Comment
            </Button>
          </div>
        </div>
      </form>
      
      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
              {comment.avatarUrl ? (
                <img src={comment.avatarUrl} alt={comment.username} className="h-full w-full object-cover" />
              ) : (
                <User className="h-full w-full p-2" />
              )}
            </div>
            
            <div className="flex-grow">
              <div className="flex items-baseline space-x-2">
                <h4 className="font-medium text-sm">@{comment.username}</h4>
                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>
              
              <p className="mt-1 text-sm text-gray-200">{comment.content}</p>
              
              <div className="flex items-center space-x-4 mt-2">
                <button className="text-xs text-gray-400 hover:text-white transition">
                  Like
                </button>
                <button className="text-xs text-gray-400 hover:text-white transition">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoComments;