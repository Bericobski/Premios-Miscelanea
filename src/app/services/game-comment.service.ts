import { Injectable } from '@angular/core';
import {
  Timestamp,
  Unsubscribe,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestoreDb } from '../core/firebase.config';
import { CommentCategory, GameComment } from '../classes/gamecomment';

const COLLECTION_NAME = 'gameComments';

interface GameCommentDoc {
  gameId: number;
  userId: number;
  userFirebaseUid: string;
  userName: string;
  commentText: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  likesTotal: number;
  likedByUserIds: string[];
  categories: CommentCategory[];
}

export interface NewGameCommentInput {
  gameId: number;
  userId: number;
  userFirebaseUid: string;
  userName: string;
  commentText: string;
  categories: CommentCategory[];
}

@Injectable({
  providedIn: 'root',
})
export class GameCommentService {
  // Real-time subscription for a single game's comments, newest first.
  // Caller owns the returned unsubscribe (an Angular `effect` cleanup is the natural fit).
  listenToComments(gameId: number, onChange: (comments: GameComment[]) => void): Unsubscribe {
    const commentsQuery = query(
      collection(firestoreDb, COLLECTION_NAME),
      where('gameId', '==', gameId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(commentsQuery, (snapshot) => {
      const comments = snapshot.docs.map((docSnap) =>
        this.toGameComment(docSnap.id, docSnap.data() as GameCommentDoc)
      );
      onChange(comments);
    });
  }

  async addComment(input: NewGameCommentInput): Promise<void> {
    await addDoc(collection(firestoreDb, COLLECTION_NAME), {
      gameId: input.gameId,
      userId: input.userId,
      userFirebaseUid: input.userFirebaseUid,
      userName: input.userName,
      commentText: input.commentText,
      createdAt: serverTimestamp(),
      updatedAt: null,
      likesTotal: 0,
      likedByUserIds: [],
      categories: input.categories,
    });
  }

  async updateComment(commentId: string, commentText: string, categories: CommentCategory[]): Promise<void> {
    await updateDoc(doc(firestoreDb, COLLECTION_NAME, commentId), {
      commentText,
      categories,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(firestoreDb, COLLECTION_NAME, commentId));
  }

  // Toggles uid's like inside a transaction so a comment can only ever hold one
  // like per user, even under concurrent clicks.
  async toggleLike(commentId: string, uid: string): Promise<void> {
    const commentRef = doc(firestoreDb, COLLECTION_NAME, commentId);

    await runTransaction(firestoreDb, async (transaction) => {
      const snapshot = await transaction.get(commentRef);
      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data() as GameCommentDoc;
      const likedByUserIds = data.likedByUserIds ?? [];
      const alreadyLiked = likedByUserIds.includes(uid);

      const nextLikedByUserIds = alreadyLiked
        ? likedByUserIds.filter((likedUid) => likedUid !== uid)
        : [...likedByUserIds, uid];

      transaction.update(commentRef, {
        likedByUserIds: nextLikedByUserIds,
        likesTotal: nextLikedByUserIds.length,
      });
    });
  }

  private toGameComment(id: string, data: GameCommentDoc): GameComment {
    return new GameComment(
      id,
      data.gameId,
      data.userId,
      data.userFirebaseUid,
      data.userName,
      data.commentText,
      data.createdAt?.toDate() ?? new Date(),
      data.updatedAt?.toDate() ?? null,
      data.likesTotal,
      data.likedByUserIds ?? [],
      data.categories ?? []
    );
  }
}
