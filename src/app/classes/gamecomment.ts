// Snapshot of an award_categories row, embedded on the comment at creation/edit time.
export interface CommentCategory {
    id: number;
    name: string;
}

// Backed by the "gameComments" Firestore collection (see firestore.rules).
export class GameComment {
    id: string;
    gameId: number;
    userId: number;
    userFirebaseUid: string;
    userName: string;
    commentText: string;
    createdAt: Date;
    updatedAt: Date | null;
    likesTotal: number;
    likedByUserIds: string[];
    categories: CommentCategory[];

    constructor(
        id: string,
        gameId: number,
        userId: number,
        userFirebaseUid: string,
        userName: string,
        commentText: string,
        createdAt: Date,
        updatedAt: Date | null,
        likesTotal: number,
        likedByUserIds: string[],
        categories: CommentCategory[]
    ) {
        this.id = id;
        this.gameId = gameId;
        this.userId = userId;
        this.userFirebaseUid = userFirebaseUid;
        this.userName = userName;
        this.commentText = commentText;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.likesTotal = likesTotal;
        this.likedByUserIds = likedByUserIds;
        this.categories = categories;
    }

    isLikedBy(uid: string | null): boolean {
        return !!uid && this.likedByUserIds.includes(uid);
    }
}
