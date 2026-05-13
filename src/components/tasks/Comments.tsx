import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Send } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';
import { useAuth } from '../../contexts/FirebaseProvider';

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export default function Comments({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const { user, loading } = useAuth();

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (loading || !user) return;

    const q = query(
      collection(db, 'comments'),
      where('taskId', '==', taskId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'comments');
      } catch (e) {
        setError(e as Error);
      }
    });

    return () => unsubscribe();
  }, [taskId, user, loading]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await addDoc(collection(db, 'comments'), {
        taskId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        text: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'comments');
      } catch (e) {
        setError(e as Error);
      }
    }
  };

  return (
    <div className="mt-4 p-4 bg-surface-ground rounded-xl border border-border-dark">
      <h4 className="text-base font-bold text-text-primary mb-3">Izohlar</h4>
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {comments.map(comment => (
          <div key={comment.id} className="text-base">
            <span className="font-bold text-brand-400">{comment.userName}: </span>
            <span className="text-text-secondary">{comment.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Izoh qoldirish..."
          className="flex-1 bg-surface-card border border-border-dark rounded-lg px-3 py-2 text-base text-text-primary focus:outline-none focus:border-brand-500"
        />
        <button onClick={handleAddComment} className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
